/// <reference path="Resources.js" />

var dev = (function () {
    return {
        sessionGUID: null,
        generateRandomSignupData: function () {
            $('#signupModal .data-firstName').val('firstName' + resources.getRandom(10000, 99999));
            $('#signupModal .data-lastName').val('lastName' + resources.getRandom(10000, 99999));
            $('#signupModal .data-company').val('company' + resources.getRandom(10000, 99999));
            $('#signupModal .data-email').val('random' + resources.getRandom(10000, 99999) + '@random.com');
            $('#signupModal .data-password').val('asdQWE123');
            $('#signupModal .data-passwordConfirm').val('asdQWE123');
        }
    };
})();