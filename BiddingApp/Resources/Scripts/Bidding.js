/// <reference path="Resources.js" />
/// <reference path="Modals.js" />

var bidding = (function () {
    var biddingWindows = new Array();
    var initialBiddingWindowSize = { width: 300, height: 250 };

    return {
        getAvailableWindowPositions: function (windowOffset) {
            var positions = new Array();
            var windowXPadding = 15;
            var windowYPadding = 5;
            var maxWidth = $(window).width();
            var maxHeight = $(window).height();
            var curPos = { x: 5 + (windowOffset * 30), y: 40 + (windowOffset * 30) };
            while (curPos.y <= (maxHeight - initialBiddingWindowSize.height)) {
                if (curPos.x <= (maxWidth - initialBiddingWindowSize.width) && curPos.y <= (maxHeight - initialBiddingWindowSize.height)) {
                    positions.push({ x: curPos.x, y: curPos.y });
                }
                curPos.x += (initialBiddingWindowSize.width + windowXPadding);
                if (curPos.x > (maxWidth - initialBiddingWindowSize.width)) {
                    curPos.x = 5 + (windowOffset * 30);
                    curPos.y += initialBiddingWindowSize.height + windowYPadding;
                }
            }
            return positions;
        },

        positionsWithinRange: function (pos1, pos2, padding) {

            return (Math.abs(pos1.x - pos2.x) <= padding && Math.abs(pos1.y - pos2.y) <= padding);
        },

        getNewWindowPos: function () {
            var pos = null;

            var windowOffset = 0;
            while (windowOffset < 100) {
                var availablePositions = bidding.getAvailableWindowPositions(windowOffset);
                while (availablePositions.length > 0) {
                    var curPos = availablePositions.shift();
                    var positionConflictFound = false;
                    resources.arrayEnum(biddingWindows, function (dia) {
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

        spawnWindow: function () {
            var windowPos = bidding.getNewWindowPos();
            var div = $($('.dialogBox').html());
            var dia = $(div).dialog({
                position: { my: "left top", at: "left+" + windowPos.left + " top+" + windowPos.top, of: window },
                width: initialBiddingWindowSize.width,
                height: initialBiddingWindowSize.height,
                autoOpen: true,
                close: function (event, ui) {
                    resources.removeObjectInArray(biddingWindows, event.target, function (a, b) { return a[0] == b; });
                }
            });
            biddingWindows.push(dia);
        },

        deleteInterest: function () {
            modals.showConfirmModal('Confirm delete interest to BUY Product3?', function (success) {
            }, 'Delete', 'Cancel');
        }
    };
})();