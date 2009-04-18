;CmdUtils.CreateCommand({
  name: "mobhat-no-ubiquity",
  homepage: "http://mobhat.restservice.org/",
  author: {
    name: "Austin King",
    email: "shout@ozten.com"
  },
  license: "GPL",
  description: "On the Troubleshooting page is a no-ubiquity alert. This removes that.",
  help: "Just run it, preview will show version",
  preview: function(pblock, input) {
    CmdUtils.log("hello");
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
});
