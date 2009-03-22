/**
* Event System consumers listen for events and
* producers create events
            whenWeSee('lifestream-entries-info-available', function(event, urlInfos){
              CmdUtils.log("We're golden BRO ", urlInfos);
              });
            whenWeSee('lifestream-entries-info-available', {foo: 'bar'}, function(event, urlInfos){
              CmdUtils.log("We're golden BRO and we've got foo", event.data.foo, urlInfos);
              });
            triggerA('lifestream-entries-info-available', {urlInfos: data});
*/

function whenWeSee(eventName, eventData, fn){
    if(eventData) {
        jQuery(Application.activeWindow.activeTab.document).bind(eventName, eventData, fn);
    } else {
        jQuery(Application.activeWindow.activeTab.document).bind(eventName, fn);
    }
}

function triggerA(eventName, callbackParam){
    callbackParam = callbackParam || {};
    jQuery(Application.activeWindow.activeTab.document).trigger(eventName, callbackParam);
}