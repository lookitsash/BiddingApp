/// <reference path="Resources.js" />
/// <reference path="Modals.js" />

var bidding = (function () {
    var biddingWindows = new Array();
    var initialBiddingWindowSize = { width: 415, height: 422 };
    var actualWindowSize = { width: 425, height: 250 };

    return {
        getAvailableWindowPositions: function (windowOffset) {
            var positions = new Array();
            var windowXPadding = 5;
            var windowYPadding = 5;
            var yOffset = 40;
            if (resources.browserDetection.isIE()) {
                windowYPadding = 14;
                yOffset = 45;
            }
            else if (resources.browserDetection.isFirefox()) {
                windowYPadding = 17;
                yOffset = 44;
            }
            var maxWidth = $(window).width();
            var maxHeight = $(window).height();
            var curPos = { x: 5 + (windowOffset * 30), y: yOffset + (windowOffset * 30) };
            while (curPos.y <= (maxHeight - actualWindowSize.height)) {
                if (curPos.x <= (maxWidth - actualWindowSize.width) && curPos.y <= (maxHeight - actualWindowSize.height)) {
                    positions.push({ x: curPos.x, y: curPos.y });
                }
                curPos.x += (actualWindowSize.width + windowXPadding);
                if (curPos.x > (maxWidth - actualWindowSize.width)) {
                    curPos.x = 5 + (windowOffset * 30);
                    curPos.y += actualWindowSize.height + windowYPadding;
                }
            }
            return positions;
        },

        positionsWithinRange: function (pos1, pos2, padding) {

            return (Math.abs(pos1.x - pos2.x) <= padding && Math.abs(pos1.y - pos2.y) <= padding);
        },

        getNewWindowPos: function (windowCollection) {
            var pos = null;

            if (windowCollection == null) windowCollection = biddingWindows;

            var windowOffset = 0;
            while (windowOffset < 100) {
                var availablePositions = bidding.getAvailableWindowPositions(windowOffset);
                while (availablePositions.length > 0) {
                    var curPos = availablePositions.shift();
                    var positionConflictFound = false;
                    resources.arrayEnum(windowCollection, function (dia) {
                        var windowPos = dia.closest('.ui-dialog').offset();
                        //console.log(Math.round(windowPos.left) + ',' + Math.round(windowPos.top) + '  :  ' + curPos.x + ',' + curPos.y);
                        if (bidding.positionsWithinRange({ x: Math.round(windowPos.left), y: Math.round(windowPos.top) }, curPos, 5)) {
                            positionConflictFound = true;
                        }
                    });

                    if (!positionConflictFound) {
                        pos = { left: curPos.x, top: curPos.y };
                        break;
                    }
                }
                if (pos != null) break;
                windowOffset++;
            }
            if (pos == null) pos = { left: 5, top: 40 };
            return pos;
        },

        autoArrangeWindows: function () {
            var windowCollection = new Array();
            resources.arrayEnum(biddingWindows, function (curWindow) {
                //console.log($(curWindow[0]).dialog('option', 'position'));
                var windowPos = bidding.getNewWindowPos(windowCollection);
                $(curWindow[0]).dialog('option', 'position', { my: "left top", at: "left+" + windowPos.left + " top+" + windowPos.top, of: window })
                $(curWindow[0]).dialog('moveToTop');
                windowCollection.push(curWindow);
            });
        },

        spawnWindow: function (dialogClass, title) {
            var windowPos = bidding.getNewWindowPos();
            var dialogHtml = $('.' + dialogClass).html();
            dialogHtml = resources.stringReplace(dialogHtml, '!MAXHEIGHT', '175px');
            var div = $(dialogHtml);
            var dia = $(div).dialog({
                position: { my: "left top", at: "left+" + windowPos.left + " top+" + windowPos.top, of: window },
                width: initialBiddingWindowSize.width,
                height: initialBiddingWindowSize.height,
                resizable: false,
                autoOpen: true,
                title: title,
                dialogClass: dialogClass,
                close: function (event, ui) {
                    resources.removeObjectInArray(biddingWindows, event.target, function (a, b) { return a[0] == b; });
                }
            });
            //$(div).html($('.dialogBox').html());
            biddingWindows.push(dia);
        },

        deleteInterest: function () {
            modals.showConfirmModal('Confirm delete interest to BUY Product3?', function (success) {
            }, 'Delete', 'Cancel');
        }
    };
})();