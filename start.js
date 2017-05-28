var os = require('os');
var fork = require('child_process').fork;
var path = require('path');

require('./lib/atajo.env').init(function() {

    require('./lib/atajo.provider').init(function(atajo) {

        global.atajo = atajo;

        //atajo.clear();
        require('./lib/atajo.setup').init(function() {


            atajo.log.i("STARTING PROVIDER");


            //GET RELEASE
            atajo.release(function(__RELEASE__, __SERVER__) {

                RELEASE = __RELEASE__;
                SERVER = __SERVER__;

                atajo.postInit(RELEASE);

                URI = SERVER.protocol + '://' + SERVER.host + ':' + SERVER.port;

                atajo.log.d("CONNECTING TO : " + URI + " (" + RELEASE + ")");

                var len = os.cpus().length;

                atajo.log.d("SPAWINING " + len + " IO INTERFACES");

                for (var i = 0; i < len; i++) {


                    var HANDLER = {
                        process: fork(path.join(__dirname, './', 'lib', 'atajo.io.js')),
                        processId: i,
                        release: RELEASE
                    }

                    HANDLER.process.on('message', function(msg) {


                    });

                    //SEND REQUEST TO PROCESS
                    HANDLER.process.send({ processId: HANDLER.processId, release: HANDLER.release, uri: URI });


                }


            });

        });

    });
});