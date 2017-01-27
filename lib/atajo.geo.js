var request = require('request');
var config = require('../conf-internal/config');

var keys = require('../../conf/keys.json')

var atajo = {
    response: require('../lib/atajo.response.js'),
    log: require('./atajo.log').init('atajo.geo')


}

var geo = {

    URL: config[GLOBAL.RELEASE].GEO.URL,

    travel: {
        start: function(uuid, username) {

            if (!uuid || uuid == '') {
                return new Promise(function(resolve, reject) { reject(response.fail('Invalid UUID', 0, false)); });
            }

            var query = {
                uuid: uuid,
                username: username

            };

            return geo.query('travel/start', query);


        },

        stop: function(uuid) {

            if (!uuid || uuid == '') {
                return new Promise(function(resolve, reject) { reject(response.fail('Invalid UUID', 0, false)); });
            }

            var query = {
                uuid: uuid,
            };

            return geo.query('travel/stop', query);


        },

        search: function() {



        }

    },

    query: function(endpoint, query) {

        //GEN HEADERS
        var headers = {
            KEY: keys.API_KEY,
            RELEASE: GLOBAL.RELEASE
        };

        return new Promise(function(resolve, reject) {

            request({
                    url: geo.URL + endpoint,
                    method: "POST",
                    headers: headers,
                    json: { query: query }
                },
                function(error, response, body) {
                    if (!error && response.statusCode === 200) {
                        resolve(atajo.response.success(body, 200, false));
                    } else {
                        var code = (typeof response == 'undefined') ? 0 : (response.statusCode || 0); 
                        reject(atajo.response.fail(error, code, false));
                    }
                });


        });



    },




}

module.exports = geo;