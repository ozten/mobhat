; //TODO restructure this...
var Oface = Oface || {};
Oface.Views = Oface.Views || {};
Oface.Views.pageFacetToggler =
  <ul id='oface-other-facets' style='float: left; list-style-type: none;'></ul>;

Oface.Views.pageFacetTogglerLabel =
  <li style='display: inline; margin-right: 0.5em; float: left'>Hidden SocialTags:</li>;
  
Oface.Views.pageFacetTogglerResetLabel = function(tab){
    jQuery('#oface-other-facets li', tab.document).remove();
    return jQuery('#oface-other-facets', tab.document).append(Oface.Views.pageFacetTogglerLabel.toXMLString());
};
  
Oface.Views.addPageFacetTogglerAddFacet = function(facet, count, tab) {
    var li = jQuery("<li class='oface-enabler-" + facet + "-other page-facet " + facet +
                    "' style='display: inline; margin-right: 0.5em; float: left;'><span class='facet-name'>" +
                    facet + "</span> <span class='count'>" + count + "</span></li>", tab.document);
    jQuery('#oface-other-facets', tab.document).append(li);
    return li;
};