;CmdUtils.CreateCommand({
  name: "mobhat-version",
  homepage: "http://mobhat.restservice.org/",
  author: {
    name: "Austin King",
    email: "shout@ozten.com"
  },
  license: "GPL",
  description: "Shows the version that MOBhat thinks your using ;)",
  help: "Just run it, preview will show version",
  preview: function(pblock, input) {
    pblock.innerHTML = "Version: 1";
  }
});
