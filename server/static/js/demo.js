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
                } else {
                        for(var i=0; i<newFacets.length; i++){
                            if( ! this.arrayContainsByKey(newFacets[i], this.allFacets)){                               
                                this.allFacets[this.allFacets.length] = newFacets[i];                                
                            }
                        }
                }
        },
        /**
         * Adds a facet to the allFacets list
         */
        addFacet: function(json){
            console.info("addFacet " + this.allFacets.length);
            console.info(json);
            for(var i=0; i < json.length; i++){
                this.allFacets[this.allFacets.length] = json[i];
            }
        },
        updateAll: function(newFacets) {
                this.allFacets = newFacets;
        },
        arrayContainsByKey: function(needle, haystack) {
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
                //console.info("facetsChosen");
                //console.info(facets);
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
        createAll: function(username) {
                var liTemplate = $('#switcher-facetlist li:first').clone();
                $('#switcher-facetlist li').replaceWith('');
                liTemplate.attr('class', '');
                return function(weight, facetName){
                        var li = liTemplate.clone();
                        li.addClass('weight' + weight);
                        li.find('.facetitem').text(facetName);
                        $('#switcher-facetlist').append(li);
                        return li;
                };
                        
                
        },
        showAll: function() {                
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
        createCurrent: function(){
                var liTemplate = $('#switcher-current-facets li:first').clone();
                var that = this;
                $('#switcher-current-facets li').replaceWith('');
                liTemplate.attr('class', '');
                //console.info("created li");
                //console.info(this.liTemplate);
                /**
                 * @param weight {number} weight from 1 to 6
                 */
                return function(weight, facetName){
                        //console.info(that.liTemplate);
                        var li = liTemplate.clone();
                        li.addClass('weight' + weight);
                        li.addClass("current");
                        li.text(facetName);
                        $('#switcher-current-facets').append(li);
                        //$('#switcher-current-facets').append("<li>foo</li>");
                };
        },
        showCurrent: function() {                
            $('#switcher-current-facets').show();
        },
        hideCurrent: function() {                
            $('#switcher-current-facets').hide();
        },
        newFacetInput: function(){
            return  $('#switchinput');     
        },
        clearInput: function(){
            $('#switchinput').attr('value', '');      
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
        initialize: function(){
                //console.info(this);
                //console.info('xx');
                var that = this;
                $.get('/facets/current/' + this.username, {},
                    function(json) {
                        Oface.Models.Facet.updateCurrent(json);
                        //TODO using call here isn't necissary
                        var curFacetView = Oface.Views.Facet.createCurrent.call(Oface.Views.Facet);
                        
                        var currentFacets = Oface.Models.Facet.currentFacets;
                        for (var i = 0; i < currentFacets.length; i++) {
                                curFacetView(currentFacets[i]['weight'],
                                     currentFacets[i]['description']);                               
                        }
                        $('#switcher-current-facets li').click(Oface.Views.Facet.showAll);
                        Oface.Views.Facet.showCurrent();
                        
                        }, "json");
                $.get('/facets/weighted/' + that.username, {},
                        function(json) {
                                Oface.Models.Facet.updateAll(json);
                                console.info("got facets");
                                that.updateAllView();
                        },
                "json");
                var context = {username: Oface.Controllers.Facet.username};
                //console.info("preparing username");
                //console.info(context);
                /* add behaviors */
                Oface.Views.Facet.newFacetInput().bind('blur', context, Oface.Controllers.Facet.handleNewFacetCreated);
                $('#all-facets-close').bind('click', context, Oface.Controllers.Facet.allFacetsCloseHandler);        
        },
        updateAllView: function(){
                console.info("updateAllView called");
                var that = this;
                                var currentFacets = Oface.Models.Facet.currentFacets;
                                var allFacets = Oface.Models.Facet.allFacets;
                                console.info(allFacets);
                                var view = Oface.Views.Facet.createAll(that.username);
                                for (var i = 0; i < allFacets.length; i++) {
                                        console.info(allFacets[i]);
                                    //console.info(allFacets[i]['weight'] + " " + allFacets[i]['description']);
                                    var f = view(allFacets[i]['weight'],
                                                 allFacets[i]['description']);
                                        f.bind('click',
                                                {username: Oface.Controllers.Facet.username,
                                                description: allFacets[i]['description']}, Oface.Controllers.Facet.handleOtherFacetChosen);
                                    if (Oface.Models.Facet.arrayContainsByKey(allFacets[i], currentFacets)) {
                                        f.addClass("current").find('.remove-facet-a').hide();
                                    } else {
                                        f.find('.remove-facet-a').show();
                                    }
                                    f.find('.remove-facet-a').bind('click', {
                                            facet: allFacets[i]['description']
                                        },
                                        function(event) {
                                            //TODO username is available in this scope
                                            Oface.Models.Facet.removeUserFacet(Oface.Controllers.Facet.username, event.data.facet);
                                            //Oface.Views.Facet.showCurrent();
                                            //Oface.Views.Facet.createAll(Oface.Controllers.Facet.username);
                                            console.info('deleted a facet');
                                            that.updateAllView();
                                            Oface.Views.Facet.showAll();
                                            return false;
                                        });
                                }      
        },
        chooseNewFacetCallback: function(json, status){
                /* why doesn't this work?
                for(var i=0; i < json.length; i++){
                    console.info("iterating ");
                    json[i]['weight'] = 1;        
                }
                json[0]['weight'] = 1;
                console.info("chooseNewFacet called");
                console.info(json);
                //brand spankin new
                */
                Oface.Models.Facet.addFacet.call(Oface.Models.Facet, json);
                console.info(this);
                this.updateAllView();
                this.chooseFacetCallback(json, status);
        },
        chooseFacetCallback: function(json, status) {
                console.info("chooseFacet called");
                Oface.Models.Facet.updateCurrent(json);
                //console.info("updating current facet");
                var curFacetView = Oface.Views.Facet.createCurrent.call(Oface.Views.Facet);
                
                var currentFacets = Oface.Models.Facet.currentFacets;                        
                        for (var i = 0; i < currentFacets.length; i++) {
                                curFacetView(currentFacets[i]['weight'],
                                             currentFacets[i]['description']);                               
                        }
                        //TODO get rid of jQuery here... 
                $('#switcher-current-facets li').click(Oface.Views.Facet.showAll);
                Oface.Views.Facet.showCurrent();
                
                Oface.Views.Facet.hideAll();
        },
        handleOtherFacetChosen: function(event) {
                that = this;
                var data = event.data;
                //console.info("We're expecting a facet here under description");
                //console.info(event.data);
                Oface.Models.Facet.facetsChosen(Oface.Controllers.Facet.username, [data['description']],
                    function(json, status){                        
                        Oface.Controllers.Facet.chooseFacetCallback(json, status);
                    }, Oface.Util.noOp);                
        },
        /**
         * handleNewFacetCreated is called only with potentially new facets
         */
        handleNewFacetCreated: function(event) {
                Oface.Models.Facet.facetsChosen(event.data.username, $('#switchinput').attr('value').split(','), function(json, status){
                    Oface.Controllers.Facet.chooseNewFacetCallback.call(Oface.Controllers.Facet, json, status);
                    //Oface.Controllers.Facet.chooseNewFacetCallback(json, status);
                }, Oface.Util.noOp);
                Oface.Views.Facet.clearInput();
        },
        allFacetsCloseHandler: function() {
                Oface.Views.Facet.hideAll();
        }
} // END Oface.Controllers.Facet 
$(document).ready(function() {
        Oface.Controllers.Facet.username = 'ozten';
        Oface.Controllers.Facet.initialize.call(Oface.Controllers.Facet);
});