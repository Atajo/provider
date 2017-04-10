var squash = require('./atajo.squash');
var fs = require('fs');
var path = require('path');
var config = require('../../conf/keys.json')
var os = require('os');

var code = {

    SOCKET: null,
    HASH: null,
    VERSION: null,
    KEY: null,

    init: function(SOCKET, VERSION) {

        var _ = this;

        _.SOCKET = SOCKET;
        _.VERSION = VERSION;
        _.KEY = config.API_KEY;

        var watcher = require('./atajo.watcher').init(function(f) {
            code.refresh(f);
        });

        code.refresh();



    },

    refresh: function(f) {

        var _ = this;

        _.HASH = atajo.builder.hash(_.VERSION);

        atajo.log.d("BASE HASH FOR " + _.VERSION.BASEVERSION + " IS " + _.HASH);

        atajo.builder.build(f, _.VERSION, function(passed) {

            if (typeof passed == 'undefined') {
                passed = true;
            }

            if (!passed) {
                atajo.log.d("COULD NOT BUILD BASE. NOT UPLOADING TO CORE");
                return;
            }
            
            var jsPath = path.join(__dirname, '../', 'build', 'base-' + _.VERSION.BASEVERSION + '.js');
            var jsData = ';;';
            if (fs.existsSync(jsPath)) { jsData = fs.readFileSync(jsPath, 'utf8'); }

            var cssPath = path.join(__dirname, '../', 'build', 'base-' + _.VERSION.BASEVERSION + '.css');
            var cssData = '.noStyle {}';
            if (fs.existsSync(cssPath)) { cssData = fs.readFileSync(cssPath, 'utf8'); }

            var htmlPath = path.join(__dirname, '../', 'build', 'base-' + _.VERSION.BASEVERSION + '.html');
            var htmlData = '<nodata />';
            if (fs.existsSync(htmlPath)) { htmlData = fs.readFileSync(htmlPath, 'utf8'); }

            var imgPath = path.join(__dirname, '../', 'build', 'base-' + _.VERSION.BASEVERSION + '.img');
            var imgData = '[]';
            if (fs.existsSync(imgPath)) { imgData = fs.readFileSync(imgPath, 'utf8'); }

            _PROVIDER = {
                HASH: _.HASH,
                VERSION: _.VERSION,
                API_KEY: _.KEY,
                HOSTNAME: os.hostname(),
                PAYLOAD: {
                    js: squash.deflate(new Buffer(jsData).toString('base64')),
                    css: squash.deflate(new Buffer(cssData).toString('base64')),
                    html: squash.deflate(new Buffer(htmlData).toString('base64')),
                    img: squash.deflate(new Buffer(imgData).toString('base64'))
                }
            };


            atajo.log.i("                            RELEASE HASH FOR VERSION " + _.VERSION.BASEVERSION + " --[ " + _.HASH + " ]--> UPLOADING TO CORE");



            _.SOCKET.emit('ATAJO.PROVIDER.CODE.SET.BASE', _PROVIDER);



        });




    }


};

module.exports = code;