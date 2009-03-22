;var ofaceObj = {
  name: "fetch-feed-oface",
  env: "http://friendfeed.com",
  testenv: "http://oface.ubuntu/static/test_files/",
  envFor: function(url){
    CmdUtils.log(url);
    if (/.*oface\.ubuntu.*/.test(url)){
      return this.testenv;
    } else {
      return this.env;
    }
  },
  preview: function(pblock, input){
    /**
     * Either via Ubiquity command or pageLoad preview is our first stop...
     */
    //TODO get ride of this - context object
    Oface.Controllers.Oface.main(this);
  },
  continueEnablingOface: function(){
      /**
       * TODO this method belongs on OFace.main controller
       */
        var tab = Application.activeWindow.activeTab;    
    var url = this.envFor(tab.document.location.href) + jQuery('link[type=application/atom+xml]', tab.document).attr('href');
    var that = this;
    
    page = Oface.WhatPageIsThis.really.call(Oface.WhatPageIsThis);
    if (! page.isKnown) {
      CmdUtils.log("Unknown page type... Skipping");
    } else {      
      if ( ! Oface.WhatPageIsThis.isSupportedPage(page.type)){
        CmdUtils.log("Page type " + page.type + " Skipping");
      } else {
        var sucessFn;
        var username;
        CmdUtils.log("I think I am on a " + page.type + " page");
        if( page.type == Oface.WhatPageIsThis.PROFILE_PAGE ) {
          username = Oface.WhatPageIsThis.getUsername.call(Oface.WhatPageIsThis, page.url, page.type);
          successFn = function(data, status){            
            CmdUtils.log("atom feed XHR call status " + status);
            CmdUtils.log(data);
            var urls = that.processFeedForUrls(data.documentElement, tab, that);
            CmdUtils.log(urls);
            CmdUtils.log('in preview calling that.getFacetsForUser');
            that.getFacetsForUser(that, tab, username, urls, false);          
          };          
        } else {
          // Home, or other mixed username page... not in the url
          username = identity.username;
          successFn = function(data, status){
            CmdUtils.log("atom feed XHR call status " + status);
            CmdUtils.log(data);
            var urls = that.processFeedForUrls(data.documentElement, tab, that, true);
            var validItems = [];
            //TODO validate url, published, etc
            for (var i=0; i<urls.length; i++) {
              if ( urls[i]['username']) {
                validItems.push(urls[i]);
              }
            }
            CmdUtils.log(validItems);
            that.getFacetsForManyUsers(that, tab, validItems);          
          };   
        }
        var h = this.fetchFeed(that, tab, username, url, successFn);
        jQuery.ajax(h, tab);
        
      }
    }
  },
  fetchFeed: function(that, tab, username, url, successFn){
    return {
        url: url,
        success: successFn,
        error: function(xhr, status, err){
          CmdUtils.log("Ouch trouble fetching the feed " + url);
          CmdUtils.log(xhr);
          CmdUtils.log("XHR call status " + status + " responseText=" + xhr.responseText);
          CmdUtils.log(err);
        }
      };
  },
  /**
   * @param username {string} optional - if username is given, then item will
   *  not each individually
   */
  processFeedForUrls: function(feed, tab, that, isEachWithUsername){
    var $ = jQuery;
    isEachWithUsername = isEachWithUsername || false;
    CmdUtils.log(isEachWithUsername + "== true right?");
    var entries = jQuery('entry', feed);
    var urls = [];
    entries.each(function(i){
      var url = jQuery('link', this).attr('href');
      var time = jQuery('published', this).text();
      var item = {url: escape(url),
                   md5sum: that.md5(url),
                   published: jQuery('published', this).text()};
      if (isEachWithUsername) {
        try{
          //TODO brittle          
          var selector = that.linkSelector(url, tab);
          
          var entry = $(selector, tab.document);
          if (entry.length == 0) {
              logError("processFeedForUrls's selector " + selector + " failed to match any entries", [url]);
          } else {
              var cluster = entry;
              while( cluster.length && ! cluster.hasClass('cluster')){      
                  cluster = cluster.parent();
              }
              if(cluster.length > 0){
                 //update this div...
                  var userHref = $('div.summary a.l_person', cluster).attr('href');                  
                  if ( userHref ) {
                      var pieces = userHref.split('/');
                      // http://friendfeed.com/draarong
                      item['username'] = pieces[pieces.length -1];                      
                  } else {
                     CmdUtils.log("WARNING can't find username for " + url);
                 }
              }else{
                  logError("processFeedForUrls's bubbling up from entry, can't find outter cluster", [entry, cluster]);
              } 
          }
        } catch (error) {
          CmdUtils.log(error);
        }
      }
      urls.push( item);
      });
    return urls;
  },
  getFacetsForUser: function(that, tab, aUsername, urls){
    /* urls [{id: 'md5sum', url: 'url', published: '2009-01-28T06:00:29Z'},] */
    var query = { urls: urls };
    var dataPayload = "q=" + Utils.encodeJson(query);
    CmdUtils.log("preparing continueWithFacets");
    
    var h = {
      url: 'http://oface.ubuntu/resources/user/' + aUsername + '/query_facets',
      type: 'POST',
      dataType: 'json',
      cache: false, // REMOVE FOR PROD
      data: dataPayload,
      success: function(jsn, status){
          CmdUtils.log(jsn);
          
          var data = [];
          for(var i=0; i<jsn.length; i++){
              //TODO we are throwing away id, created date
              data[i] = {
                facets: [jsn[i]['facets'][0]['description']],
                url: unescape(jsn[i]['url']),
                username: aUsername
                };                        
          }
          Oface.Controllers.Oface.continueWithFacets(data, tab);     
      },
      error: function(xhr, status, err){
        CmdUtils.log("status=", status);
        CmdUtils.log("err=", err);
          if(parseInt(xhr.status) == 404) {
              CmdUtils.log("User", aUsername, "is not an OFace user");
              Oface.Controllers.Oface.continueWithFacets([], tab);
          } else {
              CmdUtils.log("Ouch trouble fetching facet info for urls during getFacetsForUser ");
              CmdUtils.log(xhr);          
              CmdUtils.log("XHR call status " + status + " responseText=" + xhr.responseText);          
              CmdUtils.log(err);  
          }
      }
  };
   
  
    jQuery.ajax(h, tab.document);
    /*
    //after async
    var data = urls.slice(0);
    var facets = [["w
    "],["art"],["family"]];
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
  getFacetsForManyUsers: function(that, tab, urls){
    /* urls [{username: 'pattyok', id: 'md5sum', url: 'url', published: '2009-01-28T06:00:29Z'},] */
    CmdUtils.log('getFacetsForManyUsers');
    Oface.Models.ResourceDB.queryFacets(urls, 
       function(jsn, status){
          if(status == 'success'){
            var data = [];
            for(var i=0; i<jsn.length; i++){
              try{
                if (jsn[i]['facets']) {
                  //TODO we are throwing away id and create data, etc
                  data.push({
                    facets: [jsn[i]['facets'][0]['description']],
                    url: unescape(jsn[i]['url']),
                    username: jsn[i]['username']
                  });
                }
              } catch(error){
                CmdUtils.log(error);
              }
            }
            //TODO this could happen earlier? Why here?
            Oface.Controllers.Oface.continueWithFacets(data, tab);
          }
      }, function(xhr, status, err){
          CmdUtils.log("Ouch trouble fetching facet info for urls during getFacetsForManyUsers ");
          CmdUtils.log(xhr);
          CmdUtils.log("XHR call status " + status + " responseText=" + xhr.responseText);
          CmdUtils.log(err);
      });
  },
  linkSelector: function(link, tab){
    var selector = 'div.title a[href=' + link + ']';
      if(link.indexOf('twitter') >= 0){
        selector = 'div[viewinlink=' + link + ']';
      }else if(link.indexOf('friendfeed.com/e/') >= 0){        
        // http://friendfeed.com/e/fdb550f2-869e-4a1c-b4ce-11d2d9d4d282  
        // is not present in the html... it is dynamically added to the
        // More menu item as 'Link to this entry'
        var eid = /^http.?:\/\/.*friendfeed\.com\/e\/(.*)$/.exec(link)[1];
        selector = 'div[eid=' + eid + ']';
        
      }else if(link.indexOf('flickr.com/') >= 0 &&
               jQuery(selector, tab.document).length != 1){
        // flickr is either in the default format or this
        // format when several are collapsed together...
        selector = 'div.container a[href=' + link + ']';
      } else if(link.indexOf('feedproxy.google.com/') >= 0){
        //a[href=http://feedproxy.google.com/~r/slashfilm/~3/vjoxle-72JM/] becomes
        //a[href=http://feedproxy.google.com/%7Er/slashfilm/%7E3/vjoxle-72JM/]
        selector = selector.replace(/~/g, "%7E");
      }
      return selector;
  },
  updateDisplayWithFacets: function(data, tab, that){
    var prevFacet = "";
    var prevItemCount = 0;
    //[CmdUtils.log(i + " " + data[i].facets[0] + " " + data[i].url) for (i in data)];
    CmdUtils.log(data);
    for(var i=0; i < data.length; i++){
      /* Grab an item by url (this varies by webapp)
      *  bubble up the DOM until you reach the FriendFeed container */
      CmdUtils.log(i);
      CmdUtils.log(data[i]);
      if ( ! data[i] | !data[i].url ) {
        CmdUtils.log("ERROR data[i] is null or something is wrong, skipping", data[i]);
        continue;
      }
      
      updateUrlDbWithMd5AndFacets(data[i].url, that.md5(data[i].url), data[i].facets, data[i].username);
      var selector = that.linkSelector(data[i].url, tab);
      CmdUtils.log("the selector=" + selector);
      var a = jQuery(selector, tab.document);
      if(a.length >= 1){
        var success;
        var entry;
        var cluster;
        
        [success, entry  ] = that.findAndTagByClass(a,'entry', data[i].facets);
        CmdUtils.log("updateDisplayWithFacets entry",success, entry);
        if( success ){
          entry.data('lifestream-entry-url', data[i].url);
          entry.addClass('entry-facet-widget-root');
          entry.data('entry-oface-url', data[i].url);
        } else {
          //Flickr uses tr as it's container...
          CmdUtils.log("WARNING, might have found an entry div for anchor tag " + data[i].url);
        }
        [success, cluster] = that.findAndTagByClass(a,'cluster', data[i].facets);
        CmdUtils.log("updateDisplayWithFacets cluster " + " " + success + " " + cluster);
        if(! success ){
          CmdUtils.log("ERROR, expected to find a cluster div for anchor tag " + data[i].url);
        }
        if(! cluster.hasClass('oface')){
          cluster.addClass('oface');
        }
        CmdUtils.log("Looking to call prepareLabel");
        Oface.Controllers.FacetGroups.prepareLabel(prevFacet, data[i].facets[0], prevItemCount, cluster);
        CmdUtils.log("Looking to called prepareLabel");
        prevFacet = data[i].facets[0];
        prevItemCount++;
      }
      if(a.length != 1){
        //href=http://www.flickr.com/photos/wigfur/3229310456/
        CmdUtils.log("Looking for 'div.title a[href=" + data[i].url + "]' but found " + a.length + " items");
        //TODO send a report back to home base???
        
      } //if(a.length == 1){
    } // for(var i=0; i < data.length; i++){
    jQuery('div.cluster, div.pager', tab.document).css('clear', 'left');
    CmdUtils.log('Triggering clustersfaceted');
    jQuery(tab.document).trigger('clustersfaceted');
  },
  findAndTag: function(element, containerClassName, facets, matchFn){
        var cluster = element;
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
  },
  doFacetSwitch: function(username, facet){
    /**
     * TODO replace this with an event, pull code below out into a model db
     * username string the username
     * facet string a facet description
     */
    CmdUtils.log('Switching Current Facet in Database');
    var doc = Application.activeWindow.activeTab.document;
    jQuery('h4.group-facet', doc).show();
    jQuery('h4.group-facet.' + facet, doc).hide('slow');
    
    //TODO Bug off by 1 error? cluster vs entry?
    var itemCount = jQuery('.entry.oface-' + facet + '-facet', doc).length;
    CmdUtils.log("Switching to a facet with " + itemCount);
    
    jQuery('div.current-facet div', doc).text(facet + " (" + itemCount + ")");
    
    jQuery('#oface-enabler span.current-facet-count', doc).text(itemCount);
    
    
    jQuery('div.entry.oface-' + facet + '-facet:hidden, div.cluster.oface-' + facet + '-facet', doc).show('slow');    
    jQuery('div.cluster.oface, div.entry', doc).not('.oface-' + facet + '-facet').hide('slow');
    
    //jQuery('div.cluster', doc).not('.oface').hide('slow');
    
    Oface.Controllers.PageFacetToggle.switchDisplayWithOtherFacets(facet, Application.activeWindow.activeTab);
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
    /**
     * TODO this is a controller method...
     */
    var $ = jQuery;
    var doc = Application.activeWindow.activeTab.document;
    if( $('#' + divId + ' h3#oface-enabler', doc).length == 0){
      CmdUtils.log("Adding widget");
       $('#feed1', doc).prepend($(Oface.Views.pageFacetToggler.toXMLString(), doc));

      var ofaceEnabler = $(Oface.Views.userFacetToggler.toXMLString(), doc);
      
      $('#feed1', doc).prepend(ofaceEnabler);
      $('.current-facet div:first', doc).text(identity.facets[0]['description']);
      
      $('#oface-enabler', doc).click(ofaceToggler);
                        
      $('.current-facet', doc).click(function(){
          $('#switcher', doc).toggle();
      });
      //TODO AOK
      Oface.Controllers.Facet.username = identity.username;
      Oface.Controllers.Facet.initialize.call(Oface.Controllers.Facet);
      $('h3#oface-enabler span.current-facet', doc).css('margin-left', '30px');
    }else{
      CmdUtils.log('Already have the widget');    
    }
  }
};
/**
 * You can use fetch- command  during development (comment out pageLoad_fetchFeedOface )
 * or uncomment pageLoad_fetchFeedOface for auto load
 
function pageLoad_fetchFeedOface(){
  // Not needed any more ?
  //var loc = Application.activeWindow.activeTab.document.location;
  //var enabledFor = ['http://oface.ubuntu/static/test_files/ff-pattyok.html',
  //                 'http://oface.ubuntu/static/test_files/ozten_home.html'];
  //for(var i=0; i < enabledFor.length; i++){
  //    if(loc.href.indexOf(enabledFor[i]) != -1){
          ofaceObj.preview.call(ofaceObj);
  //        break;
}
*/
;(function(){
CmdUtils.CreateCommand(ofaceObj);
})();