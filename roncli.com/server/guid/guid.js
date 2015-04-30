/// <reference path="../../typings/node/node.d.ts"/>
module.exports = require("node-uuid");

var parse = module.exports.parse,
    unparse = module.exports.unparse,
    v4 = module.exports.v4;

module.exports.parse = function() {
    "use strict";

    var uuid = new Buffer(parse.apply(module.exports, arguments)),
        guid = new Buffer(16);
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

    var uuid = new Buffer(16),
        buf = new Buffer(guid),
        args;

    buf.copy(uuid, 0, 3, 4);
    buf.copy(uuid, 1, 2, 3);
    buf.copy(uuid, 2, 1, 2);
    buf.copy(uuid, 3, 0, 1);
    buf.copy(uuid, 4, 5, 6);
    buf.copy(uuid, 5, 4, 5);
    buf.copy(uuid, 6, 7, 8);
    buf.copy(uuid, 7, 6, 7);
    buf.copy(uuid, 8, 8);

    args = Array.prototype.slice.call(arguments);
    args[0] = uuid;
    return unparse.apply(module.exports, args).toUpperCase();
};

module.exports.v4 = function() {
    "use strict";

    return module.exports.unparse(new Buffer(parse(v4.apply(module.exports, arguments))));
};
