(function() {
    "use strict";
}());

var _log = require('../../lib/atajo.log.js').init('ADAPTER');
var mqtt_lib = require('mqtt');

var _mqtt = {
    CONF: null,
    CLIENT: null,
    CONNECTED: false,

    init: function(CB) {
        var _ = this;
        try {
            _.CONF = require('../../../conf/mqtt');
        } catch (e) {
            _log.e("COULD NOT REQUIRE MQTT CONFIG. PLEASE ENSURE conf/mqtt.json EXISTS AND IS CONFIGURED");
            CB(false);
            return;
        }

        _.connect(CB);
    },


    connect: function(CB) {
        var _ = this;
        _.CLIENT = mqtt_lib.connect(_.CONF.connection_string);

        _.CLIENT.on('error', _.err);

        _.CLIENT.on("connect", function() {
            if (_.CONNECTED) {
                return;
            }

            _.CONNECTED = true;
            _log.d("Connected MQTT to " + _.CONF.connection_string);

            CB();
        });

        process.on('SIGINT', function() {
            _.CLIENT.end(function() {
                _log.e('<<<<<<<<<<<<<<<<<<<  MQTT DISCONNECTED  >>>>>>>>>>>>>>>>>>>');
                process.exit(0);
            });
        });
    },

    err: function(msg) {
        _log.e("MQTT ERROR : " + msg);
    },
};

module.exports = _mqtt;
}

}

if (_.SCHEMAS.length == 0) {
    _log.i("NO SCHEMAS DEFINED. NOT CONNECTING DB");
    return;
}

//INIT THE SCHEMAS
for (var schema in _.SCHEMAS) {

    var schemaName = schema;
    var schemaData = _.SCHEMAS[schema];

    var schemaRefName = schemaName.replace('Schema', '') + 's';
    _log.d("                     LOADING SCHEMA " + schemaName + " (" + schemaRefName + ")"); // => "+JSON.stringify(schemaInstance));

    _.SCHEMAS[schemaRefName] = (typeof _.SCHEMAS[schemaRefName] == 'undefined') ? mongoose.model(schemaName, new mongoose.Schema(schemaData)) : _.SCHEMAS[schemaRefName];

}

_.connect(CB);



});


},


connect: function(CB) {
        var _ = this;

        var options = {
            db: {
                native_parser: true
            }
        };

        if (_.CONF.username && _.CONF.password) {
            options.user = _.CONF.username;
            options.pass = _.CONF.password;
        };

        //GET ENDPOINT
        var mongoURL = _.CONF.host;

        _log.d("MONGO CONNECTING TO " + mongoURL);


        //CONNECT TO DB
        _.DB = mongoose.connection;
        _.DB.on('error', _.err);
        _.DB.once('open', function callback() {
            if (_.CONNECTED) {
                return;
            }

            _.CONNECTED = true;

            _log.d("MONGO CONNECTED TO " + mongoURL);
            CB(_.SCHEMAS);
        });

        mongoose.connect(mongoURL, options);
        //mongoose.connect(mongoURL);

        process.on('SIGINT', function() {
            _.DB.close(function() {
                _log.e('<<<<<<<<<<<<<<<<<<<  MONGO DISCONNECTED  >>>>>>>>>>>>>>>>>>>');
                process.exit(0);
            });
        });



    },

    err: function(msg) {

        _log.e("MONGO ERROR : " + msg);
        _log.e("COULD NOT CONNECT TO MONGO -> STOPPING");
        //process.exit(1);

    }

};

module.exports = _mongodb;