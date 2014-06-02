var config = require("../privateConfig").database,
    sql = require("mssqlhelper"),
    _ = require("underscore"),
    moment = require("moment"),
    query = sql.query;

sql.config(config);

sql.query = function(sqlStr, params, callback) {
    "use strict";

    query.apply(sql, [sqlStr, params, function(data) {
        if (data.tables) {
            _(data.tables).each(function(table, index) {
                var columns = [];

                // Get the column types.
                _(table.rows[0].metadata.columns).each(function(column) {
                    columns.push(column.name);
                });

                // Create the results.
                _(table.rows).each(function(row, index) {
                    var result = {};
                    _(columns).each(function(column) {
                        console.log(row);
                        console.log(column);
                        result[column] = row.getValue(column);
                    });
                    table.rows[index] = result;
                });

                data.tables[index] = table;
            });
        }

        callback(data);
    }]);
};

module.exports = sql;
