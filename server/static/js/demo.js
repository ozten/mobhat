/* model */
var currentFacets = [];
var allFacets = [];

function updateCurrent(newFacets) {
        currentFacets = newFacets;
        if (allFacets.length == 0) {
                allFacets = newFacets.slice();
        }
}

function updateAll(newFacets) {
        allFacets = newFacets;
}

function isCurrent(needle, haystack) {
        for (var i = 0; i < haystack.length; i++) {
                if (needle['id'] == haystack[i]['id']) {
                        return true;
                }
        }
        return false;
}

function showAll() {
        //var code = "<h4>Current Facets</h4><ul id='switcher-facetlist'>";
        var liTemplate = $('#switcher-facetlist li:first').clone();
        $('#switcher-facetlist li').replaceWith('');
        liTemplate.attr('class', '');

        for (var i = 0; i < allFacets.length; i++) {
                li = liTemplate.clone();
                li.addClass('weight' + allFacets[i]['weight']);
                li.bind('click', allFacets[i], facetChosen);
                if (isCurrent(allFacets[i], currentFacets)) {
                        li.addClass("current");
                }
                li.text(allFacets[i]['description']);

                $('#switcher-facetlist').append(li);
        }
        var p = $('#current-facets').position();
        $('#all-facets').css(
                                     {position:'absolute',
                                     'top' : p.top,
                                     'left': p.left}
                                     );
        $('#all-facets').show();
}

function showCurrent() {
        //var code = "<h4>Current Facets</h4><ul id='switcher-facetlist'>";
        var liTemplate = $('#switcher-current-facets li:first').clone();
        $('#switcher-current-facets li').replaceWith('');
        liTemplate.attr('class', '');
        for (var i = 0; i < currentFacets.length; i++) {
                li = liTemplate.clone();
                li.addClass('weight' + currentFacets[i]['weight']);                
                li.addClass("current");                
                li.text(currentFacets[i]['description']);
                $('#switcher-current-facets').append(li);
        }
}
/* Controller */
function facetChosen(event){
  var data = event.data;
  console.info("facetChosen event");
  console.info(data);
  $('#all-facets').hide();
}
function facetsChosen(facets){
        $.ajax({url:'/facets/current/ozten', type:'PUT',
        data:  JSON.stringify(facets)});

}
function switchinputHandler(){
        facetsChosen($('#switchinput').attr('value').split(','));
        
}
$(document).ready(function() {
        $.get('/facets/current/ozten', {},
        function(json) {
                updateCurrent(json);
                showCurrent();
                $('#switcher-current-facets li').click(showAll);
        },
        "json");
        $.get('/facets/weighted/ozten', {},
        function(json) {
                updateAll(json);
                //showAll();
        },
        "json");
        /* add behaviors */
        $('#switchinput').bind('blur', switchinputHandler);

});