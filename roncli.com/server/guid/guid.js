module.exports = require("node-uuid");

var parse = module.exports.parse,
    unparse = module.exports.unparse;

module.exports.parse = function() {
    "use strict";

    var uuid = parse.apply(module.exports, arguments);
    var guid = new Buffer(16);
    uuid.copy(guid, 0, 3, 4);
    uuid.copy(guid, 1, 2, 3);
    uuid.copy(guid, 2, 1, 2);
    uuid.copy(guid, 3, 0, 1);
    uuid.copy(guid, 4, 5, 6);
    uuid.copy(guid, 5, 4, 5);
    uuid.copy(guid, 6, 7, 8);
    uuid.copy(guid, 7, 6, 7);
    uuid.copy(guid, 8, 8);
    return guid;
};

module.exports.unparse = function(guid) {
    "use strict";

    var uuid = new Buffer(16), args;
    guid.copy(uuid, 0, 3, 4);
    guid.copy(uuid, 1, 2, 3);
    guid.copy(uuid, 2, 1, 2);
    guid.copy(uuid, 3, 0, 1);
    guid.copy(uuid, 4, 5, 6);
    guid.copy(uuid, 5, 4, 5);
    guid.copy(uuid, 6, 7, 8);
    guid.copy(uuid, 7, 6, 7);
    guid.copy(uuid, 8, 8);

    args = Array.prototype.slice.call(arguments);
    args[0] = uuid;
    return unparse.apply(module.exports, args);
};
