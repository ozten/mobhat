<?php defined('SYSPATH') OR die('No direct access allowed.');
/*
  Facets are the "hats" that people wear throughout the day.
  We have various social identities that we perform for different audiences.
  
  A user may have 1 or more facets. When a user is initially created they have
  their Everybody facet on.
  
  HTTP| URI Template                          | Resource and metadata
  GET | facets/curent/{username} (none)          (facet_list)
  
  PUT | facets/current/{username} (facet_list)   (facet_list)
  
  facet_list representations
  JSON - default - a list of facets, each facet being a map.
         keys in map include:
         * id - system generated "facet id". This is used as inputs to the serverice, but should not be user visable
         * description - which is the full name or description of the facet
  
*/
class Facets_Controller extends Template_Controller {

  // Set the name of the template to use
  public $template = 'kohana/template';

  public function current($username) {
    $this->auto_render=false;
		
    //Kohana::log('info', );
    $facet = new Facet_Model;
    
    if( request::method() == "get"){
      $this->_get_current($username, $facet);
    }else if(request::method() == "put"){
      $this->_set_current($username, $facet);
    }
  }
  public function _get_current($username, $facet){
    echo json_encode($facet->get_facets($username));
  }
  
  public function _set_current($username, $facet){
    $newFacets = json_decode(@file_get_contents("php://input"));
    $facet->set_facets($username, $newFacets);
    echo json_encode($facet->get_facets($username));

  }
}