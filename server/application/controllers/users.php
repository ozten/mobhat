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
            
            $headers = getallheaders();
            $acceptHeader = $headers['Accept'];
            if (strpos($acceptHeader, "pplication/json")) {
                header("Login Required", true, 401);
                echo json_encode(array(
                  'status' => 'LOGIN_REQ',
                  'loginAction' => '/auth_demo/login'
				));        
            } else {
                $this->session->set("requested_url","/". url::current() );
                Kohana::log('info', "Noone logged in... sending to auth. requested_url /" . url::current());
                url::redirect('/auth_demo/login_form');
            }
        } else {            
            $this->user = Session::instance()->get('auth_user');
            $this->facetModel = new Facet_Model;
            
            $facets = $this->facetModel->current_facets($this->user->username);
            //Kohana::log('info', "Found user id=" . $this->user->id . " username=" . $this->user->username . " facets=" . var_dump($facets));
            $this->auto_render = FALSE;
            
            $payload = json_encode(array(
                'id'       => $this->user->id,
                'username' => $this->user->username,
                'facets'   => $facets
                             ));
            
            //Kohana::log('info', "Skipping payload " . Kohana::debug($payload));
            Kohana::log('info', Kohana::debug($payload));
            Kohana::log('info', Kohana::debug(json_decode($payload)));
            echo $payload;
        }
    }
}
?>