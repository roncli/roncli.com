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
                    var result = {name: column.name};
                    switch (column.type.type) {
                        case "35":
                        case "167":
                        case "175":
                            result.convert = function(buffer) {
                                // Convert to a string.
                                return buffer.toString();
                            };
                            break;
                        case "36":
                            result.convert = function(buffer) {
                                // Convert to a GUID.
                                return (("0" + buffer[3].toString(16)).substr(-2) +
                                    ("0" + buffer[2].toString(16)).substr(-2) +
                                    ("0" + buffer[1].toString(16)).substr(-2) +
                                    ("0" + buffer[0].toString(16)).substr(-2) +
                                    "-" +
                                    ("0" + buffer[5].toString(16)).substr(-2) +
                                    ("0" + buffer[4].toString(16)).substr(-2) +
                                    "-" +
                                    ("0" + buffer[7].toString(16)).substr(-2) +
                                    ("0" + buffer[6].toString(16)).substr(-2) +
                                    "-" +
                                    ("0" + buffer[8].toString(16)).substr(-2) +
                                    ("0" + buffer[9].toString(16)).substr(-2) +
                                    "-" +
                                    ("0" + buffer[10].toString(16)).substr(-2) +
                                    ("0" + buffer[11].toString(16)).substr(-2) +
                                    ("0" + buffer[12].toString(16)).substr(-2) +
                                    ("0" + buffer[13].toString(16)).substr(-2) +
                                    ("0" + buffer[14].toString(16)).substr(-2) +
                                    ("0" + buffer[15].toString(16)).substr(-2)).toLowerCase();
                            };
                            break;
                        case "48":
                            result.convert = function(buffer) {
                                // Convert to a 1-byte number.
                                return buffer.readUInt8(0);
                            };
                            break;
                        case "52":
                            result.convert = function(buffer) {
                                // Convert to a 2-byte number.
                                return buffer.readInt16LE(0);
                            };
                            break;
                        case "56":
                            result.convert = function(buffer) {
                                // Convert to a 4-byte number.
                                return buffer.readInt32LE(0);
                            };
                            break;
                        case "61":
                            result.convert = function(buffer) {
                                // Convert to a date.
                                var date = moment(new Date(1899, 12, 1));
                                date.add("days", buffer.readInt32LE(0));
                                date.add("seconds", buffer.readInt32LE(4) / 300);
                                return date.toDate();
                            };
                            break;
                    }
                    columns.push(result);
                });

                // Create the results.
                _(table.rows).each(function(row, index) {
                    var result = {};
                    _(row.values).each(function(value, index) {
                        if (columns[index].convert) {
                            result[columns[index].name] = columns[index].convert(value.buffer);
                        } else {
                            result[columns[index].name] = value.buffer;
                        }
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
