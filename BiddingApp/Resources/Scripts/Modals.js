﻿/// <reference path="Resources.js" />
/// <reference path="Statics.js" />
/// <reference path="DefaultPage.js" />
/// <reference path="Dev.js" />
/// <reference path="Bidding.js" />

var modals = (function () {
    var currentModal = null;
    var currentModals = new Array();
    var currentEditingGUID = null;
    var modalCallback = null;

    return {
        show: function (modalID) {
            if (currentModal == modalID) return;

            currentModal = modalID;

            if (currentModals.length > 0) currentModals[currentModals.length - 1].background.hide();
            var modal = $('#' + modalID);
            var background = showModal(modal, $('.lightboxContainer'), null, null);
            currentModals.push({ name: modalID, modal: modal, background: background });
        },

        hide: function () {
            if (currentModal != null) closeModalByElement($('#' + currentModal));
            currentModals.pop();
            currentModal = null;

            if (currentModals.length > 0) {
                currentModal = currentModals[currentModals.length - 1].name;
                currentModals[currentModals.length - 1].background.show();
            }
        },

        showNotificationModal: function (notificationText, responseCallback) {
            $('#genericNotificationModal .notificationText').html(resources.stringReplace(notificationText, '\n', '<br/>'));
            confirmModalCallback = responseCallback;
            modals.show('genericNotificationModal');
        },

        showConfirmModal: function (confirmText, responseCallback, yesButtonOptions, noButtonOptions) {
            if (yesButtonOptions == null) yesButtonOptions = { text: 'Yes' }
            else if (typeof yesButtonOptions === 'string') yesButtonOptions = { text: yesButtonOptions };
            if (yesButtonOptions.cssClass == null) yesButtonOptions.cssClass = 'btn btn-primary';
            $('#genericConfirmModalYesButton').removeAttr('class');
            $('#genericConfirmModalYesButton').attr('class', yesButtonOptions.cssClass);
            $('#genericConfirmModalYesButton').html(yesButtonOptions.text);

            if (noButtonOptions == null) noButtonOptions = { text: 'No' }
            else if (typeof noButtonOptions === 'string') noButtonOptions = { text: noButtonOptions };
            if (noButtonOptions.cssClass == null) noButtonOptions.cssClass = 'btn btn-cancel';
            $('#genericConfirmModalNoButton').removeAttr('class');
            $('#genericConfirmModalNoButton').attr('class', noButtonOptions.cssClass);
            $('#genericConfirmModalNoButton').html(noButtonOptions.text);

            if (resources.stringNullOrEmpty(confirmText)) confirmText = 'Are you sure you want to do this?';
            $('#genericConfirmModal .confirmText').html(resources.stringReplace(confirmText, '\n', '<br/>'));
            confirmModalCallback = responseCallback;
            modals.show('genericConfirmModal');
        },


        confirmModalResponse: function (success) {
            modals.hide();
            if (confirmModalCallback != null) confirmModalCallback(success);
            confirmModalCallback = null;
        },

        toggleWaitingModal: function (isVisible, text) {
            if (isVisible) {
                if (text == null) text = 'Please wait...';
                $('#genericWaitModal .notificationText').html(text);

                modals.show('genericWaitModal');
            }
            else modals.hide();
        },

        clearValidation: function (modalID) {
            $('#' + modalID + ' .validateRequired').removeClass('error');
            $('#' + modalID + ' .errorHeader').hide();
        },

        applyValidation: function (modalID) {
            $('#' + modalID).removeClass('validationPerformed');
            $('#' + modalID).addClass('validationPerformed');
            return resources.dataFieldsValidate($('#' + modalID), function () { modals.clearValidation(modalID); }, function (errorFields) {
                $('#' + modalID + ' .errorHeader').show();
                resources.arrayEnum(errorFields, function (field) { field.addClass('error'); });
            });
        },

        showLoginModal: function () {
            $('#loginModal .data-email, #loginModal .data-password').off('keypress').on('keypress', function (ev) {
                var keycode = (ev.keyCode ? ev.keyCode : ev.which);
                if (keycode == '13') {
                    modals.login();
                }
            });

            modals.clearValidation('signupModal');
            $('#loginModal input').val('');
            modals.show('loginModal');
        },

        login: function () {
            if (modals.applyValidation('loginModal')) {
                var formData = resources.dataFieldsToObject($('#loginModal'));
                modals.hide();
                modals.toggleWaitingModal(true, 'Please wait...');
                resources.ajaxPost('Receiver', 'Login', formData, function (data) {
                    modals.hide();
                    if (data.Success) {
                        if (data.EmailVerified) {
                            $.session.set('SessionData', JSON.stringify(data.SessionData));
                            defaultPage.refreshSession();
                            defaultPage.initializeSignalR();

                            var userData = defaultPage.getUserData();
                            if (userData != null && userData.MembershipType == MEMBERSHIPTYPE_MANAGER && resources.stringNullOrEmpty(userData.PasswordChangeDate)) {
                                document.location = 'Settings.aspx';
                            }
                        }
                        else document.location = 'ValidateEmail.aspx?Email=' + formData.email;
                    }
                    else {
                        modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { modals.show('loginModal'); });
                    }
                });
            };
        },

        logout: function () {
            modals.showConfirmModal('Are you sure you want to log out?', function (success) {
                if (success) {
                    $.connection.biddingHub.server.logout();
                    $.session.clear();
                    defaultPage.validateSession();
                }
            });
        },

        showSignupModal: function () {
            modals.clearValidation('signupModal');
            $('#signupModal input').val('');
            resources.uiToggleCheckbox($('#signupModal .data-membershipBasic'), true);
            resources.uiToggleCheckbox($('#signupModal .data-membershipAdvance'), false);
            modals.show('signupModal');

            $('#signupModal input').unbind('keyup.biddingApp').bind('keyup', function () {
                if ($('#signupModal').hasClass('validationPerformed')) modals.applyValidation('signupModal');
                if ($(this).hasClass('data-password')) $('#signupModal .passwordRequirements').show();
            });

        },

        signup: function () {
            if (modals.applyValidation('signupModal')) {
                var formData = resources.dataFieldsToObject($('#signupModal'));
                if (formData.password != formData.passwordConfirm) {
                    modals.showNotificationModal('Passwords do not match, please re-enter');
                    return;
                }
                if (!resources.isValidPassword(formData.password)) {
                    modals.showNotificationModal('Password must be at least 8 characters, and contain 1 capital letter, 1 lowercase letter and 1 number');
                    return;
                }

                modals.hide();
                modals.toggleWaitingModal(true, 'Please wait...');
                resources.ajaxPost('Receiver', 'Signup', { formData: formData }, function (data) {
                    modals.hide();
                    if (data.Success) {
                        document.location = 'ValidateEmail.aspx?Email=' + formData.email;
                        //$.session.set('SessionData', JSON.stringify(data.SessionData));
                        //defaultPage.refreshSession();
                    }
                    else {
                        modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { modals.show('signupModal'); });
                    }
                });
            }
        },

        showNewInterestModal: function (callback) {
            modalCallback = callback;
            modals.clearValidation('createInterestModal');
            $('#createInterestModal input').val('');
            modals.show('createInterestModal');
        },

        createNewInterest: function (interestType) {
            if (modals.applyValidation('createInterestModal')) {
                var formData = resources.dataFieldsToObject($('#createInterestModal'));
                formData.interestType = interestType;
                modals.hide();
                modals.toggleWaitingModal(true, 'Please wait...');
                resources.ajaxPost('Receiver', 'CreateInterest', { guid: defaultPage.sessionGUID(), formData: formData }, function (data) {
                    modals.hide();
                    if (data.Success) {
                        if (modalCallback != null) modalCallback(data.Interests, data.InterestGUID);
                    }
                    else {
                        modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { modals.show('createInterestModal'); });
                    }
                });
            }
        },

        showNewContactModal: function (callback) {
            modalCallback = callback;
            modals.clearValidation('createContactModal');
            $('#createContactModal input').val('');
            modals.show('createContactModal');
        },

        addNewContact: function () {
            if (modals.applyValidation('createContactModal')) {
                var formData = resources.dataFieldsToObject($('#createContactModal'));
                if (resources.stringEqual(defaultPage.getUserData().Email, formData.email)) {
                    modals.showNotificationModal('You cannot add yourself as a contact');
                    return;
                }
                modals.hide();
                modals.toggleWaitingModal(true, 'Please wait...');
                resources.ajaxPost('Receiver', 'AddContact', { guid: defaultPage.sessionGUID(), formData: formData }, function (data) {
                    modals.hide();
                    if (data.Success) {
                        if (data.IsBlocked) modals.showNotificationModal('Unable to add an inactive contact');
                        else {
                            modals.showNotificationModal('Contact successfully added');
                            if (modalCallback != null) modalCallback(data.Contacts);
                        }
                    }
                    else {
                        modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { modals.show('createContactModal'); });
                    }
                });
            }
        },

        showDeleteContactModal: function (contact, callback) {
            modalCallback = callback;
            currentEditingGUID = contact.GUID;
            $('#deleteContactModal .contactDetails').html(contact.FirstName + ' (' + contact.Email + ')');
            resources.uiToggleCheckbox($('#deleteContactModal .deleteField'), false);
            modals.show('deleteContactModal');
        },

        deleteContact: function () {
            var blockContact = resources.uiCheckboxSelected($('#deleteContactModal .deleteField'));
            modals.hide();
            modals.toggleWaitingModal(true, 'Please wait...');
            resources.ajaxPost('Receiver', 'DeleteContact', { guid: defaultPage.sessionGUID(), contactGUID: currentEditingGUID, blockContact: blockContact }, function (data) {
                modals.hide();
                if (data.Success) {
                    if (modalCallback != null) modalCallback(data.Contacts);
                }
                else {
                    modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { modals.show('createContactModal'); });
                }
            });
        },

        showCheckPricesModal: function (interestGUID) {
            currentEditingGUID = interestGUID;
            resources.uiToggleCheckbox($('#checkPricesModal .allContacts'), true);
            $('#checkPricesModal .selectContactsDiv').hide();

            $('#checkPricesModal .contactsList').html('');
            var contactRowHtml = null;
            var advanceContactCount = 0;
            resources.arrayEnum(bidding.contacts, function (contact) {
                if (contact.MembershipTypeID == MEMBERSHIPTYPE_ADVANCE) {
                    advanceContactCount++;
                    var baseHtml = '<td><label><input class="contactField" data-id="' + contact.GUID + '" type="checkbox" />' + contact.FirstName + ' ' + contact.LastName + '</label></td>';
                    if (resources.stringNullOrEmpty(contactRowHtml)) contactRowHtml = '<tr>' + baseHtml;
                    else {
                        contactRowHtml += baseHtml + '</tr>';
                        $('#checkPricesModal .contactsList').append(contactRowHtml);
                        contactRowHtml = null;
                    }
                }
            });
            if (!resources.stringNullOrEmpty(contactRowHtml)) {
                contactRowHtml += '<td>&nbsp;</td></tr>';
                $('#checkPricesModal .contactsList').append(contactRowHtml);
            }

            if (advanceContactCount == 0) {
                modals.showNoAdvanceContactsModal();
            }
            else {
                $('#checkPricesModal .allContacts').unbind('click.bidding').bind('click.bidding', function (e) {
                    $('#checkPricesModal .selectContactsDiv').hide();
                    windowUpdate();
                });
                $('#checkPricesModal .selectedContacts').unbind('click.bidding').bind('click.bidding', function (e) {
                    $('#checkPricesModal .selectContactsDiv').show();
                    windowUpdate();
                });

                modals.show('checkPricesModal');
            }
        },

        checkPrices: function (bidType) {
            var allContacts = resources.uiCheckboxSelected($('#checkPricesModal .allContacts'));
            var contactGUIDs = null;
            if (!allContacts) {
                contactGUIDs = new Array();
                $('#checkPricesModal .contactField:checked').each(function () {
                    contactGUIDs.push($(this).attr('data-id'));
                });
                if (contactGUIDs.length == 0) {
                    modals.showNotificationModal('Please select at least one contact');
                    return;
                }
            }

            modals.hide();
            modals.toggleWaitingModal(true, 'Please wait...');
            var formData = { guid: defaultPage.sessionGUID(), interestGUID: currentEditingGUID, bidType: bidType, contactGUIDs: contactGUIDs };
            resources.ajaxPost('Receiver', 'CheckPrices', formData, function (data) {
                modals.hide();
                if (data.Success) {

                }
                else {
                    modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { modals.show('checkPricesModal'); });
                }
            });
        },

        showLeaveOrderModal: function (interestGUID) {
            currentEditingGUID = interestGUID;
            $('#leaveOrderModal input').val('');
            resources.uiToggleCheckbox($('#leaveOrderModal .goodUntilCancelled'), true);
            resources.uiToggleCheckbox($('#leaveOrderModal .allContacts'), true);
            $('#leaveOrderModal .selectContactsDiv').hide();

            $('#leaveOrderModal .contactsList').html('');
            var contactRowHtml = null;
            var advanceContactCount = 0;
            resources.arrayEnum(bidding.contacts, function (contact) {
                if (contact.MembershipTypeID == MEMBERSHIPTYPE_ADVANCE) {
                    advanceContactCount++;
                    var baseHtml = '<td><label><input class="contactField" data-id="' + contact.GUID + '" type="checkbox" />' + contact.FirstName + ' ' + contact.LastName + '</label></td>';
                    if (resources.stringNullOrEmpty(contactRowHtml)) contactRowHtml = '<tr>' + baseHtml;
                    else {
                        contactRowHtml += baseHtml + '</tr>';
                        $('#leaveOrderModal .contactsList').append(contactRowHtml);
                        contactRowHtml = null;
                    }
                }
            });
            if (!resources.stringNullOrEmpty(contactRowHtml)) {
                contactRowHtml += '<td>&nbsp;</td></tr>';
                $('#leaveOrderModal .contactsList').append(contactRowHtml);
            }

            if (advanceContactCount == 0) {
                modals.showNoAdvanceContactsModal();
            }
            else {
                $('#leaveOrderModal .allContacts').unbind('click.bidding').bind('click.bidding', function (e) {
                    $('#leaveOrderModal .selectContactsDiv').hide();
                    windowUpdate();
                });
                $('#leaveOrderModal .selectedContacts').unbind('click.bidding').bind('click.bidding', function (e) {
                    $('#leaveOrderModal .selectContactsDiv').show();
                    windowUpdate();
                });

                $('#leaveOrderModal .allContacts').unbind('click.bidding').bind('click.bidding', function (e) {
                    $('#leaveOrderModal .selectContactsDiv').hide();
                    windowUpdate();
                });
                $('#leaveOrderModal .selectedContacts').unbind('click.bidding').bind('click.bidding', function (e) {
                    $('#leaveOrderModal .selectContactsDiv').show();
                    windowUpdate();
                });
                $('#leaveOrderModal .hourField, #leaveOrderModal .minuteField').unbind('click.bidding').bind('click.bidding', function (e) {
                    resources.uiToggleCheckbox($('#leaveOrderModal .goodUntilCancelled'), false);
                    resources.uiToggleCheckbox($('#leaveOrderModal .goodUntilDuration'), true);
                });

                modals.show('leaveOrderModal');
            }
        },

        getFormData: function (modalID) {
            var formData = resources.dataFieldsToObject($('#' + modalID));
            formData.guid = defaultPage.sessionGUID();
            return formData;
        },

        leaveOrder: function () {
            if (modals.applyValidation('leaveOrderModal')) {
                var allContacts = resources.uiCheckboxSelected($('#leaveOrderModal .allContacts'));
                var contactGUIDs = null;
                if (!allContacts) {
                    contactGUIDs = new Array();
                    $('#leaveOrderModal .contactField:checked').each(function () {
                        contactGUIDs.push($(this).attr('data-id'));
                    });
                    if (contactGUIDs.length == 0) {
                        modals.showNotificationModal('Please select at least one contact');
                        return;
                    }
                }

                var formData = modals.getFormData('leaveOrderModal');
                formData.contactGUIDs = contactGUIDs;
                formData.price = resources.toDecimal(formData.price);
                formData.interestGUID = currentEditingGUID;
                formData.hours = 0;
                formData.minutes = 0;
                if (resources.uiCheckboxSelected($('#leaveOrderModal .goodUntilDuration'))) {
                    formData.hours = resources.toInt(formData.hour);
                    formData.minutes = resources.toInt(formData.minute);
                    if (formData.hours == 0 && formData.minutes == 0) {
                        modals.showNotificationModal('Please enter a valid expiration date');
                        return;
                    }
                }
                modals.hide();
                modals.toggleWaitingModal(true, 'Please wait...');
                resources.ajaxPost('Receiver', 'PlaceOrder', formData, function (data) {
                    modals.hide();
                    if (data.Success) {
                        bidding.interests = data.Interests;
                        bidding.refreshInterests();
                        bidding.showInterestWindow(currentEditingGUID);
                    }
                    else {
                        modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { modals.show('leaveOrderModal'); });
                    }
                });
            };
        },

        showNoAdvanceContactsModal: function () {
            modals.show('noAdvanceContactsModal');
        },

        showFillOrderModal: function (interestGUID) {
            currentEditingGUID = interestGUID;

            var interest = bidding.getInterest(interestGUID);
            if (interest == null) return;

            var contact = bidding.getContactByGUID(interest.ContactGUID);
            if (contact == null) return;

            $('#confirmFillOrderModal .interestDetails').html(contact.Company + ' - ' + contact.FirstName + '<br/>Condition: ' + interest.Condition + '<br/>Qty: ' + interest.Quantity + '<br/>' + interest.Remarks);
            $('#confirmFillOrderModal .interestPrice').html('Order Price @ ' + interest.Price);
            modals.show('confirmFillOrderModal');
        },

        fillOrder: function () {
            var interest = bidding.getInterest(currentEditingGUID);
            if (interest == null) return;
            modals.hide();
            modals.toggleWaitingModal(true, 'Please wait...');
            resources.ajaxPost('Receiver', 'FillOrder', { guid: defaultPage.sessionGUID(), interestGUID: currentEditingGUID }, function (data) {
                modals.hide();
                if (data.Success) {
                    interest.DealConfirmed = true;
                    interest.PriceShowing = interest.Price;
                    bidding.interests = data.Interests;
                    bidding.refreshInterests();
                    bidding.showInterestWindow(null, interest);
                }
                else {
                    modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { modals.show('confirmFillOrderModal'); });
                }
            });
        },

        showAddManagerModal: function () {
            $('#addManagerModal input').val('');
            modals.clearValidation('addManagerModal');
            modals.show('addManagerModal');
        },

        addManager: function () {
            if (modals.applyValidation('addManagerModal')) {
                var formData = resources.dataFieldsToObject($('#addManagerModal'));
                var userData = defaultPage.getUserData();
                if (resources.arrayContainsItem(userData.Managers, formData.email, function (a, b) { return resources.stringEqual(a, b); })) {
                    modals.showNotificationModal('You have already added this manager');
                    return;
                }
                modals.hide();
                modals.toggleWaitingModal(true, 'Please wait...');
                resources.ajaxPost('Receiver', 'AddManager', { guid: defaultPage.sessionGUID(), firstName: formData.firstName, lastName: formData.lastName, email: formData.email }, function (data) {
                    modals.hide();
                    if (data.Success) {
                        defaultPage.updateUserData(data.UserData);
                        settingsPage.refreshManagers();
                    }
                    else {
                        modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { modals.show('addManagerModal'); });
                    }
                });
            }
        }
    };
})();