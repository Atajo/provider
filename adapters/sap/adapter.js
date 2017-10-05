var atajo = {
    log: require('../../lib/atajo.log').init('SAP ADAPTER', 'sapAdapter.log')
}

let SAP = {

    client: null,
    rfc: null,

    query: function(bapi, obj, commit, at) {


        try {

            this.rfc = require('sapnwrfc');


        } catch (e) {

            atajo.log.e("SAP ADAPTER: COULD NOT FIND SAP NODE-RFC.")
            return;

        }

        let sap = new SAPAdapter(this.rfc);
        return sap.query(bapi, obj, commit, at);

    }


}


class SAPAdapter {


    constructor(rfc) {

        atajo.log.d("INITIALIZING SAP ADAPTER");
        this.client = new rfc.Connection;

        try {

            let config = require('../../../conf/sap.json');
            this.CONNECTION_PARAMETERS = config[GLOBAL.RELEASE];


        } catch (e) {

            atajo.log.e("SAP ADAPTER: COULD NOT PARSE CONF/SAP.JSON : " + e)
            return;

        }
    }

    query(bapi, obj, commit, at) {

        atajo.log.d("SAP.QUERY : " + bapi + " -> " + JSON.stringify(obj));
        let that = this;
        at = at || new Date().getTime();
        commit = commit || false;
        let qry = { bapi: bapi, obj: obj, commit: commit, at: at }


        return new Promise((resolve, reject) => {



            atajo.log.d("SAP.QUERY RUNNING : " + JSON.stringify(qry));

            if (!qry) {
                return reject({ status: 0, message: "INVALID REQUEST", result: "" });
            } else if (!qry.bapi) {
                return reject({ status: 0, message: "INVALID REQUEST - NO BAPI NAME SET", result: "" });
            } else if (!qry.obj) {
                return reject({ status: 0, message: "INVALID REQUEST - NO BAPI DATA SET", result: "" });
            }

            var bapi = qry.bapi;
            var obj = qry.obj;
            var commit = qry.commit;
            //atajo.log.d("CONNECTION PARAMETERS ARE : " + JSON.stringify(adapter.CONNECTION_PARAMETERS));
            atajo.log.d("CALLING BAPI " + bapi + " (COMMIT : " + commit + ") WITH DATA : " + JSON.stringify(obj).substring(0, 100) + '...');

            this.client.Open(this.CONNECTION_PARAMETERS, (err) => {

                if (err) { // check for login/connection errors
                    atajo.log.e("SAP CLIENT CONNECT ERROR : " + err);
                    return reject({ status: 0, message: "ERROR CONNECTING TO SAP BACKEND @ " + conParams.ashost, result: err });
                }

                atajo.log.d("CLIENT IS OPEN - LOOKING UP " + bapi);

                var func = that.client.Lookup(bapi);

                atajo.log.d("GOT FUNC");

                func.Invoke(obj, (err, result) => {

                    atajo.log.d("FUNC RETURNED");

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

                        func = that.client.Lookup(bapi);
                        func.Invoke(obj, function(err, commitResult) {

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

    }


}


module.exports = SAP;