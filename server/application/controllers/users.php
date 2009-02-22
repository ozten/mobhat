<?php defined('SYSPATH') OR die('No direct access allowed.');

class Users_Controller extends Controller
{
    private $auth;
    private $user;
    private $session;
    
    public function __construct()
    {
        // load database library into $this->db (can be omitted if not required)
        parent::__construct();
        
        $this->auth = new Auth();
        $this->session = Session::instance();
    }
    
    public function whoami()
    {
        Kohana::log('info', "METERING " . request::method() . "users/whoami");

        $this->auth->auto_login();
        if (! $this->auth->logged_in()) {
            Kohana::log('info', "Noone logged in... sending to auth");
            $this->session->set("requested_url","/". url::current() );
            url::redirect('/auth_demo/login_form');
        } else {            
            $this->user = Session::instance()->get('auth_user');            
            $this->auto_render = FALSE;
            
            $this->facetModel = new Facet_Model;
            echo json_encode(array(
                'id'       => $this->user->id,
                'username' => $this->user->username,
                'facets'   => $this->facetModel->current_facets($this->user->username)
                             ));
        }
    }
}
?>