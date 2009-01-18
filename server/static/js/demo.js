/* model
  stores data
  reads and updates
  from service
*/
var currentFacets = [];
var allFacets = [];

/* internal */
function updateCurrent(newFacets) {
        currentFacets = newFacets;
        if (allFacets.length == 0) {
                allFacets = newFacets.slice();
        }
        //TODO add newFacets to allFacets if they don't exist...
        
}
/* internal */
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

/* Takes a single facet and persists it
facets - array of strings
forTheWin - callback when successfull. Called with json, status
fail - callback when there was an error. Called with xhr, msg, exception
*/
function facetsChosen(facets, forTheWin, fail){
        $.ajax({url:'/facets/current/ozten', type:'PUT',
        data:  JSON.stringify(facets),
        dataType: "json",
        success: forTheWin,
        error: fail});
}

/* view
   Mostly in HTML this is the bits of code to manipulate the view
*/
function showAll() {
        //var code = "<h4>Current Facets</h4><ul id='switcher-facetlist'>";
        var liTemplate = $('#switcher-facetlist li:first').clone();
        $('#switcher-facetlist li').replaceWith('');
        liTemplate.attr('class', '');

        for (var i = 0; i < allFacets.length; i++) {
                li = liTemplate.clone();
                li.addClass('weight' + allFacets[i]['weight']);
                li.bind('click', allFacets[i], handleswitcherFacetlist);
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
        $('#switcher-current-facets li').click(showAll);
}

function noOp(event){
        
}

/* Controller */
function handleswitcherFacetlist(event){
  var data = event.data;
  console.info("facetChosen event");
  console.info(data);
  //facetsChosen(newFacets);
  facetsChosen([data['description']],
               
        function(json, status){
                console.info(json);
                console.info(status);
                updateCurrent(json);
                showCurrent();
        }, noOp);
  $('#all-facets').hide();        
}

function switchinputHandler(){
        facetsChosen($('#switchinput').attr('value').split(','), noOp, noOp);
        
}
$(document).ready(function() {
        $.get('/facets/current/ozten', {},
        function(json) {
                updateCurrent(json);
                showCurrent();
                
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