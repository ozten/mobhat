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
          this.t = jQuery("<h4 class='facet " + currentFacet +
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
                  ofaceObj.doFacetSwitch(identity.username, facet);
              };
          })();
          this.t.click(facetGroupLabelFn);          
          
        }
    }
};