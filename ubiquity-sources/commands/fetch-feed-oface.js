
/**
 * You can use fetch- command  during development (comment out pageLoad_fetchFeedOface )
 * or uncomment pageLoad_fetchFeedOface for auto load
*/
function pageLoad_fetchFeedOface(){
    CmdUtils.log("Starting ");
    ofaceObj.preview.call(ofaceObj);
}
  

;(function(){
CmdUtils.CreateCommand(ofaceObj);
})();