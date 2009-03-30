;

function logError(msg, debugObjects) {
  Oface.log("ERROR:" + msg);
  for(var i=0; i <= debugObjects.length; i++) {
    Oface.log(debugObjects[i]);
  }
};
var Oface = Oface || {};
Oface.log = function() {
    var args = Array.prototype.slice.call(arguments);
    try {
        CmdUtils.log.apply(CmdUtils, args);
    } catch (e) {
        CmdUtils.log("ERROR: Unable to log that object", e);
    }
}
Oface.Util = Oface.Util || {
    noOp: function(event) {
        //no op
    },
    ajax: function(options) {
        var numRetry = 5;
        var origError = options['error'];
        options['error'] = function(xhr, status, error) {
            var numRetries = parseInt( numRetry );
            if(500 == parseInt(xhr.status) && numRetries != NaN && numRetries > 1) {
                Oface.log("Caught a server error " + numRetry);    
                numRetry = numRetries - 1;
                retryAjax();
            } else {
                Oface.log('Out of retries, or real error ' + xhr.status);
                if(origError) {
                    origError(xhr, status, error);
                }
            }
        };
        function retryAjax(){
            jQuery.ajax(options);
        };
        retryAjax();
    }
};
