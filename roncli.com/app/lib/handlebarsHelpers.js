module.exports = function(Handlebars) {
    return {
        copyright: function() {
            var year = new Date();
            return new Handlebars.SafeString(year.getFullYear());
        }
    };
};
