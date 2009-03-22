Oface.Controllers = Oface.Controllers || {};
Oface.Controllers.Oface = Oface.Controllers.Facet || {
    main: function(context){
        //TODO... we should check current page first
        // also we should make next step explicit? or
        // is the too much coupling?
        Oface.Models.UserDB.whoAmI(context, function(data, status){
          //TODO jQuery json ... data is a string and not an oject...why?
            CmdUtils.log("whoAmI success with: ", data);
            //TODO identity is global object... belongs in the Models module?
            identity = data;
            jQuery('#oface-login-form', Application.activeWindow.activeTab.document).hide();
            context.continueEnablingOface();
        }, function(xhr, status, error){
          CmdUtils.log(xhr);
          CmdUtils.log(xhr.status);
            if (xhr.status == 401) {
                askForLogin(context);
            } 
            CmdUtils.log("whoAmI ERROR with: ");
            CmdUtils.log(xhr);
            CmdUtils.log(status);
            CmdUtils.log(error);
            
        });
        
        //Register Events and their controllers
        whenWeSee('lifestream-entries-infos-available',
                  Oface.Controllers.PageFacetToggle.handleLifestreamEntriesInfosAvailable);
    }
};