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
class Resources_Controller extends Template_Controller
{
    private $facetDb;
    function __construct()
    {
        parent::__construct();
        $this->facetDb = new Facet_Model();  
    }
    // Set the name of the template to use
    public $template = 'kohana/template';
    /**
    $.ajax({
       url: '/resources/query_facets',
        type: 'POST',
        dataType: 'json',
        data: "q=" + JSON.stringify([{url: escape('http://example.com/'), updated: '2009-01-28T06:00:29Z'},{url: escape('http://example.com/art.jpg'), updated: '2009-01-27T13:22:21Z'}]),
        success: function(json, status){ console.info(json); }
     });
     */
    public function query_facets()
    {
        Kohana::log('info', "query_facets() " . request::method() );
        $this->auto_render=false;
        if (request::method() == "post") {
            
            $post = $this->input->post();
            Kohana::log('info', Kohana::debug($post['q']));
            
            $query = json_decode($post['q'], true);
            $items = $query['urls'];
            //TODO url_decode each url before using...
            Kohana::log('info', Kohana::debug($items));
            
            $username = $query['username'];
            Kohana::log('info', $username);
            Kohana::log('info', Kohana::debug($username));
            $userId = $this->_userId($username);
            if( $userId <= 0 ) {
                //TODO if request is for one unknown user... send a 404
                header('http_response_code', true, 404);
            } else {
                $currentFacets = $this->facetDb->current_facets($username);
            
                foreach($items as $i => $item){
                    $date = $item['published'];                
                    $facets = $this->facetDb->facetsDuring($userId, $date);
                    if (count($facets) > 0) {
                        $items[$i]['facets'] = $facets;
                    } else {
                        $items[$i]['facets'] = $currentFacets;
                    }
                }
            }
            echo json_encode($items);
        } else {
            echo json_encode(array('error' => "Unknown action, expecting POST"));
        }
        
        
    }
    private function _userId($username)
    {
        //$model = ORM::factory('user')->find(11);//'username', $username);
        $model = ORM::factory('user')->where('username', 'pattyok')->find();        
        return $model->id;
    }
}
?>