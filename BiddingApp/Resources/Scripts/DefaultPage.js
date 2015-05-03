/// <reference path="Resources.js" />

var defaultPage = (function () {
    return {
        ctrlPressed: false,
        shiftPressed: false,

        initialize: function () {
            // Monitor special key press combinations
            $(window).keydown(function (evt) {
                if (evt.which == 17) defaultPage.ctrlPressed = true;
                else if (evt.which == 16) defaultPage.shiftPressed = true;
            }).keyup(function (evt) {
                if (evt.which == 17) defaultPage.ctrlPressed = false;
                else if (evt.which == 16) defaultPage.shiftPressed = false;
            });
        },

        sessionGUID: function () {
            return $.session.get('SessionGUID');
        },

        validateSession: function () {
            if (resources.stringNullOrEmpty(defaultPage.sessionGUID())) {
                if (resources.stringContains(document.location.href, 'default.aspx')) defaultPage.refreshSession();
                else document.location = 'Default.aspx';
            }
        },

        refreshSession: function () {
            $('.inSession').hide();
            $('.outSession').hide();
            if (resources.stringNullOrEmpty(defaultPage.sessionGUID())) {
                $('.outSession').show();
            }
            else {
                $('.inSession').show();
            }
        }
    };
})();