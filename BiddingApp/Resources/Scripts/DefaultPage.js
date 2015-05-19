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
            defaultPage.initializeSignalR();
        },

        initializeSignalR: function () {
            if (defaultPage.isLoggedIn()) {
                $.connection.biddingHub.client.forceLogout = function (data) {
                    $.session.clear();
                    defaultPage.validateSession();
                };
                $.connection.hub.url = "signalr";
                $.connection.hub.start().done(function () {
                    $.connection.biddingHub.server.registerClient(defaultPage.sessionGUID());
                }).fail(function (error) {
                    //console.error(error);
                });

                $.connection.hub.reconnecting(function () {
                    //console.log("reconnecting");
                });

                $.connection.hub.reconnected(function () {
                    //console.log("We have been reconnected");
                    $.connection.biddingHub.server.registerClient(defaultPage.sessionGUID());
                });

                $.connection.hub.disconnected(function () {
                    //console.log("We are disconnected!");
                    setTimeout(function () {
                        $.connection.hub.start().done(function () {
                            $.connection.biddingHub.server.registerClient(defaultPage.sessionGUID());
                        });
                    }, 5000); // Restart connection after 5 seconds.
                });
            }
        },

        sessionGUID: function () {
            return defaultPage.isLoggedIn() ? defaultPage.sessionData().GUID : null;
        },

        sessionData: function () {
            var sessionDataStr = $.session.get('SessionData');
            if (!resources.stringNullOrEmpty(sessionDataStr)) return $.parseJSON(sessionDataStr);
            else return null;
        },

        isLoggedIn: function () {
            return !resources.stringNullOrEmpty($.session.get('SessionData'));
        },

        validateSession: function () {
            if (resources.stringNullOrEmpty(defaultPage.sessionGUID())) {
                $.connection.biddingHub.server.logout();
                if (resources.stringContains(document.location.href, 'default.aspx')) defaultPage.refreshSession();
                else document.location = 'Default.aspx';
            }
        },

        refreshSession: function () {
            $('.inSession').hide();
            $('.outSession').hide();
            if (!defaultPage.isLoggedIn()) {
                $('.outSession').show();
            }
            else {
                $('.inSession').show();
                $('.userGreeting').html('Hello <i>' + defaultPage.sessionData().UserData.FirstName + '</i>');
            }
        }
    };
})();