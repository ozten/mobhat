//TODO urlDb is a.... Model?
var urlDb = {};
/**
 * @param url {string} The url for the item
 * @param md5 {string} hash of the url
 * @param facets {Array of Strings} A list of Facets
 */
function updateUrlDbWithMd5AndFacets(url, md5, facets, username) {
    if( urlDb[url] ) {
      Oface.log("Already seen ", url);
    } else {
      //Oface.log("Seeing ", url, "for the first time");
      urlDb[url] = {
        md5: md5,
        facets: facets
      };
      if(username) {
        urlDb[url]['username'] = username;
      }
    }
}
