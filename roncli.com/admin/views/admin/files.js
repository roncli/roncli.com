/*globals bootbox*/

var BaseView = require("./base"),
    $ = require("jquery"),
    Admin = require("../../models/admin");

// Sets up the files admin view.
module.exports = BaseView.extend({
    className: "admin_files_view",

    events: {
        "click button#upload-file": "uploadFile"
    },

    uploadFile: function() {
        "use strict";

        var uploadFile = $("button#upload-file"),
            view = this,
            app = this.app,
            data = new FormData();

        uploadFile.prop("disabled", true);

        $.each($("#add-file")[0].files, function(index, file) {
            data.append("file" + index, file);
        });

        $.ajax({
            url: "/api/-/admin/files/upload",
            type: "POST",
            data: data,
            processData: false,
            contentType: false,
            success: function() {
                bootbox.dialog({
                    title: "File Uploaded",
                    message: app.templateAdapter.getTemplate("admin/files/fileUploaded")(),
                    buttons: {ok: {label: "OK"}},
                    show: false
                }).off("shown.bs.modal").modal("show");

                uploadFile.prop("disabled", false);
            },
            error: function(xhr, error) {
                var message;
                if (error && error.body && error.body.error) {
                    message = error.body.error;
                } else {
                    message = "There was a server error uploading the file.  Please try again later.";
                }

                view.showError(message);

                uploadFile.prop("disabled", false);
            }
        });
    }
});

module.exports.id = "admin/files";
