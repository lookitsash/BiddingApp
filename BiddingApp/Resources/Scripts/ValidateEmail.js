/// <reference path="Resources.js" />
/// <reference path="Modals.js" />

var validateEmail = (function () {
    return {
        submit: function () {
            if (modals.applyValidation('emailNotVerified')) {
                var formData = resources.dataFieldsToObject($('#emailNotVerified'));
                modals.toggleWaitingModal(true, 'Please wait...');
                resources.ajaxPost('Receiver', 'ValidateEmail', { guid: defaultPage.sessionGUID(), formData: formData }, function (data) {
                    modals.hide();
                    if (data.Success) {
                        validateEmail.emailVerified();
                    }
                    else {
                        modals.showNotificationModal(resources.isNull(data.ErrorMessage, 'Email could not be verified.  Are you sure you used the correct token?'), function () { });
                    }
                });
            }
        },

        secondsUntilRedirect: 10,

        emailVerified: function () {
            $('#emailVerified').show();
            $('#emailNotVerified').hide();
            validateEmail.refreshRedirect();
        },

        refreshRedirect: function () {
            if (validateEmail.secondsUntilRedirect == 0) document.location = 'Default.aspx?Action=Login';
            else {
                $('#emailVerified .countdown').html(validateEmail.secondsUntilRedirect + 's');
                validateEmail.secondsUntilRedirect--;
                setTimeout(validateEmail.refreshRedirect, 1000);
            }
        }
    };
})();

$(document).ready(function () {
    modals.clearValidation('emailNotVerified');
    var emailParam = resources.getQuerystringParam('Email');
    var tokenParam = resources.getQuerystringParam('Token');
    if (!resources.stringNullOrEmpty(emailParam)) $('.data-email').val(emailParam);
    if (!resources.stringNullOrEmpty(tokenParam)) $('.data-token').val(tokenParam);

    if (!resources.stringNullOrEmpty(emailParam) && !resources.stringNullOrEmpty(tokenParam)) validateEmail.submit();
});