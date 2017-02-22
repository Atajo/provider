var _log = require('../provider/lib/log');


_onSyncCancel = {

    evt: function() {
        _log.i("HOOK : onSyncCancel");
    }


};


module.exports = _onSyncCancel;