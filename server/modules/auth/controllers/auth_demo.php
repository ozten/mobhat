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
    // Display the install page
    $this->template->title   = 'Auth Module Installation';
    $this->template->content = View::factory('auth/install');
  }

  public function create()
  {
    $this->template->title = 'Create User';
    $this->template->content = View::factory('auth/create');

  }
  public function save()
  {
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
    $this->template->title = "User Login Form";
    $this->template->content = View::factory('auth/login_form');
  }

  public function login()
  {
    $this->session = Session::instance();
    if (Auth::instance()->logged_in())
    {
      $this->template->title = 'User Logout';
      $this->template->content = View::factory('auth/success');
    }else{
      $this->template->title = 'User Login';

      // Load the user
      $user = ORM::factory('user', $this->input->post("username"));

      if (Auth::instance()->login($user, $this->input->post("password")))
      {
        // Login successful, redirect
        url::redirect($this->session->get("requested_url"));

        $this->template->content = View::factory('auth/success');        
      } else {
        $this->template->content = View::factory('auth/fail');
      }
    }
  }

  public function logout()
  {
    // Force a complete logout
    Auth::instance()->logout(TRUE);

    // Redirect back to the login page
    url::redirect('auth_demo/login_form');
  }
}