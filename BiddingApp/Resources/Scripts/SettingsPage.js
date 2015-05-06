/// <reference path="Resources.js" />
/// <reference path="Statics.js" />
/// <reference path="Modals.js" />

var settingsPage = (function () {
    return {
        contacts: null,

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
        }
    };
})();