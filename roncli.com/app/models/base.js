var Model = require("rendr/shared/base/model"),
    BaseModel, fetch, set_;

module.exports = Model.extend();

BaseModel = module.exports;

BaseModel.prototype.contentType = "application/json; charset=utf-8";

// Function hooks to fix issue with the app not being populated on the client.
if (typeof window === "object") {
    fetch = BaseModel.prototype.fetch;

    BaseModel.prototype.fetch = function() {
        "use strict";

        if (!this.app && window.App) {
            this.app = window.App;
        }
        return fetch.apply(this, arguments);
    };

    set_ = BaseModel.prototype.set;

    BaseModel.prototype.set = function() {
        "use strict";

        if (!this.app && window.App) {
            this.app = window.App;
        }
        return set_.apply(this, arguments);
    };
}
