var watch = require('watch');
var path = require('path');


exports.init = function(cb) {


    watch.createMonitor(path.join(__dirname, '../../', 'src'), function(monitor) {
        monitor.files['/dev/null']; // Stat object for my zshrc.
        monitor.on("created", function(f, stat) {
            atajo.log.d("BASE PACKAGE FILE CREATED @ " + f);
            cb(f);

        });
        monitor.on("changed", function(f, curr, prev) {
            if (f.indexOf('scss.css') > -1) {
                return;
            }
            atajo.log.d("BASE PACKAGE FILE CHANGE @ " + f);
            cb(f);

        });
        monitor.on("removed", function(f, stat) {
            if (f.indexOf('scss.css') > -1) {
                return;
            }
            atajo.log.d("BASE PACKAGE FILE REMOVED @ " + f);
            cb(f);
        });
        //  monitor.stop(); // Stop watching
    });


};