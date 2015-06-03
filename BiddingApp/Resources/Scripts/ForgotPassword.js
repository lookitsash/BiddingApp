/// <reference path="Resources.js" />
/// <reference path="Modals.js" />

var forgotPassword = (function () {
    return {
        resetToken: null,

        secondsUntilRedirect: 10,

        refreshRedirect: function () {
            if (forgotPassword.secondsUntilRedirect == 0) document.location = 'Default.aspx?Action=Login';
            else {
                $('#forgotPasswordStep2Completed .countdown').html(forgotPassword.secondsUntilRedirect + 's');
                forgotPassword.secondsUntilRedirect--;
                setTimeout(forgotPassword.refreshRedirect, 1000);
            }
        },

        submit: function (step) {
            if (step == 1) {
                modals.clearValidation('forgotPasswordStep1');

                $('#recaptcha iframe').css('border', 'none');
                if (!resources.stringNullOrEmpty(grecaptcha.getResponse())) {
                    if (modals.applyValidation('forgotPasswordStep1')) {
                        var formData = resources.dataFieldsToObject($('#forgotPasswordStep1'));
                        modals.toggleWaitingModal(true, 'Please wait...');
                        resources.ajaxPost('Receiver', 'ResetPassword', { email: formData.email }, function (data) {
                            modals.hide();
                            $('#forgotPasswordStep1').hide();
                            $('#forgotPasswordStep1Completed').show();
                        });
                    }
                }
                else {
                    $('.errorHeader').show();
                    $('#recaptcha iframe').css('border', '1px solid #ff0000');
                }
            }
            else if (step == 2) {
                modals.clearValidation('forgotPasswordStep2');
                if (modals.applyValidation('forgotPasswordStep2')) {
                    var formData = resources.dataFieldsToObject($('#forgotPasswordStep2'));
                    if (formData.password != formData.passwordconfirm) {
                        modals.showNotificationModal('Please enter matching passwords');
                        return;
                    }
                    else if (!resources.isValidPassword(formData.password)) {
                        modals.showNotificationModal('Password must be at least 8 characters, and contain 1 capital letter, 1 lowercase letter and 1 number');
                        return;
                    }

                    modals.toggleWaitingModal(true, 'Please wait...');
                    resources.ajaxPost('Receiver', 'ChangePassword', { resetToken: forgotPassword.resetToken, password: formData.password }, function (data) {
                        modals.hide();
                        if (data.Success) {
                            $('#forgotPasswordStep2').hide();
                            $('#forgotPasswordStep2Completed').show();
                            forgotPassword.refreshRedirect();
                        }
                        else {
                            modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { });
                        }
                    });
                }
            }
            /*
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
            */
        }
    };
})();

$(document).ready(function () {
    modals.clearValidation('forgotPasswordStep1');
    modals.clearValidation('forgotPasswordStep2');

    var tokenParam = resources.getQuerystringParam('Token');
    if (!resources.stringNullOrEmpty(tokenParam)) {
        forgotPassword.resetToken = tokenParam;
        $('#forgotPasswordStep1').hide();
        $('#forgotPasswordStep2').show();
        $('.data-token').val(tokenParam);
        resources.uiToggleEnable($('.data-token'), false);
    }
});