var Model = require("rendr/shared/base/model"),
    BaseModel, fetch;

module.exports = Model.extend();

BaseModel = module.exports;

BaseModel.prototype.contentType = "application/json; charset=utf-8";

fetch = BaseModel.prototype.fetch;

BaseModel.prototype.fetch = function(){
    "use strict";

    if (!this.app && typeof window === "object" && window.App) {
        this.app = window.App;
    }
    fetch.apply(this, arguments);
};
