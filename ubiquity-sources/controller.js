Oface.Controllers = Oface.Controllers || {};
Oface.Controllers.Facet = Oface.Controllers.Facet || {
        username: "Unknown",
        initialize: function(){
                
                var that = this;
                var $ = jQuery, doc = Application.activeWindow.activeTab.document;
                $('head', doc).append('<link rel="stylesheet" href="' + Oface.HOST + '/static/css/stylo.css" type="text/css" media="screen" />');
                var switcherXml = <div id="switcher" style='position:absolute; z-index: 2; width: 600px; display: none; background-color: #CCC;'>
						<div id="all-facets">
								<h4>All Facets</h4>

								<ul id='switcher-facetlist' style="list-style-type: none;">                                
										<li style="float: left; margin-right: 5px"><span class="facetitem"></span> <a href="#" class="remove-facet-a">x</a></li>
								</ul>
                          <div style="clear:left">
						    <label for="switchinput">Add A New Facet:</label> <input id="switchinput" value="" />
						    <button id="all-facets-save">Save</button>
                            <button id="all-facets-close">Close</button>
                          </div>
						</div>				        
				</div>.toXMLString();                
                $('#oface-enabler', doc).after(switcherXml);
                //TODO is this duplicated between orig oface and the switcher?
                $.get(Oface.HOST + '/facets/current/' + this.username, {},
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
                $.get(Oface.HOST + '/facets/weighted/' + that.username, {},
                        function(json) {
                                Oface.Models.Facet.updateAll(json);
                                that.updateAllView();
                        },
                "json");
                var contextx = {username: Oface.Controllers.Facet.username};
                /* add behaviors */
                Oface.Views.Facet.newFacetInput().bind('blur', contextx, Oface.Controllers.Facet.handleNewFacetCreated);
                $('#all-facets-close', doc).bind('click', contextx, Oface.Controllers.Facet.allFacetsCloseHandler);
        },
        updateAllView: function(){
                var that = this;
                                var currentFacets = Oface.Models.Facet.currentFacets;
                                var allFacets = Oface.Models.Facet.allFacets;

                                var view = Oface.Views.Facet.createAll(that.username);
                                for (var i = 0; i < allFacets.length; i++) {
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
                                            that.updateAllView();
                                            Oface.Views.Facet.showAll();
                                            return false;
                                        });
                                }      
        },
        chooseNewFacetCallback: function(json, status){                
                Oface.Models.Facet.addFacet.call(Oface.Models.Facet, json);
                this.updateAllView();
                this.chooseFacetCallback(json, status);
        },
        chooseFacetCallback: function(json, status) {
          var $ = jQuery, doc = Application.activeWindow.activeTab.document;
                Oface.log("chooseFacet called");
                //AOK
                Oface.Models.Facet.updateCurrent(json);
                
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
                Oface.Models.Facet.facetsChosen(Oface.Controllers.Facet.username, [data['description']],
                    function(json, status){                        
                        Oface.Controllers.Facet.chooseFacetCallback(json, status);
                    }, Oface.Util.noOp);
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


