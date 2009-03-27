//Growl displayMessage
//Replace selected text CmdUtils.setSelection("You selected: "+input.html);
//Application - FUEL Application - http://developer.mozilla.org/en/docs/FUEL 
/* This is a template command */
CmdUtils.CreateCommand({
  feedIcon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAJDSURBVHjajJJNSBRhGMd/887MzrQxRSLbFuYhoUhEKsMo8paHUKFLdBDrUIdunvq4RdClOq8Hb0FBSAVCUhFR1CGD/MrIJYqs1kLUXd382N356plZFOrUO/MMz/vO83+e93n+f+1zF+kQBoOQNLBJg0CTj7z/rvWjGbEOIwKp9O7WkhtQc/wMWrlIkP8Kc1lMS8eyFHpkpo5SgWCCVO7Z5JARhuz1Qg29fh87u6/9VWL1/SPc4Qy6n8c0FehiXin6dcCQaylDMhqGz8ydS2hKkmxNkWxowWnuBLHK6G2C8X6UJkBlxUmNqLYyNbzF74QLDrgFgh9LLE0NsPKxjW1Hz2EdPIubsOFdH2HgbwAlC4S19dT13o+3pS+vcSfvUcq9YnbwA6muW9hNpym/FWBxfh0CZkKGkPBZeJFhcWQAu6EN52QGZ/8prEKW+cdXq0039UiLXhUYzdjebOJQQI30UXp6mZn+Dtam32Afu0iyrgUvN0r+ZQbr8HncSpUVJfwRhBWC0hyGV8CxXBL5SWYf9sYBidYLIG2V87/ifVjTWAX6AlxeK2C0X8e58hOr/Qa2XJ3iLMWxB1h72tHs7bgryzHAN2o2gJorTrLxRHVazd0o4TXiyV2Yjs90uzauGvvppmqcLjwmbZ3V7BO2HOrBnbgrQRqWUgTZ5+Snx4WeKfzCCrmb3axODKNH+vvUyWjqyK4DiKQ0eXSpFsgVvLJQWpH+xSpr4otg/HI0TR/t97cxTUS+QxIMRTLi/9ZYJPI/AgwAoc3W7ZrqR2IAAAAASUVORK5CYII%3D",
  name: "discover-feeds-oface",
  icon: this.feedIcon,
  homepage: "http://ozten.com/",
  author: {
    name: "Your Name",
    email: "you@example.com"
  },
  license: "GPL",
  description: "Lists Feeds that this page contains",
  help: "how to use your command",
  preview: function(pblock, input) {
    //var d = context.chromeWindow.window.document;
    var d = CmdUtils.getDocument();
    var links = d.getElementsByTagName('link');
    var template = "<h4>Feeds</h4>";
    var data = {};
    var type = {
      'application/rss+xml': 'RSS',
      "application/atom+xml": "Atom"
    };
    var numFeeds = 0;
    template += "<ul>";
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var title = links[i].title || "Untitled Feed";
      
      if (link.type == "application/atom+xml" || link.type == "application/rss+xml") {
        numFeeds += 1;
        template += "<li ><img src='" + this.feedIcon + "' /> " + " <a href='" + link.href + "'>" + title + "</a> <small>(" + type[links[i].type]  + ")</small></li>";
        //Oface.log(links[i].title + " " + links[i].href);
      }
      template += "</ul>";

    }
    if (numFeeds == 0) {
      template = "None Feeds discovered";
    }
    pblock.innerHTML = CmdUtils.renderTemplate(template, data);
    var doc = Application.activeWindow.activeTab.document;
    jQuery('div.cluster', doc).css('border', 'solid 1px grey');
  }
});
