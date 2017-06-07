var os = require('os');
var fork = require('child_process').fork;
var path = require('path');

var NODES = [];
var currentNodeIdx = 0;
var RELEASE = null;
var SERVER = null;
var URI = null;


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

                var len = os.cpus().length;

                for (var i = 0; i < len; i++) {


                    var NODE = createNode(i);
                    NODES.push(NODE);



                }

                initNextNode();



            });

        });

    });
});

function createNode(i) {

    var NODE = {
        process: fork(path.join(__dirname, './', 'lib', 'atajo.io.js')),
        processId: i,
        release: RELEASE
    }

    NODE.process.on('message', function(msg) {

        //atajo.log.i("GOT MESSAGE FROM NODE : ");
        //atajo.log.i(msg);


    });

    return NODE;


}

function startNode(NODE) {

    atajo.log.d("CONNECTING NODE " + NODE.processId + " TO " + URI);
    NODE.process.send({ action: 'start', processId: NODE.processId, release: NODE.release, uri: URI });

}


function initNextNode(idx) {

    idx = idx || currentNodeIdx;

    var NODE = NODES[idx];
    if (NODE && typeof NODE != 'undefined') {

        setTimeout(function() {
            //atajo.log.d("STARTING NODE " + NODE.processId);
            startNode(NODE);
            currentNodeIdx++;
            initNextNode();

        }, 2000);
    } else {
        atajo.log.i("ALL (" + NODES.length + ") NODES STARTED");
        startNodeMonitor();
    }


}


var monitorInterval = null;

function startNodeMonitor() {

    clearInterval(monitorInterval);
    monitorInterval = setInterval(function() {

        // atajo.log.d("SENDING ALIVE TO NODES ");

        for (var i in NODES) {
            var NODE = NODES[i];
            try {
                NODE.process.send({ action: 'alive' });
            } catch (e) {
                atajo.log.w("NODE " + i + " NOT REACHABLE. RESTARTING");
                var NODE = createNode(i);
                NODES[i] = NODE;
                startNode(NODE);
            }

        }



    }, 10000);

}