;

var divId = 'feed1';
var oFaceIsEnabled = true;
var lastSeenFacetHeadings = null;
var lastHiddenItems = null;

function ofaceToggler(){
  var $ = jQuery;
  var doc = Application.activeWindow.activeTab.document;

  if(oFaceIsEnabled){
    $('h3#oface-enabler span.status', doc).text("Disabled");
    $('h3#oface-enabler span.current-facet', doc).hide();

    lastSeenFacetHeadings = $('h4.facet:visible', doc).hide();
    lastHiddenItems = $('div.oface:hidden', doc).show();
    //TODO rename class oface to oface-cluster and add a new one oface-entry
    $('.oface:hidden').show();
    oFaceIsEnabled = false;
  }else{
    $('h3#oface-enabler span.status', doc).text("Enabled");
    $('h3#oface-enabler span.current-facet', doc).show();
    lastSeenFacetHeadings.show();
    lastHiddenItems.hide();
    //TODO finish disabling oface
    oFaceIsEnabled = true;
  }
}

var ofaceObj = {
  name: "fetch-feed-oface",
  xenv: "http://friendfeed.com",
  env: "http://oface.ubuntu/static/test_files/",
  preview: function(pblock, input){
    CmdUtils.log('preview called with ' + pblock);
    var tab = Application.activeWindow.activeTab;
    var url = this.env + jQuery('link[type=application/atom+xml]', tab.document).attr('href');
    CmdUtils.log(url);
    var that = this;
    var h = {
        url: url,
        success: function(data, status){
          CmdUtils.log("atom feed XHR call status " + status);
          CmdUtils.log(data);
          //CmdUtils.log('sucessfully fetched feed');
          var urls = that.processFeedForUrls(data.documentElement, tab, that);
          CmdUtils.log(urls);
          that.feedFacets(that, tab, pblock, urls);
          //CmdUtils.log(urls);          
        },
        error: function(xhr, status, err){
          CmdUtils.log("Ouch trouble fetching the feed " + url);
          CmdUtils.log("XHR call status " + status);
          CmdUtils.log(err);
        }
      };
    jQuery.ajax(h, tab);
    if(pblock){
      pblock.innerHTML = "Loading";
    }
  },
  processFeedForUrls: function(feed, tab, that){
    var entries = jQuery('entry link', feed);
    var urls = [];
    entries.each(function(i){
      var url = jQuery(this).attr('href');      
      urls.push( {url: url,
                   id: that.md5(url)});
      });
    return urls;
  },
  feedFacets: function(that, tab, pblock, urls){
    /*
    var h = {
      url: "http://oface.ubuntu/facets/info",
      method: "post",
      cache: false, // REMOVE FOR PROD 
      data: {
        username: 'ozten',
        urls: urls,
        dataType: 'html',  //TODO JSON 
        success: function(data, status){
          CmdUtils.log('feedFacets success');
          CmdUtils.log(data);          
        },
        error: function(xhr, status, err){
          CmdUtils.log("Ouch trouble fetching facet info for urls ");
          CmdUtils.log("XHR call status " + status);
          CmdUtils.log(err);
        },
        complete: function(){
          CmdUtils.log("woo");
        }
      }
    };
    jQuery.ajax(h, tab.document);
    */
    //after async
    var data = urls.slice(0);
    var facets = [["webdev"],["art"],["family"]];
    for(var i = 0; i < data.length; i++){
      if(i == 0 || i == 6){
        data[i].facets = facets[0];
      } else if(i == 1 || i == 5 ){
        data[i].facets = facets[2];
      } else if(i >= 2 && i < 5 ){
        data[i].facets = facets[1];
      } else {
        data[i].facets = facets[Math.round(Math.random() * 2)];
      }
      CmdUtils.log(i + ' ' + data[i].facets[0]);
    }
    
    var prevFacet = "";
    var t = null;
    var prevItemCount = 0;
    that.addOfaceEnabled();
    [CmdUtils.log(i + " " + data[i].facets[0] + " " + data[i].url) for (i in data)];
    for(var i=0; i < data.length; i++){
      /* Grab an item by url (this varies by webapp)
      *  bubble up the DOM until you reach the FriendFeed container */
      
      var selector = 'div.title a[href=' + data[i].url + ']';      
      if(data[i].url.indexOf('twitter') >= 0){
        selector = 'div[viewinlink=' + data[i].url + ']';
      }else if(data[i].url.indexOf('friendfeed.com/e/') >= 0){        
        // http://friendfeed.com/e/fdb550f2-869e-4a1c-b4ce-11d2d9d4d282  
        // is not present in the html... it is dynamically added to the
        // More menu item as 'Link to this entry'
        var eid = /^http.?:\/\/.*friendfeed\.com\/e\/(.*)$/.exec(data[i].url)[1];
        selector = 'div[eid=' + eid + ']';
        
      }else if(data[i].url.indexOf('flickr.com/') >= 0 &&
               jQuery(selector, tab.document).length != 1){
        // flickr is either in the default format or this
        // format when several are collapsed together...
        selector = 'div.container a[href=' + data[i].url + ']';
      }
      //CmdUtils.log("selector=" + selector);
      var a = jQuery(selector, tab.document);
      if(a.length == 1){
        var success;
        var entry;
        var cluster;
        [success, entry  ] = that.findAndTagByClass(a,'entry', data[i].facets);
        if(! success ){
          //Flickr uses tr as it's container...
          CmdUtils.log("WARNING, might have found an entry div for anchor tag " + data[i].url);
        }
        [success, cluster] = that.findAndTagByClass(a,'cluster', data[i].facets);
        if(! success ){
          CmdUtils.log("ERROR, expected to find a cluster div for anchor tag " + data[i].url);
        }
        if(! cluster.hasClass('oface')){
          cluster.addClass('oface');
        }        
        if(prevFacet != data[i].facets[0]){          
          if(t) jQuery('span.count', t).text(prevItemCount);
          prevItemCount = 0;
          t = jQuery("<h4 class='facet " + data[i].facets[0] +
                     "'><span class='facet-name'>" + (data[i].facets[0]) + "</span> <span class='count'>x</span></h4> ", tab.document);
          t.css({
             'class': 'toggler',
            'border': 'solid 1px grey',
            'float' : 'left',
            'margin-right': '10px'
          });
          cluster.before(t);
          t.click(that.switchFacetDisplay);
          jQuery('div.cluster, div.pager', tab.document).css('clear', 'left');
        }
        prevFacet = data[i].facets[0];
        prevItemCount++;
      }else{
        //href=http://www.flickr.com/photos/wigfur/3229310456/
        CmdUtils.log("Looking for 'div.title a[href=" + data[i].url + "]' but found " + a.length + " items");
      } //if(a.length == 1){
    } // for(var i=0; i < data.length; i++){
    var currentFacet = 'webdev';
    var missed = jQuery('div.cluster', tab.document).not('.oface');
    CmdUtils.log("Missed " + missed.length + "items");
    //missed.hide();
    //jQuery('div.cluster.oface', tab.document).not('.oface-' + currentFacet + '-facet').hide()
    
    //jQuery('div', tab.document).css('border', 'solid 1px red');
    /*
    jQuery('.oface-webdev-facet', tab.document).css('background-color', 'red');
    jQuery('.oface-art-facet', tab.document).css('background-color', 'blue');
    jQuery('.oface-family-facet', tab.document).css('background-color', 'yellow');
    jQuery('.oface-webdev-facet.oface-art-facet', tab.document).css('background-color', 'purple');
    jQuery('.oface-webdev-facet.oface-family-facet', tab.document).css('background-color', 'orange');
    jQuery('.oface-art-facet.oface-family-facet', tab.document).css('background-color', 'green');
    */
    
  },
  findAndTag: function(element, containerClassName, facets, matchFn){
    var cluster = element;//.parent();
        while( cluster.length && ! matchFn(cluster)){      
          cluster = cluster.parent();
        }
        if(cluster.length > 0){
          //update this div...
          var c = "oface-" + facets[0] + "-facet";
          if(! cluster.hasClass(c)){            
            cluster.addClass(c);
          }        
          return [true, cluster];
        }else{
          return [false, element];
        }
  },
  findAndTagByClass: function(element, containerClassName, facets){
    return this.findAndTag(element, containerClassName, facets, function(cluster){
      return cluster.hasClass(containerClassName);
      });    
  },findAndTagByClass: function(element, containerClassName, facets){
    return this.findAndTag(element, containerClassName, facets, function(cluster){
      return cluster.hasClass(containerClassName);
      });    
  },
  switchFacetDisplay: function(){
    /**
     * this - is the 6.toggler the user clicked
    */
    var doc = Application.activeWindow.activeTab.document;    
    var facet = jQuery('span.facet-name', this).text();
    
    jQuery.ajax({
                        url: 'http://oface.ubuntu/facets/current/ozten',
                        type: 'PUT',
                        data: '["' + facet + '"]',
                        dataType: "json"                        
                }, doc);
    
    jQuery('h4.facet', doc).show();
    jQuery('h4.facet.' + facet, doc).hide('slow');
    
    jQuery('#oface-enabler span.current-facet', doc).text(facet);
    
    jQuery('div.entry.oface-' + facet + '-facet:hidden, div.cluster.oface-' + facet + '-facet', doc).show('slow');    
    jQuery('div.cluster.oface, div.entry', doc).not('.oface-' + facet + '-facet').hide('slow');
    
    //jQuery('div.cluster', doc).not('.oface').hide('slow');
    
    
    
  },
  md5: function(str){
    // https://developer.mozilla.org/en/nsICryptoHash
    var converter =
      Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
        createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

    // we use UTF-8 here, you can choose other encodings.
    converter.charset = "UTF-8";
    // result is an out parameter,
    // result.value will contain the array length
    var result = {};
    // data is an array of bytes
    var data = converter.convertToByteArray(str, result);
    var ch = Components.classes["@mozilla.org/security/hash;1"]
                       .createInstance(Components.interfaces.nsICryptoHash);
    ch.init(ch.MD5); //MD5 SHA1
    ch.update(data, data.length);
    var hash = ch.finish(false);

    // return the two-digit hexadecimal code for a byte
    function toHexString(charCode)
    {
      return ("0" + charCode.toString(16)).slice(-2);
    }

    // convert the binary hash data to a hex string.
    return [toHexString(hash.charCodeAt(i)) for (i in hash)].join("");
  },
  addOfaceEnabled: function(){
    
    CmdUtils.log(jQuery);
    CmdUtils.log(Application);
    var $ = jQuery;
    var doc = Application.activeWindow.activeTab.document;
    CmdUtils.log(doc);
    CmdUtils.log($('#' + divId + ' h3#oface-enabler', doc).length);
    if( $('#' + divId + ' h3#oface-enabler', doc).length == 0){
      var ofaceEnabler = $("<h3 id='oface-enabler' title='Click to Change'>Oface is " +
                           "<span class='status'>Enabled</span> " +
                           "<span class='current-facet'>webdev</span>" +
                           "</h3>", doc)
                        .click(ofaceToggler);
      CmdUtils.log('addOfaceEnabled');
    
      CmdUtils.log(ofaceEnabler);
      $('#feed1', doc).prepend(ofaceEnabler);
      $('h3#oface-enabler span.current-facet', doc).css('margin-left', '30px');
    }else{
      CmdUtils.log('Already have the widget');
    
    }
    CmdUtils.log('addOfaceEnabled called');
  }
};
function pageLoad_fetchFeedOface(){
  CmdUtils.log('pageLoad_fetchFeedOface3 really called');
  var loc = Application.activeWindow.activeTab.document.location;
  
  var enabledFor = 'http://oface.ubuntu/static/test_files/ff-pattyok.html';
  CmdUtils.log(enabledFor);
  CmdUtils.log(loc.href);
  if(loc.href.indexOf(enabledFor) != -1){
      ofaceObj.preview.call(ofaceObj);
  }

}
;(function(){

//Growl displayMessage
//Replace selected text CmdUtils.setSelection("You selected: "+input.html);
//Application - FUEL Application - http://developer.mozilla.org/en/docs/FUEL 
/* This is a template command */
CmdUtils.CreateCommand({
  feedIcon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAJDSURBVHjajJJNSBRhGMd/887MzrQxRSLbFuYhoUhEKsMo8paHUKFLdBDrUIdunvq4RdClOq8Hb0FBSAVCUhFR1CGD/MrIJYqs1kLUXd382N356plZFOrUO/MMz/vO83+e93n+f+1zF+kQBoOQNLBJg0CTj7z/rvWjGbEOIwKp9O7WkhtQc/wMWrlIkP8Kc1lMS8eyFHpkpo5SgWCCVO7Z5JARhuz1Qg29fh87u6/9VWL1/SPc4Qy6n8c0FehiXin6dcCQaylDMhqGz8ydS2hKkmxNkWxowWnuBLHK6G2C8X6UJkBlxUmNqLYyNbzF74QLDrgFgh9LLE0NsPKxjW1Hz2EdPIubsOFdH2HgbwAlC4S19dT13o+3pS+vcSfvUcq9YnbwA6muW9hNpym/FWBxfh0CZkKGkPBZeJFhcWQAu6EN52QGZ/8prEKW+cdXq0039UiLXhUYzdjebOJQQI30UXp6mZn+Dtam32Afu0iyrgUvN0r+ZQbr8HncSpUVJfwRhBWC0hyGV8CxXBL5SWYf9sYBidYLIG2V87/ifVjTWAX6AlxeK2C0X8e58hOr/Qa2XJ3iLMWxB1h72tHs7bgryzHAN2o2gJorTrLxRHVazd0o4TXiyV2Yjs90uzauGvvppmqcLjwmbZ3V7BO2HOrBnbgrQRqWUgTZ5+Snx4WeKfzCCrmb3axODKNH+vvUyWjqyK4DiKQ0eXSpFsgVvLJQWpH+xSpr4otg/HI0TR/t97cxTUS+QxIMRTLi/9ZYJPI/AgwAoc3W7ZrqR2IAAAAASUVORK5CYII%3D",
  name: "discover-feeds-oface",
  icon: this.feedIcon,
  homepage: "http://ozten.com/",
  author: {
    name: "Your Name",
    email: "you@example.com"
  },
  license: "GPL",
  description: "Lists Feeds that this page contains",
  help: "how to use your command",
  preview: function(pblock, input) {
    //var d = context.chromeWindow.window.document;
    var d = CmdUtils.getDocument();
    var links = d.getElementsByTagName('link');
    var template = "<h4>Feeds</h4>";
    var data = {};
    var type = {
      'application/rss+xml': 'RSS',
      "application/atom+xml": "Atom"
    };
    var numFeeds = 0;
    template += "<ul>";
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var title = links[i].title || "Untitled Feed";
      
      if (link.type == "application/atom+xml" || link.type == "application/rss+xml") {
        numFeeds += 1;
        template += "<li ><img src='" + this.feedIcon + "' /> " + " <a href='" + link.href + "'>" + title + "</a> <small>(" + type[links[i].type]  + ")</small></li>";
        //CmdUtils.log(links[i].title + " " + links[i].href);
      }
      template += "</ul>";

    }
    if (numFeeds == 0) {
      template = "None Feeds discovered";
    }
    pblock.innerHTML = CmdUtils.renderTemplate(template, data);
    var doc = Application.activeWindow.activeTab.document;
    jQuery('div.cluster', doc).css('border', 'solid 1px grey');
  }
});



CmdUtils.CreateCommand(ofaceObj);



})();