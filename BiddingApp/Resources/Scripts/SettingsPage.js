/// <reference path="Resources.js" />
/// <reference path="Statics.js" />
/// <reference path="Modals.js" />

var settingsPage = (function () {
    return {
        contacts: null,

        initialize: function () {
            defaultPage.validateSession();

            $.connection.biddingHub.client.contactsUpdated = function (data) {
                data = JSON.parse(data);
                settingsPage.contacts = data.Contacts;
                settingsPage.refreshContacts();
            };

            var userData = defaultPage.getUserData();
            if (userData != null && userData.MembershipType == MEMBERSHIPTYPE_MANAGER) {
                $('#contactsTab').parent().remove();
                $('#adminTab').parent().remove();
                $('#notificationTypes').remove();
            }
            else settingsPage.refreshContacts();

            $("#tabs").tabs({
                activate: function (event, ui) {
                    if (ui.newPanel.attr('id') == 'tabs-2') { // Admin
                        settingsPage.refreshAdmin();
                    }
                    else if (ui.newPanel.attr('id') == 'tabs-3') { // Account
                        settingsPage.refreshAccount();
                    }
                }
            });
        },

        refreshContacts: function (newContacts, refreshCache) {
            var _refreshContacts = function () {
                $('.contactItem').remove();
                $('.blockedContactItem').remove();
                resources.arrayEnum(settingsPage.contacts, function (contact) {
                    if (contact.Block) {
                        var html = '<tr class="blockedContactItem">';
                        html += '<td style="width:50px;">&nbsp;</td>';
                        if (contact.MembershipTypeID == MEMBERSHIPTYPE_NOTSIGNEDUP) {
                            html += '<td>' + contact.Email + '</td>'
                        }
                        else {
                            html += '<td>' + contact.FirstName + ' ' + contact.LastName + ' (' + contact.Email + ')</td>'
                        }
                        html += '<td colspan="2"><a href="#" onclick="settingsPage.unblockContact(\'' + contact.GUID + '\');return false;">Unblock</a></td>';
                        html += '</tr>';
                        $('.blockedContactsList').append($(html));
                    }
                    else {
                        var html = '<tr class="contactItem" data-guid="' + contact.GUID + '"><td style="width:50px;">&nbsp;</td>';
                        if (contact.MembershipTypeID == MEMBERSHIPTYPE_NOTSIGNEDUP) {
                            html += '<td>' + contact.Email + '</td>'
                            html += '<td style="text-align:left;">Not a user yet</td>';
                        }
                        else if (contact.MembershipTypeID == MEMBERSHIPTYPE_BASIC) {
                            html += '<td>' + contact.FirstName + ' ' + contact.LastName + ' (' + contact.Email + ')</td>'
                            html += '<td style="text-align:left;">Not an advance user</td>';
                        }
                        else if (contact.MembershipTypeID == MEMBERSHIPTYPE_ADVANCE) {
                            html += '<td>' + contact.FirstName + ' ' + contact.LastName + ' (' + contact.Email + ')</td>'
                            html += '<td style="text-align:left;"><input style="margin-left:40px;" onclick="settingsPage.updateContact(\'' + contact.GUID + '\')" type="checkbox" ' + (contact.AllowBid ? 'checked="checked"' : '') + ' class="bidField" /><span class="bidFieldSaving" style="display:none;font-size:8pt;">(saving)</span></td>';
                        }

                        html += '<td style="text-align:center;"><a href="#" onclick="settingsPage.showDeleteContactModal(\'' + contact.GUID + '\');return false;" style="font-weight:bold;color:#ff0000;font-size:12pt;">X</a></td>';
                        html += '</tr>';
                        $('.contactsList').append($(html));
                    }
                });
            };

            if (newContacts != null) settingsPage.contacts = newContacts;
            if (settingsPage.contacts == null || refreshCache) {
                modals.toggleWaitingModal(true, 'Loading, please wait...');
                resources.ajaxPost('Receiver', 'GetData', { guid: defaultPage.sessionGUID(), contacts: true }, function (data) {
                    modals.hide();
                    if (data.Success) {
                        settingsPage.contacts = data.Contacts;
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
                settingsPage.refreshContacts(contacts);
            });
        },

        showDeleteContactModal: function (contactGUID) {
            var contact = settingsPage.getContactByGUID(contactGUID);
            modals.showDeleteContactModal(contact, function (contacts) {
                settingsPage.refreshContacts(contacts);
            });
        },

        getContactByGUID: function (contactGUID) {
            return resources.getArrayItem(settingsPage.contacts, function (contact) { return resources.stringEqual(contact.GUID, contactGUID); });
        },

        unblockContact: function (contactGUID) {
            modals.showConfirmModal('Are you sure you want to unblock this contact?', function (success) {
                if (success) {
                    modals.toggleWaitingModal(true, 'Please wait...');
                    resources.ajaxPost('Receiver', 'UnblockContact', { guid: defaultPage.sessionGUID(), contactGUID: contactGUID }, function (data) {
                        modals.hide();
                        if (data.Success) {
                            settingsPage.refreshContacts(data.Contacts);
                        }
                        else {
                            modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { modals.show('createContactModal'); });
                        }
                    });
                }
            });
        },

        updateContact: function (contactGUID) {
            var allowBid = resources.uiCheckboxSelected($('.contactItem[data-guid="' + contactGUID + '"] .bidField'));
            $('.contactItem[data-guid="' + contactGUID + '"] .bidFieldSaving').show();
            resources.ajaxPost('Receiver', 'UpdateContact', { guid: defaultPage.sessionGUID(), contactGUID: contactGUID, allowBid: allowBid }, function (data) {
                $('.contactItem[data-guid="' + contactGUID + '"] .bidFieldSaving').hide();
            });
        },

        changePassword: function () {
            modals.clearValidation('changePassword');
            if (modals.applyValidation('changePassword')) {
                var formData = resources.dataFieldsToObject($('#changePassword'));
                if (formData.password != formData.passwordconfirm) {
                    modals.showNotificationModal('Please enter matching passwords');
                    return;
                }
                else if (!resources.isValidPassword(formData.password)) {
                    modals.showNotificationModal('Password must be at least 8 characters, and contain 1 capital letter, 1 lowercase letter and 1 number');
                    return;
                }

                modals.toggleWaitingModal(true, 'Please wait...');
                resources.ajaxPost('Receiver', 'ChangePassword', { guid: defaultPage.sessionGUID(), oldPassword: formData.oldpassword, password: formData.password }, function (data) {
                    modals.hide();
                    if (data.Success) {
                        modals.showNotificationModal('Your password was successfully changed.');
                        $('#changePassword input').val('');
                    }
                    else {
                        modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { });
                    }
                });
            }
        },

        updateNotifications: function () {
            modals.toggleWaitingModal(true, 'Please wait...');
            var notificationTypes = new Array();
            if (resources.uiCheckboxSelected($('.notificationType' + NOTIFICATIONTYPE_RECEIVEOFFLINEMESSAGE))) notificationTypes.push(NOTIFICATIONTYPE_RECEIVEOFFLINEMESSAGE);
            if (resources.uiCheckboxSelected($('.notificationType' + NOTIFICATIONTYPE_NEWCONTACTSADDME))) notificationTypes.push(NOTIFICATIONTYPE_NEWCONTACTSADDME);
            if (resources.uiCheckboxSelected($('.notificationType' + NOTIFICATIONTYPE_USERFILLSORDER))) notificationTypes.push(NOTIFICATIONTYPE_USERFILLSORDER);
            if (resources.uiCheckboxSelected($('.notificationType' + NOTIFICATIONTYPE_NEWINTEREST))) notificationTypes.push(NOTIFICATIONTYPE_NEWINTEREST);
            if (resources.uiCheckboxSelected($('.notificationType' + NOTIFICATIONTYPE_REQUESTPRICE))) notificationTypes.push(NOTIFICATIONTYPE_REQUESTPRICE);
            if (resources.uiCheckboxSelected($('.notificationType' + NOTIFICATIONTYPE_LEAVEORDER))) notificationTypes.push(NOTIFICATIONTYPE_LEAVEORDER);
            resources.ajaxPost('Receiver', 'UpdateNotifications', { guid: defaultPage.sessionGUID(), notificationTypes: notificationTypes }, function (data) {
                modals.hide();
                if (data.Success) {
                    defaultPage.updateUserData(data.UserData);
                    modals.showNotificationModal('Your settings were successfully changed.');
                }
                else {
                    modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { });
                }
            });
        },

        refreshAccount: function () {
            modals.clearValidation('changePassword');
            $('#changePassword input').val('');

            var userData = defaultPage.getUserData();
            resources.uiToggleCheckbox($('.notificationType' + NOTIFICATIONTYPE_RECEIVEOFFLINEMESSAGE), resources.arrayContainsItem(userData.NotificationTypes, NOTIFICATIONTYPE_RECEIVEOFFLINEMESSAGE));
            resources.uiToggleCheckbox($('.notificationType' + NOTIFICATIONTYPE_NEWCONTACTSADDME), resources.arrayContainsItem(userData.NotificationTypes, NOTIFICATIONTYPE_NEWCONTACTSADDME));
            resources.uiToggleCheckbox($('.notificationType' + NOTIFICATIONTYPE_USERFILLSORDER), resources.arrayContainsItem(userData.NotificationTypes, NOTIFICATIONTYPE_USERFILLSORDER));
            resources.uiToggleCheckbox($('.notificationType' + NOTIFICATIONTYPE_NEWINTEREST), resources.arrayContainsItem(userData.NotificationTypes, NOTIFICATIONTYPE_NEWINTEREST));
            resources.uiToggleCheckbox($('.notificationType' + NOTIFICATIONTYPE_REQUESTPRICE), resources.arrayContainsItem(userData.NotificationTypes, NOTIFICATIONTYPE_REQUESTPRICE));
            resources.uiToggleCheckbox($('.notificationType' + NOTIFICATIONTYPE_LEAVEORDER), resources.arrayContainsItem(userData.NotificationTypes, NOTIFICATIONTYPE_LEAVEORDER));

            $('#notificationTypes .advanceOnly').hide();
            if (userData.MembershipType == MEMBERSHIPTYPE_ADVANCE) $('#notificationTypes .advanceOnly').show();
        },

        refreshAdmin: function () {
            var userData = defaultPage.sessionData().UserData;
            $('#monthlyLogs .data-deallogemails').val(userData.SendMonthlyDealLogTo);
            $('#monthlyLogs .data-chatlogemails').val(userData.SendMonthlyChatLogTo);
            settingsPage.toggleMonthlyLogStatus(!resources.stringNullOrEmpty(userData.SendMonthlyDealLogTo), !resources.stringNullOrEmpty(userData.SendMonthlyChatLogTo), true);

            $('#monthlyLogs .data-deallog').unbind('click.settings').bind('click.settings', function (e) {
                var isSelected = resources.uiCheckboxSelected($(this));
                settingsPage.toggleMonthlyLogStatus(isSelected, null);
                if (!isSelected) {
                    $('#monthlyLogs .data-deallogemails').val('');
                    resources.ajaxPost('Receiver', 'UpdateSendMonthlyLogTo', { guid: defaultPage.sessionGUID(), sendMonthlyDealLogTo: '' }, function (data) { });
                }
            });
            $('#monthlyLogs .data-chatlog').unbind('click.settings').bind('click.settings', function (e) {
                var isSelected = resources.uiCheckboxSelected($(this));
                settingsPage.toggleMonthlyLogStatus(null, isSelected);
                if (!isSelected) {
                    $('#monthlyLogs .data-chatlogemails').val('');
                    resources.ajaxPost('Receiver', 'UpdateSendMonthlyLogTo', { guid: defaultPage.sessionGUID(), sendMonthlyChatLogTo: '' }, function (data) { });
                }
            });

            settingsPage.refreshManagers();
        },

        updateMonthlyLogEmails: function (dealUpdated, chatUpdated) {
            if (dealUpdated && !$('#monthlyLogs .updateDealLogButton').hasClass('disabled2')) {
                var dealLogEmails = $('#monthlyLogs .data-deallogemails').val();
                if (resources.stringNullOrEmpty(dealLogEmails)) {
                    modals.showNotificationModal('Please enter at least one email address');
                    return;
                }

                dealLogEmails = resources.stringReplace(dealLogEmails, ';', ',');
                var dealLogEmailArr = dealLogEmails.split(',');
                var dealLogEmailArrValid = new Array();
                for (var i = 0; i < dealLogEmailArr.length; i++) {
                    var email = resources.stringTrim(dealLogEmailArr[i]);
                    if (!resources.stringNullOrEmpty(email)) {
                        if (!resources.isValidEmail(email)) {
                            modals.showNotificationModal('Please enter valid email address');
                            return;
                        }
                        dealLogEmailArrValid.push(email);
                    }
                }
                dealLogEmails = dealLogEmailArrValid.join(', ');
                $('#monthlyLogs .data-deallogemails').val(dealLogEmails);

                modals.toggleWaitingModal(true, 'Please wait...');
                resources.ajaxPost('Receiver', 'UpdateSendMonthlyLogTo', { guid: defaultPage.sessionGUID(), sendMonthlyDealLogTo: dealLogEmails }, function (data) {
                    modals.hide();
                    if (data.Success) {
                        defaultPage.updateUserData(data.UserData);
                        modals.showNotificationModal('Your settings were successfully changed.');
                    }
                    else {
                        modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX));
                    }
                });
            }

            if (chatUpdated && !$('#monthlyLogs .updateChatLogButton').hasClass('disabled2')) {
                var chatLogEmails = $('#monthlyLogs .data-chatlogemails').val();
                if (resources.stringNullOrEmpty(chatLogEmails)) {
                    modals.showNotificationModal('Please enter at least one email address');
                    return;
                }

                chatLogEmails = resources.stringReplace(chatLogEmails, ';', ',');
                var chatLogEmailArr = chatLogEmails.split(',');
                var chatLogEmailArrValid = new Array();
                for (var i = 0; i < chatLogEmailArr.length; i++) {
                    var email = resources.stringTrim(chatLogEmailArr[i]);
                    if (!resources.stringNullOrEmpty(email)) {
                        if (!resources.isValidEmail(email)) {
                            modals.showNotificationModal('Please enter valid email address');
                            return;
                        }
                        chatLogEmailArrValid.push(email);
                    }
                }
                chatLogEmails = chatLogEmailArrValid.join(', ');
                $('#monthlyLogs .data-chatlogemails').val(chatLogEmails);

                modals.toggleWaitingModal(true, 'Please wait...');
                resources.ajaxPost('Receiver', 'UpdateSendMonthlyLogTo', { guid: defaultPage.sessionGUID(), sendMonthlyChatLogTo: chatLogEmails }, function (data) {
                    modals.hide();
                    if (data.Success) {
                        defaultPage.updateUserData(data.UserData);
                        modals.showNotificationModal('Your settings were successfully changed.');
                    }
                    else {
                        modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX));
                    }
                });
            }
        },

        toggleMonthlyLogStatus: function (dealEnabled, chatEnabled, toggleCheckboxes) {
            if (dealEnabled != null) {
                resources.uiToggleEnable($('#monthlyLogs .data-deallogemails'), false);
                $('#monthlyLogs .updateDealLogButton').removeClass('btn-primary');
                $('#monthlyLogs .updateDealLogButton').addClass('disabled2');
                if (dealEnabled) {
                    resources.uiToggleEnable($('#monthlyLogs .data-deallogemails'), true);
                    $('#monthlyLogs .updateDealLogButton').addClass('btn-primary');
                    $('#monthlyLogs .updateDealLogButton').removeClass('disabled2');
                }
                if (toggleCheckboxes) resources.uiToggleCheckbox($('#monthlyLogs .data-deallog'), dealEnabled);
            }

            if (chatEnabled != null) {
                resources.uiToggleEnable($('#monthlyLogs .data-chatlogemails'), false);
                $('#monthlyLogs .updateChatLogButton').removeClass('btn-primary');
                $('#monthlyLogs .updateChatLogButton').addClass('disabled2');
                if (chatEnabled) {
                    resources.uiToggleEnable($('#monthlyLogs .data-chatlogemails'), true);
                    $('#monthlyLogs .updateChatLogButton').addClass('btn-primary');
                    $('#monthlyLogs .updateChatLogButton').removeClass('disabled2');
                }
                if (toggleCheckboxes) resources.uiToggleCheckbox($('#monthlyLogs .data-chatlog'), chatEnabled);
            }
        },

        refreshManagers: function () {
            var userData = defaultPage.getUserData();
            var html = 'Your account is currently being monitored by:';
            if (userData.Managers.length == 0) html += ' NO ONE';
            else {
                html += '<br/>';
                resources.arrayEnum(userData.Managers, function (email, i) {
                    html += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + email + ' (<a href="#" style="" onclick="settingsPage.removeManager(' + i + ');return false;">remove</a>)<br/>';
                });
            }
            $('#managers').html(html);
        },

        removeManager: function (managerID) {
            var userData = defaultPage.getUserData();
            if (managerID < userData.Managers.length) {
                modals.showConfirmModal('Are you sure you want to remove this manager?', function (success) {
                    if (success) {
                        var managerEmail = userData.Managers[managerID];
                        modals.toggleWaitingModal(true, 'Please wait...');
                        resources.ajaxPost('Receiver', 'RemoveManager', { guid: defaultPage.sessionGUID(), email: managerEmail }, function (data) {
                            modals.hide();
                            if (data.Success) {
                                defaultPage.updateUserData(data.UserData);
                                settingsPage.refreshManagers();
                            }
                            else {
                                modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { });
                            }
                        });
                    }
                });
            }
        }
    };
})();

$(document).ready(function () {
    settingsPage.initialize();
});

