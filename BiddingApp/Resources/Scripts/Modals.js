/// <reference path="Resources.js" />
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
                var loginData = resources.dataFieldsToObject($('#loginModal'));
                modals.hide();
                modals.toggleWaitingModal(true, 'Please wait...');
                resources.ajaxPost('Receiver', 'Login', loginData, function (data) {
                    modals.hide();
                    if (data.Success) {
                        $.session.set('SessionGUID', data.SessionGUID);
                        defaultPage.refreshSession();
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
                        $.session.set('SessionGUID', data.SessionGUID);
                        defaultPage.refreshSession();
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
                        if (modalCallback != null) modalCallback(data.Interests);
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
                modals.hide();
                modals.toggleWaitingModal(true, 'Please wait...');
                resources.ajaxPost('Receiver', 'AddContact', { guid: defaultPage.sessionGUID(), formData: formData }, function (data) {
                    modals.hide();
                    if (data.Success) {
                        if (modalCallback != null) modalCallback(data.Contacts);
                    }
                    else {
                        modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { modals.show('createContactModal'); });
                    }
                });
            }
        },

        showDeleteContactModal: function (contactGUID, callback) {
            modalCallback = callback;
            currentEditingGUID = contactGUID;
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

        showCheckPricesModal: function () {
            resources.uiToggleCheckbox($('#checkPricesModal .allContacts'), true);
            $('#checkPricesModal .selectContactsDiv').hide();

            $('#checkPricesModal .allContacts').unbind('click.bidding').bind('click.bidding', function (e) {
                $('#checkPricesModal .selectContactsDiv').hide();
                windowUpdate();
            });
            $('#checkPricesModal .selectedContacts').unbind('click.bidding').bind('click.bidding', function (e) {
                $('#checkPricesModal .selectContactsDiv').show();
                windowUpdate();
            });

            modals.show('checkPricesModal');
        },

        showLeaveOrderModal: function (interestGUID) {
            currentEditingGUID = interestGUID;
            $('#leaveOrderModal input').val('');
            resources.uiToggleCheckbox($('#leaveOrderModal .goodUntilCancelled'), true);
            resources.uiToggleCheckbox($('#leaveOrderModal .allContacts'), true);
            $('#leaveOrderModal .selectContactsDiv').hide();

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
        },

        getFormData: function (modalID) {
            var formData = resources.dataFieldsToObject($('#' + modalID));
            formData.guid = defaultPage.sessionGUID();
            return formData;
        },

        leaveOrder: function () {
            if (modals.applyValidation('leaveOrderModal')) {
                var formData = modals.getFormData('leaveOrderModal');
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
        }

    };
})();