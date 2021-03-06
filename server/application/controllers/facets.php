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
   $.ajax( {url:'/facets/current/ozten', type:'PUT', data: JSON.stringify(["AllMyFriends", "AndYouGary"])} ); 
   */
  public function current($username) {		
    //Kohana::log('info', "Looks like they are logged in " . $this->user->id . " " . $this->user->username);
	$username = strtolower($username);
    $this->auto_render=false;
    Kohana::log('info', request::method());
    $facet = new Facet_Model();
    if( request::method() == "get"){
      Kohana::log('info', "METERING GET facets/current username=$username");
      echo json_encode($this->_get_current($username, $facet));
    }else if(request::method() == "put"){
      
      $putdata = fopen("php://input", "r");
      $thedata = "";
      while ($data = fread($putdata, 1024)){
	    $thedata = $thedata . $data;
      }
	  Kohana::log('info', "METERING PUT facets/current username=$username data=$thedata");
	  
	  $newFacets = json_decode($thedata);
	  Kohana::log('info', 'decoded json is ' . Kohana::debug($newFacets));
	  $proof = $this->proof($newFacets, $username, $facet);
	  if($proof[0]){
		Kohana::log('info', "username is " . Kohana::debug($username));
		Kohana::log('info', Kohana::debug($newFacets));
        $this->_set_current($username, $newFacets, $facet);
	  }else{
		echo json_encode(array("errMsg" => $proof[1]));
	  }
    }
  }
  /**
   * prints out the current facets
   */
  public function _get_current($username, $facet){
		//Kohana::log('info', "About to call get_current");
    return $facet->current_facets($username);
  }
  
  /**
   * returns an array [success, errorMessage]
   */
  public function proof(&$newFacets, $username, $facetModel){
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
		if ($this->_newFacetsAreSameAsCurrent($newFacets, $username, $facetModel)) {
			header('HTTP/1.0 400 Bad Request', TRUE, 400);
			return array(true, "");
		} else {
		    return array(true, "");		
		}
	  }else{
		//Bad Request
		header('HTTP/1.0 400 Bad Request', TRUE, 400);
		$msg = "proofing facets, expected atleast on valid facet " . Kohana::debug($newFacets);
		Kohana::log('alert', $msg);
		//TODO set response to error code 4xx?
		return array(false, $msg);
	  }
    }else{
		//Bad Request
		header('HTTP/1.0 400 Bad Request', TRUE, 400);
		$msg = "proofing facets, expected array but got " . Kohana::debug($newFacets);
      Kohana::log('alert', $msg);
      return array(false, $msg);
	}
  }
  
    private function _newFacetsAreSameAsCurrent($newFacets, $username, $facetModel)
    {
		Kohana::log('info', "new facets " . Kohana::debug($newFacets));
		$cur = $this->_get_current($username, $facetModel);
		Kohana::log('info', "Current facets " . Kohana::debug($cur));
		if (count($newFacets) != count($cur)) {
			return false;	
		}
		foreach ($newFacets as $i => $facet) {
		    if (array_search($facet, $cur) == false) {
				return false;
			}
		}
		return true;
    }
  
  public function _set_current($username, $newFacets, $model)
  {
    $model->set_facets($username, $newFacets);
    echo json_encode($model->current_facets($username));
  }
  
  /**
   $.ajax( {url:'/facets/weighted/ozten', type:'GET'});
   */
  public function weighted($username) {
	$username = strtolower($username);
	Kohana::log('info', "METERING " . request::method() . "facets/weighted username=$username");
	$this->auto_render=false;
    
    $facet = new Facet_Model();
    if( request::method() == "get"){
		
      Kohana::log('info', Kohana::debug($facet->weighted_facets($username)));
      echo json_encode($facet->weighted_facets($username));
    }
  }
  
  /*
   $.ajax( {url:'/facets/u/ozten/foo', type:'DELETE'});
  */
  public function u($username, $facet){
	  $username = strtolower($username);
		Kohana::log('info', "METERING " . request::method() . "facets/u username=$username facet=$facet");
		$this->auto_render=false;
		$facetDb = new Facet_Model();
		
		if( request::method() == "delete"){
		  $facetDb->remove_user_facet($username, $facet);
		}else{
				//Not Implemented
				header('HTTP/1.0 501 Not Implemented', TRUE, 501);
				echo "Unsupported Operation";		
		}
  }
}