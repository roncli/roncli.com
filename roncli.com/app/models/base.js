var Model = require("rendr/shared/base/model"),
    fetch;

module.exports = Model.extend();

fetch = module.exports.prototype.fetch;

module.exports.prototype.fetch = function(){
    "use strict";

    if (!this.app && typeof window === "object" && window.App) {
        this.app = window.App;
    }
    fetch.apply(this, arguments);
};
