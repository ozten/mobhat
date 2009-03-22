;var $ = jQuery;
var doc = Application.activeWindow.activeTab.document;

Oface = Oface || {};
Oface.Controllers = Oface.Controllers || {};
Oface.Controllers.FacetGroups = {
    t: null,
    prepareLabel: function(prevFacet, currentFacet, prevItemCount, cluster) {
        CmdUtils.log("Looking at prepareLabel", currentFacet);
        if(prevFacet != currentFacet){          
          if(this.t) jQuery('span.count', this.t).text(prevItemCount);
          prevItemCount = 0;
          this.t = jQuery("<h4 class='group-facet " + currentFacet +
                     "' style='clear:left'><span class='facet-name'>" + (currentFacet) + "</span> <span class='count'>x</span></h4> ", doc);
          this.t.css({
             'class': 'toggler',
            'border': 'solid 1px grey',
            'float' : 'left',
            'margin-right': '10px'
          });
          cluster.before(this.t);
          
          var facetGroupLabelFn = (function(){
              var facet = currentFacet;
               return function(){
                    CmdUtils.log("Looking at runtime it's now", facet);
                    Oface.Models.Facet.facetsChosen(identity.username, [facet], function(json, status){
                        ofaceObj.doFacetSwitch(identity.username, facet);
                        }, Oface.Util.noOp);
              };
          })();
          this.t.click(facetGroupLabelFn);          
          
        }
    }
};