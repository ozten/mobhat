Oface.Util = Oface.Util || {
        noOp: function(event) {
                //no op
        }
}; //END Oface.Util

/* Controller */
Oface.Controllers = Oface.Controllers || {};
Oface.Controllers.Oface = Oface.Controllers.Facet || {
    main: function(context){
        //TODO... we should check current page first
        // also we should make next step explicit? or
        // is the too much coupling?
        Oface.Models.UserDB.whoAmI(context, function(data, status){
          //TODO jQuery json ... data is a string and not an oject...why?
            CmdUtils.log("whoAmI success with: ", data);
            //TODO identity is global object... belongs in the Models module?
            identity = data;
            jQuery('#oface-login-form', Application.activeWindow.activeTab.document).hide();
            context.continueEnablingOface();
        }, function(xhr, status, error){
          CmdUtils.log(xhr);
          CmdUtils.log(xhr.status);
            if (xhr.status == 401) {
                askForLogin(context);
            } 
            CmdUtils.log("whoAmI ERROR with: ");
            CmdUtils.log(xhr);
            CmdUtils.log(status);
            CmdUtils.log(error);
            
        });
        
        //Register Events and their controllers
        whenWeSee('lifestream-entries-infos-available',
                  Oface.Controllers.PageFacetToggle.handleLifestreamEntriesInfosAvailable);
    }
};

Oface.Controllers.PageFacetToggle = Oface.Controllers.PageFacetToggle || {
        handleLifestreamEntriesInfosAvailable: function(event, params){
            var tab = Application.activeWindow.activeTab;
            var aUsername    = identity.username;
            var currentFacet = identity.facets[0];
            var data = params.urlInfos;
            CmdUtils.log("TODO Test params", params);
            //simulate click on facet heading
            //updateDisplayWithOtherFacets: function(data, currentFacet, tab, that){
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
            //TODO, get it working, then move htis all into the view
            // reloadPageFacetToggler...
            jQuery('#oface-other-facets li', tab.document).remove();
            jQuery('#oface-other-facets', tab.document).append(Oface.Views.pageFacetTogglerLabel.toXMLString());
            for (var i=0; i< facets.length; i++){      
                var li = Oface.Views.addPageFacetTogglerAddFacet(facets[i], counts[i], tab);
                var fn = (function(){
                            var newFacet = facets[i];
                            return function(){ofaceObj.doFacetSwitch(identity.username, newFacet); ofaceObj.switchDisplayWithOtherFacets(newFacet, tab);};
                        })();
                li.click(fn);
            }
            CmdUtils.log("TODO Test me Switching to ", currentFacet['description']);
            //huh? that.switchFacetDisplay.call(currentFacet['description'], aUsername);
            ofaceObj.switchDisplayWithOtherFacets(currentFacet['description'], tab);
        }
};

Oface.Controllers.Facet = Oface.Controllers.Facet || {
        username: "Unknown",
        server: "http://oface.ubuntu", 
        initialize: function(){
                
                //CmdUtils.log(this);
                //CmdUtils.log('xx');
                var that = this;
                var $ = jQuery, doc = Application.activeWindow.activeTab.document;
                $('head', doc).append('<link rel="stylesheet" href="http://oface.ubuntu/static/css/stylo.css" type="text/css" media="screen" />');
                var switcherXml = <div id="switcher" style='position:absolute; z-index: 2; width: 600px; display: none; background-color: #CCC;'>
						<div id="all-facets">
								<h4>All Facets</h4>

								<ul id='switcher-facetlist' style="list-style-type: none;">                                
										<li style="float: left; margin-right: 5px"><span class="facetitem"></span> <a href="#" class="remove-facet-a">x</a></li>
								</ul>
                          <div style="clear:left">
						    <label for="switchinput">Add A New Facet:</label> <input id="switchinput" value="" />
						    <button id="all-facets-close">Close</button>
                          </div>
						</div>				        
				</div>.toXMLString();
                CmdUtils.log(switcherXml);
                $('#oface-enabler', doc).after(switcherXml);
                //TODO is this duplicated between orig oface and the switcher?
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
                
                $(doc).bind('clustersfaceted', function(){
                    $('.entry-facet-widget-root', doc)
                        .bind('mouseover', {controller: that}, that.mouseEnterFacetedCluster)
                        .bind('mouseout', {controller: that}, that.mouseOutFacetedCluster)
                });
                //TODO register and handle 'oface-url-refaceted'
        },
        //Idea Actor model -> Series of Actor objects with eventHandlers which bootstrap themselfs back into the object
        // They know about callers, and callees which they've called
        // backbone of the system is catalog of events and event handlers
        // An actor may switch it's behavior to handle the next event...
        // Actor - mailbox(es?) Tasks Behaviors
        //Task - tag, address, content
        //Mailbox - FIFO Queue - jQuery event system
        //Behavior - function to process task, returns the next Behavior. Behaviors can see related actors
        mouseEnterFacetedCluster: function(event){
          var $ = jQuery, cluster = event.target, that = event.data.controller;
          
          if ($(cluster).data('entry-oface-url') === undefined) {
            return;
          } else {
            CmdUtils.log("OKAY GET THE URL BACK.>...");
            CmdUtils.log($(cluster).data('entry-oface-url'));
          }
          var theUrl = $(cluster).data('entry-oface-url');
            if(jQuery(cluster).data('oface.faceted.cluster.widget') == undefined) {
              //Stopped here... we need a global data store... boo.
              //Quick fix in memory hash
              //eventually a sqlite db with in memory caching
                var url = $($(cluster).parents('.cluster'));
                var urlInfo = urlDb[theUrl];
                var clusterWidget =
                  $(cluster).append(<div class="cluster-facet-widget-panel"><a class="cluster-facet-widget-link" href="#">Change Facet</a><form class="cluster-facet-widget" style="position: absolute; z-index: 666; top: -5px; right: 0px">
                                    <input type="hidden" name="md5sum" value="TODO" />
                                    <input type="hidden" name="url" value="TODO" />
                                          <select></select><button type="submit">Change</button><button class="cancel" type="reset">Cancel</button></form></div>.toXMLString());
                $options = "";
                for(var i=0; i < Oface.Models.Facet.allFacets.length; i++) {
                  var f = Oface.Models.Facet.allFacets[i];
                  var selectedVal = f['description'] === urlInfo['facets'][0] ? ' selected="true"' : '';
                  $options += "<option value='" + f['description'] + " " + f['id'] + "'" + selectedVal + ">" + f['description']  + "</option>";
                }
                $('select', cluster).append($options);
                $('.cluster-facet-widget', cluster).hide().bind('submit', function(){
                    var theForm = this;
                    var options = $('option[selected]', theForm);
                    var f;
                    //HACK ALERT: jQuery is acting weird here...
                    //Ubiquity jQuery returns 2 options, doing same directly in Firebug w/jQuery returns 1 option
                    //So we do some funny business here
                    options.each(function(){
                        var tmp = $(this).attr('value').split(' ');
                        if( tmp[0] != urlInfo['facets'][0]) {
                          f = tmp;
                        }
                      });
                        
                    if(f) {
                        CmdUtils.log("User selected", f);
                        var newFacets = {id: f[1], description: f[0]};
                        CmdUtils.log(newFacets);
                        var payload = Utils.encodeJson([{facets: newFacets, urlInfo: urlInfo, url: theUrl}]);
                        $.ajax({
                          url: 'http://oface.ubuntu/resources/resource/' + urlInfo['md5'] + '/user/' + Oface.Models.username,
                          type: 'PUT',
                          data: payload,
                          dataType: 'json',
                          success: function(jsn, status){
                              $(theForm).trigger('oface-url-refaceted',{
                                  cluster: cluster,
                                  url: theUrl,
                                  oldFacets: urlInfo['facets'],
                                  newFacets: newFacets
                                });
                          $(theForm).hide();
                          },
                          cache: false
                        });
                    } else {
                        CmdUtils.log("No new facet");
                    }
                    return false;
                });
                $('.cancel', cluster).click(function(){
                    $('.cluster-facet-widget', cluster).hide();
                    return false;
                });
                $('.cluster-facet-widget-link', cluster).show().click(function(){
                    $('.cluster-facet-widget', cluster).show();
                    return false;
                  });
              jQuery(cluster).data('oface.faceted.cluster.widget', clusterWidget);
            } else {
              var clusterWidget = jQuery(cluster).data('oface.faceted.cluster.widget');
              //TODO
              CmdUtils.log("TODO show this form again sldkfjsdkjewrj");
            }
            $('.cluster-facet-widget-link', cluster).show();
            //clear Timeout if exists
            if ( $(cluster).data('oface.faceted.cluster.widget.timer') ) {              
              Utils.clearTimeout($(cluster).data('oface.faceted.cluster.widget.timer'));
              $(cluster).data('oface.faceted.cluster.widget.timer', null)
            } 
        },
        mouseOutFacetedCluster: function(event){
          var $ = jQuery, cluster = event.target;
          /*
            var c = $(cluster);
              while( c.length && ! c.hasClass('summary')){      
                  c = c.parent();
              }
            cluster = c.get(0);
          */
          if ( ! $(cluster).data('oface.faceted.cluster.widget.timer') ) {
            var timer = Utils.setTimeout(function(){
                  $('.cluster-facet-widget-link', cluster).hide();  
              }, 1000);
              $(cluster).data('oface.faceted.cluster.widget.timer', timer);              
              
          }
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
                                            Oface.Models.Facet.removeUserFacet(that.username, event.data.facet);
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


