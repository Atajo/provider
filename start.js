var os = require('os');
var fork = require('child_process').fork;
var path = require('path');

var HANDLERS = [];

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

                URI = SERVER.protocol + '://' + SERVER.host;

                atajo.log.d("CONNECTING TO : " + URI + " (" + RELEASE + ")");

                var len = 2;

                for (var i = 0; i < len; i++) {


                    var HANDLER = {
                        process: fork(path.join(__dirname, './', 'lib', 'atajo.io.js')),
                        processId: i,
                        release: RELEASE
                    }

                    HANDLER.process.on('message', function(msg) {


                    });

                    HANDLERS.push(HANDLER);



                }


                initNextHandler();



            });

        });

    });
});


function initNextHandler() {

    var i = HANDLERS.length - 1;
    var HANDLER = HANDLERS.pop();
    if (HANDLER && typeof HANDLER != 'undefined') {
        //SEND REQUEST TO PROCESS
        //var PROVIDER_URI = URI + '/' + (30000 + i);
        // atajo.log.d("URI IS " + PROVIDER_URI);
        setTimeout(function() {
            HANDLER.process.send({ processId: HANDLER.processId, release: HANDLER.release, uri: URI });
            initNextHandler()
        }, 2000);
    } else {
        atajo.log.i("ALL HANDLERS STARTED");
    }




}