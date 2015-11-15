/*globals bootbox*/

var BaseView = require("./base"),
    $ = require("jquery"),
    Admin = require("../../models/admin"),
    backbone = require("rendr/node_modules/backbone");

// Sets up the files admin view.
module.exports = BaseView.extend({
    className: "admin_files_view",

    events: {
        "click a.download-file": "downloadFile",
        "click button.delete-file": "deleteFile",
        "click button#upload-file": "uploadFile"
    },

    downloadFile: function(ev) {
        "use strict";

        // Open download in new window.
        window.open($(ev.target).attr("href"), "_blank");

        // Do not open download in current window!
        return false;
    },

    deleteFile: function(ev) {
        "use strict";

        var view = this,
            app = this.app,
            deleteFile = $(ev.target),
            filename = deleteFile.closest("div.file").data("filename"),
            admin = new Admin();

        bootbox.dialog({
            title: "Delete File",
            message: app.templateAdapter.getTemplate("admin/files/deleteConfirm")(),
            buttons: {
                yes: {
                    label: "Yes",
                    className: "btn-primary",
                    callback: function() {
                        deleteFile.prop("disabled", true);

                        admin.fetch({
                            url: "/admin/files/delete",
                            data: JSON.stringify({filename: filename}),
                            type: "POST",
                            contentType: "application/json",
                            dataType: "json",
                            success: function() {
                                backbone.history.loadUrl(window.location.pathname);
                            },
                            error: function(xhr, error) {
                                var message;
                                if (error && error.body && error.body.error) {
                                    message = error.body.error;
                                } else {
                                    message = "There was a server error deleting the file.  Please try again later.";
                                }

                                view.showError(message);

                                deleteFile.prop("disabled", false);
                            }
                        });
                    }
                },
                no: {label: "No"}
            },
            show: false
        }).off("shown.bs.modal").modal("show");
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
                    buttons: {ok: {
                        label: "OK",
                        callback: function() {
                            backbone.history.loadUrl(window.location.pathname);
                        }
                    }},
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
