/// <reference path="Resources.js" />
/// <reference path="Statics.js" />
/// <reference path="Modals.js" />

var settingsPage = (function () {
    return {
        contacts: null,

        initialize: function () {
            $.connection.biddingHub.client.contactsUpdated = function (data) {
                data = JSON.parse(data);
                settingsPage.contacts = data.Contacts;
                settingsPage.refreshContacts();
            };
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
            modals.showDeleteContactModal(contactGUID, function (contacts) {
                settingsPage.refreshContacts(contacts);
            });
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
                    var sessionData = defaultPage.sessionData();
                    sessionData.UserData = data.UserData;
                    $.session.set('SessionData', JSON.stringify(sessionData));

                    modals.showNotificationModal('Your settings were successfully changed.');
                }
                else {
                    modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { });
                }
            });
        }
    };
})();

$(document).ready(function () {
    defaultPage.validateSession();
    $("#tabs").tabs({
        activate: function (event, ui) {
            if (ui.newPanel.attr('id') == 'tabs-3') {
                modals.clearValidation('changePassword');
                $('#changePassword input').val('');

                var userData = defaultPage.sessionData().UserData;
                resources.uiToggleCheckbox($('.notificationType' + NOTIFICATIONTYPE_RECEIVEOFFLINEMESSAGE), resources.arrayContainsItem(userData.NotificationTypes, NOTIFICATIONTYPE_RECEIVEOFFLINEMESSAGE));
                resources.uiToggleCheckbox($('.notificationType' + NOTIFICATIONTYPE_NEWCONTACTSADDME), resources.arrayContainsItem(userData.NotificationTypes, NOTIFICATIONTYPE_NEWCONTACTSADDME));
                resources.uiToggleCheckbox($('.notificationType' + NOTIFICATIONTYPE_USERFILLSORDER), resources.arrayContainsItem(userData.NotificationTypes, NOTIFICATIONTYPE_USERFILLSORDER));
                resources.uiToggleCheckbox($('.notificationType' + NOTIFICATIONTYPE_NEWINTEREST), resources.arrayContainsItem(userData.NotificationTypes, NOTIFICATIONTYPE_NEWINTEREST));
                resources.uiToggleCheckbox($('.notificationType' + NOTIFICATIONTYPE_REQUESTPRICE), resources.arrayContainsItem(userData.NotificationTypes, NOTIFICATIONTYPE_REQUESTPRICE));
                resources.uiToggleCheckbox($('.notificationType' + NOTIFICATIONTYPE_LEAVEORDER), resources.arrayContainsItem(userData.NotificationTypes, NOTIFICATIONTYPE_LEAVEORDER));

                $('#notificationTypes .advanceOnly').hide();
                if (userData.MembershipType == MEMBERSHIPTYPE_ADVANCE) $('#notificationTypes .advanceOnly').show();
            }
        }
    });
    settingsPage.refreshContacts();
    settingsPage.initialize();
});

