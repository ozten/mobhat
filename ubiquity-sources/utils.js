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
        }
};