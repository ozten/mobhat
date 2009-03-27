;Oface = Oface || {};
Oface.Controllers = Oface.Controllers || {};
Oface.Controllers.WelcomeNewUser = {
    promptForFirstFacet: function(identity) {
        var $ = jQuery, doc = Application.activeWindow.activeTab.document;
        $('#feed1', doc).append(Oface.Views.welcomeNewUser)
            .find('form').bind('submit', {identity: identity}, Oface.Controllers.WelcomeNewUser.handleSubmit);
        $('#new-user-name', doc).text(identity.username);
    },
    handleSubmit: function(event) {
        var identity = event.data.identity;
        var $ = jQuery, doc = Application.activeWindow.activeTab.document;
        var newFacet = $('#facetinput', this).attr('value');
        Oface.Models.Facet.facetsChosen(identity.username, [newFacet],
            function(json, status){
                Oface.log("Restarting with new facets");
                $('#welcome-new-user-panel', doc).remove();
                Oface.Controllers.Oface.main(ofaceObj);
            }, Oface.Util.noOp);
        return false;
    }
};
