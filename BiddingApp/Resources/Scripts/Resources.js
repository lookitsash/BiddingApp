var resources = (function () {
    var _newID = -1000;

    return {
        newID: function () { return --_newID; },

        setTitle: function (str) {
            document.title = str;
        },

        stringReplace: function (sourceStr, strToFind, replaceWith) {
            return sourceStr.split(strToFind).join(replaceWith);
        },

        stringContains: function (sourceStr, strToFind, caseSensitive) {
            if (caseSensitive) return sourceStr.indexOf(strToFind) >= 0;
            else return sourceStr.toUpperCase().indexOf(strToFind.toUpperCase()) >= 0;
        },

        stringStartsWith: function (sourceStr, strToFind) {
            return sourceStr.indexOf(strToFind) == 0;
        },

        stringTrim: function (str) {
            return $.trim(str);
        },

        stringNullOrEmpty: function (str) {
            if (str == null || $.trim(str) == '') return true;
            else return false;
        },

        stringPadLeft: function (str, strLen, padChar) {
            var initialStrLen = str.length;
            for (var i = 0; i < (strLen - initialStrLen); i++)
                str = padChar + str;
            return str;
        },

        stringLeft: function (str, len) {
            if (str.length > len) return str.substring(0, len);
            else return str;
        },

        stringAlphanumeric: function (str) {
            var newStr = '';
            var validChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            var validCharLookup = new Array();
            for (var i = 0; i < validChars.length; i++) validCharLookup[validChars.charAt(i)] = true;
            for (var i = 0; i < str.length; i++) {
                var c = str.charAt(i);
                if (validCharLookup[c]) newStr += c;
            }
            return newStr;
        },

        isValidEmail: function (email) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        },

        isValidPassword: function (password) {
            var charGroups = [
                { chars: 'abcdefghijklmnopqrstuvwxyz', match: false },
                { chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', match: false },
                { chars: '0123456789', match: false }
            ];

            for (var i = 0; i < password.length; i++) {
                var c = password.charAt(i);
                resources.arrayEnum(charGroups, function (charGroup) {
                    if (resources.stringContains(charGroup.chars, c, true)) charGroup.match = true;
                });
            };

            var charGroupFailed = false;
            resources.arrayEnum(charGroups, function (charGroup) {
                if (!charGroup.match) charGroupFailed = true;
            });
            return !charGroupFailed;
        },

        isValidFilename: function (filename) {
            var validChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+_-.() ';
            var validCharLookup = new Array();
            for (var i = 0; i < validChars.length; i++) validCharLookup[validChars.charAt(i)] = true;
            for (var i = 0; i < filename.length; i++) {
                var c = filename.charAt(i);
                if (!validCharLookup[c]) return false;
            }
            /*
            var badChars = ['\\', '/', ':', '*', '?', '<', '>', '|'];
            var badCharLookup = new Array();
            for (var i = 0; i < badChars; i++) badCharLookup[badChars[i]] = true;
            for (var i = 0; i < filename.length; i++) {
            var c = filename.charAt(i);
            if (badCharLookup[c]) return false;
            }
            */
            return true;
        },

        isNull: function (obj, valueIfNull) {
            if (obj == null) return valueIfNull;
            else return obj;
        },

        indexOfObject: function (arr, value, compareFunction) {
            if (arr != null) {
                var arrLen = arr.length;
                var i = -1
                while (++i < arrLen) {
                    var curValue = arr[i];
                    var valueExists = false;
                    if (compareFunction == null) valueExists = (curValue == value);
                    else valueExists = compareFunction(curValue, value);
                    if (valueExists) return i;
                }
            }
            return -1;
        },

        removeObjectInArray: function (arr, value, compareFunction) {
            var pos = resources.indexOfObject(arr, value, compareFunction);
            if (pos >= 0) {
                arr.splice(pos, 1);
                return true;
            }
            return false;
        },

        arrayCopy: function (arr) {
            var newArr = new Array();
            var count = arr.length;
            var i = -1;
            while (++i < count) {
                newArr.push(arr[i]);
            }
            return newArr;
        },

        arrayContainsItem: function (arr, item, compareFunction) {
            var count = arr.length;
            var i = -1;
            while (++i < count) {
                if (compareFunction != null && compareFunction(arr[i], item)) return true;
                else if (arr[i] == item) return true;
            }
            return false;
        },

        arrayIdentical: function (arr1, arr2) {
            if (arr1 != null && arr2 != null && arr1.length == arr2.length) {
                for (var i = 0; i < arr1.length; i++) {
                    if (arr1[i] != arr2[i]) return false;
                }
                return true;
            }
            else return false;
        },

        arrayEnum: function (arr, func) {
            var count = arr.length;
            var i = -1;
            while (++i < count) {
                if (func(arr[i], i, count)) break;
            }
        },

        getArrayItem: function (arr, comparisonFunc) {
            var count = arr.length;
            var i = -1;
            while (++i < count) {
                var item = arr[i];
                if (comparisonFunc(item)) return item;
            }
            return null;
        },

        getRandom: function (min, max) {
            return Math.floor(Math.random() * max) + min;
        },

        getRandomString: function (maxChars, possibleChars) {
            var randomStr = "";
            if (resources.stringNullOrEmpty(possibleChars)) possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

            for (var i = 0; i < maxChars; i++) {
                randomStr += possibleChars.charAt(resources.getRandom(0, possibleChars.length));
            }
            return randomStr;
        },

        createCookie: function (name, value, days) {
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                var expires = "; expires=" + date.toGMTString();
            } else var expires = "";
            document.cookie = escape(name) + "=" + escape(value) + expires + "; domain=.collages.net; path=/";
        },

        readCookie: function (name) {
            var nameEQ = escape(name) + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return unescape(c.substring(nameEQ.length, c.length));
            }
            return null;
        },

        eraseCookie: function (name) {
            resources.createCookie(name, "", -1);
        },

        ajaxPost: function (serverPage, serverFunction, params, successCallbackFunction, errorCallbackFunction, throttleUploader) {
            //if (throttleUploader) imageUpload.yuiPauseUpload();
            jQuery.ajax
            ({
                type: "POST",
                url: serverPage + '.asmx/' + serverFunction,
                data: JSON.stringify({ json: JSON.stringify(params) }),
                contentType: 'application/json',
                success: function (data) {
                    if (successCallbackFunction != null) {
                        var json;
                        if (data) {
                            if (data.d) {
                                json = $.parseJSON(data.d);
                            } else {
                                json = $.parseJSON(data);
                            }
                        }
                        successCallbackFunction(json, null);
                    }
                    //if (throttleUploader) imageUpload.yuiResumeUpload();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    if (errorCallbackFunction != null) {
                        errorCallbackFunction(null, { xhr: xhr, ajaxOptions: ajaxOptions, thrownError: thrownError })
                    }
                    else if (successCallbackFunction != null) {
                        successCallbackFunction({ Success: false, ErrorMessage: 'We\'re sorry, but your request could not be processed.  Your Internet connection has been lost.' });
                    }
                    //if (throttleUploader) imageUpload.yuiResumeUpload();
                }
            });
        },

        uiMetronicsInit: function () {
            Metronic.init();
        },

        uiScrollTop: function () {
            window.scrollTo(0, 0);
        },

        uiIsVisible: function (element) {
            return element.is(':visible');
        },

        uiToggleCheckbox: function (checkbox, isChecked) {
            checkbox.parent().removeClass('checked');
            checkbox.removeAttr('checked');
            if (isChecked) {
                checkbox.parent().addClass('checked');
                checkbox.attr('checked', true);
            }
        },

        uiToggleEnable: function (control, isEnabled) {
            control.removeAttr('disabled');
            var controlLabel = control.parent().parent().parent();
            controlLabel.removeClass('label-text-gray');
            if (!isEnabled) {
                control.attr('disabled', 'disabled');
                controlLabel.addClass('label-text-gray');
            }
        },

        uiCheckboxSelected: function (checkbox) {
            return (checkbox.attr('checked') == 'checked');
        },

        uiSetDate: function (datepicker, val) {
            //datepicker.datepicker('setDate', val);
            datepicker.datepicker('update', val);
        },

        uiSetDateLimits: function (datepicker, startDate, endDate) {
            datepicker.datepicker('setStartDate', startDate);
            datepicker.datepicker('setEndDate', endDate);
        },

        uiGetDate: function (datepicker) {
            return datepicker.find('input').val();
        },

        uiCreateSortable: function (sortableParent, handleClass) {
            sortableParent.sortable({
                axis: 'y',
                handle: handleClass,
                helper: function (e, ui) {
                    ui.children().each(function () {
                        $(this).width($(this).width());
                    });
                    return ui;
                }
            });
        },

        browserDetection: {
            isMac: function () { return resources.stringContains(navigator.platform, 'MAC'); },
            isMac10_6: function () { return resources.stringContains(navigator.userAgent, 'OS X 10_6'); },
            isChrome: function () { if (window.chrome) return true; else return false; },
            isSafari: function () { return resources.stringContains(navigator.userAgent, 'SAFARI') && !resources.browserDetection.isChrome(); },
            isFirefox: function () { return resources.stringContains(navigator.userAgent, 'FIREFOX'); },
            isIE: function () { return resources.stringContains(navigator.userAgent, 'IE') || resources.stringContains(navigator.userAgent, 'TRIDENT'); },
            isIE8: function () { return resources.stringContains(navigator.userAgent, 'IE 8'); },
            isIE9: function () { return resources.stringContains(navigator.userAgent, 'IE 9'); },
            isMobile: function () { return (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())); },
            //isMobile: function () { return true; },
            toString: function () { return 'isMac: ' + resources.browserDetection.isMac() + ', isMac10_6: ' + resources.browserDetection.isMac10_6() + ', isChrome: ' + resources.browserDetection.isChrome() + ', isSafari: ' + resources.browserDetection.isSafari() + ', isFirefox: ' + resources.browserDetection.isFirefox() + ', isIE: ' + resources.browserDetection.isIE() + ', isIE8: ' + resources.browserDetection.isIE8() + ', isIE9: ' + resources.browserDetection.isIE9() + ', isMobile: ' + resources.browserDetection.isMobile(); }
        },

        dateDiff: function (startDate, endDate) {
            startDate = resources.dateConvert(startDate);
            endDate = resources.dateConvert(endDate);
            var timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
            return Math.ceil(timeDiff / (1000 * 3600 * 24));
        },

        dateIsFuture: function (d, currentDate) {
            if (currentDate == null) currentDate = new Date();
            return (resources.dateCompare(d, currentDate) > 0);
        },

        dateAddDays: function (date, days) {
            return new Date(resources.dateConvert(date).getTime() + days * 24 * 60 * 60 * 1000);
        },

        dateConvert: function (d) {
            if (d.constructor === String) d = resources.stringReplace(d, '.', '/');
            // Converts the date in d to a date-object. The input can be:
            //   a date object: returned without modification
            //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
            //   a number     : Interpreted as number of milliseconds
            //                  since 1 Jan 1970 (a timestamp) 
            //   a string     : Any format supported by the javascript engine, like
            //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
            //  an object     : Interpreted as an object with year, month and date
            //                  attributes.  **NOTE** month is 0-11.
            return (
                d.constructor === Date ? d :
                d.constructor === Array ? new Date(d[0], d[1], d[2]) :
                d.constructor === Number ? new Date(d) :
                d.constructor === String ? new Date(d) :
                typeof d === "object" ? new Date(d.year, d.month, d.date) :
                NaN
            );
        },

        dateCompare: function (a, b) {
            // Compare two dates (could be of any type supported by the convert
            // function above) and returns:
            //  -1 : if a < b
            //   0 : if a = b
            //   1 : if a > b
            // NaN : if a or b is an illegal date
            // NOTE: The code inside isFinite does an assignment (=).
            return (
                isFinite(a = resources.dateConvert(a).valueOf()) &&
                isFinite(b = resources.dateConvert(b).valueOf()) ?
                (a > b) - (a < b) :
                NaN
            );
        },

        dateInRange: function (d, start, end) {
            // Checks if date in d is between dates in start and end.
            // Returns a boolean or NaN:
            //    true  : if d is between start and end (inclusive)
            //    false : if d is before start or after end
            //    NaN   : if one or more of the dates is illegal.
            // NOTE: The code inside isFinite does an assignment (=).
            return (
                isFinite(d = resources.dateConvert(d).valueOf()) &&
                isFinite(start = resources.dateConvert(start).valueOf()) &&
                isFinite(end = resources.dateConvert(end).valueOf()) ?
                start <= d && d <= end :
                NaN
            );
        },

        dateFormatSimple: function (d) {
            d = resources.dateConvert(d);
            return resources.stringPadLeft(((d.getMonth() + 1) + ''), 2, '0') + '.' + resources.stringPadLeft(d.getDate() + '', '2', '0') + '.' + d.getFullYear();
        },

        clone: function (obj) {
            if (obj == null || typeof (obj) != 'object')
                return obj;

            var temp = obj.constructor();

            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    temp[key] = resources.clone(obj[key]);
                }
            }
            return temp;
        },

        objectsEqual: function (obj1, obj2) {
            for (var key in obj1) {
                if (!(obj2.hasOwnProperty(key) && obj2[key] == obj1[key])) return false;
            }
            return true;
        },

        htmlEncode: function (str) {
            return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        },

        rgb2hex: function (rgb) {
            if (rgb.search("rgb") == -1) {
                return rgb;
            } else {
                rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
                function hex(x) {
                    return ("0" + parseInt(x).toString(16)).slice(-2);
                }
                return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
            }
        },

        redirectHash: function (hash) {
            var targetHash = hash;
            if (!resources.stringStartsWith(targetHash, '#')) targetHash = '#' + targetHash;
            if (location.hash == targetHash) targetHash += '_' + resources.getRandom(1000, 9999);
            document.location = targetHash;
        },

        getExpirationDate: function (curDate, daysActive) {
            var expirationDate = resources.dateAddDays(curDate, daysActive);
            var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            var year = expirationDate.getYear();
            if (year < 2000) year += 1900;
            return days[expirationDate.getDay()] + ' ' + resources.stringPadLeft((expirationDate.getMonth() + 1) + '', 2, '0') + '.' + resources.stringPadLeft(expirationDate.getDate() + '', 2, '0') + '.' + year + ' at 11:59PM PST';
        },

        getCalendarDate: function (abbreviatedMonths) {
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            if (abbreviatedMonths) months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

            var now = new Date();
            var monthnumber = now.getMonth();
            var monthname = months[monthnumber];
            var monthday = now.getDate();
            var year = now.getYear();
            if (year < 2000) { year = year + 1900; }
            var dateString = monthname +
                            ' ' +
                            monthday +
                            ' ' +
                            year;
            return dateString;
        },

        getClockTime: function () {
            var now = new Date();
            var hour = now.getHours();
            var minute = now.getMinutes();
            var second = now.getSeconds();
            var ap = "AM";
            if (hour > 11) { ap = "PM"; }
            if (hour > 12) { hour = hour - 12; }
            if (hour == 0) { hour = 12; }
            if (hour < 10) { hour = "0" + hour; }
            if (minute < 10) { minute = "0" + minute; }
            if (second < 10) { second = "0" + second; }
            var timeString = hour +
                            ':' +
                            minute +
                            ':' +
                            second +
                            " " +
                            ap;
            return timeString;
        },

        extractFilenameFromPath: function (str) {
            var pathSeparator = '\\';
            if (resources.stringContains(str, '/')) pathSeparator = '/';
            var pathArr = str.split(pathSeparator);
            if (pathArr.length > 1) return resources.stringTrim(pathArr[pathArr.length - 1]);
            else return str;
        },

        getTimer: function () {
            return { startTime: new Date().getTime(), reset: function () { this.startTime = new Date().getTime(); }, elapsedTime: function () { return new Date().getTime() - this.startTime; } };
        },

        // scales the image by (float) scale < 1
        // returns a canvas containing the scaled image.
        downScaleImage: function (img, scale) {
            var imgCV = document.createElement('canvas');
            imgCV.width = img.width;
            imgCV.height = img.height;
            var imgCtx = imgCV.getContext('2d');
            imgCtx.drawImage(img, 0, 0);
            return resources.downScaleCanvas(imgCV, scale);
        },

        // scales the canvas by (float) scale < 1
        // returns a new canvas containing the scaled image.
        downScaleCanvas: function (cv, scale) {
            if (!(scale < 1) || !(scale > 0)) throw ('scale must be a positive number <1 ');
            var sqScale = scale * scale; // square scale = area of source pixel within target
            var sw = cv.width; // source image width
            var sh = cv.height; // source image height
            var tw = Math.floor(sw * scale); // target image width
            var th = Math.floor(sh * scale); // target image height
            // EDIT (credits to @Enric ) : was ceil before, and creating artifacts :  
            //                           var tw = Math.ceil(sw * scale); // target image width
            //                           var th = Math.ceil(sh * scale); // target image height
            var sx = 0, sy = 0, sIndex = 0; // source x,y, index within source array
            var tx = 0, ty = 0, yIndex = 0, tIndex = 0; // target x,y, x,y index within target array
            var tX = 0, tY = 0; // rounded tx, ty
            var w = 0, nw = 0, wx = 0, nwx = 0, wy = 0, nwy = 0; // weight / next weight x / y
            // weight is weight of current source point within target.
            // next weight is weight of current source point within next target's point.
            var crossX = false; // does scaled px cross its current px right border ?
            var crossY = false; // does scaled px cross its current px bottom border ?
            var sBuffer = cv.getContext('2d').getImageData(0, 0, sw, sh).data; // source buffer 8 bit rgba
            var tBufferLen = 3 * sw * sh;
            var tBufferLenSplit = Math.ceil(tBufferLen / 2);
            var tBuffer1 = new Float32Array(tBufferLenSplit); // target buffer Float32 rgb
            var tBuffer2 = new Float32Array(tBufferLenSplit); // target buffer Float32 rgb
            var sR = 0, sG = 0, sB = 0; // source's current point r,g,b

            for (sy = 0; sy < sh; sy++) {
                ty = sy * scale; // y src position within target
                tY = 0 | ty;     // rounded : target pixel's y
                yIndex = 3 * tY * tw;  // line index within target array
                crossY = (tY != (0 | ty + scale));
                if (crossY) { // if pixel is crossing botton target pixel
                    wy = (tY + 1 - ty); // weight of point within target pixel
                    nwy = (ty + scale - tY - 1); // ... within y+1 target pixel
                }
                for (sx = 0; sx < sw; sx++, sIndex += 4) {
                    tx = sx * scale; // x src position within target
                    tX = 0 | tx;    // rounded : target pixel's x
                    tIndex = yIndex + tX * 3; // target pixel index within target array
                    crossX = (tX != (0 | tx + scale));
                    if (crossX) { // if pixel is crossing target pixel's right
                        wx = (tX + 1 - tx); // weight of point within target pixel
                        nwx = (tx + scale - tX - 1); // ... within x+1 target pixel
                    }
                    sR = sBuffer[sIndex];   // retrieving r,g,b for curr src px.
                    sG = sBuffer[sIndex + 1];
                    sB = sBuffer[sIndex + 2];

                    if (!crossX && !crossY) { // pixel does not cross
                        // just add components weighted by squared scale.
                        if (tIndex < tBufferLenSplit) tBuffer1[tIndex] += sR * sqScale;
                        else tBuffer2[tIndex - tBufferLenSplit] += sR * sqScale;

                        if (tIndex + 1 < tBufferLenSplit) tBuffer1[tIndex + 1] += sG * sqScale;
                        else tBuffer2[tIndex + 1 - tBufferLenSplit] += sG * sqScale;

                        if (tIndex + 2 < tBufferLenSplit) tBuffer1[tIndex + 2] += sB * sqScale;
                        else tBuffer2[tIndex + 2 - tBufferLenSplit] += sB * sqScale;

                    } else if (crossX && !crossY) { // cross on X only
                        w = wx * scale;
                        // add weighted component for current px
                        if (tIndex < tBufferLenSplit) tBuffer1[tIndex] += sR * w;
                        else tBuffer2[tIndex - tBufferLenSplit] += sR * w;

                        if (tIndex + 1 < tBufferLenSplit) tBuffer1[tIndex + 1] += sG * w;
                        else tBuffer2[tIndex + 1 - tBufferLenSplit] += sG * w;

                        if (tIndex + 2 < tBufferLenSplit) tBuffer1[tIndex + 2] += sB * w;
                        else tBuffer2[tIndex + 2 - tBufferLenSplit] += sB * w;

                        // add weighted component for next (tX+1) px                
                        nw = nwx * scale
                        if (tIndex + 3 < tBufferLenSplit) tBuffer1[tIndex + 3] += sR * nw;
                        else tBuffer2[tIndex + 3 - tBufferLenSplit] += sR * nw;

                        if (tIndex + 4 < tBufferLenSplit) tBuffer1[tIndex + 4] += sG * nw;
                        else tBuffer2[tIndex + 4 - tBufferLenSplit] += sG * nw;

                        if (tIndex + 5 < tBufferLenSplit) tBuffer1[tIndex + 5] += sB * nw;
                        else tBuffer2[tIndex + 5 - tBufferLenSplit] += sB * nw;

                    } else if (crossY && !crossX) { // cross on Y only
                        w = wy * scale;
                        // add weighted component for current px
                        if (tIndex < tBufferLenSplit) tBuffer1[tIndex] += sR * w;
                        else tBuffer2[tIndex - tBufferLenSplit] += sR * w;

                        if (tIndex + 1 < tBufferLenSplit) tBuffer1[tIndex + 1] += sG * w;
                        else tBuffer2[tIndex + 1 - tBufferLenSplit] += sG * w;

                        if (tIndex + 2 < tBufferLenSplit) tBuffer1[tIndex + 2] += sB * w;
                        else tBuffer2[tIndex + 2 - tBufferLenSplit] += sB * w;

                        // add weighted component for next (tY+1) px                
                        nw = nwy * scale
                        if (tIndex + 3 * tw < tBufferLenSplit) tBuffer1[tIndex + 3 * tw] += sR * nw;
                        else tBuffer2[(tIndex + 3 * tw) - tBufferLenSplit] += sR * nw;

                        if (tIndex + 3 * tw + 1 < tBufferLenSplit) tBuffer1[tIndex + 3 * tw + 1] += sG * nw;
                        else tBuffer2[(tIndex + 3 * tw + 1) - tBufferLenSplit] += sG * nw;

                        if (tIndex + 3 * tw + 2 < tBufferLenSplit) tBuffer1[tIndex + 3 * tw + 2] += sB * nw;
                        else tBuffer2[(tIndex + 3 * tw + 2) - tBufferLenSplit] += sB * nw;

                    } else { // crosses both x and y : four target points involved
                        // add weighted component for current px
                        w = wx * wy;
                        if (tIndex < tBufferLenSplit) tBuffer1[tIndex] += sR * w;
                        else tBuffer2[tIndex - tBufferLenSplit] += sR * w;

                        if (tIndex + 1 < tBufferLenSplit) tBuffer1[tIndex + 1] += sG * w;
                        else tBuffer2[tIndex + 1 - tBufferLenSplit] += sG * w;

                        if (tIndex + 2 < tBufferLenSplit) tBuffer1[tIndex + 2] += sB * w;
                        else tBuffer2[tIndex + 2 - tBufferLenSplit] += sB * w;

                        // for tX + 1; tY px
                        nw = nwx * wy;
                        if (tIndex + 3 < tBufferLenSplit) tBuffer1[tIndex + 3] += sR * nw;
                        else tBuffer2[tIndex + 3 - tBufferLenSplit] += sR * nw;

                        if (tIndex + 4 < tBufferLenSplit) tBuffer1[tIndex + 4] += sG * nw;
                        else tBuffer2[tIndex + 4 - tBufferLenSplit] += sG * nw;

                        if (tIndex + 5 < tBufferLenSplit) tBuffer1[tIndex + 5] += sB * nw;
                        else tBuffer2[tIndex + 5 - tBufferLenSplit] += sB * nw;

                        // for tX ; tY + 1 px
                        nw = wx * nwy;
                        if (tIndex + 3 * tw < tBufferLenSplit) tBuffer1[tIndex + 3 * tw] += sR * nw;
                        else tBuffer2[(tIndex + 3 * tw) - tBufferLenSplit] += sR * nw;

                        if (tIndex + 3 * tw + 1 < tBufferLenSplit) tBuffer1[tIndex + 3 * tw + 1] += sG * nw;
                        else tBuffer2[(tIndex + 3 * tw + 1) - tBufferLenSplit] += sG * nw;

                        if (tIndex + 3 * tw + 2 < tBufferLenSplit) tBuffer1[tIndex + 3 * tw + 2] += sB * nw;
                        else tBuffer2[(tIndex + 3 * tw + 2) - tBufferLenSplit] += sB * nw;

                        // for tX + 1 ; tY +1 px
                        nw = nwx * nwy;
                        if (tIndex + 3 * tw + 3 < tBufferLenSplit) tBuffer1[tIndex + 3 * tw + 3] += sR * nw;
                        else tBuffer2[(tIndex + 3 * tw + 3) - tBufferLenSplit] += sR * nw;

                        if (tIndex + 3 * tw + 4 < tBufferLenSplit) tBuffer1[tIndex + 3 * tw + 4] += sG * nw;
                        else tBuffer2[(tIndex + 3 * tw + 4) - tBufferLenSplit] += sG * nw;

                        if (tIndex + 3 * tw + 5 < tBufferLenSplit) tBuffer1[tIndex + 3 * tw + 5] += sB * nw;
                        else tBuffer2[(tIndex + 3 * tw + 5) - tBufferLenSplit] += sB * nw;

                    }
                } // end for sx 
            } // end for sy

            // create result canvas
            var resCV = document.createElement('canvas');
            resCV.width = tw;
            resCV.height = th;
            var resCtx = resCV.getContext('2d');
            var imgRes = resCtx.getImageData(0, 0, tw, th);
            var tByteBuffer = imgRes.data;
            // convert float32 array into a UInt8Clamped Array
            var pxIndex = 0; //  
            for (sIndex = 0, tIndex = 0; pxIndex < tw * th; sIndex += 3, tIndex += 4, pxIndex++) {
                if (sIndex < tBufferLenSplit) tByteBuffer[tIndex] = Math.ceil(tBuffer1[sIndex]);
                else tByteBuffer[tIndex] = Math.ceil(tBuffer2[sIndex - tBufferLenSplit]);

                if (sIndex + 1 < tBufferLenSplit) tByteBuffer[tIndex + 1] = Math.ceil(tBuffer1[sIndex + 1]);
                else tByteBuffer[tIndex + 1] = Math.ceil(tBuffer2[sIndex + 1 - tBufferLenSplit]);

                if (sIndex + 2 < tBufferLenSplit) tByteBuffer[tIndex + 2] = Math.ceil(tBuffer1[sIndex + 2]);
                else tByteBuffer[tIndex + 2] = Math.ceil(tBuffer2[sIndex + 2 - tBufferLenSplit]);

                tByteBuffer[tIndex + 3] = 255;
            }
            // writing result to canvas.
            resCtx.putImageData(imgRes, 0, 0);
            return resCV;
        },

        dataURLToBlob: function (dataURL) {
            var BASE64_MARKER = ';base64,';
            if (dataURL.indexOf(BASE64_MARKER) == -1) {
                var parts = dataURL.split(',');
                var contentType = parts[0].split(':')[1];
                var raw = parts[1];

                return new Blob([raw], { type: contentType });
            }

            var parts = dataURL.split(BASE64_MARKER);
            var contentType = parts[0].split(':')[1];
            var raw = window.atob(parts[1]);
            var rawLength = raw.length;

            var uInt8Array = new Uint8Array(rawLength);

            for (var i = 0; i < rawLength; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }

            return new Blob([uInt8Array], { type: contentType });
        },

        objectRenameProperty: function (obj, oldPropName, newPropName) {
            if (oldPropName !== newPropName) {
                Object.defineProperty(obj, newPropName, Object.getOwnPropertyDescriptor(obj, oldPropName));
                delete obj[oldPropName];
            }
        },

        objectToString: function (obj) {
            var str = '';
            for (var propName in obj) {
                str += propName + ': ' + obj[propName] + '\n';
            }
            return str;
        },

        dataFieldsToObject: function (parent) {
            var dataObj = new Object();
            $('[class*=\'data-\']', parent).each(function () {
                var dataValue = resources.stringTrim($(this).val());
                if ($(this).attr('type') == 'radio') dataValue = $(this).is(':checked');
                var classNames = $(this).attr('class').split(' ');
                resources.arrayEnum($(this).attr('class').split(' '), function (className) {
                    if (resources.stringStartsWith(className, 'data-')) {
                        dataObj[resources.stringReplace(className, 'data-', '')] = dataValue;
                    }
                });
                //signupData[$(this).attr('data-id')] = $(this).val();
            });
            return dataObj;
        },

        dataFieldsValidate: function (parent, validationResetFunc, validationFailedFunc) {
            if (validationResetFunc != null) validationResetFunc();

            var errorFields = new Array();
            $('[class*=\'data-\']', parent).each(function () {
                var hasError = false;
                if ($(this).hasClass('validateRequired')) {
                    var dataValue = $(this).val();
                    if (resources.stringNullOrEmpty(dataValue)) {
                        errorFields.push($(this));
                        hasError = true;
                    }
                }
                if (!hasError && $(this).hasClass('validateEmail')) {
                    var dataValue = $(this).val();
                    if (!resources.stringNullOrEmpty(dataValue) && !resources.isValidEmail(dataValue)) {
                        errorFields.push($(this));
                        hasError = true;
                    }
                }
            });

            if (errorFields.length > 0) {
                if (validationFailedFunc != null) validationFailedFunc(errorFields);
                return false;
            }
            else return true;
        }
    };
})();