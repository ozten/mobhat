var $ = jQuery;
var doc = Application.activeWindow.activeTab.document;

Oface = Oface || {};
Oface.Controllers = Oface.Controllers || {};
Oface.Controllers.EntryFacetChooser = {
    handleClustersFaceted: function(){
        jQuery('.l_more', Application.activeWindow.activeTab.document).click(Oface.Controllers.EntryFacetChooser.moarClicked);
        
        /*
        Oface.log(jQuery('.ls-entry-refacet-turnon', Application.activeWindow.activeTab.document));
        jQuery('.ls-entry-refacet-turnon', Application.activeWindow.activeTab.document).click(
            Oface.Controllers.EntryFacetChooser.handleClustersFaceted);
        
        that = Oface.Controllers.EntryFacetChooser;
        $('.entry-facet-widget-root', doc).each(function(i, el){            
            var url = $(el).data('lifestream-entry-url');            
            if(url && urlDb[url]) {
                var username = urlDb[url].username;
                if(identity.username == username) {                    
                    $(el).bind('mouseover', {controller: that}, that.mouseEnterFacetedCluster)
                         .bind('mouseout', {controller: that}, that.mouseOutFacetedCluster);
                } else {
                    Oface.log("WARNING Skipping " + username);
                }
            }
        });
        */
        return true;
        
    },
    createHandleRefacetLink: function(anEntry, anUrl) {
            return function(){
                        jQuery('.popupmenu, .popupshadow', Application.activeWindow.activeTab.document).remove();
                        Oface.Controllers.EntryFacetChooser.mouseEnterFacetedCluster(anEntry, anUrl); //580 in mobhat 3979 in ubiquity
                        return false;
                    };
    },
    moarClicked: function(){
        Oface.log("moarClicked 14");
        var entry = jQuery(this).parents('.entry');
        var url = entry.data('entry-oface-url');
        if (urlDb[url]['username'] == identity.username) {
            Oface.log('doing url=', url);
            var link = jQuery("<div class='ls-entry-facet-menu-item'><a href='#'>Retag this entry</a></div>");
            jQuery('a', link).click(Oface.Controllers.EntryFacetChooser.createHandleRefacetLink(entry, url));
            Utils.setTimeout(
                function(){
                   jQuery('.popupmenu', Application.activeWindow.activeTab.document)
                        .append(link);
                    Oface.log($('.popupmenu'));},
                100);
            Oface.log('done with url=', url);
        }
        return true;
    },
    mouseEnterFacetedCluster: function(entry, theUrl){
        var $ = jQuery;
        Oface.log("Hello Loco", theUrl);
        if (entry === undefined || theUrl === undefined) {
            return;
        } 
        
        var urlInfo = urlDb[theUrl];
        var clusterWidget =
                  $(entry).append(<div class="cluster-facet-widget-panel">
                                    <form class="cluster-facet-widget" style="position: absolute; z-index: 666; top: -5px; right: 0px">
                                    <input type="hidden" name="md5sum" value="TODO" />
                                    <input type="hidden" name="url" value="TODO" />
                                          <select></select><button class='change' type="submit">Change</button><button class="cancel" type="reset">Cancel</button></form></div>.toXMLString());
                $options = "";
                for(var i=0; i < Oface.Models.Facet.allFacets.length; i++) {
                  var f = Oface.Models.Facet.allFacets[i];
                  var selectedVal = f['description'] === urlInfo['facets'][0] ? ' selected="true"' : '';
                  $options += "<option value='" + f['description'] + " " + f['id'] + "'" + selectedVal + ">" + f['description']  + "</option>";
                }
                $('select', entry).append($options);
                //.hide()
                $('.cluster-facet-widget', entry).bind('submit', function(){
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
                        $('select, button.change', theForm).attr('disabled', true);
                        $('select', $('.cluster-facet-widget')).attr('disabled', true)
                        var newFacets = {id: f[1], description: f[0]};
                        //TODO why is this encoded as a list?
                        var newResource = [{facets: newFacets, urlInfo: urlInfo, url: theUrl}];
                        Oface.log("ENCODEJSON mouseEnterFacetedCluster", newResource);
                        var payload = Utils.encodeJson(newResource);
                        //TODO it's possible that the user fails login hre...
                        Oface.Util.ajax({
                          url: Oface.HOST + '/resources/resource/' + urlInfo['md5'] + '/user/' + Oface.Models.username,
                          type: 'PUT',
                          data: payload,
                          dataType: 'json',
                          success: function(jsn, status){
                            //
                              Oface.log("Testing me out11, replacing", urlDb[theUrl]);
                              urlDb[theUrl]['facets'] = [f[0]];
                              Oface.log("With", urlDb[theUrl]);
                              $(theForm).trigger('oface-url-refaceted',{
                                  entry: entry,
                                  url: theUrl,
                                  oldFacets: urlInfo['facets'],
                                  newFacets: newFacets
                                });
                        //TODO remove?
                          $(theForm).hide();
                          },
                          cache: false
                        });
                    } 
                    return false;
                });
                $('.cancel', entry).click(function(){
                    //TODO remove?
                    $('.cluster-facet-widget', entry).hide();
                    return false;
                });
                /*$('.cluster-facet-widget-link', entry).show().click(function(){
                    $('.cluster-facet-widget', entry).show();
                    return false;
                  });*/
              //jQuery(entry).data('oface.faceted.cluster.widget', clusterWidget);
            /*} else {
              var clusterWidget = jQuery(cluster).data('oface.faceted.cluster.widget');
              //TODO
              Oface.log("TODO show this form again sldkfjsdkjewrj");
            }*/
            //$('.cluster-facet-widget-link', cluster).show();
            //clear Timeout if exists
            /*if ( $(cluster).data('oface.faceted.cluster.widget.timer') ) {              
              Utils.clearTimeout($(cluster).data('oface.faceted.cluster.widget.timer'));
              $(cluster).data('oface.faceted.cluster.widget.timer', null)
            } */
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