module.exports = {

    success: function(msg, code, stringify) {
        stringify = stringify || true;
        var resp = {
            error: false,
            message: msg,
        }
        return stringify ? JSON.stringify(resp) : resp;
    },
    fail: function(msg, code, stringify) {
        stringify = stringify || true;
        var resp = {
            error: true,
            message: msg,
        }
        return stringify ? JSON.stringify(resp) : resp;
    },


}