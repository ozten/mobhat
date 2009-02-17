<?php defined('SYSPATH') or die('No direct script access.');
 
class Facet_Model extends Model {
 
  public function __construct(){
    // load database library into $this->db (can be omitted if not required)
    parent::__construct();
  }
  public function current_facets($username){
    $query = $this->db->query("SELECT facets.id, facets.description, facets.created " .
                              "FROM facets " .
                              "JOIN facets_user ON facets.id = facets_user.facet_id " .
                              "WHERE facets_user.username = '" . $username . "' AND " .
                              "  facets_user.end_date IS NULL");
    Kohana::log('info', "SELECT facets.id, facets.description, facets.created " .
                              "FROM facets " .
                              "JOIN facets_user ON facets.id = facets_user.facet_id " .
                              "WHERE facets_user.username = '" . $username . "' AND " .
                              "  facets_user.end_date IS NULL");
    return $query->result_array(FALSE);
  }
  public function weighted_facets($username){
    $sql = "SELECT facet_id AS id, facets.description, count(facet_id) AS weight " .
           "FROM facets_user  " .
           "JOIN facets ON facets_user.facet_id = facets.id  " .
           "WHERE username = '$username' " .
           "GROUP BY facet_id  " .
           "ORDER BY weight DESC ";
    
    return $this->db->query($sql)->result_array(FALSE);
  }
  
  public function set_facets($username, $newFacets){
    $newFacetIds = array();
    $facetsToInsert = array();
    foreach($newFacets as $facet){
      $facetsToInsert[$facet] = TRUE;
    }
    Kohana::log('info', Kohana::debug($newFacets));
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
    $this->remove_old_facets($userId);
    foreach($newFacetIds as $id){
      $sql = "INSERT INTO facets_user (facet_id, user_id, username, start_date) VALUES (" . $id . ", " . $userId . ", '" . $username . "', NOW())";
      Kohana::log('info', $sql);
      $this->db->query($sql);
    }
    
    //Kohana::log('info', Kohana::debug($existingFacets));
    //Kohana::log('info', Kohana::debug($facetsToInsert));
    return $newFacets;
  }
  
  public function remove_old_facets($user_id){
    $this->db->query("UPDATE facets_user SET end_date = NOW() WHERE user_id = " . $user_id . " " .
                     "AND end_date IS NULL");
  }
  /**
   * $user - username of the user
   * $facet - facet description
   */
  public function remove_user_facet($username, $facet){
    $sql = "DELETE FROM facets_user WHERE facets_user.username = '$username' " .
    "AND facets_user.facet_id = ( " .
    "  SELECT id FROM facets WHERE facets.description = '$facet');";
    Kohana::log('info', $sql);
    $query = $this->db->query($sql);
    Kohana::log('info', $query->count());
  }
  
    public function facetsDuring($userId, $time)
    {
        $sql = "SELECT `facets_user`.facet_id, facets.description, facets.created " .
               "FROM facets_user " .
               "JOIN facets ON facets.id = `facets_user`.facet_id " .
               "WHERE user_id = $userId AND " .
               "'$time' BETWEEN start_date AND end_date ";
        Kohana::log('info', $sql);
        return $this->db->query($sql)->result_array(FALSE);
    }
}
?>