"use strict";


try {

    var rfc = require('node-rfc');

} catch (e) {

    atajo.log.e("SAP ADAPTER: COULD NOT FIND SAP NODE-RFC.")
    return

}

try {

    var config = require('../../../conf/sap.json');

} catch (e) {

    atajo.log.e("SAP ADAPTER: COULD NOT FIND CONF/SAP.JSON")
    return

}




var conParams = null;


exports.call = function(bapi, obj, cb, commit, at) {

    conParams = config[GLOBAL.RELEASE];

    if (typeof conParams == 'undefined' || conParams == null) {
        cb({ status: 0, message: "CONNECTION PARAMETERS NOT SET. CALL INIT FIRST.", result: false });
        return;
    }

    if (typeof at == 'undefined') { at = new Date().getTime(); }
    if (typeof commit == 'undefined') { commit = false; }


    q = { bapi: bapi, obj: obj, cb: cb, commit: commit, at: at }


    var _worker = Object.create(worker);

    _worker.process(q);



}


var worker = {

    client: null,

    process: function(q) {
        var that = this;

        if (typeof q == 'undefined') {
            return;
        }

        var bapi = q.bapi;
        var obj = q.obj;
        var commit = q.commit;
        var cb = q.cb;
        var at = (typeof q.at == 'undefined') ? false : q.at;

        //if(typeof BAPIS[bapi] == 'undefined') { return; }

        that.call(q);

        /*
                if (at) {

                    now = new Date().getTime();
                    delay = parseInt(at) - parseInt(now);
                    atajo.log.d("CALL TO " + bapi + " DELAYED - CALLING IN " + delay + "ms");
                    if (delay > 0) { setTimeout(function() { that.call(q); }, delay); } else { that.call(q); }

                } else {
                    that.call(q);
                }
        */
    },

    call: function(q) {
        var that = this;

        var bapi = q.bapi;
        var obj = q.obj;
        var commit = q.commit;
        var cb = q.cb;
        var at = (typeof q.at == 'undefined') ? false : q.at;


        that.client = new rfc.Client(conParams);
        atajo.log.d("CALLING BAPI " + bapi + " WITH DATA : " + JSON.stringify(obj).substring(0, 50) + "... USING RFC " + that.client.getVersion());


        that.client.connect(function(err) {
            if (err) { // check for login/connection errors
                return cb({ status: 0, message: "ERROR CONNECTING TO SAP BACKEND @ " + conParams.ashost, result: err });
            }

            // invoke remote enabled ABAP function module
            client.invoke(bapi,
                obj,
                function(err, result) {
                    if (err) { // check for errors (e.g. wrong parameters)
                        return cb({ status: 0, message: "ERROR INVOKING RFC FOR " + bapi, result: err });
                    }

                    atajo.log.d('====== RESULT FOR BAPI ' + bapi + ' IS ================');
                    atajo.log.d(JSON.stringify(result).substring(0, 100) + '...');
                    atajo.log.d('===================================================');

                    if (commit) {
                        atajo.log.d("TRANSACTION COMMIT");
                        cmd = "BAPI_TRANSACTION_COMMIT";
                        obj = { WAIT: 'X' }
                        func = that.con.Lookup(cmd);

                        client.invoke(cmd,
                            obj,
                            function(err, result) {

                                if (err) {
                                    cb({ status: 0, message: "COMMIT FAILED : " + err });
                                } else {
                                    cb({ status: 1, message: "COMMIT SUCCESS", result: result, commitresult: commitResult });
                                }

                            });
                    } else {
                        atajo.log.d("SENDING RESULT");
                        cb({ status: 1, message: "TRANSACTION SUCCESS", result: result });

                    }

                });


        });




    },















}