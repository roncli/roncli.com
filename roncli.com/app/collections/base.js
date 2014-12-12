var Collection = require("rendr/shared/base/collection"),
    BaseCollection, fetch;

module.exports = Collection.extend();

BaseCollection = module.exports;

BaseCollection.prototype.contentType = "application/json; charset=utf-8";

// Function hooks to fix issue with the app not being populated on the client.
if (typeof window === "object") {
    fetch = BaseCollection.prototype.fetch;

    BaseCollection.prototype.fetch = function() {
        "use strict";

        if (!this.app && window.App) {
            this.app = window.App;
        }
        return fetch.apply(this, arguments);
    };
}
