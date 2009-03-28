var $ = jQuery;
var doc = Application.activeWindow.activeTab.document;

Oface = Oface || {};
Oface.Controllers = Oface.Controllers || {};
Oface.Controllers.EntryFacetChooser = {
    handleClustersFaceted: function(){
        that = Oface.Controllers.EntryFacetChooser;
        $('.entry-facet-widget-root', doc).each(function(i, el){
            Oface.log("Looking 2 for handeling clusters faceted");            
            var url = $(el).data('lifestream-entry-url');
            Oface.log("Looking at url", url);
            if(url && urlDb[url]) {
                var username = urlDb[url].username;
                if(identity.username == username) {                    
                    $(el).bind('mouseover', {controller: that}, that.mouseEnterFacetedCluster)
                         .bind('mouseout', {controller: that}, that.mouseOutFacetedCluster);
                    Oface.log("Looking Bound to", that.mouseOutFacetedCluster);
                } else {
                    Oface.log("WARNING Skipping " + username);
                }
            }
        });
        return true;
        
    },
    mouseEnterFacetedCluster: function(event){
        var $ = jQuery, cluster = event.target, that = event.data.controller;
          
          if ($(cluster).data('entry-oface-url') === undefined) {
            return;
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
                        
                        var newFacets = {id: f[1], description: f[0]};
                        //TODO why is this encoded as a list?
                        var newResource = [{facets: newFacets, urlInfo: urlInfo, url: theUrl}];
                        Oface.log("ENCODEJSON mouseEnterFacetedCluster", newResource);
                        var payload = Utils.encodeJson(newResource);
                        $.ajax({
                          url: Oface.HOST + '/resources/resource/' + urlInfo['md5'] + '/user/' + Oface.Models.username,
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
              Oface.log("TODO show this form again sldkfjsdkjewrj");
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
        }
};