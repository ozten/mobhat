;
var Oface = Oface || {};
Oface.Models = Oface.Models || {};

/* model
  stores data
  reads and updates
  from service
*/
Oface.Models.Facet = Oface.Models.Facet || {
        currentFacets: [],
        allFacets: [],        
        updateCurrent: function(newFacets) {
                this.currentFacets = newFacets;
                if (this.allFacets.length == 0) {
                        allFacets = newFacets.slice();                        
                } else {
                        for(var i=0; i<newFacets.length; i++){
                            if( ! this.arrayContainsByKey(newFacets[i], this.allFacets)){                               
                                this.allFacets[this.allFacets.length] = newFacets[i];                                
                            }
                        }
                }
        },
        /**
         * Adds a facet to the allFacets list
         */
        addFacet: function(json){
            CmdUtils.log("addFacet " + this.allFacets.length);
            CmdUtils.log(json);
            for(var i=0; i < json.length; i++){
                this.allFacets[this.allFacets.length] = json[i];
            }
        },
        updateAll: function(newFacets) {
                this.allFacets = newFacets;
        },
        arrayContainsByKey: function(needle, haystack) {
                for (var i = 0; i < haystack.length; i++) {
                        if (needle['id'] == haystack[i]['id']) {
                                return true;
                        }
                }
                return false;
        },
        /**
         * Takes a single facet and persists it
         * @param username {string} - username that we should update
         * @param facets {array} of facets
         * @param forTheWin {function} - callback when successfull. Called with json, status
         * @param fail {function} - callback when there was an error. Called with xhr, msg, exception
         */
        facetsChosen: function(username, facets, forTheWin, fail) {
                var $ = jQuery, doc = Application.activeWindow.activeTab.document;
                //CmdUtils.log("facetsChosen");
                //CmdUtils.log(facets);
                CmdUtils.log("JSON test" + Utils.encodeJson(facets) );
                $.ajax({
                        url: Oface.Controllers.Facet.server + '/facets/current/' + username,
                        type: 'PUT',
                        data: Utils.encodeJson(facets),
                        dataType: "json",
                        success: forTheWin,
                        error: fail
                }, doc);
        },
        /**
         * Removes the facet from the user
         * @param username {string} the username
         * @param facet {array} of facets
         */
        removeUserFacet: function(username, facet) {
          var $ = jQuery, doc = Application.activeWindow.activeTab.document;
                $.ajax({
                        url: Oface.Controllers.Facet.server + '/facets/u/' + username + '/' + facet,
                        type: 'DELETE'
                }, doc);
                function notTheFacet(aFacet, index) {
                        return aFacet['description'] != facet;
                }
                this.currentFacets = $.grep(this.currentFacets, notTheFacet);
                this.allFacets = $.grep(this.allFacets, notTheFacet);                
        }
}; //End Oface.Models.Facet

Oface.Views = Oface.Views || {};
/** view
 *   Mostly in HTML this is the bits of code to manipulate the view
 */
Oface.Views.Facet = Oface.Views.Facet || {
        createAll: function(username) {
          var $ = jQuery, doc = Application.activeWindow.activeTab.document;
                var liTemplate = $('#switcher-facetlist li:first', doc).clone();
                $('#switcher-facetlist li', doc).replaceWith('');
                liTemplate.attr('class', '');
                return function(weight, facetName){
                        var li = liTemplate.clone();
                        li.addClass('weight' + weight);
                        li.find('.facetitem').text(facetName);
                        $('#switcher-facetlist', doc).append(li);
                        return li;
                };
                        
                
        },
        showAll: function() {
          var $ = jQuery, doc = Application.activeWindow.activeTab.document;
                var p = $('#current-facets', doc).position();
                $('#switcher', doc).css({
                        position: 'absolute',
                        'top': p.top,
                        'left': p.left
                });
                $('#switcher', doc).show();
        },
        hideAll: function(){
          var $ = jQuery, doc = Application.activeWindow.activeTab.document;
                $('#switcher', doc).hide();
        },        
        createCurrent: function(){
          var $ = jQuery, doc = Application.activeWindow.activeTab.document;
                var liTemplate = $('#switcher-current-facets li:first', doc).clone();
                var that = this;
                $('#switcher-current-facets li', doc).replaceWith('');
                liTemplate.attr('class', '');
                //CmdUtils.log("created li");
                //CmdUtils.log(this.liTemplate);
                /**
                 * @param weight {number} weight from 1 to 6
                 */
                return function(weight, facetName){
                        //CmdUtils.log(that.liTemplate);
                        var li = liTemplate.clone();
                        li.addClass('weight' + weight);
                        li.addClass("current");
                        li.text(facetName);
                        $('#switcher-current-facets', doc).append(li);
                        //$('#switcher-current-facets', doc).append("<li>foo</li>");
                };
        },
        showCurrent: function() {
          var $ = jQuery, doc = Application.activeWindow.activeTab.document;
            $('#switcher-current-facets', doc).show();
        },
        hideCurrent: function() {
          var $ = jQuery, doc = Application.activeWindow.activeTab.document;
            $('#switcher-current-facets', doc).hide();
        },
        newFacetInput: function(){
          var $ = jQuery, doc = Application.activeWindow.activeTab.document;
            return  $('#switchinput', doc);     
        },
        clearInput: function(){
          var $ = jQuery, doc = Application.activeWindow.activeTab.document;
            $('#switchinput', doc).attr('value', '');      
        }
}; //END Oface.Views.Facet
Oface.Util = Oface.Util || {
        noOp: function(event) {
                //no op
        }
}; //END Oface.Util
/* Controller */
Oface.Controllers = Oface.Controllers || {};
Oface.Controllers.Facet = Oface.Controllers.Facet || {
        username: "Unknown",
        server: "http://oface.ubuntu", 
        initialize: function(){
                //CmdUtils.log(this);
                //CmdUtils.log('xx');
                var that = this;
                var $ = jQuery, doc = Application.activeWindow.activeTab.document;
                
                var switcherXml = <div id="switcher" style='position:absolute; z-index: 2; width: 600px; display: none; background-color: #CCC;'>
						<div id="all-facets">
								<h4>All Facets</h4>

								<ul id='switcher-facetlist' style="list-style-type: none;">
                                <!-- TODO li id="template" doesn't get overwritten -->
										<li id="template" style="float: left; margin-right: 5px"><span class="facetitem"></span> <a href="#" class="remove-facet-a">x</a></li>
								</ul>
                          <div style="clear:left">
						    <label for="switchinput">Add A New Facet:</label> <input id="switchinput" value="" />
						    <button id="all-facets-close">Close</button>
                          </div>
						</div>				        
				</div>.toXMLString();
                CmdUtils.log(switcherXml);
                $('#oface-enabler', doc).after(switcherXml);
                //TODO does this work without the context?
                
                $.get(this.server + '/facets/current/' + this.username, {},
                    function(json) {
                        Oface.Models.Facet.updateCurrent(json);
                        //TODO using call here isn't necissary
                        var curFacetView = Oface.Views.Facet.createCurrent.call(Oface.Views.Facet);
                        
                        var currentFacets = Oface.Models.Facet.currentFacets;
                        for (var i = 0; i < currentFacets.length; i++) {
                                curFacetView(currentFacets[i]['weight'],
                                     currentFacets[i]['description']);                               
                        }
                        $('#switcher-current-facets li', doc).click(Oface.Views.Facet.showAll);
                        Oface.Views.Facet.showCurrent();
                        
                        }, "json");
                $.get(this.server + '/facets/weighted/' + that.username, {},
                        function(json) {
                                Oface.Models.Facet.updateAll(json);
                                CmdUtils.log("got facets");
                                that.updateAllView();
                        },
                "json");
                var context = {username: Oface.Controllers.Facet.username};
                //CmdUtils.log("preparing username");
                //CmdUtils.log(context);
                /* add behaviors */
                Oface.Views.Facet.newFacetInput().bind('blur', context, Oface.Controllers.Facet.handleNewFacetCreated);
                $('#all-facets-close', doc).bind('click', context, Oface.Controllers.Facet.allFacetsCloseHandler);        
        },
        updateAllView: function(){
                CmdUtils.log("updateAllView called");
                var that = this;
                                var currentFacets = Oface.Models.Facet.currentFacets;
                                var allFacets = Oface.Models.Facet.allFacets;
                                CmdUtils.log(allFacets);
                                var view = Oface.Views.Facet.createAll(that.username);
                                for (var i = 0; i < allFacets.length; i++) {
                                        CmdUtils.log(allFacets[i]);
                                    //CmdUtils.log(allFacets[i]['weight'] + " " + allFacets[i]['description']);
                                    var f = view(allFacets[i]['weight'],
                                                 allFacets[i]['description']);
                                        f.bind('click',
                                                {username: Oface.Controllers.Facet.username,
                                                description: allFacets[i]['description']}, Oface.Controllers.Facet.handleOtherFacetChosen);
                                    if (Oface.Models.Facet.arrayContainsByKey(allFacets[i], currentFacets)) {
                                        f.addClass("current").find('.remove-facet-a').hide();
                                    } else {
                                        f.find('.remove-facet-a').show();
                                    }
                                    f.find('.remove-facet-a').bind('click', {
                                            facet: allFacets[i]['description']
                                        },
                                        function(event) {
                                            //TODO username is available in this scope
                                            Oface.Models.Facet.removeUserFacet(Oface.Controllers.Facet.username, event.data.facet);
                                            //Oface.Views.Facet.showCurrent();
                                            //Oface.Views.Facet.createAll(Oface.Controllers.Facet.username);
                                            CmdUtils.log('deleted a facet');
                                            that.updateAllView();
                                            Oface.Views.Facet.showAll();
                                            return false;
                                        });
                                }      
        },
        chooseNewFacetCallback: function(json, status){                
                Oface.Models.Facet.addFacet.call(Oface.Models.Facet, json);
                CmdUtils.log(this);
                this.updateAllView();
                this.chooseFacetCallback(json, status);
        },
        chooseFacetCallback: function(json, status) {
          var $ = jQuery, doc = Application.activeWindow.activeTab.document;
                CmdUtils.log("chooseFacet called");
                //AOK
                Oface.Models.Facet.updateCurrent(json);
                //CmdUtils.log("updating current facet");
                var curFacetView = Oface.Views.Facet.createCurrent.call(Oface.Views.Facet);
                
                var currentFacets = Oface.Models.Facet.currentFacets;                        
                        for (var i = 0; i < currentFacets.length; i++) {
                                curFacetView(currentFacets[i]['weight'],
                                             currentFacets[i]['description']);                               
                        }
                        //TODO get rid of jQuery here... 
                $('#switcher-current-facets li', doc).click(Oface.Views.Facet.showAll);
                Oface.Views.Facet.showCurrent();
                
                Oface.Views.Facet.hideAll();
        },
        handleOtherFacetChosen: function(event) {
                that = this;
                var data = event.data;
                //CmdUtils.log("We're expecting a facet here under description");
                //CmdUtils.log(event.data);
                Oface.Models.Facet.facetsChosen(Oface.Controllers.Facet.username, [data['description']],
                    function(json, status){                        
                        Oface.Controllers.Facet.chooseFacetCallback(json, status);
                    }, Oface.Util.noOp);
                CmdUtils.log("Calling doFacetSwitch with " + Oface.Controllers.Facet.username + " " + data['description'])
                ofaceObj.doFacetSwitch(Oface.Controllers.Facet.username, data['description']);
        },
        /**
         * handleNewFacetCreated is called only with potentially new facets
         */
        handleNewFacetCreated: function(event) {
          var $ = jQuery, doc = Application.activeWindow.activeTab.document;
                Oface.Models.Facet.facetsChosen(event.data.username, $('#switchinput', doc).attr('value').split(','), function(json, status){
                    Oface.Controllers.Facet.chooseNewFacetCallback.call(Oface.Controllers.Facet, json, status);
                    //Oface.Controllers.Facet.chooseNewFacetCallback(json, status);
                }, Oface.Util.noOp);
                ofaceObj.doFacetSwitch(Oface.Controllers.Facet.username, ($('#switchinput', doc).attr('value').split(','))[0]);
                Oface.Views.Facet.clearInput();
                
        },
        allFacetsCloseHandler: function() {
                Oface.Views.Facet.hideAll();
        }
} // END Oface.Controllers.Facet


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
    $('h3#oface-enabler span.current-facet', doc).hide();
    $('#oface-other-facets', doc).hide();
    lastSeenFacetHeadings = $('h4.facet:visible', doc).hide();
    lastHiddenSubItems = $('.entry:hidden',doc);
    lastHiddenItems = $('div.oface:hidden', doc).show();
    //TODO rename class oface to oface-cluster and add a new one oface-entry
    $('.oface:hidden').show();
    lastHiddenSubItems.show();
    jQuery('div.cluster', doc).not('.oface').show();
    oFaceIsEnabled = false;
    
    
  }else{
    $('h3#oface-enabler span.status', doc).text("Enabled");
    $('h3#oface-enabler span.current-facet', doc).show();
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
        if( page.type == Oface.WhatPageIsThis.PROFILE_PAGE ) {
          var username = Oface.WhatPageIsThis.getUsername.call(Oface.WhatPageIsThis, page.url, page.type);
          successFn = function(data, status){
            CmdUtils.log("atom feed XHR call status " + status);
            CmdUtils.log(data);
            var urls = that.processFeedForUrls(data.documentElement, tab, that);
            CmdUtils.log(urls);
            CmdUtils.log('in preview calling that.getFacetsForUser');
            that.getFacetsForUser(that, tab, pblock, username, urls, false);          
          };          
        } else {
          // Home, or other mixed username page... not in the url
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
            that.getFacetsForManyUsers(that, tab, pblock, validItems);          
          };   
        }
        var h = this.fetchFeed(that, tab, username, url, successFn);
        jQuery.ajax(h, tab);
        if(pblock){
          pblock.innerHTML = "Loading";
        }
      }
    }
  },
  fetchFeed: function(that, tab, username, url, successFn){
    return {
        url: url,
        success: successFn,
        error: function(xhr, status, err){
          CmdUtils.log("Ouch trouble fetching the feed " + url);
          CmdUtils.log("XHR call status " + status);
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
    var entries = jQuery('entry', feed);
    var urls = [];
    entries.each(function(i){
      var url = jQuery('link', this).attr('href');
      var time = jQuery('published', this).text();
      var item = {url: escape(url),
                   id: that.md5(url),
                   published: jQuery('published', this).text()};
      if (isEachWithUsername) {
        try{
          //TODO brittle
          //aok a
          var selector = that.linkSelector(url, tab);
          //'a[href=' + url + ']'
          var userHref = $('div.summary a.l_person', $($(selector, tab.document).get(0)).parent().parent().parent()).attr('href');
          if ( userHref ) {
            var pieces = userHref.split('/');
            // http://friendfeed.com/draarong
            item['username'] = pieces[pieces.length -1];
            CmdUtils.log('USERNAME: ' + item['username']);
          } else {
            CmdUtils.log("WARNING can't find username for " + url);
          }
        } catch (error) {
          CmdUtils.log(error);
        }
      }
      urls.push( item);
      });
    return urls;
  },
  getFacetsForUser: function(that, tab, pblock, aUsername, urls){
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
            var currentFacet = 'art';//TODO
            
            CmdUtils.log('never here');
            
            that.updateDisplayWithOtherFacets(data, currentFacet, tab, that);
            //simulate click on facet heading
            that.switchFacetDisplay.call(jQuery('h4.facet.' + currentFacet, tab.document).get(0), aUsername);
            var missed = jQuery('div.cluster', tab.document).not('.oface');            
            //jQuery('div.cluster', tab.document).not('.oface').css('background-color', 'red');
            missed.hide();      
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
  getFacetsForManyUsers: function(that, tab, pblock, urls){
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
                  //TODO we are throwing away id, created date
              
                  //TODO loop through here and grab all the facets instead of the first
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
            //aok
            that.updateDisplayWithFacets(data, tab, that);            
            var currentFacet = 'geek';//TODO
            var aUsername    = 'ozten'; //TODO
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
          CmdUtils.log("Ouch trouble fetching facet info for urls ");
          CmdUtils.log("XHR call status " + status);
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
      if ( ! data[i] ) {
        continue;
      }
      var selector = that.linkSelector(data[i].url, tab);
      //CmdUtils.log("selector=" + selector);
      var a = jQuery(selector, tab.document);
      if(a.length == 1){
        var success;
        var entry;
        var cluster;
        
        [success, entry  ] = that.findAndTagByClass(a,'entry', data[i].facets);
        CmdUtils.log("updateDisplayWithFacets entry " + " " + success + " " + entry);
        if(! success ){
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
    CmdUtils.log('updateDisplayWithOtherFacets called about to add other facets');
    jQuery('#oface-other-facets', tab.document).append("<li style='display: inline; margin-right: 0.2em'>Filtered Out of Page:</li>");
    for (var i=0; i< facets.length; i++){
      CmdUtils.log('updateDisplayWithOtherFacets adding ');
      CmdUtils.log(facets[i]);
      var li = jQuery("<li class='oface-enabler-" + facets[i] + "-other facet " + facets[i] + "' style='display: inline; margin-right: 2em'><span class='facet-name'>" + facets[i] +
                                                         "</span> <span class='count'>" + counts[i] + "</span></li>", tab.document);
      li.click(that.switchFacetDisplay);
      jQuery('#oface-other-facets', tab.document).append(li);
      
    }
    that.switchDisplayWithOtherFacets(currentFacet, tab);
    //hide currentFacet
  },
  switchDisplayWithOtherFacets: function(currentFacet, tab){
    jQuery('#oface-other-facets li:hidden', tab.document).show();
    jQuery('#oface-other-facets #oface-enabler-' + currentFacet + "-other", tab.document).hide();
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
  },
  switchFacetDisplay: function(username){
    /**
     * this - is the 6.toggler the user clicked
    */
    CmdUtils.log("switchFacetDisplay(" + username + ")");
    var facet = jQuery('span.facet-name', this).text();
    ofaceObj.doFacetSwitch(username, facet);        
  },
  doFacetSwitch: function(username, facet){
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
    
    //TODO call switchDisplayWithOtherFacets
    jQuery('#oface-other-facets li:hidden', doc).show();
    jQuery('#oface-other-facets #oface-enabler-' + facet + "-other", doc).hide();
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
      Oface.Controllers.Facet.username = 'ozten';
      Oface.Controllers.Facet.initialize.call(Oface.Controllers.Facet);
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
    var url = doc.location.href;
    //TODO 
    if (url == "http://oface.ubuntu/static/test_files/ff-pattyok.html") {
      CmdUtils.log('Replacing ' + url + " with hardcoded http://friendfeed.com/pattyok");
      url = "http://friendfeed.com/pattyok";
    } else if(url == "http://oface.ubuntu/static/test_files/ozten_home.html") {
      CmdUtils.log('Replacing ' + url + " with hardcoded http://friendfeed.com/");
      url = "http://friendfeed.com/";
    }
    var aPageType = this.pageType(url);
    return {isKnown:  this.isSupportedPage(aPageType),
            type: aPageType,
            url: url};
  },
  HOME_PAGE: "home",            HOME_REGEX:     /^https?:\/\/w?w?w?\.?friendfeed\.com\/$/,
  PROFILE_PAGE: "profile",      PROFILE_REGEX:  /^https?:\/\/w?w?w?\.?friendfeed\.com\/(\w+)$/,
  LIST_PAGE: "list",            LIST_REGEX:     /^https?:\/\/w?w?w?\.?friendfeed\.com\/list\/(\w+)$/,
  ROOMS_LIST_PAGE: "roomslist", ROOMS_LIST_REGEX: /^https?:\/\/w?w?w?\.?friendfeed\.com\/rooms$/,
  ROOM_PAGE: "room",            ROOM_REGEX:     /^https?:\/\/w?w?w?\.?friendfeed\.com\/rooms\/(\w+)$/,
  EVERYONE_PAGE: "everyone",    EVERYONE_REGEX: /^https?:\/\/w?w?w?\.?friendfeed\.com\/public$/,
  //A User's Profile plus their friends
  FRIENDS_PAGE: "profilewfriends", FRIENDS_REGEX: /^https?:\/\/w?w?w?\.?friendfeed\.com\/(\w+)\/friends$/,
  UNKNOWN_PAGE: "unknown",
  pageType: function(url){    
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
    // USER_COMMENTS_PAGE /^https?:\/\/w?w?w?\.?friendfeed\.com\/(\w+)\/comments$/
    // USER_LIKES_PAGE   /^https?:\/\/w?w?w?\.?friendfeed\.com\/(\w+)\/likes$/
    // USER_DISCUSSION /^https?:\/\/w?w?w?\.?friendfeed\.com\/(\w+)\/discussion$/
    // SEARCH http://friendfeed.com/search?required=q&q=lisp&friends=ozten
  },
  getUsername: function(url, pageType){
    if (pageType === this.PROFILE_PAGE) {
      var match = this.PROFILE_REGEX.exec(url);
      if (match.length == 2) {
        return match[1];
      } else {
        CmdUtils.log("ERROR: getUsername(" + url + ", " + pageType + " called. Matched didn't have exactly 1 username piece, it had ");
        CmdUtils.log(match);
      }
    } else {
      CmdUtils.log("ERROR: getUsername(" + url + ", " + pageType + " called. Expected a PROFILE_PAGE types instead.");
    }
    
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