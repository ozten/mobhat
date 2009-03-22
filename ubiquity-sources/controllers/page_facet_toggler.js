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
                            return function(){ofaceObj.doFacetSwitch(identity.username, newFacet); ofaceObj.switchDisplayWithOtherFacets(newFacet, tab);};
                        })();
                li.click(fn);
            }            
            ofaceObj.switchDisplayWithOtherFacets(identity['facets'][0]['description'], tab);
        }
};
