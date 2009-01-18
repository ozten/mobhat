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
  /* temporarily playing with authentication */
  function __construct(){
    parent::__construct();
    $this->session = Session::instance();
    /*
    $authentic=new Auth;
    if (!$authentic->logged_in()){
      $this->session->set("requested_url","/". url::current() ); // this will redirect from the login page back to this page/
      url::redirect('/auth_demo/login_form');
    }else{			
      $this->user = Session::instance()->get('auth_user'); //now you have access to user information stored in the database
    }
    */
  }
    
  // Set the name of the template to use
  public $template = 'kohana/template';

  /**
   $.ajax( {url:'/facets/current/ozten', type:'PUT', data: JSON.stringify(["AllMyFriends", "You"])} ); 
   */
  public function current($username) {
    //Kohana::log('info', "Looks like they are logged in " . $this->user->id . " " . $this->user->username);
    $this->auto_render=false;
    
    $facet = new Facet_Model;
    if( request::method() == "get"){
		
      $this->_get_current($username, $facet);
    }else if(request::method() == "put"){
      
      $putdata = fopen("php://input", "r");
      $thedata = "";
      while ($data = fread($putdata, 1024)){
	    $thedata = $thedata . $data;
      }
	  $newFacets = json_decode($thedata);
	  $proof = $this->proof($newFacets);
	  if($proof[0]){
		Kohana::lang('info', Kohana::debug($newFacets));
        $this->_set_current($username, $newFacets, $facet);
	  }else{
		echo json_encode(array("errMsg" => $proof[1]));
	  }
    }
  }
  
  public function _get_current($username, $facet){
    echo json_encode($facet->current_facets($username));
  }
  
  /**
   * returns an array [success, errorMessage]
   */
  public function proof(&$newFacets){
    if(is_array($newFacets)){
      $newFacets = array_unique($newFacets);
      for($i = 0; $i < count($newFacets); $i++){
		if( empty($newFacets[$i]) ){
				unset($newFacets[$i]);				
		} else {
		        $newFacets[$i] = trim($newFacets[$i]);
				
		}
	  }
	  if( count($newFacets) > 0 ){
	    return array(true, "");
	  }else{
		$msg = "proofing facets, expected atleast on valid facet " . Kohana::debug($newFacets);
		Kohana::log('alert', $msg);      
		return array(false, $msg);
	  }
    }else{
		$msg = "proofing facets, expected array but got " . Kohana::debug($newFacets);
      Kohana::log('alert', $msg);
      return array(false, $msg);
	}
  }
  
  public function _set_current($username, $newFacets, $model){
    Kohana::log('info', "Still Got this far... dong put" . Kohana::debug($newFacets));
    //$newFacets = json_decode(@file_get_contents("php://input"));
    $model->set_facets($username, $newFacets);
    echo json_encode($model->current_facets($username));
  }
  
  /**
   $.ajax( {url:'/facets/weighted/ozten', type:'GET'});
   */
  public function weighted($username) {
		sleep(1);
	$this->auto_render=false;
    
    $facet = new Facet_Model;
    if( request::method() == "get"){
		
      Kohana::log('info', Kohana::debug($facet->weighted_facets($username)));
      echo json_encode($facet->weighted_facets($username));
    }
  }
}