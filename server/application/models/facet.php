<?php defined('SYSPATH') or die('No direct script access.');
 
class Facet_Model extends Model {
 
  public function __construct(){
    // load database library into $this->db (can be omitted if not required)
    parent::__construct();
  }
  public function get_facets($username){
    $query = $this->db->query("SELECT facets.id, facets.description, facets.created " .
                              "FROM facets " .
                              "JOIN facets_user ON facets.id = facets_user.facet_id " .
                              "WHERE facets_user.username = '" . $username . "'");
    return $query->result_array(FALSE);

  }
  public function set_facets($username, $newFacets){
    $newFacetIds = array();
    $facetsToInsert = array();
    foreach($newFacets as $facet){
      $facetsToInsert[$facet] = TRUE;
    }
    Kohana::log('info', $newFacets);
    $sql = "SELECT id, description FROM facets WHERE description IN ('" .
           implode("', '", $newFacets) . "')";
    
    Kohana::log('info', $sql);
    $query = $this->db->query($sql);
    $existingFacets = $query->result_array(FALSE);
    foreach($existingFacets as $facet){
      array_push($newFacetIds, $facet['id']);
      if( array_key_exists($facet['description'], $facetsToInsert) ){
       unset($facetsToInsert[$facet['description']]);
      }else{
        Kohana::log('warn', "Skipping " . $facet . ", didn't find it in " . Kohana::debug($facetsToInsert));
      }
    }
    Kohana::log('info', "new facets so far..." . Kohana::debug($newFacetIds));
    foreach(array_keys($facetsToInsert) as $facet){
      $sql = "INSERT INTO facets (description) VALUES('" . $facet . "')";
      Kohana::log('info', $sql);
      $this->db->query($sql);
      $sql = "SELECT id FROM facets WHERE description = '" . $facet . "'";
      Kohana::log('info', $sql);
      $facetId = $this->db->query($sql);
      array_push($newFacetIds, $facetId[0]->id);
      Kohana::log('info', "Searching for ids gives us " . Kohana::debug($query));
    }
    $userId = User_Model::username_to_id($username, $this->db);
    $this->delete_from($userId);
    foreach($newFacetIds as $id){
      $sql = "INSERT INTO facets_user (facet_id, user_id, username) VALUES (" . $id . ", " . $userId . ", '" . $username . "')";
      Kohana::log('info', $sql);
      $this->db->query($sql);
    }
    
    //Kohana::log('info', Kohana::debug($existingFacets));
    //Kohana::log('info', Kohana::debug($facetsToInsert));
    return $newFacets;
  }
  
  public function delete_from($user_id){
    $user = new User_Model();
    $this->db->query("DELETE FROM facets_user WHERE user_id = " . $user_id);
  }
}
?>