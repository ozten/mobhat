
//TODO namespace this...
function whoAmI(oface){
    //get userame and current facets... force login if need be
    
    jQuery.ajax({
        type: "GET",
        url: "http://oface.ubuntu/users/whoami?cache_bust=" + escape(new Date()),
        async: false,
        cache: false,
        dataType: "json",
        success: function(data, status){
          //TODO jQuery json ... data is a string and not an oject...why?
            CmdUtils.log("whoAmI success with: " + data['id'] + " " + data['username']);
            identity = data;
            jQuery('#oface-login-form', Application.activeWindow.activeTab.document).hide();
            oface.continueEnablingOface();
        },
        error: function(xhr, status, error){
          CmdUtils.log(xhr);
          CmdUtils.log(xhr.status);
            if (xhr.status == 401) {
                askForLogin(oface);
            } 
            CmdUtils.log("whoAmI ERROR with: ");
            CmdUtils.log(xhr);
            CmdUtils.log(status);
            CmdUtils.log(error);
            
        }
    });
}
