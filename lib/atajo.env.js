var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;


module.exports = {

    CALLBACK: null,
    ISWIN: false,

    init: function(cb) {
        var _ = this;

        _.CALLBACK = cb;

        _.ISWIN = /^win/.test(process.platform);

        //CHECK FOR NODE ARCH
        if (process.arch != 'x64') {
            console.log("PROVIDER REQUIRES 64-bit NODE");
            process.exit(0);
        }

        //CHECK FOR PROVIDER NODE MODULES
        var modPath = path.join(__dirname, '../', '../', 'provider', 'node_modules');
        if (!fs.existsSync(modPath)) {
            console.log("INSTALLING NPM MODULES REQUIRED BY PROVIDER - THIS CAN TAKE A FEW MINUTES");

            if (_.ISWIN) {
                cmd = 'cd provider & npm install';
            } else {
                cmd = 'cd provider; npm install;';
            }

            exec(

                cmd,

                function(error, stdout, stderr) {


                    _.checkAppModules(cb);


                });



        } else {

            _.checkAppModules(cb);

        }


    },

    checkAppModules: function(cb) {

        //CHECK FOR APP NODE MODULES
        var modPath = path.join(__dirname, '../', '../', 'node_modules');
        if (!fs.existsSync(modPath)) {
            console.log("INSTALLING NPM MODULES REQUIRED BY APPLICATION - THIS CAN TAKE A FEW MINUTES");

            if (_.ISWIN) {
                cmd = 'cd provider & npm install';
            } else {
                cmd = 'cd provider; npm install;';
            }

            exec(

                cmd,

                function(error, stdout, stderr) {


                    cb();


                });



        } else {
            cb();
        }

    }

};