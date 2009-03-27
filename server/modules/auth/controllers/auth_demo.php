<?php defined('SYSPATH') OR die('No direct access allowed.');
/**
 * Hacked on to remove Forge dependency
 * Auth module demo controller. This controller should NOT be used in production.
 * It is for demonstration purposes only!
 *
 * $Id: auth_demo.php 3769 2008-12-15 00:48:56Z zombor $
 *
 * @package    Auth
 * @author     Kohana Team
 * @copyright  (c) 2007-2008 Kohana Team
 * @license    http://kohanaphp.com/license.html
 */
class Auth_Demo_Controller extends Template_Controller {

  // Do not allow to run in production
  const ALLOW_PRODUCTION = FALSE;

  // Use the default Kohana template
  public $template = 'kohana/template';

  public function index()
  {
    Kohana::log('info', "METERING " . request::method() . "auth_demo/index");
    // Display the install page
    $this->template->title   = 'Auth Module Installation';
    $this->template->content = View::factory('auth_demo/install');
  }

  public function create()
  {
    Kohana::log('info', "METERING " . request::method() . "auth_demo/create");
    $this->template->title = 'Create User';
    $this->template->content = View::factory('auth_demo/create');

  }
  public function save()
  {
    Kohana::log('info', "METERING " . request::method() . "auth_demo/save");
    $user = ORM::factory('user');
    $user->email = $this->input->post("email");
    $user->username = $this->input->post("username");
    $user->password = $this->input->post("password");
    if ($user->save() AND $user->add(ORM::factory('role', 'login')))
    {
      Auth::instance()->login($user, $this->input->post("password"));

      // Redirect to the login page
      url::redirect('auth_demo/login');
    }  
  }

  public function login_form()
  {
    Kohana::log('info', "METERING " . request::method() . "auth_demo/login_form");
    $this->template->title = "User Login Form";
	$this->template->content = View::factory('auth_demo/login_form');
	
  }

  public function login()
  {
    Kohana::log('info', "METERING " . request::method() . "auth_demo/login");
    $this->session = Session::instance();
    if (Auth::instance()->logged_in())
    {
		//TODO JSON unhandled case... login called when already logged in
      $this->template->title = 'User Logout';
      $this->template->content = View::factory('auth_demo/success');
    }else{
      $this->template->title = 'User Login';
      Kohana::log('info', "Checking " . $this->input->post("username") . " and " . $this->input->post("password"));
      // Load the user
      $user = ORM::factory('user', $this->input->post("username"));

      if (Auth::instance()->login($user, $this->input->post("password"), true)) {
		  if ($this->_isJSON()) {
				Kohana::log('info', "JSON request");
		      $this->auto_render = FALSE;
			  header("Content-type: application/json; charset=utf-8");
			  echo json_encode(array(
                  'status' => 'OK',
                  'message' => 'retry-whoami'
		      ));	
		  } else {
			  Kohana::log('info', "HTML request");
              // Login successful, redirect
              url::redirect($this->session->get("requested_url"));
		  }
          $this->template->content = View::factory('auth_demo/success');        
      } else {
		
		  if ($this->_isJSON()) {
				Kohana::log('info', "JSON request");
		      header("Login Required", true, 401);
			  $this->auto_render = FALSE;
			  header("Content-type: application/json; charset=utf-8");
              echo json_encode(array(
                    'status' => 'LOGIN_FAIL',
                    'loginAction' => '/auth_demo/login'
			  ));
		  } else {
				Kohana::log('info', "NOT JSON request");
              $this->template->content = View::factory('auth_demo/fail');
		  }
      }
    }
  }

  public function logout()
  {
    Kohana::log('info', "METERING " . request::method() . "auth_demo/logout");
    // Force a complete logout
    Auth::instance()->logout(TRUE);

    // Redirect back to the login page
    url::redirect('auth_demo/login_form');
  }
  
    private function _isJSON(){
		$acceptHeader = $_SERVER['HTTP_ACCEPT'];
		//plication - don't fix spelling, makes string pos > 0
		$pos = stristr($acceptHeader, "plication/json");
		if ($pos) {
			return true;
		} else {
		    return false;
		}
    }
}