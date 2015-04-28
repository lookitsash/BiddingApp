/// <reference path="Resources.js" />

var dev = (function () {
    return {
        generateRandomSignupData: function () {
            $('#signupModal .data-firstName').val('firstName');
            $('#signupModal .data-lastName').val('lastName');
            $('#signupModal .data-company').val('company');
            $('#signupModal .data-email').val('random' + resources.getRandom(10000, 99999) + '@random.com');
            
        }
    };
})();