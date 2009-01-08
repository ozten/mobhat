<?php defined('SYSPATH') OR die('No direct access allowed.');

class User_Model extends Auth_User_Model {
	
	// This class can be replaced or extended
    public static function username_to_id($username, $db){
      Kohana::log('info', "Called with " . $username . " ");
      $sql = "SELECT id FROM users WHERE username = '" . $username . "'";
      $query = $db->query($sql);      
      return $query[0]->id;
    }
} // End User Model