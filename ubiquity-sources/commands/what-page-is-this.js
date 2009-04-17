//Short term FriendFeed Specific stuff
//Important for proof of concept, not how real service would work
Oface.WhatPageIsThis = {
  name: "what-page-is-this-oface",
  preview: function(pblock, input){
    var doc = Application.activeWindow.activeTab.document;
    pblock.innerHTML = "Supported? <b>" + this.isSupportedPage(this.pageType(doc.location.href)) +
      "</b> type=<b>" + this.pageType(doc.location.href) + "</b>";
  },
  really: function(){
    /**
     * @returns {array} A two item array, [true/false, pageType]
     * pageType - One of the _PAGE constants from this object like PROFILE_PAGE
    */
    var doc = Application.activeWindow.activeTab.document;
    var url = doc.location.href;
    
    if (url.indexOf("http://oface.ubuntu/static/test_files/ff-pattyok.html") >= 0) {
      Oface.log('Replacing ' + url + " with hardcoded http://friendfeed.com/pattyok");
      url = "http://friendfeed.com/pattyok";
    } else if(url.indexOf("http://oface.ubuntu/static/test_files/ozten_home.html") >=0) {
      Oface.log('Replacing ' + url + " with hardcoded http://friendfeed.com/");
      url = "http://friendfeed.com/";
    }
    var aPageType = this.pageType(url);
    return {isKnown:  this.isSupportedPage(aPageType),
            type: aPageType,
            url: url};
  },
  HOME_PAGE: "home",            HOME_REGEX:     /^https?:\/\/w?w?w?\.?friendfeed\.com\/$/,
  PROFILE_PAGE: "profile",      PROFILE_REGEX:  /^https?:\/\/w?w?w?\.?friendfeed\.com\/(\w+)(?:\?[^#]*)?(?:#.*)?$/,
  LIST_PAGE: "list",            LIST_REGEX:     /^https?:\/\/w?w?w?\.?friendfeed\.com\/list\/(\w+)$/,
  ROOMS_LIST_PAGE: "roomslist", ROOMS_LIST_REGEX: /^https?:\/\/w?w?w?\.?friendfeed\.com\/rooms\/?$/,
  ROOM_PAGE: "room",            ROOM_REGEX:     /^https?:\/\/w?w?w?\.?friendfeed\.com\/rooms\/(\w+)$/,
  EVERYONE_PAGE: "everyone",    EVERYONE_REGEX: /^https?:\/\/w?w?w?\.?friendfeed\.com\/public$/,
  //A User's Profile plus their friends
  FRIENDS_PAGE: "profilewfriends", FRIENDS_REGEX: /^https?:\/\/w?w?w?\.?friendfeed\.com\/(\w+)\/friends$/,
  UNKNOWN_PAGE: "unknown",
  pageType: function(url){    
    if(       this.HOME_REGEX.test(url)){
      return  this.HOME_PAGE;
    } else if(this.LIST_REGEX.test(url)) {
      return  this.LIST_PAGE;
    } else if(this.ROOMS_LIST_REGEX.test(url)) {
      return  this.ROOMS_LIST_PAGE;
    } else if(this.ROOM_REGEX.test(url)) {
      return  this.ROOM_PAGE;
    } else if(this.EVERYONE_REGEX.test(url)) {
      return  this.EVERYONE_PAGE;
    } else if(this.FRIENDS_REGEX.test(url)){
      return  this.FRIENDS_PAGE;
    } else if(this.PROFILE_REGEX.test(url)){
      return  this.PROFILE_PAGE;
    } else {
      return this.UNKNOWN_PAGE;
    }
    
    //Known unknowns
    // Linkable Urls
    // USER_COMMENTS_PAGE /^https?:\/\/w?w?w?\.?friendfeed\.com\/(\w+)\/comments$/
    // USER_LIKES_PAGE   /^https?:\/\/w?w?w?\.?friendfeed\.com\/(\w+)\/likes$/
    // USER_DISCUSSION /^https?:\/\/w?w?w?\.?friendfeed\.com\/(\w+)\/discussion$/
    // SEARCH http://friendfeed.com/search?required=q&q=lisp&friends=ozten
  },
  getUsername: function(url, pageType){
    if (pageType === this.PROFILE_PAGE) {
      var match = this.PROFILE_REGEX.exec(url);
      if (! match ) {
        Oface.log("ERROR: getUsername(" + url + ", " + pageType + " called. Nothing matched");
      } else if ( match.length == 2) {
        return match[1];
      } else {
        Oface.log("ERROR: getUsername(" + url + ", " + pageType + " called. Matched didn't have exactly 1 username piece, it had ", match.length);
      }
    } else {
      Oface.log("ERROR: getUsername(" + url + ", " + pageType + " called. Expected a PROFILE_PAGE types instead.");
    }
    
  },
  isSupportedPage: function(pageType){
    if(pageType == this.UNKNOWN_PAGE){
      return false;
    }
    return [this.HOME_PAGE, this.PROFILE_PAGE, this.LIST_PAGE,
            this.EVERYONE_PAGE, this.FRIENDS_PAGE].indexOf(pageType) != -1;
  }
}
CmdUtils.CreateCommand(Oface.WhatPageIsThis);
