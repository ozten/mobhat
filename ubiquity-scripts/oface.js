;
var Oface = Oface || {};

var divId = 'feed1';
var oFaceIsEnabled = true;
var lastSeenFacetHeadings = null;
var lastHiddenItems = null;
var lastHiddenSubItems = null;
function ofaceToggler(){
  var $ = jQuery;
  var doc = Application.activeWindow.activeTab.document;

  if(oFaceIsEnabled){
    $('h3#oface-enabler span.status', doc).text("Disabled");
    $('h3#oface-enabler span.current-facet', doc).hide();
    $('#oface-other-facets', doc).hide();
    lastSeenFacetHeadings = $('h4.facet:visible', doc).hide();
    lastHiddenSubItems = $('.entry:hidden',doc);
    lastHiddenItems = $('div.oface:hidden', doc).show();
    //TODO rename class oface to oface-cluster and add a new one oface-entry
    $('.oface:hidden').show();
    lastHiddenSubItems.show();
    oFaceIsEnabled = false;
    
    
  }else{
    $('h3#oface-enabler span.status', doc).text("Enabled");
    $('h3#oface-enabler span.current-facet', doc).show();
    $('#oface-other-facets', doc).show();
    lastSeenFacetHeadings.show();
    lastHiddenItems.hide();
    CmdUtils.log(lastHiddenSubItems);
    lastHiddenSubItems.hide();
    //TODO finish disabling oface
    oFaceIsEnabled = true;
  }
}

var ofaceObj = {
  name: "fetch-feed-oface",
  xenv: "http://friendfeed.com",
  env: "http://oface.ubuntu/static/test_files/",
  preview: function(pblock, input){
    var tab = Application.activeWindow.activeTab;
    var url = this.env + jQuery('link[type=application/atom+xml]', tab.document).attr('href');
    var that = this;
    
    page = Oface.WhatPageIsThis.really.call(Oface.WhatPageIsThis);
    if (page.isKnown) {
      CmdUtils.log("Unknown page type... Skipping");
    } else {
      if (page.type !== Oface.WhatPageIsThis.PROFILE_PAGE){
        CmdUtils.log("Page type " + page.type + " Skipping");
      } else {
        var h = {
            url: url,
            success: function(data, status){
              CmdUtils.log("atom feed XHR call status " + status);
              CmdUtils.log(data);
              var urls = that.processFeedForUrls(data.documentElement, tab, that);
              CmdUtils.log(urls);
              that.getFacetsForUser(that, tab, pblock, 'ozten', urls);          
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
    
      }
    }
  },
  processFeedForUrls: function(feed, tab, that){
    var entries = jQuery('entry', feed);
    var urls = [];
    entries.each(function(i){
      var url = jQuery('link', this).attr('href');
      var time = jQuery('published', this).text();
      urls.push( {url: escape(url),
                   id: that.md5(url),
                   published: jQuery('published', this).text()});
      });
    return urls;
  },
  getFacetsForUser: function(that, tab, pblock, aUsername, urls){
    /* urls [{id: 'md5sum', url: 'url', published: '2009-01-28T06:00:29Z'},] */
    CmdUtils.log(urls);
    var query = {
        username: aUsername,
        urls: urls
    };
    var dataPayload = "q=" + Utils.encodeJson(query);
    
    var h = {
      url: 'http://oface.ubuntu/resources/query_facets',
      type: 'POST',
      dataType: 'json',
      cache: false, // REMOVE FOR PROD
      data: dataPayload,
      success: function(jsn, status){
        CmdUtils.log(jsn);
          if(status == 'success'){
            var data = [];
            for(var i=0; i<jsn.length; i++){
              CmdUtils.log(jsn[i]['facets'][0]['description']);
              //TODO we are throwing away id, created date
              data[i] = {
                facets: [jsn[i]['facets'][0]['description']],
                url: unescape(jsn[i]['url']) };
            }
            that.addOfaceEnabled();
            that.updateDisplayWithFacets(data, tab, that);            
            var currentFacet = 'art';//TODO
            that.updateDisplayWithOtherFacets(data, currentFacet, tab, that);
            //simulate click on facet heading
            that.switchFacetDisplay.call(jQuery('h4.facet.' + currentFacet, tab.document).get(0));
            var missed = jQuery('div.cluster', tab.document).not('.oface');
            CmdUtils.log("Missed " + missed.length + "items, turning em red");
            jQuery('div.cluster', tab.document).not('.oface').css('background-color', 'red');             
          }
      },
      error: function(xhr, status, err){
          CmdUtils.log("Ouch trouble fetching facet info for urls ");
          CmdUtils.log("XHR call status " + status);
          CmdUtils.log(err);
      },
      complete: function(){
          CmdUtils.log("woot");
      }
  };
   
  
    jQuery.ajax(h, tab.document);
    /*
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
    }
    */
    
               
  },
  updateDisplayWithFacets: function(data, tab, that){
    var prevFacet = "";
    var t = null;
    var prevItemCount = 0;
    //[CmdUtils.log(i + " " + data[i].facets[0] + " " + data[i].url) for (i in data)];
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
                     "' style='clear:left'><span class='facet-name'>" + (data[i].facets[0]) + "</span> <span class='count'>x</span></h4> ", tab.document);
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
  },
  updateDisplayWithOtherFacets: function(data, currentFacet, tab, that){
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
    jQuery('#oface-other-facets', tab.document).append("<li style='display: inline; margin-right: 0.2em'>Other Facets:</li>");
    for (var i=0; i< facets.length; i++){
      
      var li = jQuery("<li class='oface-enabler-" + facets[i] + "-other' style='display: inline; margin-right: 2em'><span class='facet-name'>" + facets[i] +
                                                         "</span> <span class='count'>" + counts[i] + "</span></li>", tab.document);
      li.click(that.switchFacetDisplay);
      jQuery('#oface-other-facets', tab.document).append(li);
      
    }
    that.switchDisplayWithOtherFacets(currentFacet, tab);
    //hide currentFacet
  },
  switchDisplayWithOtherFacets: function(currentFacet, tab){
    jQuery('#oface-other-facets li:hidden', tab.document).show();
    jQuery('#oface-other-facets .oface-enabler-' + currentFacet + "-other", tab.document).hide();
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
    CmdUtils.log(this);
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
    
    //TODO call switchDisplayWithOtherFacets
    jQuery('#oface-other-facets li:hidden', doc).show();
    jQuery('#oface-other-facets .oface-enabler-' + facet + "-other", doc).hide();
    
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
    
    var $ = jQuery;
    var doc = Application.activeWindow.activeTab.document;
    if( $('#' + divId + ' h3#oface-enabler', doc).length == 0){
       $('#feed1', doc).prepend($("<ul id='oface-other-facets' style='float: left; list-style-type: none;'></ul>", doc));
      var ofaceEnabler = $("<h3 id='oface-enabler' style='width: 300px; float: left' title='Click to Change'>Oface is " +
                           "<span class='status'>Enabled</span> " +
                           "<span class='current-facet'>webdev</span>" +
                           "</h3>", doc)
                        .click(ofaceToggler);
      $('#feed1', doc).prepend(ofaceEnabler);
      $('h3#oface-enabler span.current-facet', doc).css('margin-left', '30px');
    }else{
      CmdUtils.log('Already have the widget');
    
    }
  }
};
/*
function pageLoad_fetchFeedOface(){
  var loc = Application.activeWindow.activeTab.document.location;
  
  var enabledFor = 'http://oface.ubuntu/static/test_files/ff-pattyok.html';
  if(loc.href.indexOf(enabledFor) != -1){
      ofaceObj.preview.call(ofaceObj);
  }

}
*/
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

//Short term FriendFeed Specific stuff
//Important for proof of concept, not how real service would work
Oface.WhatPageIsThis = {
  name: "what-page-is-this-oface",
  preview: function(pblock, input){
    var doc = Application.activeWindow.activeTab.document;
    pblock.innerHTML = "Supported? <b>" + this.isSupportedPage(this.pageType(doc.location.href)) +
      "</b> type=<b>" + this.pageType(doc.location.href) + "</b>";
  },
  really: function(){
    /**
     * @returns {array} A two item array, [true/false, pageType]
     * pageType - One of the _PAGE constants from this object like PROFILE_PAGE
    */
    var doc = Application.activeWindow.activeTab.document;
    var aPageType = this.pageType(doc.location.href);
    return {isKnown:  this.isSupportedPage(aPageType),
            type: aPageType};
  },
  HOME_PAGE: "home",            HOME_REGEX:     /^https?:\/\/w?w?w?\.?friendfeed\.com\/$/,
  PROFILE_PAGE: "profile",      PROFILE_REGEX:  /^https?:\/\/w?w?w?\.?friendfeed\.com\/(\w)+$/,
  LIST_PAGE: "list",            LIST_REGEX:     /^https?:\/\/w?w?w?\.?friendfeed\.com\/list\/(\w)+$/,
  ROOMS_LIST_PAGE: "roomslist", ROOMS_LIST_REGEX: /^https?:\/\/w?w?w?\.?friendfeed\.com\/rooms$/,
  ROOM_PAGE: "room",            ROOM_REGEX:     /^https?:\/\/w?w?w?\.?friendfeed\.com\/rooms\/(\w)+$/,
  EVERYONE_PAGE: "everyone",    EVERYONE_REGEX: /^https?:\/\/w?w?w?\.?friendfeed\.com\/public$/,
  //A User's Profile plus their friends
  FRIENDS_PAGE: "profilewfriends", FRIENDS_REGEX: /^https?:\/\/w?w?w?\.?friendfeed\.com\/(\w)+\/friends$/,
  UNKNOWN_PAGE: "unknown",
  pageType: function(url){
    //TODO 
    if (url == "http://oface.ubuntu/static/test_files/ff-pattyok.html") {
      url = "http://friendfeed.com/pattyok";
    }
    if(       this.HOME_REGEX.test(url)){
      return  this.HOME_PAGE;
    } else if(this.LIST_REGEX.test(url)) {
      return  this.LIST_PAGE;
    } else if(this.ROOMS_LIST_REGEX.test(url)) {
      return  this.ROOMS_LIST_PAGE;
    } else if(this.ROOM_REGEX.test(url)) {
      return  this.ROOM_PAGE;
    } else if(this.EVERYONE_REGEX.test(url)) {
      return  this.EVERYONE_PAGE;
    } else if(this.FRIENDS_REGEX.test(url)){
      return  this.FRIENDS_PAGE;
    } else if(this.PROFILE_REGEX.test(url)){
      return  this.PROFILE_PAGE;
    } else {
      return this.UNKNOWN_PAGE;
    }
    
    //Known unknowns
    // Linkable Urls
    // USER_COMMENTS_PAGE /^https?:\/\/w?w?w?\.?friendfeed\.com\/(\w)+\/comments$/
    // USER_LIKES_PAGE   /^https?:\/\/w?w?w?\.?friendfeed\.com\/(\w)+\/likes$/
    // USER_DISCUSSION /^https?:\/\/w?w?w?\.?friendfeed\.com\/(\w)+\/discussion$/
    // SEARCH http://friendfeed.com/search?required=q&q=lisp&friends=ozten
  },
  isSupportedPage: function(pageType){
    if(pageType == this.UNKNOWN_PAGE){
      return false;
    }
    return [this.HOME_PAGE, this.PROFILE_PAGE, this.LIST_PAGE, this.ROOMS_LIST_PAGE,
            this.ROOM_PAGE, this.EVERYONE_PAGE, this.FRIENDS_PAGE].indexOf(pageType) != -1;
  }
}

CmdUtils.CreateCommand(Oface.WhatPageIsThis);

})();