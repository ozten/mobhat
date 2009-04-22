;
CmdUtils.CreateCommand({
    name: "oface-unittest",
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
            var scaleWeight = Oface.Controllers.Facet.scaleWeight;
            assertEquals(scaleWeight(2, 2), 2, "Below 6 is itself");
            
            
            assertEquals(scaleWeight(10, 14), 3, "Weak algorythm when maxCount is 6 or less, just returns the count");
            assertEquals(scaleWeight(20, 58), 1, "Should fall somewhere in long tail.");
            assertEquals(scaleWeight(19, 20), 6); assertEquals(scaleWeight(18, 20), 5); assertEquals(scaleWeight(17, 20), 4);
            assertEquals(scaleWeight(10, 20), 2, "Half the max count is still only 1/3 the wieght");
            assertEquals(scaleWeight(0, 58), 1,  "Edge case lower.");
            assertEquals(scaleWeight(58, 58), 6, "Edge case upper");
            assertEquals(scaleWeight(13, 10), 6, "Edge cases, If the count is higher than the known max, return known max");
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
                case "number":
                    if(value == otherValue) {
                        pass();
                    } else {
                        fail("Actual=(" + value + ") but Expected=(" + otherValue + "): '" +  assertString + "'");
                    }
                    break;
                default:
                    fail("assert programming error, unknown type=" + (typeof value) + " for actual=" + value + " expected=" + otherValue + "message=" + assertString);
            }
        }
    },
    execute: function(input) {
    
    }                   
});