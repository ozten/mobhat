#cd /Volumes/aking/oface/ubiquity-sources
#java -jar ~/Library/rhino1_7R1/js.jar build.js
#diff -w -B -b ../ubiquity-scripts/oface.js ../ubiquity-scripts/oface.js.orig 

# I keep running into Weird freezes with Mac OS X... switching from Java to shell to isolate the issue.
# I think it's Mac OS X -> VMWare
cd /home/aking/oface/ubiquity-sources

cp _build_warning.js ../ubiquity-scripts/oface.js
cat utils.js >> ../ubiquity-scripts/oface.js
cat utils/event.js >> ../ubiquity-scripts/oface.js
cat identity.js >> ../ubiquity-scripts/oface.js
cat models/user_db.js >> ../ubiquity-scripts/oface.js
cat models/resource_db.js >> ../ubiquity-scripts/oface.js
cat views/user_facet_toggler.js >> ../ubiquity-scripts/oface.js
cat views/page_facet_toggler.js >> ../ubiquity-scripts/oface.js
cat askforlogin.js >> ../ubiquity-scripts/oface.js
cat urldb.js >> ../ubiquity-scripts/oface.js
cat model.js >> ../ubiquity-scripts/oface.js
cat view.js >> ../ubiquity-scripts/oface.js
cat controllers/oface.js >> ../ubiquity-scripts/oface.js #new
cat controllers/page_facet_toggler.js >> ../ubiquity-scripts/oface.js #new
cat controllers/lifestream_entry_facet_chooser.js >> ../ubiquity-scripts/oface.js #new
cat controllers/facet_groups.js >> ../ubiquity-scripts/oface.js #new
cat controller.js >> ../ubiquity-scripts/oface.js
cat toggler.js >> ../ubiquity-scripts/oface.js
cat commands/fetch-feed-oface.js >> ../ubiquity-scripts/oface.js
cat commands/discover-feeds-oface.js >> ../ubiquity-scripts/oface.js
cat commands/what-page-is-this.js >> ../ubiquity-scripts/oface.js

echo 'done'