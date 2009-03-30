var divId = 'feed1';
var oFaceIsEnabled = true;
var lastSeenFacetHeadings = null;
var lastHiddenItems = null;
var lastHiddenSubItems = null;
var unknownItems = null;
function ofaceToggler(){
  
  var $ = jQuery;
  var doc = Application.activeWindow.activeTab.document;
  if (unknownItems === null) {
    unknownItems = jQuery('.unknown-entry', doc);
    Oface.log("Looking for unknownitems", unknownItems);
  } else {
    Oface.log("Looking for unknownitems - already good");
  }
  if(oFaceIsEnabled){
    $('h3#oface-enabler span.status', doc).text("Disabled");    
    //TODO show/hide is broken here... why?
    $('.current-facet', doc).hide();
    $('#oface-other-facets', doc).hide();
    lastSeenFacetHeadings = $('h4.group-facet:visible', doc).hide();
    lastHiddenSubItems = $('.entry:hidden',doc);
    lastHiddenItems = $('div.oface:hidden', doc).show();
    //TODO rename class oface to oface-cluster and add a new one oface-entry
    $('.oface:hidden').show();
    lastHiddenSubItems.show();
    jQuery('div.cluster', doc).not('.oface').show();
    jQuery('.current-facet', doc).show();
    oFaceIsEnabled = false;
    unknownItems.removeClass("unknown-entry");
    Oface.log("Removing");
  }else{
    $('h3#oface-enabler span.status', doc).text("Enabled");
    $('.current-facet', doc).show();
    $('#oface-other-facets', doc).show();
    lastSeenFacetHeadings.show();
    lastHiddenItems.hide();
    lastHiddenSubItems.hide();
    //jQuery('div.cluster', doc).not('.oface').hide();
    oFaceIsEnabled = true;
    unknownItems.addClass("unknown-entry");
  }
}



