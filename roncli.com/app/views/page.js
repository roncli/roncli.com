var BaseView = require("rendr/shared/base/view");

// Sets up the home view.
module.exports = BaseView.extend({
    className: "page",

    getTemplateData: function() {
        "use strict";

        var data = BaseView.prototype.getTemplateData.call(this);
        data.second = "OH HI!";
        return data;
    }
});

module.exports.id = "page";
