var fs = require('fs-extra');
var path = require('path');
var md5 = require('md5');

var diff = {

    getPatch: function(str_1, str_2, charsPerChunk) {

        charsPerChunk = charsPerChunk || 100;

        var chunks = Math.round(str_2.length / charsPerChunk);

        var nextStart = 0;
        var patch = [];
        var mismatches = 0;

        for (var i = 0; i <= chunks; i++) {
            var newChunk = str_1.substring(nextStart, nextStart + charsPerChunk);
            var oldChunk = str_2.substring(nextStart, nextStart + charsPerChunk);

            if (newChunk != oldChunk) {
                mismatches++;
                patch.push({ x: nextStart, v: newChunk });
            }

            nextStart += charsPerChunk;
        }

        return {
            chunkSize: charsPerChunk,
            preHash: md5(str_1),
            postHash: md5(str_2),
            at: new Date().getTime(),
            chunks: chunks,
            mismatches: mismatches,
            patch: patch
        }


    },

    applyPatches: function(str, patch) {

        var charsPerChunk = patch.chunkSize;

        for (var i in patch.data) {



        }



    },



}


module.exports = diff;