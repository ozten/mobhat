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
            
            $acceptHeader = $_SERVER['HTTP_ACCEPT'];
            if (strpos($acceptHeader, "pplication/json")) {
                header("HTTP/1.0 401 Login Required", true, 401);
                echo json_encode(array(
                  'status' => 'LOGIN_REQ',
                  'loginAction' => 'https://mobhat.restservice.org/auth_demo/login'
				));        
            } else {
                $this->session->set("requested_url","/". url::current() );
                Kohana::log('info', "Noone logged in... sending to auth. requested_url /" . url::current());
                url::redirect('https://mobhat.restservice.org/auth_demo/login_form');
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
            Kohana::log('info', Kohana::debug(json_decode($payload)));
            echo $payload;
        }
    }
    
    /**
     * Web viewable, useful for debugging
     * /users/{username}/{facet}/page/{page=0}
     * page is option and defaults to 0
     */
    public function items($username, $unused, $page=0)
    {
		$username = strtolower($username);
        $urlDb = new Url_Model;
        $this->view = new View('users/items');
        $this->view->username = $username;
        $this->view->links = $urlDb->urlsByUsername($username, $page);
        $this->view->render(TRUE);
    }
     
     /**
     * Web viewable, useful for debugging
     * /users/{username}/{facet}/page/{page=0}
     * page is option and defaults to 0
     */
    public function faceted_items($username, $facet, $unused, $page=0)
    {
		$username = strtolower($username);
        $urlDb = new Url_Model;
        $this->view = new View('users/items');
        $this->view->username = $username;
        $this->view->facet = $facet;
        $this->view->links = $urlDb->urlsByUsernameAndFacet($username, $facet, $page);
        $this->view->render(TRUE);
    }
}
?>