var Oface = Oface || {};
Oface.Models = Oface.Models || {};

/* model
  stores data
  reads and updates
  from service
*/
Oface.Models.Facet = Oface.Models.Facet || {
        currentFacets: [],
        allFacets: [],        
        updateCurrent: function(newFacets) {
                this.currentFacets = newFacets;
                if (this.allFacets.length == 0) {
                        allFacets = newFacets.slice();
                        //TODO rename isCurrent to arrayContainsByKey
                } else {
                        for(var i=0; i<newFacets.length; i++){
                            if( ! this.isCurrent(newFacets[i], this.allFacets)){                                      
                                this.allFacets[this.allFacets.length] = newFacets[i];                                
                            }
                        }
                }
        },        
        updateAll: function(newFacets) {
                this.allFacets = newFacets;
        },
        isCurrent: function(needle, haystack) {
                for (var i = 0; i < haystack.length; i++) {
                        if (needle['id'] == haystack[i]['id']) {
                                return true;
                        }
                }
                return false;
        },
        /**
         * Takes a single facet and persists it
         * @param username {string} - username that we should update
         * @param facets {array} of facets
         * @param forTheWin {function} - callback when successfull. Called with json, status
         * @param fail {function} - callback when there was an error. Called with xhr, msg, exception
         */
        facetsChosen: function(username, facets, forTheWin, fail) {
                $.ajax({
                        url: '/facets/current/' + username,
                        type: 'PUT',
                        data: JSON.stringify(facets),
                        dataType: "json",
                        success: forTheWin,
                        error: fail
                });
        },
        /**
         * Removes the facet from the user
         * @param username {string} the username
         * @param facet {array} of facets
         */
        removeUserFacet: function(username, facet) {
                $.ajax({
                        url: '/facets/u/' + username + '/' + facet,
                        type: 'DELETE'
                });
                function notTheFacet(aFacet, index) {
                        return aFacet['description'] != facet;
                }
                this.currentFacets = $.grep(this.currentFacets, notTheFacet);
                this.allFacets = $.grep(this.allFacets, notTheFacet);                
        }
}; //End Oface.Models.Facet

Oface.Views = Oface.Views || {};
/** view
 *   Mostly in HTML this is the bits of code to manipulate the view
 */
Oface.Views.Facet = Oface.Views.Facet || {
        showAll: function() {
                var currentFacets = Oface.Models.Facet.currentFacets;
                var allFacets = Oface.Models.Facet.allFacets;
                var liTemplate = $('#switcher-facetlist li:first').clone();
                $('#switcher-facetlist li').replaceWith('');
                liTemplate.attr('class', '');

                for (var i = 0; i < allFacets.length; i++) {
                        var li = liTemplate.clone();
                        li.addClass('weight' + allFacets[i]['weight']);
                        li.bind('click', allFacets[i], Oface.Controllers.Facet.handleswitcherFacetlist);
                        if (Oface.Models.Facet.isCurrent(allFacets[i], currentFacets)) {
                                cli = li.addClass("current").find('.remove-facet-a').hide();
                        } else {
                                li.find('.remove-facet-a').show();
                        }
                        //li.text(allFacets[i]['description']);
                        li.find('.facetitem').text(allFacets[i]['description']);
                        li.find('.remove-facet-a').bind('click', {
                                facet: allFacets[i]['description']
                        },
                        function(event) {
                                Oface.Models.Facet.removeUserFacet('ozten', event.data.facet);
                                Oface.Views.Facet.showCurrent();
                                Oface.Views.Facet.showAll();
                                return false;
                        });
                        $('#switcher-facetlist').append(li);
                }
                var p = $('#current-facets').position();
                $('#all-facets').css({
                        position: 'absolute',
                        'top': p.top,
                        'left': p.left
                });
                $('#all-facets').show();
        },
        hideAll: function(){
                $('#all-facets').hide();
        },
        showCurrent: function() {
                var currentFacets = Oface.Models.Facet.currentFacets;
                var liTemplate = $('#switcher-current-facets li:first').clone();
                $('#switcher-current-facets li').replaceWith('');
                liTemplate.attr('class', '');
                for (var i = 0; i < currentFacets.length; i++) {
                        var li = liTemplate.clone();
                        li.addClass('weight' + currentFacets[i]['weight']);
                        li.addClass("current");
                        li.text(currentFacets[i]['description']);
                        $('#switcher-current-facets').append(li);
                }
                $('#switcher-current-facets li').click(this.showAll);                
        }
}; //END Oface.Views.Facet
Oface.Util = Oface.Util || {
        noOp: function(event) {
                //no op
        }
}; //END Oface.Util
/* Controller */
Oface.Controllers = Oface.Controllers || {};
Oface.Controllers.Facet = Oface.Controllers.Facet || {
        username: "Unknown",
        chooseFacetCallback: function(json, status) {
                Oface.Models.Facet.updateCurrent(json);
                Oface.Views.Facet.showCurrent();                                
                Oface.Views.Facet.hideAll();
        },
        handleswitcherFacetlist: function(event) {
                that = this;
                var data = event.data;
                Oface.Models.Facet.facetsChosen(Oface.Controllers.Facet.username, [data['description']], Oface.Controllers.Facet.chooseFacetCallback, Oface.Util.noOp);                
        },
        switchinputHandler: function() {
                Oface.Models.Facet.facetsChosen(event.data.username, $('#switchinput').attr('value').split(','), Oface.Controllers.Facet.chooseFacetCallback, Oface.Util.noOp);                
        },
        allFacetsCloseHandler: function() {
                Oface.Views.Facet.hideAll();
        }
} // END Oface.Controllers.Facet 
$(document).ready(function() {
        Oface.Controllers.Facet.username = 'ozten';
        $.get('/facets/current/ozten', {},
        function(json) {
                Oface.Models.Facet.updateCurrent(json);
                Oface.Views.Facet.showCurrent();

        },
        "json");
        $.get('/facets/weighted/ozten', {},
        function(json) {
                Oface.Models.Facet.updateAll(json);
                //Oface.Views.Facet.showAll();
        },
        "json");
        var context = {username: 'ozten'};
        /* add behaviors */
        $('#switchinput').bind('blur', context, Oface.Controllers.Facet.switchinputHandler);
        $('#all-facets-close').bind('click', context, Oface.Controllers.Facet.allFacetsCloseHandler);        
});