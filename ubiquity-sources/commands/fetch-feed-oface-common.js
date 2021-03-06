;var ofaceObj = {
  name: "fetch-feed-oface",
  env: "http://friendfeed.com",
  testenv: "http://oface.ubuntu/static/test_files/",
  envFor: function(url){
    Oface.log(url);
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
    
    if ( Oface.running === undefined || (new Date() - Oface.running) > 3000 ) {
        Oface.running = new Date();
        //Oface.log("Starting oface");
        CmdUtils.log("Starting oface");
        Oface.Controllers.Oface.main(this);
    } else {
        Oface.log("Skipping oface, instance already running");
    }
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
      Oface.log("Unknown page type... Skipping");
    } else {      
      if ( ! Oface.WhatPageIsThis.isSupportedPage(page.type)){
        Oface.log("Page type " + page.type + " Skipping");
      } else {
        var sucessFn;
        var username;
        Oface.log("I think I am on a " + page.type + " page");
        if( page.type == Oface.WhatPageIsThis.PROFILE_PAGE ) {
          username = Oface.WhatPageIsThis.getUsername.call(Oface.WhatPageIsThis, page.url, page.type);
          successFn = function(data, status){
            Oface.Timing.step2complete = new Date();
            Oface.log("atom feed XHR call status " + status);
            Oface.log(data);
            var urls = that.processFeedForUrls(data.documentElement, tab, that);
            
            Oface.log('in preview calling that.getFacetsForUser');
            that.getFacetsForUser(that, tab, username, urls, false);          
          };          
        } else {
          // Home, or other mixed username page... not in the url
          username = identity.username;
          successFn = function(data, status){
            Oface.Timing.step2complete = new Date();
            Oface.log("atom feed XHR call status " + status);
            
            var urls = that.processFeedForUrls(data.documentElement, tab, that, true);
            var validItems = [];
            //TODO validate url, published, etc
            for (var i=0; i<urls.length; i++) {
              if ( urls[i]['username']) {
                validItems.push(urls[i]);
              }
            }
            Oface.log(validItems);
            that.getFacetsForManyUsers(that, tab, validItems);          
          };   
        }
        Oface.Timing.step2_start = new Date();
        var h = this.fetchFeed(that, tab, username, url, successFn);
        Oface.Util.ajax(h, tab);
        
      }
    }
  },
  fetchFeed: function(that, tab, username, url, successFn){
    return {
        url: url,
        success: successFn,
        error: function(xhr, status, err){
          Oface.log("Ouch trouble fetching the feed " + url);
          Oface.log(xhr);
          Oface.log("XHR call status " + status + " responseText=" + xhr.responseText);
          Oface.log(err);
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
                     Oface.log("WARNING can't find username for " + url);
                 }
              }else{
                  logError("processFeedForUrls's bubbling up from entry, can't find outter cluster", [entry, cluster]);
              } 
          }
        } catch (error) {
          Oface.log(error);
        }
      }
      urls.push( item);
      });
    return urls;
  },
  logTiming: function(){
    Oface.log("xLogging timing back to home");
          Oface.Timing.step3queryFacets_complete = new Date();
          
          var timingUrl = Oface.HOST + '/static/images/timing.gif?s1=' + Oface.Timing.start.getTime() +
            '&s1c=' + Oface.Timing.step1WhoAmI_complete.getTime() +
            '&s2s=' + Oface.Timing.step2_start.getTime() +
            '&s2c=' + Oface.Timing.step2complete.getTime();
            timingUrl += '&s3s=' + Oface.Timing.step3queryFacets_start.getTime() +
            '&s3c=' + Oface.Timing.step3queryFacets_complete.getTime() +
            '&v=' + Oface.version;
            
          Oface.log("Looking for " + timingUrl);
          jQuery.get(timingUrl);
  },
  getFacetsForUser: function(that, tab, aUsername, urls){
    /* urls [{id: 'md5sum', url: 'url', published: '2009-01-28T06:00:29Z'},] */
    var query = { urls: urls };
    Oface.log("ENCODEJSON getFacetsForUser", query);
    var dataPayload = "q=" + Utils.encodeJson(query);
    Oface.log("Finished Using Utils.encodeJson");
    Oface.log("preparing continueWithFacets");
    
    var h = {
      url: Oface.HOST + '/resources/user/' + aUsername + '/query_facets',
      type: 'POST',
      dataType: 'json',
      cache: false, // REMOVE FOR PROD
      data: dataPayload,
      success: function(jsn, status){
          that.logTiming();
          var data = [];
          for(var i=0; i<jsn.length; i++){
              //TODO we are throwing away id, created date
              if (jsn[i]['facets'] && jsn[i]['facets'].length > 0){
                data[i] = {
                  facets: [jsn[i]['facets'][0]['description']],
                  url: unescape(jsn[i]['url']),
                  username: aUsername
                  };
              }
          }
          Oface.Controllers.Oface.continueWithFacets(data, tab);     
      },
      error: function(xhr, status, err){
        Oface.log("status=", status);
        Oface.log("err=", err);
          if(parseInt(xhr.status) == 404) {
              Oface.log("User", aUsername, "is not an OFace user");
              Oface.Controllers.Oface.continueWithFacets([], tab);
          } else {
              Oface.log("Ouch trouble fetching facet info for urls during getFacetsForUser ");
              Oface.log(xhr);          
              Oface.log("XHR call status " + status + " responseText=" + xhr.responseText);          
              Oface.log(err);  
          }
      }
  };
   
    Oface.Timing.step3queryFacets_start = new Date();
    Oface.Util.ajax(h, tab.document);
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
    Oface.log('getFacetsForManyUsers');
    Oface.Timing.step3queryFacets_start = new Date();
    Oface.Models.ResourceDB.queryFacets(urls, 
       function(jsn, status){
          Oface.log("got results for getFacetsForManyUsers");
          that.logTiming();
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
                Oface.log(error);
              }
            }
            //TODO this could happen earlier? Why here?
            Oface.Controllers.Oface.continueWithFacets(data, tab);
          }
      }, function(xhr, status, err){
          Oface.log("Ouch trouble fetching facet info for urls during getFacetsForManyUsers ");
          Oface.log(xhr);
          Oface.log("XHR call status " + status + " responseText=" + xhr.responseText);
          Oface.log(err);
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
    //[Oface.log(i + " " + data[i].facets[0] + " " + data[i].url) for (i in data)];
    //Oface.log(data);
    for(var i=0; i < data.length; i++){
      /* Grab an item by url (this varies by webapp)
      *  bubble up the DOM until you reach the FriendFeed container */
      //Oface.log(i);
      //Oface.log(data[i]);
      if ( ! data[i] | !data[i].url ) {
        Oface.log("ERROR data[i] is null or something is wrong, skipping", data[i]);
        continue;
      }
      
      updateUrlDbWithMd5AndFacets(data[i].url, that.md5(data[i].url), data[i].facets, data[i].username);
      var selector = that.linkSelector(data[i].url, tab);
      Oface.log("the selector=" + selector);
      var a = jQuery(selector, tab.document);
      if(a.length >= 1){
        var success;
        var entry;
        var cluster;
        
        [success, entry  ] = that.findAndTagByClass(a,'entry', data[i].facets);
        Oface.log("updateDisplayWithFacets entry",success, entry);
        if( success ){
          entry.data('lifestream-entry-url', data[i].url);
          entry.addClass('entry-facet-widget-root');
          entry.data('entry-oface-url', data[i].url);
        } else {
          //Flickr uses tr as it's container...
          Oface.log("WARNING, might not have found an entry div for anchor tag " + data[i].url);
        }
        [success, cluster] = that.findAndTagByClass(a,'cluster', data[i].facets);
        Oface.log("updateDisplayWithFacets cluster " + " " + success + " " + cluster);
        if(! success ){
          Oface.log("ERROR, expected to find a cluster div for anchor tag " + data[i].url);
        }
        if(! cluster.hasClass('oface')){
          cluster.addClass('oface');
        }
        Oface.Controllers.FacetGroups.prepareLabel(prevFacet, data[i].facets[0], prevItemCount, cluster);
        prevFacet = data[i].facets[0];
        prevItemCount++;
      }
      if(a.length != 1){
        //href=http://www.flickr.com/photos/wigfur/3229310456/
        //Oface.log("Looking for 'div.title a[href=" + data[i].url + "]' but found " + a.length + " items");
        //TODO send a report back to home base???
        
      } //if(a.length == 1){
    } // for(var i=0; i < data.length; i++){
    ofaceObj.doFacetSwitch(identity.username, identity.facets[0]['description']);
    jQuery('div.cluster, div.pager', tab.document).css('clear', 'left');
    Oface.log('Triggering clustersfaceted');
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
    Oface.log('Switching Current Facet in Display');
    var doc = Application.activeWindow.activeTab.document;
    jQuery('h4.group-facet', doc).show();
    jQuery('h4.group-facet.' + facet, doc).hide('slow');
    
    //TODO Bug off by 1 error? cluster vs entry?
    var itemCount = jQuery('.entry.oface-' + facet + '-facet', doc).length;
    Oface.log("Switching to a facet with " + itemCount);
    
    jQuery('div#facet-toggler-display', doc).text(facet + " (" + itemCount + ")");
    
    jQuery('#oface-enabler span.current-facet-count', doc).text(itemCount);
    
    jQuery('div.entry.oface-' + facet + '-facet:hidden, div.cluster.oface-' + facet + '-facet', doc).show('slow');    
    jQuery('div.cluster.oface', doc).not('.oface-' + facet + '-facet').hide('slow');
    
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
      Oface.log("Adding widget");
      $('#feed1', doc).prepend('<br id="asdf" style="clear: both;" />');
       $('#feed1', doc).prepend($(Oface.Views.pageFacetToggler.toXMLString(), doc));

      var ofaceEnabler = $(Oface.Views.userFacetToggler.toXMLString(), doc);
      
      $('#feed1', doc).prepend(ofaceEnabler);      
      $('#facet-toggler-display', doc).text(identity.facets[0]['description']);
      
      $('#oface-enabler', doc).click(ofaceToggler);
      $('.current-facet', doc).click(function(){
          $('#switcher', doc).toggle();
      });
                        
      //TODO AOK
      Oface.Controllers.Facet.username = identity.username;
      Oface.Controllers.Facet.initialize.call(Oface.Controllers.Facet);
      $('h3#oface-enabler span.current-facet', doc).css('margin-left', '30px');
      Oface.log("Finishing with addOfaceEnabed");
    }else{
      Oface.log('Already have the widget');    
    }
  }
};