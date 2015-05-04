/// <reference path="Resources.js" />
/// <reference path="Modals.js" />
/// <reference path="DefaultPage.js" />

var bidding = (function () {
    var biddingWindows = new Array();
    var chatWindows = new Array();
    var chatHistory = new Object();

    var defaultWindowSize = { width: 415, height: 422 };
    var actualWindowSize = { width: 425, height: 250 };

    return {
        contacts: null,
        userData: null,

        initialize: function () {
            defaultPage.validateSession();
            $('.menuInterests').dropit();

            $('.menuContacts').dropit({
                afterHide: function () {
                    toggleContactSearch(false);
                }
            });

            $('.contactsButton').bind('click.biddingApp', function (e) {
                toggleContactSearch(true);
                $('.menuContactsLI').removeClass('dropit-open');
                $('.menuContactsLI').addClass('dropit-open');
                $('.menuContactsDropdown').show();
                if (e.preventDefault) {
                    e.preventDefault();
                }
                return false;
            });

            $('.contactsSearchField').bind('click.biddingApp', function (e) {
                if (e.preventDefault) {
                    e.preventDefault();
                }
                return false;
            });

            bidding.refreshContacts();
            bidding.getData();

            var chatHub = $.connection.chatHub;
            $.connection.chatHub.client.chatReceived = function (data) {
                data = JSON.parse(data);
                bidding.showChatWindow_Incoming(data);
            };
            $.connection.hub.url = "signalr";
            $.connection.hub.start().done(function () {
                $.connection.chatHub.server.registerClient(defaultPage.sessionGUID());
            }).fail(function (error) {
                //console.error(error);
            });
        },

        getData: function (options) {
            if (options == null) options = { contacts: true, userData: true };
            options.guid = defaultPage.sessionGUID();
            modals.toggleWaitingModal(true, 'Loading, please wait...');
            resources.ajaxPost('Receiver', 'GetData', options, function (data) {
                modals.hide();
                if (data.Success) {
                    if (data.Contacts != null) {
                        bidding.contacts = data.Contacts;
                        bidding.refreshContacts();
                    }
                    if (data.UserData != null) {
                        bidding.userData = data.UserData;
                    }
                }
                else {
                    modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX));
                }
            });
        },

        getAvailableWindowPositions: function (windowOffset, windowType) {
            var positions = new Array();
            var windowXPadding = 5;
            var windowYPadding = 5;
            var yOffset = 40;
            if (resources.browserDetection.isIE()) {
                windowYPadding = 14;
                yOffset = 45;
            }
            else if (resources.browserDetection.isFirefox()) {
                windowYPadding = 17;
                yOffset = 44;
            }
            var maxWidth = $(window).width();
            var maxHeight = $(window).height();
            var curPos = { x: 5 + (windowOffset * 30), y: yOffset + (windowOffset * 30) };
            if (windowType == WINDOWTYPE_CHAT) {
                curPos.x += 20;
                curPos.y += 20;
            }

            while (curPos.y <= (maxHeight - actualWindowSize.height)) {
                if (curPos.x <= (maxWidth - actualWindowSize.width) && curPos.y <= (maxHeight - actualWindowSize.height)) {
                    positions.push({ x: curPos.x, y: curPos.y });
                }
                curPos.x += (actualWindowSize.width + windowXPadding);
                if (curPos.x > (maxWidth - actualWindowSize.width)) {
                    curPos.x = 5 + (windowOffset * 30);
                    if (windowType == WINDOWTYPE_CHAT) {
                        curPos.x += 20;
                    }
                    curPos.y += actualWindowSize.height + windowYPadding;
                }
            }
            return positions;
        },

        positionsWithinRange: function (pos1, pos2, padding) {

            return (Math.abs(pos1.x - pos2.x) <= padding && Math.abs(pos1.y - pos2.y) <= padding);
        },

        getNewWindowPos: function (windowCollection, windowType) {
            var pos = null;

            if (windowCollection == null) {
                if (windowType == WINDOWTYPE_CHAT) windowCollection = chatWindows;
                else windowCollection = biddingWindows;
            }

            var windowOffset = 0;
            while (windowOffset < 100) {
                var availablePositions = bidding.getAvailableWindowPositions(windowOffset, windowType);
                while (availablePositions.length > 0) {
                    var curPos = availablePositions.shift();
                    var positionConflictFound = false;
                    resources.arrayEnum(windowCollection, function (curWindow) {
                        //if (curWindow.windowType != WINDOWTYPE_DEALCONFIRM) {
                        var windowPos = curWindow.dialog.closest('.ui-dialog').offset();
                        //console.log(Math.round(windowPos.left) + ',' + Math.round(windowPos.top) + '  :  ' + curPos.x + ',' + curPos.y);
                        if (bidding.positionsWithinRange({ x: Math.round(windowPos.left), y: Math.round(windowPos.top) }, curPos, 5)) {
                            positionConflictFound = true;
                        }
                        //}
                    });

                    if (!positionConflictFound) {
                        pos = { left: curPos.x, top: curPos.y };
                        break;
                    }
                }
                if (pos != null) break;
                windowOffset++;
            }
            if (pos == null) {
                if (windowType == WINDOWTYPE_CHAT) pos = { left: 20, top: 50 };
                else pos = { left: 5, top: 40 };
            }
            return pos;
        },

        autoArrangeWindows: function () {
            bidding.autoArrangeWindowsByCollection(biddingWindows);
            bidding.autoArrangeWindowsByCollection(chatWindows);

        },

        autoArrangeWindowsByCollection: function (collection) {
            var windowCollection = new Array();
            resources.arrayEnum(collection, function (curWindow) {
                //console.log($(curWindow[0]).dialog('option', 'position'));
                var windowPos = null;
                /*if (curWindow.windowType == WINDOWTYPE_DEALCONFIRM) {
                windowPos = { my: "center", at: "center", of: window };
                }
                else {*/
                var pos = bidding.getNewWindowPos(windowCollection, curWindow.windowType);
                windowPos = { my: "left top", at: "left+" + pos.left + " top+" + pos.top, of: window };
                //}

                $(curWindow.dialog[0]).dialog('option', 'position', windowPos)
                $(curWindow.dialog[0]).dialog('moveToTop');
                windowCollection.push(curWindow);
            });
        },

        spawnWindow: function (windowType, title, windowID, data) {
            var windowPos = null;
            /*if (windowType == WINDOWTYPE_DEALCONFIRM) {
            windowPos = { my: "center", at: "center", of: window };
            }
            else {*/
            var pos = bidding.getNewWindowPos(null, windowType);
            windowPos = { my: "left top", at: "left+" + pos.left + " top+" + pos.top, of: window };
            //}

            var dialogHtml = $('.' + windowType).html();
            dialogHtml = resources.stringReplace(dialogHtml, '!MAXHEIGHT', '175px');
            var div = $(dialogHtml);
            var dia = $(div).dialog({
                position: windowPos,
                width: defaultWindowSize.width,
                height: defaultWindowSize.height,
                resizable: false,
                autoOpen: true,
                title: title,
                dialogClass: windowType,
                close: function (event, ui) {
                    resources.removeObjectInArray(bidding.getWindowCollection(windowType), event.target, function (a, b) { return a.dialog[0] == b; });
                }
            });
            //$(div).html($('.dialogBox').html());

            var windowObj = { windowType: windowType, dialog: dia, windowID: windowID, data: data };
            bidding.getWindowCollection(windowType).push(windowObj);
            return windowObj;
        },

        getWindowCollection: function (windowType) {
            if (windowType == WINDOWTYPE_CHAT) return chatWindows;
            else return biddingWindows;
        },

        getWindowByTypeAndID: function (windowType, windowID) {
            return resources.getArrayItem(bidding.getWindowCollection(windowType), function (w) { return w.windowType == windowType && resources.stringEqual(w.windowID, windowID); });
        },

        deleteInterest: function () {
            modals.showConfirmModal('Confirm delete interest to BUY Product3?', function (success) {
            }, 'Delete', 'Cancel');
        },

        refreshContacts: function (newContacts, refreshCache) {
            var _refreshContacts = function () {
                var htmlArray = new Array();
                resources.arrayEnum(bidding.contacts, function (contact) {
                    if (!contact.Block && contact.MembershipTypeID != MEMBERSHIPTYPE_NOTSIGNEDUP) {
                        var html = '<li><div onclick="bidding.showChatWindow_Outgoing(\'' + contact.GUID + '\')" style="background-color:white; cursor:pointer; white-space:nowrap;"><table width="100%"><tr><td>' + contact.FirstName + ' ' + contact.LastName + '</td><td align="right"><img src="Resources/Images/green_light_16.png" /></td></tr></table></div></li>';
                        htmlArray.push(html);
                    }
                });
                $('.menuContacts .menuContactsDropdown').html(htmlArray.join(''));
            };

            if (newContacts != null) bidding.contacts = newContacts;
            if (bidding.contacts == null || refreshCache) {
                modals.toggleWaitingModal(true, 'Loading, please wait...');
                resources.ajaxPost('Receiver', 'GetContacts', { guid: defaultPage.sessionGUID() }, function (data) {
                    modals.hide();
                    if (data.Success) {
                        bidding.contacts = data.Contacts;
                        _refreshContacts();
                    }
                    else {
                        modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX));
                    }
                });
            }
            else _refreshContacts();
        },

        showNewContactModal: function () {
            modals.showNewContactModal(function (contacts) {
                bidding.refreshContacts(contacts);
            });
        },

        getContactByGUID: function (contactGUID) {
            return resources.getArrayItem(bidding.contacts, function (contact) { return resources.stringEqual(contact.GUID, contactGUID); });
        },

        getContactByEmail: function (email) {
            return resources.getArrayItem(bidding.contacts, function (contact) { return resources.stringEqual(contact.Email, email); });
        },

        logChat: function (data) {
            var chatHistoryKey = data.Email.toLowerCase();
            if (chatHistory[chatHistoryKey] == null) chatHistory[chatHistoryKey] = new Array();
            chatHistory[chatHistoryKey].push(data);
        },

        showChatWindow: function (firstName, lastName, email) {
            var chatWindow = bidding.spawnWindow(WINDOWTYPE_CHAT, firstName + ' ' + lastName, email, null);
            $('.loadEarlierMessages', chatWindow.dialog).bind('click', function (e) {
                $(this).hide();
            });
            //$('.loadEarlierMessages', chatWindow.dialog).hide();

            var chatHistoryItems = chatHistory[email.toLowerCase()];
            if (chatHistoryItems != null) {
                var chatContent = $('.chatContent', chatWindow.dialog);
                resources.arrayEnum(chatHistoryItems, function (data) {
                    var html = '<div class="chatMessage"><b style="color:#' + (data.Outgoing ? 'ff0000' : '0000ff') + ';">' + data.FirstName + ':</b> ' + resources.stringReplace(data.Message, '\n', '</br>') + '</div>';
                    chatContent.append($(html));
                });
                chatContent.scrollTop(chatContent.prop("scrollHeight"));
            }

            $('.chatField', chatWindow.dialog).attr('data-id', email).bind('keydown', function (e) {
                var keycode = (e.keyCode ? e.keyCode : e.which);
                if (keycode == '13') {
                    if (!defaultPage.shiftPressed) {
                        var emailTo = $(this).attr('data-id');
                        var message = resources.htmlEncode(resources.stringTrim($(this).val()));
                        if (!resources.stringNullOrEmpty(message)) {
                            bidding.logChat({ Email: emailTo, FirstName: bidding.userData.FirstName, LastName: bidding.userData.LastName, Message: message, Outgoing: true });
                            var html = '<div class="chatMessage"><b style="color:#ff0000;">' + bidding.userData.FirstName + ':</b> ' + resources.stringReplace(message, '\n', '</br>') + '</div>';
                            var _chatWindow = bidding.getWindowByTypeAndID(WINDOWTYPE_CHAT, emailTo);

                            var chatContent = $('.chatContent', _chatWindow.dialog);
                            chatContent.append($(html));
                            chatContent.scrollTop(chatContent.prop("scrollHeight"));

                            $.connection.chatHub.server.postChat(JSON.stringify({ emailTo: emailTo, message: message }));
                            /*
                            resources.ajaxPost('Receiver', 'Chat', { guid: defaultPage.sessionGUID(), emailTo: emailTo, message: message }, function (data) {
                            if (data.Success) {
                            }
                            else {
                            }
                            });
                            */
                        }
                        $(this).val('');
                        e.preventDefault();
                        return false;
                    }
                }
            });
            return chatWindow;
        },

        showChatWindow_Incoming: function (data) {
            var chatWindow = bidding.getWindowByTypeAndID(WINDOWTYPE_CHAT, data.Email);
            if (chatWindow == null) {
                chatWindow = bidding.showChatWindow(data.FirstName, data.LastName, data.Email); // bidding.spawnWindow(WINDOWTYPE_CHAT, data.FirstName + ' ' + data.LastName, data.Email, null);
            }
            else {

                $(chatWindow.dialog[0]).dialog('moveToTop');
            }

            bidding.logChat({ Email: data.Email, FirstName: data.FirstName, LastName: data.LastName, Message: data.Message });
            var html = '<div class="chatMessage"><b style="color:#0000ff;">' + data.FirstName + ':</b> ' + resources.stringReplace(data.Message, '\n', '</br>') + '</div>';
            var chatContent = $('.chatContent', chatWindow.dialog);
            chatContent.append($(html));
            chatContent.scrollTop(chatContent.prop("scrollHeight"));
        },

        showChatWindow_Outgoing: function (contactGUID) {
            var contact = bidding.getContactByGUID(contactGUID);
            if (contact != null) {
                var chatWindow = bidding.getWindowByTypeAndID(WINDOWTYPE_CHAT, contact.Email);
                if (chatWindow == null) {
                    chatWindow = bidding.showChatWindow(contact.FirstName, contact.LastName, contact.Email);
                }
                else $(chatWindow.dialog[0]).dialog('moveToTop');
            }
        }
    };
})();