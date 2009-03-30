#cd /Volumes/aking/oface/ubiquity-sources
#java -jar ~/Library/rhino1_7R1/js.jar build.js
#diff -w -B -b ../server/static/ubiquity/mobhat.js ../server/static/ubiquity/mobhat.js.orig 

# I keep running into Weird freezes with Mac OS X... switching from Java to shell to isolate the issue.
# I think it's Mac OS X -> VMWare
cd /home/aking/oface/ubiquity-sources

cp _build_warning.js                                 ../server/static/ubiquity/mobhat.js
cat stylo.css >>                                     ../server/static/ubiquity/mobhat.js
cat config.js >>                                     ../server/static/ubiquity/mobhat.js
cat utils.js >>                                      ../server/static/ubiquity/mobhat.js
cat utils/event.js >>                                ../server/static/ubiquity/mobhat.js
cat identity.js >>                                   ../server/static/ubiquity/mobhat.js
cat models/user_db.js >>                             ../server/static/ubiquity/mobhat.js
cat models/resource_db.js >>                         ../server/static/ubiquity/mobhat.js
cat views/user_facet_toggler.js >>                   ../server/static/ubiquity/mobhat.js
cat views/page_facet_toggler.js >>                   ../server/static/ubiquity/mobhat.js
cat views/login.js >>                                ../server/static/ubiquity/mobhat.js
cat views/new_user.js >>                             ../server/static/ubiquity/mobhat.js #new
cat models/askforlogin.js >>                         ../server/static/ubiquity/mobhat.js
cat askforlogin.js >>                                ../server/static/ubiquity/mobhat.js
cat urldb.js >>                                      ../server/static/ubiquity/mobhat.js
cat model.js >>                                      ../server/static/ubiquity/mobhat.js
cat view.js >>                                       ../server/static/ubiquity/mobhat.js
cat controllers/oface.js >>                          ../server/static/ubiquity/mobhat.js #new
cat controllers/page_facet_toggler.js >>             ../server/static/ubiquity/mobhat.js #new
cat controllers/lifestream_entry_facet_chooser.js >> ../server/static/ubiquity/mobhat.js #new
cat controllers/facet_groups.js >>                   ../server/static/ubiquity/mobhat.js #new
cat controllers/new_user.js >>                       ../server/static/ubiquity/mobhat.js #new
cat controller.js >>                                 ../server/static/ubiquity/mobhat.js
cat toggler.js >>                                    ../server/static/ubiquity/mobhat.js
cat commands/fetch-feed-oface.js >>                  ../server/static/ubiquity/mobhat.js
cat commands/discover-feeds-oface.js >>              ../server/static/ubiquity/mobhat.js
cat commands/what-page-is-this.js >>                 ../server/static/ubiquity/mobhat.js #new
cat commands/mobhat-version.js >>                    ../server/static/ubiquity/mobhat.js

echo 'done'