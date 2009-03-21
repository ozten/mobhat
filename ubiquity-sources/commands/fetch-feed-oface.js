var ofaceObj = {
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
    whoAmI(this);
  },
  continueEnablingOface: function(){
        var tab = Application.activeWindow.activeTab;    
    var url = this.envFor(tab.document.location.href) + jQuery('link[type=application/atom+xml]', tab.document).attr('href');
    CmdUtils.log('URL=' + url);
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
          CmdUtils.log("Selector = " + selector);
          //'a[href=' + url + ']'
          
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
                  
                  CmdUtils.log(userHref);
                  if ( userHref ) {
                      var pieces = userHref.split('/');
                      // http://friendfeed.com/draarong
                      item['username'] = pieces[pieces.length -1];
                      CmdUtils.log('USERNAME: ' + item['username']);
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
    CmdUtils.log(urls);
    var query = { urls: urls };
    var dataPayload = "q=" + Utils.encodeJson(query);
    
    var h = {
      url: 'http://oface.ubuntu/resources/user/' + aUsername + '/query_facets',
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
            CmdUtils.log('here but');
            try{
                that.updateDisplayWithFacets(data, tab, that);            
            } catch(e){
              CmdUtils.log('caught error while in getFacetsForUser');
              CmdUtils.log(e);
            }
            var currentFacet = 'art';//TODO does this duplicate efforts of the Switcher
            that.updateDisplayWithOtherFacets(data, currentFacet, tab, that);
            //simulate click on facet heading
            that.switchFacetDisplay.call(jQuery('h4.facet.' + currentFacet, tab.document).get(0), aUsername);
            var missed = jQuery('div.cluster', tab.document).not('.oface');            
            //jQuery('div.cluster', tab.document).not('.oface').css('background-color', 'red');
            missed.hide();      
          }
      },
      error: function(xhr, status, err){
          CmdUtils.log("Ouch trouble fetching facet info for urls during getFacetsForUser ");
          CmdUtils.log(xhr);          
          CmdUtils.log("XHR call status " + status + " responseText=" + xhr.responseText);          
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
  getFacetsForManyUsers: function(that, tab, urls){
    /* urls [{username: 'pattyok', id: 'md5sum', url: 'url', published: '2009-01-28T06:00:29Z'},] */
    CmdUtils.log('getFacetsForManyUsers');
    var query = { urls: urls };
    var dataPayload = "q=" + Utils.encodeJson(query);
    
    var h = {
      url: 'http://oface.ubuntu/resources/query_facets',
      type: 'POST',
      dataType: 'json',
      cache: false, // REMOVE FOR PROD
      data: dataPayload,
      success: function(jsn, status){
          if(status == 'success'){
            var data = [];
            
            for(var i=0; i<jsn.length; i++){
              try{
                if (jsn[i]['facets']) {
                  //TODO we are throwing away id and create data, etc
                  data.push({
                    facets: [jsn[i]['facets'][0]['description']],
                    url: unescape(jsn[i]['url'])
                  });
                }
              } catch(error){
                CmdUtils.log(error);
              }
            }
            CmdUtils.log("Setting up ofaceenabled widget");
            that.addOfaceEnabled();
            
            that.updateDisplayWithFacets(data, tab, that);            
            var currentFacet = identity.facets[0];
            var aUsername    = identity.username;
            that.updateDisplayWithOtherFacets(data, currentFacet, tab, that);
            //simulate click on facet heading
            that.switchFacetDisplay.call(jQuery('h4.facet.' + currentFacet, tab.document).get(0), aUsername);
            var missed = jQuery('div.cluster', tab.document).not('.oface');
            CmdUtils.log("Missed " + missed.length + "items, turning em red");
            //jQuery('div.cluster', tab.document).not('.oface').css('background-color', 'red');
            missed.hide();
          }
      },
      error: function(xhr, status, err){
          CmdUtils.log("Ouch trouble fetching facet info for urls during getFacetsForManyUsers ");
          CmdUtils.log(xhr);
          CmdUtils.log("XHR call status " + status + " responseText=" + xhr.responseText);
          CmdUtils.log(err);
      },
      complete: function(){
          CmdUtils.log("woot");
      }
  };
   
  
    jQuery.ajax(h, tab.document);
  },
  linkSelector: function(link, tab){
    var selector = 'div.title a[href=' + link + ']';
      CmdUtils.log(selector);
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
        CmdUtils.log("feedproxy.google case selector now " + selector);
      }
      return selector;
  },
  updateDisplayWithFacets: function(data, tab, that){
    var prevFacet = "";
    var t = null;
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
      
      updateUrlDbWithMd5AndFacets(data[i].url, that.md5(data[i].url), data[i].facets);
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
          t.click(function(){that.switchFacetDisplay();that.doFacetSwitch(identity.username, facet);});
          //AOK TODO A switchFacetInDB          
          jQuery('div.cluster, div.pager', tab.document).css('clear', 'left');
        }
        prevFacet = data[i].facets[0];
        prevItemCount++;
      }
      if(a.length != 1){
        //href=http://www.flickr.com/photos/wigfur/3229310456/
        CmdUtils.log("Looking for 'div.title a[href=" + data[i].url + "]' but found " + a.length + " items");
        //TODO send a report back to home base???
        
      } //if(a.length == 1){
    } // for(var i=0; i < data.length; i++){
    CmdUtils.log('Triggering clustersfaceted');
    jQuery(tab.document).trigger('clustersfaceted');
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
    CmdUtils.log('updateDisplayWithOtherFacets called about to add other facets');
    jQuery('#oface-other-facets', tab.document).append("<li style='display: inline; margin-right: 0.2em'>Filtered Out of Page:</li>");
    for (var i=0; i< facets.length; i++){
      CmdUtils.log('updateDisplayWithOtherFacets adding ');
      CmdUtils.log(facets[i]);
      var li = jQuery("<li class='oface-enabler-" + facets[i] + "-other facet " + facets[i] + "' style='display: inline; margin-right: 2em'><span class='facet-name'>" + facets[i] +
                                                         "</span> <span class='count'>" + counts[i] + "</span></li>", tab.document);
      li.click(function(){that.switchFacetDisplay();that.doFacetSwitch(identity.username, facet);});
      //AOK TODO A switchFacetInDB     
      jQuery('#oface-other-facets', tab.document).append(li);
      
    }
    that.switchDisplayWithOtherFacets(currentFacet, tab);
    //hide currentFacet
  },
  switchDisplayWithOtherFacets: function(currentFacet, tab){
    CmdUtils.log('switchDisplayWithOtherFacets');
    jQuery('#oface-other-facets li:hidden', tab.document).show();
    jQuery('#oface-other-facets li.oface-enabler-' + currentFacet + "-other", tab.document).hide();
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
  switchFacetDisplay: function(username){
    /**
     * this - is the 6.toggler the user clicked
    */
    
    var facet = jQuery('span.facet-name', this).text();
    //AOK TODO A switchFacetInDB     delete this line...        
  },
  doFacetSwitch: function(username, facet){
    CmdUtils.log('Switching Current Facet in Database');
    var doc = Application.activeWindow.activeTab.document;    
    jQuery.ajax({
                        url: 'http://oface.ubuntu/facets/current/' + username,
                        type: 'PUT',
                        data: '["' + facet + '"]',
                        dataType: "json"                        
                }, doc);
    jQuery('h4.facet', doc).show();
    jQuery('h4.facet.' + facet, doc).hide('slow');
    
    //TODO Bug off by 1 error? cluster vs entry?
    var itemCount = jQuery('.entry.oface-' + facet + '-facet', doc).length;
    CmdUtils.log("Switching to a facet with " + itemCount);
    
    jQuery('div.current-facet div', doc).text(facet + " (" + itemCount + ")");
    
    jQuery('#oface-enabler span.current-facet-count', doc).text(itemCount);
    
    
    jQuery('div.entry.oface-' + facet + '-facet:hidden, div.cluster.oface-' + facet + '-facet', doc).show('slow');    
    jQuery('div.cluster.oface, div.entry', doc).not('.oface-' + facet + '-facet').hide('slow');
    
    //jQuery('div.cluster', doc).not('.oface').hide('slow');
    
    ofaceObj.switchDisplayWithOtherFacets(facet, Application.activeWindow.activeTab);
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
      CmdUtils.log("Adding widget");
       $('#feed1', doc).prepend($("<ul id='oface-other-facets' style='float: left; list-style-type: none;'></ul>", doc));

      var ofaceEnabler = $(<div><h3 id='oface-enabler' style='float: left' title='Click to Change'>Oface is
                               <span class='status'>Enabled</span>
                               <img src='http://oface.ubuntu/static/images/dell_icon-power-button.gif'
                                    style='vertical-align: bottom' width='16' height='16' />
                               
                              </h3>
                              
                                <div class='current-facet' ><div style="margin-top:17px; margin-left: 3px; float:left">webdev</div>
                                  <div class='switcher-arrow' style='margin-top:20px; float: left; height:6px; width:7px; margin-left:3px; font-size:0; vertical-align:middle; background:transparent url(http://oface.ubuntu/static/images/gmail_downarros.png) no-repeat scroll -36px 50%;'> x</div>
                                </div>
                              </div>.children().toXMLString(), doc);

                        
                        /*
                         background:transparent url(images/2/5/chrome/vimages7.png) no-repeat scroll -36px 50%;





                        */
      $('#feed1', doc).prepend(ofaceEnabler);
      $('#oface-enabler', doc).click(ofaceToggler);
                        
      $('.current-facet', doc).click(function(){
          CmdUtils.log('click');
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