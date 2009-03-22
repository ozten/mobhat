<?php defined('SYSPATH') or die('No direct script access.');
 
class Url_Model extends Model {
    /**
     * Saves Facet info for an Url. It will create the url entry or the facet entries
     * which don't already exist.
     * 
     */
    public function createUrl($url, $md5sum, $userId, $theFacets)
    {
        $this->facetDb = new Facet_Model;
        
        Kohana::log('info', "Saving url... " . Kohana::debug($url) . " facets=" . Kohana::debug($theFacets));
        $url = $this->_getOrCreateUrl($url, $md5sum, $userId);
        $facets = $this->facetDb->getOrCreateFacets($theFacets);
        $facetUrls = $this->_getOrCreateFacetsUrls($facets, $url);
        return array('url' => $url,
                     'facets' => $facets,
                     'facets_urls' => $facetUrls);
    }
    
    private function _getOrCreateUrl($url, $md5sum, $userId)
    {
        $existingUrl = $this->_getUrl($md5sum);
        if (count($existingUrl) == 0) {
            $res = $this->db->query("INSERT INTO urls (url, hash, user_fk) VALUES (?, ?, ?)",
                                                array($url, $md5sum, $userId));
            Kohana::log('info', "Inserted url into db");
            Kohana::log('info', "insert_id= " . $res->insert_id() . " count=" . $res->count());
            //TODO check output
            //TODO make an array that would match output of this call... with insert_id
            $existingUrl = $this->_getUrl($md5sum);
        }
        return $existingUrl[0];
    }
    
    private function _getUrl($md5sum)
    {
        return $this->db->query("SELECT id, url, hash, user_fk FROM urls WHERE hash = ?", array($md5sum))->result_array(FALSE);
    }
    /**
     * @param Array facetInfos
     * @param urlInfo
     */
    private function _getOrCreateFacetsUrls($facets, $url)
    {
        $newFacetsForFacetsUrls = array();
        foreach ($facets as $facet) {
            $key = "" . $facet['id'];
            $newFacetsForFacetsUrls[$key] = TRUE;
        }
        $facetsUrls = $this->_getFacetsUrls($facets, $url);
        foreach ($facetsUrls as $facetUrl) {
            $key = "" . $facetUrl['facet_fk'];
            if (array_key_exists($key, $newFacetsForFacetsUrls)) {
                unset($newFacetsForFacetsUrls[$key]);
            }
        }
        foreach (array_keys($newFacetsForFacetsUrls) as $facetId) {
            $this->_createFacetsUrls($facetId, $url['id']);
        }
        //TODO could we use insert_id here instaed?
        return $this->_getFacetsUrls($facets, $url);
    }
    
    private function _createFacetsUrls($facetId, $urlId)
    {
        return $this->db->query("INSERT INTO facets_urls (facet_fk, url_fk) VALUES (?, ?)",
                                array($facetId, $urlId));
    }
    
    private function _getFacetsUrls($facetInfos, $urlInfo)
    {
        Kohana::log('info', "facetInfos=" . Kohana::debug($facetInfos) . "urlInfo=" . Kohana::debug($urlInfo));
        $facetIds = array();
        foreach ($facetInfos as $facetInfo) {
            array_push($facetIds, $facetInfo['id']);
        }
        return $this->db->query("SELECT id, facet_fk, url_fk
                                 FROM facets_urls
                                 WHERE url_fk = ? AND facet_fk IN (" . implode(", ", $facetIds) . ")",
                                 array($urlInfo['id']))->result_array(FALSE);
    }
    
    
    
    /**
     * Gets the facets for an url
     * @return Array - An array of facet infos, or an empty array
     */
    public function facetsFor($userId, $hash)
    {
        //TODO rename columns _fk to _id
        $sql = "SELECT facets.id, facets.description, facets.created
                FROM facets 
                JOIN facets_urls ON facets.id = facets_urls.facet_fk
                WHERE facets_urls.url_fk IN (
                    SELECT id FROM urls WHERE user_fk = $userId AND hash = '$hash'
                );";
        
        return $this->db->query($sql)->result_array(FALSE);
    }
    public function updateInfo($hash, $username, $facets)
    {
        $id = $facets[0]->facets->id;
        if ( is_numeric($id) ) {
            $facetId = intval($id);    
            Kohana::log('info', "Chaning facet over to $facetId");  
            $delSql = "
DELETE FROM facets_urls 
WHERE url_fk IN (
  SELECT urls.id FROM urls
  JOIN users ON users.id = urls.user_fk
  WHERE urls.hash = '$hash' AND
  users.username = '$username'
)";

            $insSql = "
INSERT INTO facets_urls (facet_fk, url_fk) VALUES ($facetId, (
  SELECT urls.id FROM urls
  JOIN users ON users.id = urls.user_fk
  WHERE urls.hash = '$hash' AND
  users.username = '$username'
  )
);";
            try{
                $this->db->query("START TRANSACTION");
                $this->db->query($delSql);
                $this->db->query($insSql);
                $this->db->query("COMMIT");
            } catch(Exception $e) {
                Kohana::log('error', $e);
                $this->db->query("ROLLBACK");
            }
            Kohana::log('info', "Updated the db");
        } else {
            Kohana::log('alert', "Unable to find a facet id, skipping");
        }
    }
    
    public function urlsByUsername($username, $page=0)
    {
        $num = 100;
        $offset = $num * $page;
        
        $sql = "SELECT urls.id, urls.url, facets.description, urls.hash
FROM urls 
JOIN users ON users.id = urls.user_fk
JOIN facets_urls ON facets_urls.url_fk = urls.id
JOIN facets ON facets.id = facets_urls.facet_fk
WHERE users.username = '$username'
ORDER BY urls.id DESC
LIMIT $num OFFSET $offset";
        return $this->db->query($sql);
    }
    public function urlsByUsernameAndFacet($username, $facet, $page=0)
    {
        $num = 100;
        $offset = $num * $page;
        
        $sql = "SELECT urls.id, urls.url, urls.hash
FROM urls 
JOIN users ON users.id = urls.user_fk
JOIN facets_urls ON facets_urls.url_fk = urls.id
JOIN facets ON facets.id = facets_urls.facet_fk
WHERE users.username = '$username'
AND facets.description = '$facet'
ORDER BY urls.id DESC
LIMIT $num OFFSET $offset";
        return $this->db->query($sql);
    }
}
?>