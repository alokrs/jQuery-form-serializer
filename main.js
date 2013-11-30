M.wrap('github/IonicaBizau/form-serializer/dev/main.js', function (require, module, exports) {
var Bind = require("github/jillix/bind");
var Events = require("github/jillix/events");

module.exports = function(config) {

    var self = this;
    Events.call(self, config);

    self.config = config;
    config.validators = config.validators || {};

    $(self.dom).on("submit", "form", function (e) {

        e.preventDefault();

        var $form = $(this);
        var serializedForm = {};

        $form.find("[data-field]").each(function () {
            var $element = $(this);
            var how = $element.attr("data-value") || "val";
            var params = $element.attr("data-params");
            var field = $element.attr("data-field");
            var value;

            if (!params) {
                value = $element[how]();
            } else {
                value = $element[how](params);
            }

            serializedForm[field] = value;
        });

        self.emit(config.eventName || "serializedForm", serializedForm);
    });

    self.fillForm = function (data) {

        self.clearErrors();

        var fillFormFilterFunction = findFunction(window, self.config.validators.fillForm);
        if (typeof fillFormFilterFunction === "function") {
            var result = filterFunction(self, data, undefined, data);
            if (result.error) {
                self.showError(result.error);
                return;
            }
        }

        config.onFill = config.onFill || {};
        config.onFill.binds = config.onFill.binds || [];

        for (var i = 0; i < config.onFill.binds.length; ++i) {
            var bindObj = config.onFill.binds[i];
            bindObj.context = self.dom;
            Bind.call(self, bindObj, data[0]);
        }
    };

    self.showError = function (err) {
        if (err) {
            var $newAlert = $("<div>");
            $newAlert.addClass("alert fade in danger alert-error alert-danger");
            $newAlert.append("<button type='button' class='close' data-dismiss='alert'>×</button>");
            $newAlert.append(err);

            $("form", self.dom).before($newAlert);
            $newAlert.fadeIn();
            $("form", self.dom).hide();
            return;
        }

        $("form", self.dom).show();
        $(".alert-error, .alert-danger", self.dom).remove();
    };

    self.clearErrors = function () {
        $("form", self.dom).show();
        $(".alert-error, .alert-danger", self.dom).remove();
    };
};

function findValue (parent, dotNot) {

    if (!dotNot) return undefined;

    var splits = dotNot.split(".");
    var value;

    for (var i = 0; i < splits.length; i++) {
        value = parent[splits[i]];
        if (value === undefined) return undefined;
        if (typeof value === "object") parent = value;
    }

    return value;
}

function findFunction (parent, dotNot) {

    var func = findValue(parent, dotNot);

    if (typeof func !== "function") {
        return undefined;
    }

    return func;
}

return module; });
