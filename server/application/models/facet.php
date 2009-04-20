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
    //TODO refactor with set_facets below
    /**
     * @param array $theFacets {'description' => theFacet}
     */
    public function getOrCreateFacets($theFacets)
    {
        $newFacetIds = array();
        $facetsToInsert = array();
        $theFacetDescs = array();
        foreach($theFacets as $facet){
            Kohana::log('info', Kohana::debug($facet));
            $facetsToInsert[$facet['description']] = TRUE;
            array_push($theFacetDescs, $facet['description']);
        }
        $existingFacets = $this->_getFacets($theFacetDescs);        
        foreach($existingFacets as $facet){
            array_push($newFacetIds, $facet['id']);
            if( array_key_exists($facet['description'], $facetsToInsert) ){
                unset($facetsToInsert[$facet['description']]);
            }else{
                Kohana::log('alert', "Skipping " . $facet . ", didn't find it in " . Kohana::debug($facetsToInsert));
            }
        }
        Kohana::log('info', "model saying new facets so far..." . Kohana::debug($newFacetIds));
        
        foreach(array_keys($facetsToInsert) as $facet){
            array_push($existingFacets, array('id' => $this->_createFacet($facet),
                                              'description' => $facet));
        }
    
        return $existingFacets;
    }
    /**
     * @param Array string - a list of facet descriptions
     */
    private function _getFacets($newFacets)
    {
        Kohana::log('info', Kohana::debug($newFacets));
        $sql = "SELECT id, description FROM facets WHERE description IN ('" .
        implode("', '", $newFacets) . "')";
    
        $query = $this->db->query($sql);
        return $query->result_array(FALSE);
    }
    
    private function _createFacet($facet)
    {
        $sql = "INSERT INTO facets (description) VALUES('" . $facet . "')";
        return $this->db->query($sql)->insert_id();        
    }
  
    public function set_facets($username, $newFacets)
    {
        //compare proposedNewFacets with existing facets
        //create two lists
        // * facets to put on
        // * facets to remove
        // (implicit facets to leave alone)
        // remove removal facets
        // getOrCreate ids facetsToPutOn
        // addThese facets
        
        $facetsToInsert = array();
        $oldFacetsIdsToRemove = array();
        foreach($newFacets as $facet){
            $facetsToInsert[$facet] = TRUE;
        }
        $existingFacets = $this->current_facets($username);
        foreach($existingFacets as $facet){
            //we already have this facet
            if( array_key_exists($facet['description'], $facetsToInsert) ){
                Kohana::log('info', "Kicking out " . $facet['description']);
                unset($facetsToInsert[$facet['description']]);
            //not a current facet
            }else{
                array_push($oldFacetsIdsToRemove, $facet['id']);
                Kohana::log('alert', "Well be taking off  " . $facet['description']);
            }
        }
        $userId = intval(User_Model::username_to_id($username, $this->db));
        if (count($oldFacetsIdsToRemove) > 0) {
            $this->remove_old_facets($userId, $oldFacetsIdsToRemove);  
        }
        if (count($facetsToInsert) > 0 ) {
            $getOrCreateFacets = array();
            foreach (array_keys($facetsToInsert) as $facet) {
                array_push($getOrCreateFacets, array('description' => $facet));
            }
            $theFacets = $this->getOrCreateFacets($getOrCreateFacets);
            Kohana::log('info', "About to plugin " . Kohana::debug($theFacets));
            foreach($theFacets as $facet){
                $sql = "INSERT INTO facets_user (facet_id, user_id, username, start_date) VALUES (" .
                        intval($facet['id']) . ", " . $userId . ", '" . $username . "', NOW())";
      
                $this->db->query($sql);
            }
        }
        return $newFacets;
    }
  
    public function remove_old_facets($user_id, $oldFacetIds)
    {
        $this->db->query(" UPDATE facets_user SET end_date = NOW() WHERE user_id = " . intval($user_id) .
                         " AND end_date IS NULL " .
                         " AND facet_id IN (" . implode(", ", $oldFacetIds) . ") ");
    }
    
  /**
   * $user - username of the user
   * $facet - facet description
   */
  public function remove_user_facet($username, $facet){
    $sql = "DELETE FROM facets_user WHERE facets_user.username = '$username' " .
    "AND facets_user.facet_id = ( " .
    "  SELECT id FROM facets WHERE facets.description = '$facet');";
    
    $query = $this->db->query($sql);
    Kohana::log('info', $query->count());
  }
  
    public function facetsDuring($userId, $time)
    {
        $sql = "SELECT `facets_user`.facet_id, facets.description, facets.created
                FROM facets_user 
                JOIN facets ON facets.id = `facets_user`.facet_id 
                WHERE user_id = $userId AND (
                ? BETWEEN start_date AND end_date OR
                (end_date IS NULL AND ? > start_date))";
        
        return $this->db->query($sql, array($time, $time))->result_array(FALSE);
    }
    
    
}
?>