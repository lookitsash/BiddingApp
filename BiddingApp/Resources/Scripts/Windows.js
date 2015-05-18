/// <reference path="Resources.js" />
/// <reference path="Modals.js" />
/// <reference path="DefaultPage.js" />

var windows = (function () {
    var biddingWindows = new Array();
    var chatWindows = new Array();

    var defaultWindowSize = { width: 415, height: 422 };
    var actualWindowSize = { width: 425, height: 250 };

    return {
        isChatWindow: function (windowType) {
            return (windowType == WINDOWTYPE_CHAT || windowType == WINDOWTYPE_CHATCONTACTREQUEST);
        },

        getOpenWindows: function () {
            return biddingWindows;
        },
        getAvailableWindowPositions: function (windowOffset, windowType) {
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
            if (windows.isChatWindow(windowType)) {
                curPos.x += 20;
                curPos.y += 20;
            }

            while (curPos.y <= (maxHeight - actualWindowSize.height)) {
                if (curPos.x <= (maxWidth - actualWindowSize.width) && curPos.y <= (maxHeight - actualWindowSize.height)) {
                    positions.push({ x: curPos.x, y: curPos.y });
                }
                curPos.x += (actualWindowSize.width + windowXPadding);
                if (curPos.x > (maxWidth - actualWindowSize.width)) {
                    curPos.x = 5 + (windowOffset * 30);
                    if (windows.isChatWindow(windowType)) {
                        curPos.x += 20;
                    }
                    curPos.y += actualWindowSize.height + windowYPadding;
                }
            }
            return positions;
        },

        positionsWithinRange: function (pos1, pos2, padding) {

            return (Math.abs(pos1.x - pos2.x) <= padding && Math.abs(pos1.y - pos2.y) <= padding);
        },

        getNewWindowPos: function (windowCollection, windowType) {
            var pos = null;

            if (windowCollection == null) {
                if (windows.isChatWindow(windowType)) windowCollection = chatWindows;
                else windowCollection = biddingWindows;
            }

            var windowOffset = 0;
            while (windowOffset < 100) {
                var availablePositions = windows.getAvailableWindowPositions(windowOffset, windowType);
                while (availablePositions.length > 0) {
                    var curPos = availablePositions.shift();
                    var positionConflictFound = false;
                    resources.arrayEnum(windowCollection, function (curWindow) {
                        //if (curWindow.windowType != WINDOWTYPE_DEALCONFIRM) {
                        var windowPos = curWindow.dialog.closest('.ui-dialog').offset();
                        //console.log(Math.round(windowPos.left) + ',' + Math.round(windowPos.top) + '  :  ' + curPos.x + ',' + curPos.y);
                        if (windows.positionsWithinRange({ x: Math.round(windowPos.left), y: Math.round(windowPos.top) }, curPos, 5)) {
                            positionConflictFound = true;
                        }
                        //}
                    });

                    if (!positionConflictFound) {
                        pos = { left: curPos.x, top: curPos.y };
                        break;
                    }
                }
                if (pos != null) break;
                windowOffset++;
            }
            if (pos == null) {
                if (windows.isChatWindow(windowType)) pos = { left: 20, top: 50 };
                else pos = { left: 5, top: 40 };
            }
            return pos;
        },

        autoArrangeWindows: function () {
            windows.autoArrangeWindowsByCollection(biddingWindows);
            windows.autoArrangeWindowsByCollection(chatWindows);

        },

        autoArrangeWindowsByCollection: function (collection) {
            var windowCollection = new Array();
            resources.arrayEnum(collection, function (curWindow) {
                //console.log($(curWindow[0]).dialog('option', 'position'));
                var windowPos = null;
                /*if (curWindow.windowType == WINDOWTYPE_DEALCONFIRM) {
                windowPos = { my: "center", at: "center", of: window };
                }
                else {*/
                var pos = windows.getNewWindowPos(windowCollection, curWindow.windowType);
                windowPos = { my: "left top", at: "left+" + pos.left + " top+" + pos.top, of: window };
                //}

                $(curWindow.dialog[0]).dialog('option', 'position', windowPos)
                $(curWindow.dialog[0]).dialog('moveToTop');
                windowCollection.push(curWindow);
            });
        },

        spawnWindow: function (windowType, title, windowID, data) {
            var windowPos = null;
            /*if (windowType == WINDOWTYPE_DEALCONFIRM) {
            windowPos = { my: "center", at: "center", of: window };
            }
            else {*/
            var pos = windows.getNewWindowPos(null, windowType);
            windowPos = { my: "left top", at: "left+" + pos.left + " top+" + pos.top, of: window };
            //}

            var dialogHtml = $('.' + windowType).html();
            dialogHtml = resources.stringReplace(dialogHtml, '!MAXHEIGHT', '175px');
            var div = $(dialogHtml);
            var dia = $(div).dialog({
                position: windowPos,
                width: defaultWindowSize.width,
                height: defaultWindowSize.height,
                resizable: false,
                autoOpen: true,
                title: title,
                dialogClass: windowType,
                close: function (event, ui) {
                    resources.removeObjectInArray(windows.getWindowCollection(windowType), event.target, function (a, b) { return a.dialog[0] == b; });
                }
            });
            //$(div).html($('.dialogBox').html());

            var windowObj = { windowType: windowType, dialog: dia, windowID: windowID, data: data };
            windows.getWindowCollection(windowType).push(windowObj);
            return windowObj;
        },

        getWindowCollection: function (windowType) {
            if (windows.isChatWindow(windowType)) return chatWindows;
            else return biddingWindows;
        },

        getWindowByID: function (windowID) {
            return resources.getArrayItem(biddingWindows, function (w) { return resources.stringEqual(w.windowID, windowID); });
        },

        getWindowByTypeAndID: function (windowType, windowID) {
            return resources.getArrayItem(windows.getWindowCollection(windowType), function (w) { return w.windowType == windowType && resources.stringEqual(w.windowID, windowID); });
        },

        closeWindow: function (windowObj) {
            $(windowObj.dialog[0]).dialog('close');
        }
    };
})();