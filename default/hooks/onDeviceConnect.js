var _log = require('../provider/lib/log');


_onDeviceConnect = {

    evt: function() {
        _log.i("HOOK : onDeviceConnect");
    }


};


module.exports = _onDeviceConnect;