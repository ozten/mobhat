;var $ = jQuery;
var doc = Application.activeWindow.activeTab.document;

Oface = Oface || {};
Oface.Controllers = Oface.Controllers || {};
Oface.Controllers.FacetGroups = {
    t: null,
    prepareLabel: function(prevFacet, currentFacet, prevItemCount, cluster) {
        
        if(prevFacet != currentFacet){          
          if(this.t) jQuery('span.count', this.t).text(prevItemCount);
          prevItemCount = 0;
          //TODO change the text 1 below to x and see if this code is buggy
          //I think it is structured wrong and prepareLabel should be called
          //again once after outter for loop finishes...
          this.t = jQuery("<h4 class='group-facet " + currentFacet +
                     "' style='clear:none'><span class='facet-name'>" + (currentFacet) + "</span>" + 
                     " <!--a href='#' class='group-facet-link'>Show Them</a--> <span class='count'>1</span></h4> ", doc);
          this.t.css({
             'class': 'toggler',
             'height': '15px',
            'float' : 'left',
            'margin-right': '10px',
            'margin-left': '33px'
          });
          cluster.before(this.t);
          
          var facetGroupLabelFn = (function(){
              var facet = currentFacet;
               return function(){
                    
                    Oface.Models.Facet.facetsChosen(identity.username, [facet], function(json, status){
                        ofaceObj.doFacetSwitch(identity.username, facet);
                        }, Oface.Util.noOp);
                    return false;
              };
          })();
          this.t.click(facetGroupLabelFn);          
          jQuery('.group-facet-link', this.t).click(facetGroupLabelFn);
        }
    }
};