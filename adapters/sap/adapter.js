var atajo = {
    log: require('../../lib/atajo.log').init('SAP ADAPTER', 'sapAdapter.log')
}

var rfc = null;
var config = null;


var adapter = {

    CONNECTION_PARAMETERS: null,

    init: function() {

        atajo.log.d("INITIALIZING SAP ADAPTER");

        try {

            //rfc = require('node-rfc');
            rfc = require('sapnwrfc');


        } catch (e) {

            atajo.log.e("SAP ADAPTER: COULD NOT FIND SAP NODE-RFC.")
            return;

        }

        try {

            config = require('../../../conf/sap.json');

        } catch (e) {

            atajo.log.e("SAP ADAPTER: COULD NOT PARSE CONF/SAP.JSON : " + e)
            return;

        }


        this.CONNECTION_PARAMETERS = config[GLOBAL.RELEASE];

        return this;

    },

    query: function(bapi, obj, commit, at) {


        at = at || new Date().getTime();
        commit = commit || false;

        var qry = { bapi: bapi, obj: obj, commit: commit, at: at }


        var _worker = Object.create(adapter.worker);

        return _worker.process(qry);



    },


    worker: {

        client: null,

        process: function(q) {
            var that = this;

            return new Promise(function(resolve, reject) {

                if (!q) {
                    return reject({ status: 0, message: "INVALID REQUEST", result: "" });
                } else if (!q.bapi) {
                    return reject({ status: 0, message: "INVALID REQUEST - NO BAPI NAME SET", result: "" });
                } else if (!q.obj) {
                    return reject({ status: 0, message: "INVALID REQUEST - NO BAPI DATA SET", result: "" });
                }

                var bapi = q.bapi;
                var obj = q.obj;
                var commit = q.commit;
                that.client = new rfc.Connection;
                atajo.log.d("CONNECTION PARAMETERS ARE : " + JSON.stringify(adapter.CONNECTION_PARAMETERS));
                atajo.log.d("CALLING BAPI " + bapi + " (COMMIT : " + commit + ") WITH DATA : " + JSON.stringify(obj).substring(0, 100) + '...');

                that.client.Open(adapter.CONNECTION_PARAMETERS, function(err) {
                    //that.client.connect(function(err) {
                    if (err) { // check for login/connection errors
                        atajo.log.e("SAP CLIENT CONNECT ERROR : " + err);
                        return reject({ status: 0, message: "ERROR CONNECTING TO SAP BACKEND @ " + conParams.ashost, result: err });
                    }

                    var func = that.client.Lookup(bapi);

                    func.Invoke(obj, function(err, result) {
                        if (err) { // check for errors (e.g. wrong parameters)
                            atajo.log.e("SAP CLIENT INVOKE ERROR : " + JSON.stringify(err) + "/" + JSON.stringify(result));

                            atajo.log.e(JSON.stringify(obj));
                            return reject({ status: 0, message: "ERROR INVOKING RFC FOR " + bapi, result: err });
                        }

                        atajo.log.d('====== RESULT FOR BAPI ' + bapi + ' IS ==========================');
                        atajo.log.d(JSON.stringify(result).substring(0, 100) + '...');
                        atajo.log.d('================================================================================');

                        if (commit) {
                            atajo.log.d("TRANSACTION COMMIT");
                            bapi = "BAPI_TRANSACTION_COMMIT";
                            obj = { WAIT: 'X' }
                            atajo.log.d("TRANSACTION COMMIT");

                            func = that.client.Lookup(bapi);
                            atajo.log.d("TRANSACTION COMMIT");

                            func.Invoke(obj, function(err, result) {

                                if (err) {
                                    atajo.log.e("SAP CLIENT [COMMIT] INVOKE ERROR : " + err);
                                    reject({ status: 0, message: "COMMIT FAILED : " + err, result: result, commitResult: false });
                                } else {
                                    resolve({ status: 1, message: "COMMIT SUCCESS", result: result, commitresult: commitResult });
                                }

                            });
                        } else {
                            resolve({ status: 1, message: "TRANSACTION SUCCESS", result: result });
                        }

                    });


                });






            });



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







    }

}

module.exports = adapter;