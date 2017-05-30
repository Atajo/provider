var _log = require('./atajo.log').init('forkController');

var fs = require('fs');
var path = require('path');


var hasResponded = false;


exports.init = function(handler, tag) {

    tag = tag || 'generic';

    process.on('message', function(request) {

        if (typeof request.request == 'undefined' || typeof request.request.pid == 'undefined') {
            _log.e("INVALID REQUEST -> DROPPING : " + JSON.stringify(request));
            return;
        }

        //SET GLOBALS
        GLOBAL.RELEASE = (typeof request.release == 'undefined') ? 'DEV' : request.release;


        //PREP DBI
        require('../adapters/mongodb/adapter').init(function(dbi) {

            _log.d("HANDLER READY. PREPPING API");

            //PREP API
            api = {
                sendMessageToToken: function(token, msg) {
                    process.send({
                        type: 'API',
                        req: {
                            token: token,
                            msg: msg
                        }
                    });
                },

                geo: require('../lib/atajo.geo.js')

            }

            initWorker(request, handler, dbi, api, tag);

        });



    });

}


function initWorker(request, handler, DBI, API, TAG) {

    var requestData = request.request;

    var WORKER = Object.create(handler);
    GLOBAL.atajo = {
        log: require('./atajo.log').init('handler:' + TAG)
    }

    if (typeof WORKER.init == 'undefined') {
        try {
            WORKER.req(requestData, workerResult, DBI, API);
        } catch (e) {
            _log.e("HANDLER REQ ERROR -> " + e);
            return
        }

    } else {
        try {
            WORKER.init(requestData, workerResult, DBI, API).req();
        } catch (e) {
            _log.e("HANDLER INIT ERROR -> " + e);
            return;
        }

    }

}




function workerResult(OBJ) {

    _log.d("GOT HANDLER RESULT");

    if (typeof OBJ.pid == 'undefined' || !OBJ.pid) {
        _log.e("HANDLER RESPONSE CONTAINS NO PID");
        return;
    }

    var _path = path.join(__dirname, '../', '../', 'cache');
    if (!fs.existsSync(_path)) {
        fs.mkdirSync(_path);
        _path = path.join(__dirname, '../', '../', 'cache', 'pids');
        fs.mkdirSync(_path);

    }

    _path = path.join(__dirname, '../', '../', 'cache', 'pids');


    var fnam = path.join(_path, OBJ.pid + '.json');
    var data = false;

    try {
        data = JSON.stringify(OBJ);
    } catch (e) {
        _log.e("COULD NOT STRINGIFY OBJ");
    }

    if (!data) {
        _log.e("NO DATA. NOT RESPONDING FOR " + fnam);
        return;
    }

    fs.writeFile(fnam, data, function(err) {
        if (err) {
            _log.e("COULD NOT WRITE RESPONSE TO CACHE FOR " + fnam + " [ " + err + " ]");
            return;
        }

        try {
            process.send({
                type: 'PID',
                pid: OBJ.pid
            });
        } catch (e) {
            _log.e("COULD NOT RESPOND TO PROVIDER -> " + e);

        }



    });





}