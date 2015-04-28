/// <reference path="Resources.js" />

var defaultPage = (function () {
    return {
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