/// <reference path="Resources.js" />
/// <reference path="Statics.js" />

var defaultPage = (function () {
    return {
        ctrlPressed: false,
        shiftPressed: false,
        isOnline: false,

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
                    $.connection.biddingHub.server.registerClient(defaultPage.sessionGUID(), defaultPage.isOnline);
                }).fail(function (error) {
                    //console.error(error);
                });

                $.connection.hub.reconnecting(function () {
                    //console.log("reconnecting");
                });

                $.connection.hub.reconnected(function () {
                    //console.log("We have been reconnected");
                    $.connection.biddingHub.server.registerClient(defaultPage.sessionGUID(), defaultPage.isOnline);
                });

                $.connection.hub.disconnected(function () {
                    //console.log("We are disconnected!");
                    setTimeout(function () {
                        $.connection.hub.start().done(function () {
                            $.connection.biddingHub.server.registerClient(defaultPage.sessionGUID(), defaultPage.isOnline);
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
                if (resources.stringContains(document.location.href, 'default.aspx')) defaultPage.refreshSession();
                else document.location = 'Default.aspx';
            }
        },

        refreshSession: function () {
            $('.managerAccountMenu').hide();
            $('.subscriptionAccountMenu').show();
            $('.inSession').hide();
            $('.outSession').hide();
            if (!defaultPage.isLoggedIn()) {
                $('.outSession').show();
            }
            else {
                $('.inSession').show();
                $('.userGreeting').html('Hello <i>' + defaultPage.sessionData().UserData.FirstName + '</i>');
                $('.userEmail').html('<i>' + defaultPage.sessionData().UserData.Email + '</i>');
                if (defaultPage.sessionData().UserData.MembershipType == MEMBERSHIPTYPE_MANAGER) {
                    $('.managerAccountMenu').show();
                    $('.subscriptionAccountMenu').hide();
                }
            }
        }
    };
})();

$(document).ready(function () {
    var pageAction = resources.getQuerystringParam('Action');
    if (pageAction != null) {
        if (resources.stringEqual(pageAction, 'Login')) modals.showLoginModal();
        else if (resources.stringEqual(pageAction, 'Signup')) modals.showSignupModal();
    }
});