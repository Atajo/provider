/**
 * This is a helper to call http requests for handlers
 * This when using an underlying web api
 */
(function() {
    var apiConfig = require('../../../conf/request.json');
    var http = require('http');
    var path = require('path');
    var url = require('url');
    var atajo = { log: require('../../lib/atajo.log').init('adapter:request') };
    var Q = require('q');
    var request = require('request');
    var os = require('os');

    /**
     * This is the fallback error
     * @type {String}
     */
    var unresolvedErrorMessage = "Network Error";

    /**
     * This is a regex to detect leading slashes
     * @type {RegExp}
     */
    var leadingSlashRegex = /^\/+/;

    /**
     * It is expected that the app and web api are served at one place (otherwise use appropriate url)
     */
    var baseURL = (apiConfig && apiConfig.BASE_URL) ? apiConfig.BASE_URL : 'https://' + os.hostname() + '/';

    var makeRequest = function(options) {
        var deferred = Q.defer();
        atajo.log.d(" start handler web request via uri: " + options.uri);
        request(options, function(error, response, body) {

            if (!error) {
                if (typeof body == 'object') {
                    deferred.resolve(body);
                } else {
                    try {
                        deferred.resolve(JSON.parse(body));
                    } catch (e) {
                        atajo.log.i("Could not parse response body - " + body);
                        deferred.resolve(body);
                    }
                }

            } else {
                atajo.log.e("Request unsuccessfull: " + (error ? error : '') + " | status: " + (response ? response.statusCode : 'N/A'));
                deferred.resolve({ error: true, message: unresolvedErrorMessage });
            }
        });
        return deferred.promise;
    };

    var post = function(urlPath, postData, params, heads) {
        var deferred = Q.defer();

        params = params || {};

        var options = {
            uri: baseURL + urlPath.replace(leadingSlashRegex, ''),
            method: 'POST',
            json: true,
            body: postData,
            qs: params,
            headers: heads
        };
        makeRequest(options).then(function(data) {
            deferred.resolve(data);
        });

        return deferred.promise;
    };

    var get = function(urlPath, params, heads) {
        var deferred = Q.defer();

        params = params || {};

        var options = {
            uri: baseURL + urlPath.replace(leadingSlashRegex, ''),
            method: 'GET',
            qs: params,
            headers: heads
        };
        makeRequest(options).then(function(data) {
            deferred.resolve(data);
        });

        return deferred.promise;
    };

    var put = function(urlPath, postData, params, heads) {
        var deferred = Q.defer();

        params = params || {};

        var options = {
            uri: baseURL + urlPath.replace(leadingSlashRegex, ''),
            method: 'PUT',
            json: true,
            body: postData,
            qs: params,
            headers: heads
        };
        makeRequest(options).then(function(data) {
            deferred.resolve(data);
        });

        return deferred.promise;
    };

    var deleteReq = function(urlPath, params, heads) {
        var deferred = Q.defer();

        params = params || {};

        var options = {
            uri: baseURL + urlPath.replace(leadingSlashRegex, ''),
            method: 'DELETE',
            qs: params,
            headers: heads
        };
        makeRequest(options).then(function(data) {
            deferred.resolve(data);
        });

        return deferred.promise;
    };

    module.exports = {
        post: post,
        get: get,
        put: put,
        delete: deleteReq
    };
}());