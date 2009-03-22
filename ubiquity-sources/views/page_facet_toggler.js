;var Oface = Oface || {};
Oface.Views = Oface.Views || {};
Oface.Views.pageFacetToggler =
  <ul id='oface-other-facets' style='float: left; list-style-type: none;'></ul>;

Oface.Views.pageFacetTogglerLabel =
  <li style='display: inline; margin-right: 0.2em'>Filtered Out of Page:</li>;
  
Oface.Views.addPageFacetTogglerAddFacet = function(facet, count, tab) {
    var li = jQuery("<li class='oface-enabler-" + facet + "-other facet " + facet +
                    "' style='display: inline; margin-right: 2em'><span class='facet-name'>" +
                    facet + "</span> <span class='count'>" + count + "</span></li>", tab.document);
    jQuery('#oface-other-facets', tab.document).append(li);
    return li;
};
CmdUtils.log("LOADING Views");