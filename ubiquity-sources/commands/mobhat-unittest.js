;
CmdUtils.CreateCommand({
    name: "mobhat-unittest",
    help: "Run the Oface unit tests",
    preview: function(pblock, input) {
        pblock.innerHTML = "Running unit tests " + Oface.version;
        var fails = 0, passes = 0;
        with(Oface.WhatPageIsThis) {
            assertRegexMatches(PROFILE_REGEX, "http://friendfeed.com/ozten", "Typical profile page");
            assertRegexMatches(PROFILE_REGEX, "http://friendfeed.com/ozten?start=30", "1 page in on a profile page");
            assertRegexMatches(PROFILE_REGEX, "http://friendfeed.com/ozten#ahash", "A page with a hash");
            
            assertRegexMatches(ROOMS_LIST_REGEX, "http://friendfeed.com/rooms", "The Rooms list, no slash");
            assertRegexMatches(ROOMS_LIST_REGEX, "http://friendfeed.com/rooms/", "The Rooms list");
        }
        pblock.innerHTML = "Passes: " + passes + " Faileds: " + fails;
        function assertRegexMatches(regex, string, message) {
            var msg = message || "";
            assert(msg, regex.test(string));
        }
        function assertRegexFails(regex, string, message) {
            var msg = message || "";
            assert(msg, ! regex.test(string));
        }
        function assert(assertString, value, otherValue) {
            switch (typeof value) {
                case "boolean":
                    if(value){
                        passes++;
                    } else {
                        fails++;
                        Utils.reportWarning("Expected true but was (false): '" +  assertString + "'");
                        //throw new AssertFailed("Expected true but was false: " + assertString);
                    }
                    break;
                default:
                    Utils.reportWarning("assert programming error, unknown type for " + value);
                    //throw "assert programming error, unknown type for " + value;
            }
            function AssertFailed(message) {
                this.message = message;
                this.name = "AssertFailed";
            }
        }
    },
    execute: function(input) {
    
    }                   
});