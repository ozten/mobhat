// build.js takes ubiquity-sources and creates ubiquity-scripts/oface.js
// example: java -jar ~/Library/rhino1_7R1/js.jar build.js

var SRC_DIR = '../ubiquity-sources/';
var DIST_DIR = '../ubiquity-scripts/';

function build(){
    //md5 is aa4649132486a2410f7e63628479f297    
    File.cp(SRC_DIR + '_build_warning.js', DIST_DIR + 'oface.js')        
        .append(SRC_DIR + 'utils.js')
        .append(SRC_DIR + 'utils/event.js')
        .append(SRC_DIR + 'identity.js')
        .append(SRC_DIR + 'models/user_db.js')
        .append(SRC_DIR + 'models/resource_db.js')
        .append(SRC_DIR + 'views/user_facet_toggler.js')
        .append(SRC_DIR + 'views/page_facet_toggler.js')
        .append(SRC_DIR + 'askforlogin.js')
        .append(SRC_DIR + 'urldb.js')
        .append(SRC_DIR + 'model.js')
        .append(SRC_DIR + 'view.js')
        .append(SRC_DIR + 'controller.js')
        .append(SRC_DIR + 'toggler.js')
        .append(SRC_DIR + 'commands/fetch-feed-oface.js')
        .append(SRC_DIR + 'commands/discover-feeds-oface.js')
        .append(SRC_DIR + 'commands/what-page-is-this.js');
}

var File = {
    cp: function(sourceFilename, targetFilename){
        NativeFile.copyFile(sourceFilename, targetFilename, false);
        return {
            append: function(filename){                
                File.append(filename, targetFilename);
                return this;
            }
        };
    },
    append: function(sourceFilename, targetFilename){        
        NativeFile.copyFile(sourceFilename, targetFilename, true);
    }
}
/**
 * Rhino specific file handeling
 */
var RhinoPhile = {
    /**
     * copies a file from one place to another by either overwriting
     * or appending the source onto the target
     */
    copyFile: function(sourceFilename, targetFilename, appendToFile) {    
        inChannel = new java.io.FileInputStream(
                        new java.io.File(sourceFilename)).getChannel();
        outChannel = new java.io.FileOutputStream(
                        new java.io.File(targetFilename), appendToFile).getChannel();
        try {
            inChannel.transferTo(0, inChannel.size(), outChannel);
        } catch (e) {
            print( e );
        } finally {
            if (inChannel != null) inChannel.close();
            if (outChannel != null) outChannel.close();
        }
    }
}
var NativeFile = RhinoPhile;
build();