/// <reference path="Resources.js" />
/// <reference path="Modals.js" />

var contactUs = (function () {
    return {
        submit: function () {
            if (modals.applyValidation('contactForm')) {
                var formData = resources.dataFieldsToObject($('#contactForm'));
                modals.toggleWaitingModal(true, 'Please wait...');
                resources.ajaxPost('Receiver', 'ContactUs', { guid: defaultPage.sessionGUID(), formData: formData }, function (data) {
                    modals.hide();
                    if (data.Success) {
                        $('#contactFormSubmitted').show();
                        $('#contactForm').hide();
                    }
                    else {
                        modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { });
                    }
                });
            }
        }
    };
})();

$(document).ready(function () {
    modals.clearValidation('contactForm');
});