/*global bootbox*/
var BaseView = require("rendr/shared/base/view");

// Sets up the 404 view.
module.exports = BaseView.extend({
    className: "error_404_view"
});

module.exports.id = "error/404";
