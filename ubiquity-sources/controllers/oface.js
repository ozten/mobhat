Oface.Controllers = Oface.Controllers || {};
Oface.Controllers.Oface = Oface.Controllers.Facet || {
    main: function(contexty){        
        //TODO... we should check current page first
        // also we should make next step explicit? or
        // is the too much coupling?
        Oface.Models.UserDB.whoAmI(contexty, function(data, status){
          //TODO jQuery json ... data is a string and not an oject...why?
            
            //TODO identity is global object... belongs in the Models module?
            identity = data;
            
            if (identity.facets.length == 0 ) {
                Oface.Controllers.WelcomeNewUser.promptForFirstFacet(identity);
            } else {
                jQuery('#oface-login-form', Application.activeWindow.activeTab.document).hide();
                contexty.continueEnablingOface();    
            }            
        }, function(xhr, status, error){
          Oface.log(xhr);
          Oface.log(xhr.status);
            if (xhr.status == 401) {
                askForLogin(contexty);
            } 
            Oface.log("whoAmI ERROR with: ");
            Oface.log(xhr);
            Oface.log(status);
            Oface.log(error);
            
        });
        
        //Register Events and their controllers
        whenWeSee('lifestream-entries-infos-available',
                  Oface.Controllers.PageFacetToggle.handleLifestreamEntriesInfosAvailable);
        //whenWeSee('clustersfaceted', Oface.Controllers.EntryFacetChooser.handleClustersFaceted);
                //TODO register and handle 'oface-url-refaceted'
    },
    continueWithFacets: function(data, tab){
        ofaceObj.addOfaceEnabled();
            
        triggerA('lifestream-entries-infos-available', {urlInfos: data});
        ofaceObj.updateDisplayWithFacets(data, tab, ofaceObj);
        var missed = jQuery('div.cluster', tab.document).not('.oface')
                           .addClass('unknown-entry');
        missed.hide();
    }
};