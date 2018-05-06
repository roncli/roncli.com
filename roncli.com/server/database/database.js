var config = require("../privateConfig").database,
    sql = require("mssql"),
    _ = require("underscore");

module.exports.query = function(sqlStr, params, callback) {
    "use strict";

    var conn = new sql.ConnectionPool(config, function(err) {
        var ps;

        if (err) {
            callback(err);
            return;
        }

        ps = new sql.PreparedStatement(conn);
        _(params).each(function(param, key) {
            ps.input(key, param.type);
        });
        ps.multiple = true;
        ps.prepare(sqlStr, function(err) {
            if (err) {
                callback(err);
                return;
            }

            ps.execute(
                _.object(_(params).map(function(param, key) {
                    return [key, param.value];
                })), function(err, data) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    ps.unprepare(function(err) {
                        if (err) {
                            callback(err);
                            return;
                        }
                        callback(null, data);
                    });
                }
            );
        });
    });
};

module.exports.TYPES = sql.TYPES;

_(sql.TYPES).each(function(value, key) {
    "use strict";

    module.exports[key] = value;
    module.exports[key.toUpperCase()] = value;
});
