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
                var $ = jQuery, doc = Application.activeWindow.activeTab.document;
                Oface.log("ENCODEJSON facetsChosen", facets);
                var payload = Utils.encodeJson(facets);
                $.ajax({
                        url: Oface.Controllers.Facet.server + '/facets/current/' + username,
                        type: 'PUT',
                        data: payload,
                        dataType: "json",
                        success: forTheWin,
                        error: fail
                }, doc);
        },
        /**
         * Removes the facet from the user
         * @param username {string} the username
         * @param facet {array} of facets
         */
        removeUserFacet: function(username, facet) {
          var $ = jQuery, doc = Application.activeWindow.activeTab.document;
                $.ajax({
                        url: Oface.Controllers.Facet.server + '/facets/u/' + username + '/' + facet,
                        type: 'DELETE'
                }, doc);
                function notTheFacet(aFacet, index) {
                        return aFacet['description'] != facet;
                }
                this.currentFacets = $.grep(this.currentFacets, notTheFacet);
                this.allFacets = $.grep(this.allFacets, notTheFacet);                
        }
};
