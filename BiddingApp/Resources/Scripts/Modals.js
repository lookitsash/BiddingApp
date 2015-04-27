/// <reference path="Resources.js" />
/// <reference path="Statics.js" />

var modals = (function () {
    var currentModal = null;
    var currentModals = new Array();

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
            if (yesButtonOptions.cssClass == null) yesButtonOptions.cssClass = 'btn btn-info';
            $('#genericConfirmModalYesButton').removeAttr('class');
            $('#genericConfirmModalYesButton').attr('class', yesButtonOptions.cssClass);
            $('#genericConfirmModalYesButton').html(yesButtonOptions.text);

            if (noButtonOptions == null) noButtonOptions = { text: 'No' }
            else if (typeof noButtonOptions === 'string') noButtonOptions = { text: noButtonOptions };
            if (noButtonOptions.cssClass == null) noButtonOptions.cssClass = 'btn gray';
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
                $('.lightbox-wait .modalTitle').html(text);

                modals.show('lightbox-wait');
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

        showSignupModal: function () {
            modals.clearValidation('signupModal');
            resources.uiToggleCheckbox($('#signupModal .data-membershipBasic'), true);
            resources.uiToggleCheckbox($('#signupModal .data-membershipAdvance'), false);
            modals.show('signupModal');
        },

        signup: function () {
            if (modals.applyValidation('signupModal')) {
                var signupData = resources.dataFieldsToObject($('#signupModal'));
                if (signupData.password != signupData.passwordConfirm) {
                    modals.showNotificationModal('Passwords do not match, please re-enter');
                    return;
                }
                if (!resources.isValidPassword(signupData.password)) {
                    modals.showNotificationModal('Password must be at least 8 characters, and contain 1 capital letter, 1 lowercase letter and 1 number');
                    return;
                }
                alert(resources.objectToString(signupData));
            }
            //$('#signupModal .firstNameField').addClass('error');
        }
    };
})();