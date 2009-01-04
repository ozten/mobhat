<?php defined('SYSPATH') or die('No direct script access.');
 
class Facet_Model extends Model {
 
  public function __construct(){
    // load database library into $this->db (can be omitted if not required)
    parent::__construct();
  }
  public function get_facets($username){
    $query = $this->db->query("SELECT id, description, created FROM facets");
    return $query->result_array(FALSE);
/*    return array(array("description" => "Seattle Friends"),
                 array("description" => "Internet Friends"),
                 array("description" => "Webdevs"),
                 array("description" => "Arty"),
                 array("description" => "Mozillians"),
                 array("description" => "Foodies"));
*/
  }
  public function set_facets($username, $newFacets){
    return get_facets($username);
  }
}
?>