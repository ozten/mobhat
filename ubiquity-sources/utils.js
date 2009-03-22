;
CmdUtils.onPageLoad(function(){
    CmdUtils.injectCss(".cluster-facet-widget-panel{float: right; position: relative; top: -25px; width: 300px;}");
});
function logError(msg, debugObjects) {
  CmdUtils.log("ERROR:" + msg);
  for(var i=0; i <= debugObjects.length; i++) {
    CmdUtils.log(debugObjects[i]);
  }
};
var Oface = Oface || {};
Oface.Util = Oface.Util || {
        noOp: function(event) {
                //no op
        }
};