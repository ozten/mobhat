;var Oface = Oface || {};
Oface.Models = Oface.Models || {};
Oface.Models.ResourceDB = {
    queryFacets: function(urls, FTW, FAIL) {
        var query = { urls: urls };
        Oface.log("ENCODEJSON queryFacets", query);        
        var dataPayload = "q=" + Utils.encodeJson(query);
        Oface.Util.ajax({
            url: Oface.HOST + '/resources/query_facets',
            type: 'POST',
            dataType: 'json',
            cache: false, // REMOVE FOR PROD
            data: dataPayload,
            success: FTW,
            error: FAIL      
        }, Application.activeWindow.activeTab.document);
    }
}