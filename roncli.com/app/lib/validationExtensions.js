/**
 * Extend jQuery validation to include a Backbone method, which validates based on the results of a Backbone model.
 */
module.exports = function() {
    "use strict";

    if (window && window.$) {
        window.$.validator.addMethod("backbone", function(value, element, param) {
            var validator = this,
                previous, data, ModelClass, validate;

            if (validator.optional(element)) {
                return "dependency-mismatch";
            }

            previous = validator.previousValue(element);
            if (!validator.settings.messages[element.name]) {
                validator.settings.messages[element.name] = {};
            }
            previous.originalMessage = validator.settings.messages[element.name].remote;
            validator.settings.messages[element.name].remote = previous.message;

            if (previous.old !== value) {
                previous.old = value;
                validator.startRequest(element);

                data = typeof param.data === "function" ? param.data() : param.data;

                ModelClass = Object.createObject(param.model);

                validate = function() {
                    var model = new ModelClass({ validate: 1 });
                    model.fetch(_.extend(param.settings || {}, {
                        data: data,
                        type: "POST",
                        success: function() {
                            validator.settings.messages[element.name].remote = previous.originalMessage;
                            var valid = model.get("valid"),
                                submitted, errors, message;
                            if (param.inverse) {
                                valid = !valid;
                            }
                            if (valid) {
                                submitted = validator.formSubmitted;
                                validator.prepareElement(element);
                                validator.formSubmitted = submitted;
                                validator.successList.push(element);
                                validator.showErrors();
                            } else {
                                errors = {};
                                message = validator.defaultMessage(element, "backbone");
                                errors[element.name] = window.$.isFunction(message) ? message(value) : message;
                                validator.showErrors(errors);
                            }
                            previous.valid = valid;
                            validator.stopRequest(element, valid);
                        },
                        error: function() {
                            roncli.Enqueue(validate);
                        }
                    }));
                };

                validate();
                return "pending";
            }
            if (validator.pending[element.name]) {
                return "pending";
            }
            return previous.valid;
        }, "Please fix this field.");
    }
};
