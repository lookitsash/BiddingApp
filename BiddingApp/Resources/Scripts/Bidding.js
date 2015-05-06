﻿/// <reference path="Resources.js" />
/// <reference path="Modals.js" />
/// <reference path="DefaultPage.js" />
/// <reference path="Windows.js" />

var bidding = (function () {
    var chatHistory = new Object();
    var chatHistoryMinChatIDLookup = new Object();

    return {
        contacts: null,
        userData: null,
        interests: null,
        serverTimeOffsetMS: 0,

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

            setTimeout(bidding.onTick, 1000);
        },

        onTick: function () {
            var openWindows = windows.getOpenWindows();
            resources.arrayEnum(openWindows, function (windowObj) {
                if (windowObj.windowType == WINDOWTYPE_VIEWINTEREST || windowObj.windowType == WINDOWTYPE_BIDDING) {
                    var interestGUID = windowObj.windowID;
                    var interest = bidding.getInterest(interestGUID);
                    if (interest != null) {
                        $('.interestExpiration', windowObj.dialog).html(bidding.getInterestExpirationDesc(interest));
                    }
                }
            });
            setTimeout(bidding.onTick, 1000);
        },

        getData: function (options, callback) {
            if (options == null) options = { contacts: true, userData: true, interests: true };
            options.guid = defaultPage.sessionGUID();
            modals.toggleWaitingModal(true, 'Loading, please wait...');
            resources.ajaxPost('Receiver', 'GetData', options, function (data) {
                modals.hide();
                if (data.Success) {
                    var serverDate = resources.dateConvert(data.ServerDate);
                    bidding.serverTimeOffsetMS = resources.dateDiffMS(serverDate, new Date());

                    if (data.Contacts != null) {
                        bidding.contacts = data.Contacts;
                        bidding.refreshContacts();
                    }
                    if (data.UserData != null) {
                        bidding.userData = data.UserData;
                    }
                    if (data.Interests != null) {
                        bidding.interests = data.Interests;
                        bidding.refreshInterests();
                    }
                    if (callback != null) callback(true);
                }
                else {
                    modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { if (callback != null) callback(true); });
                }
            });
        },

        deleteInterest: function () {
            modals.showConfirmModal('Confirm delete interest to BUY Product3?', function (success) {
            }, 'Delete', 'Cancel');
        },

        showNewInterestModal: function () {
            modals.showNewInterestModal(function (interests) {
                bidding.refreshInterests(interests);
            });
        },

        showInterestWindow: function (interestGUID) {
            var interest = bidding.getInterest(interestGUID);
            if (interest == null) return;

            var interestWindowType = bidding.getInterestWindowType(interest);
            var windowPos = null;
            var windowObj = windows.getWindowByID(interestGUID);
            if (windowObj != null) {
                windowPos = $(windowObj.dialog[0]).dialog('option', 'position');
                $(windowObj.dialog[0]).dialog('close');
            }

            var interestTypeDesc = (interest.InterestType == INTERESTTYPE_BUY) ? "BUY" : "SELL";
            var windowTitle = interestTypeDesc + ' ' + interest.Product;
            windowObj = windows.spawnWindow(interestWindowType, windowTitle, interestGUID);
            if (windowPos != null) $(windowObj.dialog[0]).dialog('option', 'position', windowPos)

            if (interestWindowType == WINDOWTYPE_BIDDINGNOORDER) {
                $('.leaveOrderButton', windowObj.dialog).bind('click.bidding', function (e) {
                    modals.showLeaveOrderModal(interestGUID);
                    return false;
                });
            }
            else if (interestWindowType == WINDOWTYPE_BIDDING) {
                $('.closeWindowButton', windowObj.dialog).bind('click.bidding', function (e) {
                    modals.showConfirmModal('You are still working an order.<br/>Confirm close window?<br/><br/><b>Order is still LIVE until you click "Cancel Order"</b>', function (success) {
                        if (success) {
                            $(windowObj.dialog[0]).dialog('close');
                        }
                    }, 'Close', 'Leave Open');
                });

                $('.interestDetails', windowObj.dialog).html('Condition: ' + interest.Condition + '<br/>Qty: ' + interest.Quantity + '<br/>' + interest.Remarks);
                $('.interestPrice', windowObj.dialog).html('Order @ ' + interest.Price);
                $('.interestExpiration', windowObj.dialog).html(bidding.getInterestExpirationDesc(interest));

                $('.cancelOrderButton', windowObj.dialog).bind('click.bidding', function (e) {
                    bidding.cancelOrder(interestGUID);
                });
            }
            else if (interestWindowType == WINDOWTYPE_VIEWINTEREST) {
                $('.closeWindowButton', windowObj.dialog).bind('click.bidding', function (e) {
                    $(windowObj.dialog[0]).dialog('close');
                });

                $('.interestDetails', windowObj.dialog).html('Condition: ' + interest.Condition + '<br/>Qty: ' + interest.Quantity + '<br/>' + interest.Remarks);
                $('.interestPrice', windowObj.dialog).html('Order @ ' + interest.Price);
                $('.interestExpiration', windowObj.dialog).html(bidding.getInterestExpirationDesc(interest));
            }
        },

        getInterestExpirationDesc: function (interest) {
            var expirationDate = 'Good until Cancelled';
            if (!resources.stringNullOrEmpty(interest.ExpirationDate)) {
                var expDate = resources.dateAddMs(resources.dateConvert(interest.ExpirationDate), bidding.serverTimeOffsetMS);
                var diffMS = expDate.getTime() - (new Date()).getTime();
                var remainingTimeSec = Math.ceil(resources.dateDiffMS(new Date(), expDate) / 1000);
                expirationDate = 'Good for another ' + bidding.formatSeconds(remainingTimeSec);
            }
            return expirationDate;
        },

        formatSeconds: function (secs) {
            var hr = Math.floor(secs / 3600);
            var min = Math.floor((secs - (hr * 3600)) / 60);
            var sec = secs - (hr * 3600) - (min * 60);

            var strFormat = '';
            if (hr > 0 & min > 0 & sec > 0) strFormat = '@HRhr, @MINmin, @SECsec';
            else if (hr > 0 & min > 0 & sec == 0) strFormat = '@HRhr, @MINmin';
            else if (hr > 0 & min == 0 & sec == 0) strFormat = '@HRhr';
            else if (hr == 0 & min > 0 & sec == 0) strFormat = '@MINmin';
            else if (hr == 0 & min == 0 & sec > 0) strFormat = '@SECsec';
            else if (hr == 0 & min > 0 & sec > 0) strFormat = '@MINmin, @SECsec';
            else if (hr > 0 & min == 0 & sec > 0) strFormat = '@HRhr, @SECsec';
            else strFormat = secs + 'sec';
            var time = resources.stringReplace(strFormat, '@HR', hr);
            time = resources.stringReplace(time, '@MIN', min);
            time = resources.stringReplace(time, '@SEC', sec);
            return time;
        },

        cancelOrder: function (interestGUID) {
            modals.showConfirmModal('Are you sure you want to cancel this order?', function (success) {
                if (success) {
                    modals.toggleWaitingModal(true, 'Please wait...');
                    resources.ajaxPost('Receiver', 'CancelOrder', { guid: defaultPage.sessionGUID(), interestGUID: interestGUID }, function (data) {
                        modals.hide();
                        if (data.Success) {
                            bidding.interests = data.Interests;
                            bidding.refreshInterests();
                            bidding.showInterestWindow(interestGUID);
                        }
                        else {
                            modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { });
                        }
                    });
                }
            });
        },

        getInterest: function (interestGUID) {
            return resources.getArrayItem(bidding.interests, function (a) { return resources.stringEqual(a.InterestGUID, interestGUID); });
        },

        getInterestWindowType: function (interest) {
            if (resources.stringNullOrEmpty(interest.ContactGUID)) {
                if (interest.Price > 0) return WINDOWTYPE_BIDDING;
                else return WINDOWTYPE_BIDDINGNOORDER;
            }
            else {
                if (interest.Price > 0) return WINDOWTYPE_VIEWINTEREST;
                else return WINDOWTYPE_VIEWINTERESTNOORDER;
            }
        },

        refreshInterests: function (newInterests, refreshCache) {
            var _refreshInterests = function () {
                var htmlArray = new Array();
                if (bidding.interests.length > 0) htmlArray.push('<li style="white-space:nowrap; text-align:center;"><a href="#" onclick="windows.autoArrangeWindows();return false;">Arrange Windows</a></li>');
                resources.arrayEnum(bidding.interests, function (interest) {
                    var interestTypeDesc = (interest.InterestType == INTERESTTYPE_BUY) ? "BUY" : "SELL";
                    var interestWindowType = bidding.getInterestWindowType(interest);
                    if (interestWindowType == WINDOWTYPE_BIDDING) {
                        var html = '<li><div style="background-color:#b9cde5; cursor:pointer; border: 1px solid #000000;"><table width="100%"><tr><td onclick="bidding.showInterestWindow(\'@INTERESTGUID\')">@LINE1<br />@LINE2</td><td style="color:Red; text-align:right; font-weight:bolder;" onclick="bidding.deleteInterest()">X&nbsp;</td></tr></table></div></li>';
                        html = resources.stringReplace(html, '@LINE1', '<b>' + interestTypeDesc + '</b> ' + interest.Product);
                        html = resources.stringReplace(html, '@LINE2', 'Order @ ' + interest.Price);
                        html = resources.stringReplace(html, '@INTERESTGUID', interest.InterestGUID);
                        htmlArray.push(html);
                    }
                    else if (interestWindowType == WINDOWTYPE_BIDDINGNOORDER) {
                        var html = '<li><div style="background-color:#d99694; cursor:pointer; border: 1px solid #000000;"><table class="hoverSimple" width="100%"><tr><td onclick="bidding.showInterestWindow(\'@INTERESTGUID\')">@LINE1<br />@LINE2</td><td style="color:Red; text-align:right; font-weight:bolder;" onclick="bidding.deleteInterest()">X&nbsp;</td></tr></table></div></li>';
                        html = resources.stringReplace(html, '@LINE1', '<b>' + interestTypeDesc + '</b> ' + interest.Product);
                        html = resources.stringReplace(html, '@LINE2', interest.Condition);
                        html = resources.stringReplace(html, '@INTERESTGUID', interest.InterestGUID);
                        htmlArray.push(html);
                    }
                    else if (interestWindowType == WINDOWTYPE_VIEWINTEREST) {
                        var contact = bidding.getContactByGUID(interest.ContactGUID);
                        if (contact != null) {
                            var html = '<li><div style="background-color:#92d050; cursor:pointer; border: 1px solid #000000;"><table width="100%"><tr><td onclick="bidding.showInterestWindow(\'@INTERESTGUID\')">@LINE1<br />@LINE2</td><td>&nbsp;</td></tr></table></div></li>';
                            html = resources.stringReplace(html, '@LINE1', '<b>' + interestTypeDesc + '</b> ' + interest.Product);
                            html = resources.stringReplace(html, '@LINE2', 'Order @ ' + interest.Price + ' - ' + contact.FirstName + ' ' + contact.LastName);
                            html = resources.stringReplace(html, '@INTERESTGUID', interest.InterestGUID);
                            htmlArray.push(html);
                        }
                    }
                    else if (interestWindowType == WINDOWTYPE_VIEWINTERESTNOORDER) {
                        var contact = bidding.getContactByGUID(interest.ContactGUID);
                        if (contact != null) {
                            var html = '<li><div style="background-color:#fac090; cursor:pointer; border: 1px solid #000000;"><table width="100%"><tr><td onclick="bidding.showInterestWindow(\'@INTERESTGUID\')">@LINE1<br />@LINE2</td><td>&nbsp;</td></tr></table></div></li>';
                            html = resources.stringReplace(html, '@LINE1', '<b>' + interestTypeDesc + '</b> ' + interest.Product);
                            html = resources.stringReplace(html, '@LINE2', interest.Condition + ' - ' + contact.FirstName + ' ' + contact.LastName);
                            html = resources.stringReplace(html, '@INTERESTGUID', interest.InterestGUID);
                            htmlArray.push(html);
                        }
                    }
                });
                $('.menuInterests .menuInterestsDropdown').html(htmlArray.join(''));
            };

            if (newInterests != null) bidding.interests = newInterests;
            if (bidding.interests == null || refreshCache) {
                bidding.getData({ interests: true }, function (success) {
                    if (success) _refreshInterests();
                });
            }
            else _refreshInterests();
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
                bidding.getData({ contacts: true }, function (success) {
                    if (success) _refreshContacts();
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

        logChat: function (data, prepend) {
            var chatHistoryKey = data.Email.toLowerCase();
            if (chatHistory[chatHistoryKey] == null) chatHistory[chatHistoryKey] = new Array();

            if (prepend) chatHistory[chatHistoryKey].splice(0, 0, data);
            else chatHistory[chatHistoryKey].push(data);
        },

        showChatWindow: function (firstName, lastName, email) {
            var chatWindow = windows.spawnWindow(WINDOWTYPE_CHAT, firstName + ' ' + lastName, email, null);
            $('.loadEarlierMessages', chatWindow.dialog).bind('click', function (e) {
                var loadEarlierMessages = $(this);
                var loadingMessages = $('.loadingMessages', loadEarlierMessages.parent());
                loadEarlierMessages.hide();
                loadingMessages.show();
                var emailTo = loadEarlierMessages.attr('data-id');
                var lastChatID = loadEarlierMessages.attr('data-lastchatid');
                resources.ajaxPost('Receiver', 'GetChatHistory', { guid: defaultPage.sessionGUID(), emailTo: emailTo, lastChatID: lastChatID }, function (data) {
                    loadEarlierMessages.show();
                    loadingMessages.hide();
                    if (data.Success) {
                        var minChatID = 0;
                        var chatHistory = data.ChatHistory.sort(function (a, b) { return b.ID - a.ID; });
                        resources.arrayEnum(chatHistory, function (chatItem) {
                            if (minChatID == 0 || chatItem.ID < minChatID) minChatID = chatItem.ID;

                            chatItem.Email = emailTo;
                            bidding.logChat(chatItem, true);
                            var html = '<div class="chatMessage"><b style="color:#' + (chatItem.Outgoing ? 'ff0000' : '0000ff') + ';">' + chatItem.FirstName + ':</b> ' + resources.stringReplace(chatItem.Message, '\n', '</br>') + '</div>';
                            loadingMessages.after($(html));
                        });
                        lastChatID = minChatID;
                        if (minChatID == 0) loadEarlierMessages.hide();
                        else {
                            lastChatID = Math.max(lastChatID - 1, 0);
                            loadEarlierMessages.attr('data-lastchatid', lastChatID);

                            if (chatHistoryMinChatIDLookup[emailTo.toLowerCase()] != null) {
                                chatHistoryMinChatIDLookup[emailTo.toLowerCase()] = Math.min(chatHistoryMinChatIDLookup[emailTo.toLowerCase()], lastChatID);
                            }
                            else chatHistoryMinChatIDLookup[emailTo.toLowerCase()] = lastChatID;
                        }
                    }
                    else {
                    }
                });
            });

            var lastChatID = 0;
            var existingContact = bidding.getContactByEmail(email);
            if (existingContact != null) {
                lastChatID = existingContact.RecentChatID;
                if (chatHistoryMinChatIDLookup[email.toLowerCase()] != null) {
                    lastChatID = Math.min(chatHistoryMinChatIDLookup[email.toLowerCase()], lastChatID);
                    chatHistoryMinChatIDLookup[email.toLowerCase()] = lastChatID;
                }
                else chatHistoryMinChatIDLookup[email.toLowerCase()] = lastChatID;
            }

            $('.loadEarlierMessages', chatWindow.dialog).attr('data-id', email);
            $('.loadEarlierMessages', chatWindow.dialog).attr('data-lastchatid', lastChatID);
            $('.loadingMessages', chatWindow.dialog).hide();
            if (lastChatID == 0) $('.loadEarlierMessages', chatWindow.dialog).hide();

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
                            var _chatWindow = windows.getWindowByTypeAndID(WINDOWTYPE_CHAT, emailTo);

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
            var chatWindow = windows.getWindowByTypeAndID(WINDOWTYPE_CHAT, data.Email);
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
                var chatWindow = windows.getWindowByTypeAndID(WINDOWTYPE_CHAT, contact.Email);
                if (chatWindow == null) {
                    chatWindow = bidding.showChatWindow(contact.FirstName, contact.LastName, contact.Email);
                }
                else $(chatWindow.dialog[0]).dialog('moveToTop');
            }
        }
    };
})();