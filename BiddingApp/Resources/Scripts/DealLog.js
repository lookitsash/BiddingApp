/// <reference path="Resources.js" />
/// <reference path="Statics.js" />

var dealLog = (function () {
    return {
        managerAccounts: null,

        logs: null,

        serverTimeOffsetMS: 0,

        convertDateToLocal: function (date) {
            return resources.dateAddMs(resources.dateConvert(date), dealLog.serverTimeOffsetMS);
        },

        getData: function (options, callback) {
            if (options == null) options = { managerAccounts: true, logDeal: true };
            options.guid = defaultPage.sessionGUID();
            modals.toggleWaitingModal(true, 'Loading, please wait...');
            resources.ajaxPost('Receiver', 'GetData', options, function (data) {
                modals.hide();
                if (data.Success) {
                    var serverDate = resources.dateConvert(data.ServerDate);
                    dealLog.serverTimeOffsetMS = resources.dateDiffMS(serverDate, new Date());

                    dealLog.managerAccounts = data.ManagerAccounts;
                    dealLog.refreshManagerAccounts();

                    dealLog.logs = data.LogDeal;
                    dealLog.refreshDealLog();
                }
                else {
                    modals.showNotificationModal(resources.isNull(data.ErrorMessage, STRING_ERROR_GENERICAJAX), function () { if (callback != null) callback(true); });
                }
            });
        },

        refreshManagerAccounts: function () {
            $('.managerAccountDiv').hide();
            var userData = defaultPage.getUserData();
            if (userData != null && userData.MembershipType == MEMBERSHIPTYPE_MANAGER) {
                $('.managerAccountDiv').show();
                $('.managerAccounts').find('option').remove();
                $('.managerAccounts').append('<option value="-1">All Accounts</option>');
                if (dealLog.managerAccounts != null) {
                    resources.arrayEnum(dealLog.managerAccounts, function (account, i) {
                        $('.managerAccounts').append('<option value="' + i + '">' + account.FirstName + ' ' + account.LastName + ' - ' + account.Company + '</option>');
                    });
                }
                $('.managerAccounts').unbind('change.dealLog').bind('change.dealLog', function () {
                    var accountID = parseInt($(this).val());
                    dealLog.refreshDealLog(accountID);
                });
            }
        },

        refreshDealLog: function (accountID) {
            if (dealLog.logs == null) return;

            var userData = defaultPage.getUserData();
            var account = null;
            if (dealLog.managerAccounts != null && accountID >= 0 && accountID < dealLog.managerAccounts.length) account = dealLog.managerAccounts[accountID];

            var logHtmlArr = new Array();
            resources.arrayEnum(dealLog.logs, function (log, i) {
                var validLog = true;
                if (account != null && !(resources.stringEqual(log.Email1, account.Email) || resources.stringEqual(log.Email2, account.Email))) validLog = false;

                if (validLog) {
                    var localDate = dealLog.convertDateToLocal(log.Date);
                    var html = '<tr class="logItem" style="background-color:#B9CDE5;"> \
    <td>' + resources.getCalendarDate(null, localDate) + ' ' + resources.getClockTime(localDate, true) + '</td> \
    <td>' + log.Name1 + '</td> \
    <td>' + log.Company1 + '</td> \
    <td>' + log.BuySell + '</td> \
    <td>' + log.Name2 + '</td> \
    <td>' + log.Company2 + '</td> \
    <td>' + log.Product + '</td> \
    <td>' + log.Condition + '</td> \
    <td>' + log.Quantity + '</td> \
    <td>' + log.Price + '</td> \
</tr>';
                    logHtmlArr.push(html);
                }
            });
            $('.logItems .logItem').remove();
            $('.logItems').append(logHtmlArr.join(''));
        }
    };
})();

$(document).ready(function () {
    $('.managerAccountDiv').hide();
    dealLog.getData();
});