#cd /Volumes/aking/oface/ubiquity-sources
#java -jar ~/Library/rhino1_7R1/js.jar build.js
#diff -w -B -b| tee -a  $MOB_DIR/mobhat.js| tee -a  $MOB_DIR/mobhat.js.orig 

# I keep running into Weird freezes with Mac OS X... switching from Java to shell to isolate the issue.
# I think it's Mac OS X -> VMWare
cd /home/aking/oface/ubiquity-sources
MOB_DIR='../server/static/ubiquity'
cp _build_warning.js                              $MOB_DIR/mobhat.js
cp _build_warning.js                              $MOB_DIR/mobhat-dev.js

cat stylo.css                                     | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js
cat config.js                                     | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js
cat utils.js                                      | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js
cat utils/event.js                                | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js
cat identity.js                                   | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js
cat models/user_db.js                             | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js
cat models/resource_db.js                         | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js
cat views/user_facet_toggler.js                   | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js
cat views/page_facet_toggler.js                   | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js
cat views/login.js                                | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js
cat views/new_user.js                             | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js #new
cat models/askforlogin.js                         | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js
cat askforlogin.js                                | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js
cat urldb.js                                      | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js
cat model.js                                      | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js
cat view.js                                       | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js
cat controllers/oface.js                          | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js #new
cat controllers/page_facet_toggler.js             | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js #new
cat controllers/lifestream_entry_facet_chooser.js | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js #new
cat controllers/facet_groups.js                   | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js #new
cat controllers/new_user.js                       | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js #new
cat controller.js                                 | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js
cat toggler.js                                    | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js
cat commands/fetch-feed-oface-common.js           | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js
# prod does pageLoad dev uses command
cat commands/fetch-feed-oface.js                  >> $MOB_DIR/mobhat.js
cat commands/fetch-feed-oface-dev.js              >> $MOB_DIR/mobhat-dev.js

cat commands/discover-feeds-oface.js              | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js
cat commands/what-page-is-this.js                 | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js #new
cat commands/mobhat-version.js                    | tee -a  $MOB_DIR/mobhat.js $MOB_DIR/mobhat-dev.js

echo 'done'