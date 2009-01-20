var Oface = Oface || {};
Oface.Models = Oface.Models || {};

/* model
  stores data
  reads and updates
  from service
*/
Oface.Models.Facet = {
        currentFacets: [],
        allFacets: [],

        /* internal */
        updateCurrent: function(newFacets) {
                this.currentFacets = newFacets;
                if (this.allFacets.length == 0) {
                        allFacets = newFacets.slice();
                }
                //TODO add newFacets to allFacets if they don't exist...
        },
        /* internal */
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
        facetsChosen: function(facets, forTheWin, fail) {
                /* Takes a single facet and persists it
        * facets - array of strings
        * forTheWin - callback when successfull. Called with json, status
        * fail - callback when there was an error. Called with xhr, msg, exception
        */

                $.ajax({
                        url: '/facets/current/ozten',
                        type: 'PUT',
                        data: JSON.stringify(facets),
                        dataType: "json",
                        success: forTheWin,
                        error: fail
                });
        },
        removeUserFacet: function(username, facet) {
                //Don't let overall LI think we want to switch to this facets...
                $.ajax({
                        url: '/facets/u/' + username + '/' + facet,
                        type: 'DELETE'
                });

                function notTheFacet(aFacet, index) {
                        return aFacet['description'] != facet;
                }
                this.currentFacets = $.grep(this.currentFacets, notTheFacet);
                this.allFacets = $.grep(this.allFacets, notTheFacet);

                showCurrent();
                showAll();
        },
};

/* view
   Mostly in HTML this is the bits of code to manipulate the view
*/
function showAll() {
        var currentFacets = Oface.Models.Facet.currentFacets;
        var allFacets = Oface.Models.Facet.allFacets;
        var liTemplate = $('#switcher-facetlist li:first').clone();
        $('#switcher-facetlist li').replaceWith('');
        liTemplate.attr('class', '');

        for (var i = 0; i < allFacets.length; i++) {
                var li = liTemplate.clone();
                li.addClass('weight' + allFacets[i]['weight']);
                li.bind('click', allFacets[i], handleswitcherFacetlist);
                if (Oface.Models.Facet.isCurrent(allFacets[i], currentFacets)) {
                        cli = li li.addClass("current").find('.remove-facet-a').hide();
                        console.info("Yes, is current");
                } else {
                        li.find('.remove-facet-a').show();
                        console.info("No not current " + allFacets[i]);
                }
                //li.text(allFacets[i]['description']);
                li.find('.facetitem').text(allFacets[i]['description']);
                li.find('.remove-facet-a').bind('click', {
                        facet: allFacets[i]['description']
                },
                function(event) {
                        Oface.Models.Facet.removeUserFacet('ozten', event.data.facet);
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
}

function showCurrent() {
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
        $('#switcher-current-facets li').click(showAll);
}

function noOp(event) {

}

/* Controller */
function chooseFacetCallback(json, status) {
        console.info(json);
        console.info(status);
        Oface.Models.Facet.updateCurrent(json);
        showCurrent();
        console.info("done");
}
function handleswitcherFacetlist(event) {
        var data = event.data;
        console.info("facetChosen event");
        console.info(data);
        Oface.Models.Facet.facetsChosen([data['description']], chooseFacetCallback, noOp);
        $('#all-facets').hide();
}

function switchinputHandler() {
        Oface.Models.Facet.facetsChosen($('#switchinput').attr('value').split(','), chooseFacetCallback, noOp);

}
$(document).ready(function() {
        $.get('/facets/current/ozten', {},
        function(json) {
                Oface.Models.Facet.updateCurrent(json);
                showCurrent();

        },
        "json");
        $.get('/facets/weighted/ozten', {},
        function(json) {
                Oface.Models.Facet.updateAll(json);
                //showAll();
        },
        "json");
        /* add behaviors */
        $('#switchinput').bind('blur', switchinputHandler);

});