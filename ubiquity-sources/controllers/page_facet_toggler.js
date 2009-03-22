Oface.Controllers = Oface.Controllers || {};
Oface.Controllers.PageFacetToggle = Oface.Controllers.PageFacetToggle || {        
        handleLifestreamEntriesInfosAvailable: function(event, params){                
            var tab = Application.activeWindow.activeTab;            
            var data = params.urlInfos;

            var facets = [];
            var counts = [];
            for (var i=0; i< data.length; i++){
                var facet = data[i].facets[0];
                var facetIndex = facets.indexOf(facet);
                if (facetIndex == -1) {
                    facets[facets.length] = facet;
                    counts[counts.length] = 1;
                } else {
                    counts[facetIndex] += 1;
                }
            }
            //TODO: pageFacetToggler creation happens elsewhere... should happen here
            Oface.Views.pageFacetTogglerResetLabel(tab);
            for (var i=0; i< facets.length; i++){      
                var li = Oface.Views.addPageFacetTogglerAddFacet(facets[i], counts[i], tab);
                var fn = (function(){
                            var newFacet = facets[i];
                            return function(){ofaceObj.doFacetSwitch(identity.username, newFacet);
                                              Oface.Controllers.PageFacetToggle.switchDisplayWithOtherFacets(newFacet, tab);};
                        })();
                li.click(fn);
            }            
            Oface.Controllers.PageFacetToggle.switchDisplayWithOtherFacets(identity['facets'][0]['description'], tab);            
    },
    switchDisplayWithOtherFacets: function(currentFacet, tab){
        /**
         * Changes the visible state of the various FacetGroups in the Lifestream
         * currentFacet string - the new facet
         */
        jQuery('#oface-other-facets li:hidden', tab.document).show();
        jQuery('#oface-other-facets li.oface-enabler-' + currentFacet + "-other", tab.document).hide();
    }
};
