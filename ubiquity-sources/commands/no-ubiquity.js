;
function pageLoad_detectNoUbiquity(){
    var doc = Application.activeWindow.activeTab.document;
    var url = doc.location.href;
    var troubleshoot = "/welcome/troubleshoot";
    //CmdUtils.log(Application.activeWindow.activeTab.window.document.location.href);
    if (url == Oface.HOST + troubleshoot) {      
        jQuery('.no-ubiquity', Application.activeWindow.activeTab.document).hide();
        jQuery('.ubiquity', Application.activeWindow.activeTab.document).show();    
    } else {
        CmdUtils.log(Oface.HOST + troubleshoot);
    }
    pblock.innerHTML = "Version: " + Oface.version;
}
