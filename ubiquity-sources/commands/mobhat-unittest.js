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
            
            assertEquals(getUsername("http://friendfeed.com/ozten?start=30", PROFILE_PAGE), "ozten", "We should still find username");
            assertEquals(getUsername("http://friendfeed.com/pattyok", PROFILE_PAGE), "pattyok", "We should still find username");
            assertEquals(getUsername("http://friendfeed.com/pattyok?expandlist=pals", PROFILE_PAGE), "pattyok", "We should still find username");
            
        }
        if( parseInt( fails ) > 0 ) {
            pblock.innerHTML = "Passes: " + passes + " Failed: " + fails + "\<br>Look in Error Console for details";            
        } else {
            pblock.innerHTML = "Passed: " + passes + " Failed: " + fails;            
        }
        
        function assertEquals(actual, expected, message) {
            assert(message + "", actual, expected);
        }
        function assertRegexMatches(regex, string, message) {
            var msg = message || "";
            assert(msg, regex.test(string));
        }
        function assertRegexFails(regex, string, message) {
            var msg = message || "";
            assert(msg, ! regex.test(string));
        }
        function assert(assertString, value, otherValue) {
            function pass(){ passes++; }
            function fail(msg){ fails++;  Utils.reportWarning(msg);}
            switch (typeof value) {
                case "boolean":
                    if(value){
                        pass();
                    } else {
                        fail("Expected true but was (false): '" +  assertString + "'");
                    }
                    break;
                case "string":
                    if(value == otherValue) {
                        pass();
                    } else {
                        fail("Actual=(" + value + ") but Expected=(" + otherValue + "): '" +  assertString + "'");
                    }
                    break;
                default:
                    fail("assert programming error, unknown type for actual=" + value + " expected=" + otherValue + "message=" + assertString);
            }
        }
    },
    execute: function(input) {
    
    }                   
});