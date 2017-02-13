var atajo = {
    log: require('../../lib/atajo.log').init('SAP ADAPTER', 'sapAdapter.log')
}

var rfc = null;
var config = null;


var adapter = {

    CONNECTION_PARAMETERS: null,

    init: function() {


        try {

            rfc = require('node-rfc');

        } catch (e) {

            atajo.log.e("SAP ADAPTER: COULD NOT FIND SAP NODE-RFC.")
            return;

        }

        try {

            config = require('../../../conf/sap.json');

        } catch (e) {

            atajo.log.e("SAP ADAPTER: COULD NOT FIND CONF/SAP.JSON")
            return;

        }


        this.CONNECTION_PARAMETERS = config[GLOBAL.RELEASE];

        return this;

    },

    call: function(bapi, obj, commit, at) {

        at = at || new Date().getTime();
        commit = commit || false;

        var qry = { bapi: bapi, obj: obj, cb: cb, commit: commit, at: at }


        var _worker = Object.create(worker);

        return _worker.process(qry);



    },


    worker: {

        client: null,

        process: function(q) {
            var that = this;

            return new Promise(function(resolve, reject) {

                if (!q) {
                    return reject({ status: 0, message: "INVALID REQUEST", result: "" });
                } else if (!q.babi) {
                    return reject({ status: 0, message: "INVALID REQUEST - NO BAPI NAME SET", result: "" });
                } else if (!q.obj) {
                    return reject({ status: 0, message: "INVALID REQUEST - NO BAPI DATA SET", result: "" });
                }

                var bapi = q.bapi;
                var obj = q.obj;
                var commit = q.commit;
                //var at = (typeof q.at == 'undefined') ? false : q.at;

                that.client = new rfc.Client(conParams);
                atajo.log.d("CALLING BAPI " + bapi + " WITH DATA : " + JSON.stringify(obj).substring(0, 50) + "... USING RFC " + that.client.getVersion());


                that.client.connect(function(err) {
                    if (err) { // check for login/connection errors
                        return reject({ status: 0, message: "ERROR CONNECTING TO SAP BACKEND @ " + conParams.ashost, result: err });
                    }

                    // invoke remote enabled ABAP function module
                    client.invoke(bapi,
                        obj,
                        function(err, result) {
                            if (err) { // check for errors (e.g. wrong parameters)
                                return reject({ status: 0, message: "ERROR INVOKING RFC FOR " + bapi, result: err });
                            }

                            atajo.log.d('====== RESULT FOR BAPI ' + bapi + ' IS ================');
                            atajo.log.d(JSON.stringify(result).substring(0, 100) + '...');
                            atajo.log.d('===================================================');

                            if (commit) {
                                atajo.log.d("TRANSACTION COMMIT");
                                var _bapi = "BAPI_TRANSACTION_COMMIT";
                                var _obj = { WAIT: 'X' }

                                client.invoke(_bapi,
                                    _obj,
                                    function(err, commitResult) {

                                        if (err) {
                                            reject({ status: 0, message: "COMMIT FAILED : " + err, result: result, commitResult: false });
                                        } else {
                                            resolve({ status: 1, message: "COMMIT SUCCESS", result: result, commitresult: commitResult });
                                        }

                                    });
                            } else {
                                atajo.log.d("SENDING RESULT");
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