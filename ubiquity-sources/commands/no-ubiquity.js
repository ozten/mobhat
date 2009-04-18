;
function pageLoad_detectNoUbiquity(){
    var doc = Application.activeWindow.activeTab.document;
    var url = doc.location.href;
    var troubleshoot = "/welcome/troubleshoot";
    if (url == Oface.HOST + troubleshoot) {      
        jQuery('.no-ubiquity', Application.activeWindow.activeTab.document).hide();
        jQuery('.ubiquity', Application.activeWindow.activeTab.document).show();    
    }
}
