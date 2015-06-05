/// <reference path="Resources.js" />
/// <reference path="Statics.js" />

var chatLog = (function () {
    return {
        managerAccounts: null,

        serverTimeOffsetMS: 0,

        convertDateToLocal: function (date) {
            return resources.dateAddMs(resources.dateConvert(date), chatLog.serverTimeOffsetMS);
        },

        getData: function (options, callback) {
            if (options == null) options = { managerAccounts: true };
            options.guid = defaultPage.sessionGUID();
            modals.toggleWaitingModal(true, 'Loading, please wait...');
            resources.ajaxPost('Receiver', 'GetData', options, function (data) {
                modals.hide();
                if (data.Success) {
                    var serverDate = resources.dateConvert(data.ServerDate);
                    chatLog.serverTimeOffsetMS = resources.dateDiffMS(serverDate, new Date());

                    chatLog.managerAccounts = data.ManagerAccounts;
                    chatLog.refreshManagerAccounts();
                }
                else {
                    modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { if (callback != null) callback(true); });
                }
            });
        },

        refreshManagerAccounts: function () {
            $('.managerAccounts').find('option').remove();
            $('.managerAccountContacts').find('option').remove();

            $('.managerAccounts').append('<option value="-1">-- Select User --</option>');
            $('.managerAccountContacts').append('<option value="-1">-- Select User\'s Contact --</option>');
            resources.uiToggleEnable($('.managerAccountContacts'), false);

            $('.managerAccounts').unbind('change.chatLog').bind('change.chatLog', function () {
                var accountID = parseInt($(this).val());
                $('.managerAccountContacts').find('option').remove();
                $('.managerAccountContacts').append('<option value="-1">-- Select User\'s Contact --</option>');
                if (accountID >= 0 && accountID < chatLog.managerAccounts.length) {
                    var account = chatLog.managerAccounts[accountID];
                    if (account.Contacts.length > 0) {
                        resources.arrayEnum(account.Contacts, function (contact, i) {
                            $('.managerAccountContacts').append('<option value="' + i + '">' + contact.FirstName + ' ' + contact.LastName + ' - ' + contact.Company + '</option>');
                        });
                        resources.uiToggleEnable($('.managerAccountContacts'), true);
                    }
                }
                else resources.uiToggleEnable($('.managerAccountContacts'), false);
            });

            if (chatLog.managerAccounts != null) {
                resources.arrayEnum(chatLog.managerAccounts, function (account, i) {
                    $('.managerAccounts').append('<option value="' + i + '">' + account.FirstName + ' ' + account.LastName + ' - ' + account.Company + '</option>');
                });
            }
        },

        loadChatLogs: function () {
            var accountID = parseInt($('.managerAccounts').val());
            var contactAccountID = parseInt($('.managerAccountContacts').val());
            if (accountID >= 0 && contactAccountID >= 0) {
                if (accountID < chatLog.managerAccounts.length) {
                    var account = chatLog.managerAccounts[accountID];
                    if (contactAccountID < account.Contacts.length) {
                        var contactAccount = account.Contacts[contactAccountID];
                        modals.toggleWaitingModal(true, 'Loading, please wait...');
                        resources.ajaxPost('Receiver', 'GetData', { guid: defaultPage.sessionGUID(), logChat: true, email1: account.Email, email2: contactAccount.Email }, function (data) {
                            modals.hide();
                            if (data.Success) {
                                var chatHtmlArr = new Array();
                                resources.arrayEnum(data.LogChat, function (logChat) {
                                    var localDate = chatLog.convertDateToLocal(logChat.Date);
                                    var dateStr = resources.getCalendarDate(null, localDate) + ' ' + resources.getClockTime(localDate, true);
                                    var html = '<div class="chatMessage">' + dateStr + ' - <b style="color:#' + (!resources.stringEqual(logChat.EmailFrom, account.Email) ? 'ff0000' : '0000ff') + ';">' + logChat.FirstNameFrom + ':</b> ' + resources.stringReplace(logChat.Message, '\n', '</br>') + '</div>';
                                    chatHtmlArr.push(html);
                                });
                                $('.chatLog').html(chatHtmlArr.join(''));
                            }
                            else {
                                modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { });
                            }
                        });
                    }
                }
            }
        }
    };
})();

$(document).ready(function () {
    chatLog.getData();
});