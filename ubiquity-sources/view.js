Oface.Views = Oface.Views || {};

/** view
 *   Mostly in HTML this is the bits of code to manipulate the view
 */
Oface.Views.Facet = Oface.Views.Facet || {
        createAll: function(username) {
          //Store a global reference to the current user
          Oface.Models.username = username;
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
                /**
                 * @param weight {number} weight from 1 to 6
                 */
                return function(weight, facetName){
                        
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
};
