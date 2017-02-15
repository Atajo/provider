var nodemailer = require('nodemailer');
var config = require('../../../conf/config.json');
var AWS = require('aws-sdk');
var atajo = { log: require('../../lib/atajo.log').init('ADAPTER:MAIL', 'mailAdapter.log') };


module.exports = {


    send: function(options, cb) {


        if (!config.AWS || !config.AWS.SES) {
            atajo.log.e("CANNOT SEND MAIL. PLEASE CONFIGURE AMAZON SES SETTINGS IN PROVIDER/CONFIG/CONFIG.JSON");
            return;
        }

        atajo.log.d("USING SES CONFIG : " + JSON.stringify(config.AWS.SES));


        var ses = new AWS.SES(config.AWS.SES);
        var transport = nodemailer.createTransport({ SES: ses });

        atajo.log.d("SENDING MAIL WITH OPTIONS : " + JSON.stringify(options));



        transport.sendMail(options, function(error, info) {
            if (error) {
                atajo.log.d("MAIL ERROR : " + error);
                cb(false);
            } else {
                atajo.log.d("MAIL SUCCESS : " + JSON.stringify(info));
                cb(true);
            }
        });



    }


}