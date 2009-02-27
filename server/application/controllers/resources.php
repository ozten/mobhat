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
        data: "q=" + JSON.stringify({urls: [{username: 'ozten', url: escape('http://example.com/'), published: '2009-01-28T06:00:29Z'},
                                            {username: 'pattyok', url: escape('http://example.com/art.jpg'), published: '2009-01-27T13:22:21Z'}]}),
        success: function(json, status){ console.info(json); }
     });
     */
    public function query_facets()
    {		
        $this->auto_render=false;
        //TODO hook up $msg
        $msg = "";
        if (request::method() == "post") {
            
            $post = $this->input->post();            
            $query = json_decode($post['q'], true);            
            $origItems = $query['urls'];
            
            Kohana::log('info', "METERING POST resources/query_facets urls=" . Kohana::debug($origItems));

            //TODO url_decode each url before using...
            $items_by_author = $this->_prepareItemsByAuthor($origItems);
            $this->_facetItemsAnAuthorAtATime($items_by_author, $origItems);
            echo json_encode($origItems);
        } else {
            Kohana::log('alert', request::method() . " on resources/query_facets INVALID, expected POST");
            echo json_encode(array('error' => "Unknown action, expecting POST"));
        }
    }
    
    /**
    $.ajax({
        url: '/resources/user/{username}/query_facets',
        type: 'POST',
        dataType: 'json',
        data: "q=" + JSON.stringify({urls: [{url: escape('http://example.com/'), published: '2009-01-28T06:00:29Z'},{url: escape('http://example.com/art.jpg'), published: '2009-01-27T13:22:21Z'}]}),
        success: function(json, status){ console.info(json); }
     });
     */
    public function user($username, $action)
    {
        $this->auto_render=false;
        if (request::method() == "post" && $action == "query_facets") {
            $post = $this->input->post();
            
            
            $query = json_decode($post['q'], true);
            $items = $query['urls'];
            //TODO url_decode each url before using...
            Kohana::log('info', "METERING POST resources/user username=$username action=$action urls=" . Kohana::debug($items));
            
            $userId = $this->_userId($username);
            
            if( $userId <= 0 ) {
                //TODO if request is for one unknown user... send a 404
                Kohana::log('alert', "Couldn't find an id for username $username");
                header('http_response_code', true, 404);                
            } else {
                $currentFacets = $this->facetDb->current_facets($username);
                $this->_updateFacetInfo($userId, $currentFacets, $items);                
            }
            //TODO wrap with in an object {urls: $items, user: {profile: url}} etc
            echo json_encode($items);
             
        } else {
            Kohana::log('alert', "Unknown action [$action] was expecting query_facets");
        }
    }
    private function _userId($username)
    {
        //$model = ORM::factory('user')->find(11);//'username', $username);
        $model = ORM::factory('user')->where('username', $username)->find();        
        return $model->id;
    }
    private function _updateFacetInfo($userId, $currentFacets, &$items)
    {
        Kohana::log('info', "=================");
        $this->urlDb = new Url_Model;
        foreach($items as $i => $item){
            $found = false;
            //TODO check if md5 is set, url is set, validate them...
            //thing about policy during read vs update/set
            $md5sum = md5($item['url']);
            $origMd5sum = NULL;
            Kohana::log('info', Kohana::debug($item));
            if (isset($item['md5sum']) && $md5sum != $item['md5sum']) {
                Kohana::log('alert', "client HASH $md5sum != Server HASH " . $item['md5sum']);
            }
            $url = $item['url'];
            Kohana::log('info', "given $url using md5 $md5sum");
            $facets = $this->urlDb->facetsFor($userId, $md5sum);
            Kohana::log('info', "we get " . Kohana::debug($facets));
            if (count($facets) > 0) {
                $found = false;
            } else {
                
                $date = $item['published'];
                $facets = $this->facetDb->facetsDuring($userId, $date);
            }
            
            // TODO make sure facets are uniqu(!?!)
            if (count($facets) > 0) {
                if ( ! $found) {
                    //TODO stopped here.. create url model and this method
                    $this->urlDb->createUrl($url, $md5sum, $userId, $facets);
                }
                $items[$i]['facets'] = $facets;
            } else {
                //TODO we ignore the currentFacets which come into this function...
                //user them as a last resort, instead of having $urlDb->facetsFor
                //regrabbing the current facets
                Kohana::log('alert', "really? I know this is user $userId but I couldn't find any facets for " . Kohana::debug($item));
                $items[$i]['facets'] = $currentFacets;
            }
        }
    }
    
    private function _prepareItemsByAuthor($items)
    {
        $items_by_author = array();
        foreach($items as $i => $item){
            $item['index'] = $i;
            if ( ! array_key_exists('username', $item)) {
                $m = "Error, no username set in item at index $i";
                Kohana::log('alert', $m);                    
            } else {
                $username = $item['username'];
                if ( ! array_key_exists($username, $items_by_author)) {
                    $items_by_author[$username] = array();
                }
                array_push($items_by_author[$username], $item);
            }
        }
        return $items_by_author;
    }
    
    private function _facetItemsAnAuthorAtATime(&$items_by_author, &$origItems)
    {
        $msg = "";
        foreach ($items_by_author as $username => $items) {
            $userId = $this->_userId($username);
            Kohana::log('info', "_facetItemsAnAuthorAtATime username=$username userId=$userId " . " items=" .
                        Kohana::debug($items));
            if( $userId <= 0 ) {
                $s = "WARNING: Query contains an unknown username $username id: $userId\n";
                $msg += $s;
                Kohana::log('alert', $s);
            } else {
                Kohana::log('info', "Right here in _facetItemsAnAuthorAtATime username=" . $username);
                //TODO include link to profile and current facets for each user?
                $currentFacets = $this->facetDb->current_facets($username);            
                $this->_updateFacetInfo($userId, $currentFacets, $items_by_author[$username]);
                foreach($items_by_author[$username] as $i => $facetedItem) {
                    $index = $facetedItem['index'];
                    Kohana::log('info', $facetedItem['index']);
                    if( array_key_exists('facets', $facetedItem)) {
                        //Kohana::log('info', "index is " . $index);
                        
                        Kohana::log('info', "Updating " . Kohana::debug($facetedItem['facets']) . " onto " . Kohana::debug($origItems[$index]));
                        $origItems[$index]['facets'] = $facetedItem['facets'];
                        Kohana::log('info', "Now it looks like " . Kohana::debug($origItems[$index]));
                    }
                }
            }    
        }
        return $msg;
    }
}
?>