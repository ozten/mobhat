var divId = 'feed1';
var oFaceIsEnabled = true;
var lastSeenFacetHeadings = null;
var lastHiddenItems = null;
var lastHiddenSubItems = null;
function ofaceToggler(){
  CmdUtils.log('Clicked');
  var $ = jQuery;
  var doc = Application.activeWindow.activeTab.document;

  if(oFaceIsEnabled){
    $('h3#oface-enabler span.status', doc).text("Disabled");    
    //TODO show/hide is broken here... why?
    $('.current-facet', doc).hide();
    $('#oface-other-facets', doc).hide();
    lastSeenFacetHeadings = $('h4.facet:visible', doc).hide();
    lastHiddenSubItems = $('.entry:hidden',doc);
    lastHiddenItems = $('div.oface:hidden', doc).show();
    //TODO rename class oface to oface-cluster and add a new one oface-entry
    $('.oface:hidden').show();
    lastHiddenSubItems.show();
    jQuery('div.cluster', doc).not('.oface').show();
    jQuery('.current-facet', doc).show();
    oFaceIsEnabled = false;
    
    
  }else{
    $('h3#oface-enabler span.status', doc).text("Enabled");
    $('.current-facet', doc).show();
    $('#oface-other-facets', doc).show();
    lastSeenFacetHeadings.show();
    lastHiddenItems.hide();
    CmdUtils.log(lastHiddenSubItems);
    lastHiddenSubItems.hide();
    jQuery('div.cluster', doc).not('.oface').hide();
    //TODO finish disabling oface
    
    oFaceIsEnabled = true;
  }
}



