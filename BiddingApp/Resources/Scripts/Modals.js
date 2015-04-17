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
        }
    };
})();