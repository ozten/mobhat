Oface.Controllers = Oface.Controllers || {};
Oface.Controllers.Oface = Oface.Controllers.Facet || {
    main: function(contexty){
        //TODO... we should check current page first
        // also we should make next step explicit? or
        // is the too much coupling?
        Oface.Models.UserDB.whoAmI(contexty, function(data, status){
          //TODO jQuery json ... data is a string and not an oject...why?
            CmdUtils.log("whoAmI success with: ", data);
            //TODO identity is global object... belongs in the Models module?
            identity = data;
            jQuery('#oface-login-form', Application.activeWindow.activeTab.document).hide();
            contexty.continueEnablingOface();
        }, function(xhr, status, error){
          CmdUtils.log(xhr);
          CmdUtils.log(xhr.status);
            if (xhr.status == 401) {
                askForLogin(contexty);
            } 
            CmdUtils.log("whoAmI ERROR with: ");
            CmdUtils.log(xhr);
            CmdUtils.log(status);
            CmdUtils.log(error);
            
        });
        
        //Register Events and their controllers
        whenWeSee('lifestream-entries-infos-available',
                  Oface.Controllers.PageFacetToggle.handleLifestreamEntriesInfosAvailable);
        whenWeSee('clustersfaceted', Oface.Controllers.EntryFacetChooser.handleClustersFaceted);
                //TODO register and handle 'oface-url-refaceted'
    },
    continueWithFacets: function(data, tab){
        ofaceObj.addOfaceEnabled();
            
        triggerA('lifestream-entries-infos-available', {urlInfos: data});
        ofaceObj.updateDisplayWithFacets(data, tab, ofaceObj);
        var missed = jQuery('div.cluster', tab.document).not('.oface')
                           .css('background-color', '#CCC')
                           .addClass('unknown-entry');
        //missed.hide();
    }
};