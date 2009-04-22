Oface.Controllers = Oface.Controllers || {};
Oface.Controllers.Facet = Oface.Controllers.Facet || {
        username: "Unknown",
        initialize: function(){
                
                var that = this;
                var $ = jQuery, doc = Application.activeWindow.activeTab.document;
                $('head', doc).append('<link rel="stylesheet" href="' + Oface.HOST + '/static/css/stylo.css" type="text/css" media="screen" />');
                var switcherXml = <div id="switcher" style='position:absolute; z-index: 2; width: 600px; display: none;'>
						<div id="all-facets">
                                Your Current SocialTag: <strong class="all-facet-current-facet"></strong>
                                <button id="all-facets-close">Close</button>
							<div class="add-facet-panel" style="clear:left">
						      <label for="switchinput">Create A New SocialTag:</label> <input id="switchinput" value="" />
						      <button id="all-facets-save">Save</button>
                            
                            </div>
                            	<h4 class='all-facets-sort-header'>All Your SocialTags</h4>
                                <div class="all-facets-sort-panel">Sorted By:
                                    <input type="radio" name="all-facet-sort" value="frequency" checked='true' disabled='disabled' /> Frequency
                                    <input type="radio" name="all-facet-sortx" value="alphabetic" disabled="disabled" />  A-Z (todo)
                                </div>
                                <br style="clear: both" />
                                
								<ul id='switcher-facetlist' style="list-style-type: none;">                                
										<li style="float: left; margin-right: 5px"><span class="facetitem"></span> <a href="#" class="remove-facet-a">x</a></li>
								</ul>
                            <br style="clear: both" />
						</div>				        
				</div>.toXMLString();
                $('#oface-enabler', doc).after(switcherXml);
                //var resort = function(type){};
                //$('input[name=all-facet-sort]', $('#oface-enabler', doc)).bind('change', function(){ resort($(this).attr('value')); });
                
                
                //TODO is this duplicated between orig oface and the switcher?
                Oface.Timing.step4CurrentFacets_start = new Date();
                Oface.Util.ajax({
                        url: Oface.HOST + '/facets/current/' + this.username,
                        type: "GET",
                        beforeSend: function(xhr) {
                            var switcher = $('#switcher', doc);
                            var w = switcher.width();
                            var h = switcher.height();
                            var offset = switcher.offset();
                            Oface.Views.Facet.hideAll();
                            $('#oface-enabler', doc).after(
                                '<div id="switcher-progress-panel"><img src="http://mobhat.restservice.org/static/images/ubiquity/progress-icon.gif" /></div>');
                            var p = $('#switcher-progress-panel', doc).width(w).height(h).offset(offset);
                        },
                        complete: function(){$('#switcher-progress-panel', doc).remove(); },
                        success: function(json) {
                            Oface.Timing.step4CurrentFacets_complete = new Date();
                            Oface.Models.Facet.updateCurrent(json);
                        
                            //TODO using call here isn't necissary
                            var curFacetView = Oface.Views.Facet.createCurrent.call(Oface.Views.Facet);
                        
                            var currentFacets = Oface.Models.Facet.currentFacets;                           
                            for (var i = 0; i < currentFacets.length; i++) {
                                    curFacetView(currentFacets[i]['weight'],
                                         currentFacets[i]['description']);
                                    if(i == 0) {
                                        $('#all-facets .all-facet-current-facet', doc).text(currentFacets[i]['description']);
                                    }
                            }
                            $('#switcher-current-facets li', doc).click(Oface.Views.Facet.showAll);
                            Oface.Views.Facet.showCurrent();                        
                        },
                        dataType: "json"});
                Oface.Timing.step5AllFacets_start = new Date();
                Oface.Util.ajax({
                        url: Oface.HOST + '/facets/weighted/' + that.username,
                        type: "GET",
                        success: function(json) {
                                Oface.Timing.step5AllFacets_complete = new Date();
                                Oface.Models.Facet.updateAll(json);
                                that.updateAllView();
                        },
                        dataType: "json"});
                var contextx = {username: Oface.Controllers.Facet.username};
                /* add behaviors */
                //Oface.Views.Facet.newFacetInput().bind('blur', contextx, Oface.Controllers.Facet.handleNewFacetCreated);
                Oface.Views.Facet.newFacetSubmit().bind('click', contextx, Oface.Controllers.Facet.handleNewFacetCreated);
                
                $('#all-facets-close', doc).bind('click', contextx, Oface.Controllers.Facet.allFacetsCloseHandler);
        },
        /**
         * Adapted from the code in Mozilla PriorArt app/model/tags.php MPL GPL
         */
        scaleWeight: function(count, maxCount){
            if( count > 0 && count <= 6 ){
                return count;
            } else {
                var weights = [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 5, 6];
			    var scale = ( count * 20 ) / maxCount;
                scale = scale > 18.5 ? 19 : scale;
			    return weights[Math.round(scale)];
            }
        },
        updateAllView: function(){
                var that = this;
                                var currentFacets = Oface.Models.Facet.currentFacets;
                                var allFacets = Oface.Models.Facet.allFacets;

                                var view = Oface.Views.Facet.createAll(that.username);
                                var maxWeight = 0;
                                for (var i = 0; i < allFacets.length; i++) {
                                    if( maxWeight < parseInt(allFacets['weight'])) {
                                        maxWeight = parseInt(allFacets['weight']);
                                    }
                                }
                                for (var i = 0; i < allFacets.length; i++) {
                                    var f = view(that.scaleWeight(allFacets[i]['weight'], maxWeight),
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
                Oface.Models.Facet.updateCurrent(json);
                
                var curFacetView = Oface.Views.Facet.createCurrent.call(Oface.Views.Facet);
                //TODO apply scaling weight here too?
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
            var newFacets =  $('#switchinput', doc).attr('value').split(',');
            var tmpNewFacets = [];
            for(var i = 0; i< newFacets.length; i++) {
                if(newFacets[i].trim().length > 2) {
                    tmpNewFacets.push(newFacets[i].trim());
                }
            }
            if(tmpNewFacets.length > 0) {
                Oface.Models.Facet.facetsChosen(event.data.username, tmpNewFacets, function(json, status){
                    Oface.Controllers.Facet.chooseNewFacetCallback.call(Oface.Controllers.Facet, json, status);
                    //Oface.Controllers.Facet.chooseNewFacetCallback(json, status);
                }, Oface.Util.noOp);
                ofaceObj.doFacetSwitch(Oface.Controllers.Facet.username, ($('#switchinput', doc).attr('value').split(','))[0]);
                Oface.Views.Facet.clearInput();
                }
        },
        allFacetsCloseHandler: function() {
                Oface.Views.Facet.hideAll();
        }
} // END Oface.Controllers.Facet


