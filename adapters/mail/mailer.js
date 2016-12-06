var nodemailer = require('nodemailer');
var sesTransport = require('nodemailer-ses-transport');
var config = require('./config');
var AWS = require('aws-sdk');
var atajo = { log: require('../../lib/atajo.log').init('ADAPTER:MAIL', 'mailAdapter.log') };


module.exports = {


    send: function(options, cb) {


        var ses = new AWS.SES(config.SES);
        var transporter = nodemailer.createTransport(sesTransport({ ses: ses }));

        atajo.log.d("SENDING MAIL WITH OPTIONS : " + JSON.stringify(options));

        transporter.sendMail(options, function(error, info) {
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