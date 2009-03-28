;var Oface = Oface || {};
Oface.Models = Oface.Models || {};
Oface.Models.UserDB = {
    whoAmI: function(oface, FTW, FAIL){
        /**
         * TODO get rid of oface argmument which is a acontext object
         */
        jQuery.ajax({
            type: "GET",
            url: Oface.HOST + "/users/whoami?cache_bust=" + escape(new Date()),
            async: false,
            cache: false,
            dataType: "json",
            success: FTW,
            error: FAIL
        }, Application.activeWindow.activeTab.document);
    }
}
