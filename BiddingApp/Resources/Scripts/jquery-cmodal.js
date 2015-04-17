/// <reference path="jquery-1.4.4-vsdoc.js" />

var windowUpdateTimeoutID = null;

var zModalIndex = 15000;

var nextModalID = 0;
var modalDivs = new Array();
var wrapperModalDivs = new Array();
var modalCloneStates = new Array();

var heightOffset = 0;

$(window).scroll(null, function () {
    windowUpdate();
});

$(window).resize(null, function () {
    windowUpdate();
});

function setModalHeightOffset(offset) {
    heightOffset = offset;
}

function windowUpdate() {
    try {
        if (windowUpdateTimeoutID)
            clearTimeout(windowUpdateTimeoutID);

        windowUpdateTimeoutID = setTimeout(function () { handleModals(); }, 10);

    } catch (err) {
        alert(err.Message);
    }
}

function showModal(modalDiv, wrapperModalDiv, parameters, useVisibilityProperty, parentContainer) {
    try {
        var clone = parameters && parameters.clone;
        var autoHideOnExternalClick = parameters && parameters.autoHideOnExternalClick;
        var fadeIn = parameters && parameters.fadeIn;
        var fadeInSpeed = parameters && parameters.fadeInSpeed;

        if (!modalDiv)
            return;

        var $modalDiv = $(modalDiv);

        if (clone)
            $modalDiv = $modalDiv.clone(true);
        else if ($modalDiv.hasClass("cModal"))
            return;

        var modalID = ++nextModalID;

        modalCloneStates[modalID] = clone;

        var viewPortBounds = getViewPortBounds();

        var $wrapperModalDiv = null;
        if (wrapperModalDiv) {
            $wrapperModalDiv = $(wrapperModalDiv).clone(true);

            wrapperModalDivs[modalID] = $wrapperModalDiv.get();

            zModalIndex = zModalIndex + 1;

            $wrapperModalDiv.addClass("cModalContainer");
            $wrapperModalDiv.css('z-index', zModalIndex);

            $wrapperModalDiv.css("position", "fixed");
            $wrapperModalDiv.css("left", "0").css("top", "0").css("width", viewPortBounds.width).css("height", viewPortBounds.height);
            $wrapperModalDiv.css("display", "block");

            if (autoHideOnExternalClick) {
                $wrapperModalDiv.bind("click", function (e) {
                    closeModal(modalID);

                    e.stopPropagation();
                });
            }
        }

        var $modalDiv = $(modalDiv);

        if (clone)
            $modalDiv = $modalDiv.clone(true);

        $modalDiv.attr("modalID", modalID);

        $modalDiv.find(".close-reveal-modal").bind("click.cModal", function (e) {
            closeModal(modalID);
            e.stopPropagation();
        });

        var elementBounds = getElementBounds($modalDiv);

        modalDivs[modalID] = $modalDiv.get();

        zModalIndex = zModalIndex + 1;

        $modalDiv.bind("resize.cModal", function () {
            windowUpdate();
        });

        var top = viewPortBounds.y;

        if (elementBounds.height < viewPortBounds.height)
            top = top + (viewPortBounds.height - elementBounds.height) / 2;

        if (top < 0)
            top = 0;

        $modalDiv.addClass("cModal");
        $modalDiv.css("left", (viewPortBounds.width - elementBounds.width) / 2);
        $modalDiv.css("top", top);
        $modalDiv.css('z-index', zModalIndex);

        if (fadeIn) {
            if (!fadeInSpeed)
                fadeInSpeed = 500;

            $modalDiv.fadeIn(fadeInSpeed, "swing", function () {
                $modalDiv.trigger("reveal:open");
            });

        } else {
            if (useVisibilityProperty) {
                $modalDiv.css('visibility', 'visible');
                $modalDiv.css('height', 'auto');
            }
            else $modalDiv.css('display', 'block');

            $modalDiv.trigger("reveal:open");
        }

        var $body = (parentContainer == null) ? $("body") : parentContainer;
        $body.append($wrapperModalDiv);

        if (clone) {
            $body.append($modalDiv);
        }

        handleModals();
        windowUpdate();

        return $wrapperModalDiv;

    } catch (err) {
        alert("Error in showModal: " + err.Message);
    }
    return null;
}

function closeModalByElement(element, useVisibilityProperty) {
    if (!element)
        return;

    var $element = $(element);

    var modalID = $element.attr("modalID");

    if (modalID)
        closeModal(modalID, useVisibilityProperty);
}

function closeModal(modalID, useVisibilityProperty) {
    try {
        var cloned = modalCloneStates[modalID];
        var wrapperModalDiv = wrapperModalDivs[modalID];
        var modalDiv = modalDivs[modalID];

        modalCloneStates[modalID] = null;

        if (wrapperModalDiv) {
            $wrapperModalDiv = $(wrapperModalDiv);

            wrapperModalDivs[modalID] = null;

            $wrapperModalDiv.remove();
        }

        if (modalDiv) {
            $modalDiv = $(modalDiv);

            modalDivs[modalID] = null;
            $modalDiv.closeModal = null;

            $modalDiv.trigger('reveal:close');
            $modalDiv.stop(true);

            if (cloned) {
                $modalDiv.remove();
            }
            else {
                $modalDiv.unbind("resize.cModal");
                $modalDiv.find(".close-reveal-modal").unbind("click.cModal");

                if (useVisibilityProperty) {
                    $modalDiv.css('visibility', 'hidden');
                    $modalDiv.css('height', '0px');
                }
                else $modalDiv.hide();

                $modalDiv.removeClass("cModal");
                $modalDiv.removeAttr("modalID");
            }
        }

        handleModals();

    } catch (err) {
        alert("Error in closeModal: " + err.Message);
    }
}
function handleModals() {
    try {
        windowUpdateTimeoutID = null;

        $.each($(".cModalContainer:visible"), function (index, item) {
            var viewPortBounds = getViewPortBounds();
            var elementBounds = getElementBounds(item);

            var $item = $(item);

            $item.css("width", viewPortBounds.width);
            $item.css("height", viewPortBounds.height);

        });

        $.each($(".cModal:visible"), function (index, item) {
            try {
                var viewPortBounds = getViewPortBounds();
                var elementBounds = getElementBounds(item);

                var $item = $(item);

                $item.css("position", "absolute");


                var left = viewPortBounds.x + (viewPortBounds.width - elementBounds.width) / 2;

                if (left != elementBounds.x)
                    $item.css("left", left);

                var top = elementBounds.y;

                //console.log('elementBounds.height: ' + elementBounds.height);
                //console.log('elementBounds.outerHeight: ' + elementBounds.outerHeight);
                if (elementBounds.height <= viewPortBounds.height) {
                    top = viewPortBounds.y + (viewPortBounds.height - elementBounds.height) / 2;
                }
                else {
                    var moveElement = false;

                    moveElement = moveElement || elementBounds.y > viewPortBounds.y && elementBounds.bottom > viewPortBounds.bottom;
                    moveElement = moveElement || elementBounds.bottom > viewPortBounds.bottom && elementBounds.top < viewPortBounds.top;
                    moveElement = moveElement || elementBounds.y < viewPortBounds.y && elementBounds.bottom < viewPortBounds.bottom;
                    moveElement = moveElement || elementBounds.bottom > viewPortBounds.bottom && elementBounds.y > viewPortBounds.y;

                    if (moveElement) {
                        var topDiff = viewPortBounds.y - elementBounds.y;
                        var bottomDiff = viewPortBounds.bottom - elementBounds.bottom;

                        if (Math.abs(topDiff) <= Math.abs(bottomDiff))
                            top = elementBounds.y + topDiff;

                        else
                            top = elementBounds.y + bottomDiff;
                    }
                }

                if (top < 0)
                    top = 0;

                //document.title = window.pageYOffset;
                //document.title = "[View Port] Left: " + viewPortBounds.x + ", Top: " + viewPortBounds.y + ", Width: " + viewPortBounds.width + ", Height: " + viewPortBounds.height + " [Element] Left: " + elementBounds.x + ", Top: " + elementBounds.y + ", Width: " + elementBounds.width + ", Height: " + elementBounds.height;
                //document.title = "[Element] Left: " + elementBounds.x + ", Top: " + elementBounds.y + ", Width: " + elementBounds.width + ", Height: " + elementBounds.height;

                if (top != elementBounds.y) {
                    $item.stop(false, true);
                    //$item.animate({ "top": top }, { duration: 500, specialEasing: { top: "swing"} });
                    $item.animate({ "top": top }, { duration: 50, specialEasing: { top: "swing"} });
                }

                elementBounds = getElementBounds(item);

                if (elementBounds.y < 1) {
                    $item.css("top", '1px');
                }

            } catch (err) {
                alert("Error in handleModals: " + err.Message);
            }
        });
    } catch (err) {
        alert(err.Message);
    }
}

function getViewPortBounds() {
    var bounds = { x: 0, y: 0, width: 0, height: 0, bottom: 0, right: 0, centerX: 0, centerY: 0 };

    try {
        if (window.pageXOffset || window.pageYOffset) {
            bounds.x = window.pageXOffset;
            bounds.y = window.pageYOffset;

        }
        else if (document.documentElement && (document.documentElement.scrollTop || document.documentElement.scrollLeft)) {
            bounds.x = document.documentElement.scrollLeft;
            bounds.y = document.documentElement.scrollTop;
        }
        else if (document.body && (document.body.scrollTop || document.body.scrollLeft)) {
            bounds.x = document.body.scrollLeft;
            bounds.y = document.body.scrollTop;
        }


        if (window.innerWidth || window.innerHeight) {
            bounds.width = window.innerWidth;
            bounds.height = window.innerHeight;

        } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
            bounds.width = document.documentElement.clientWidth;
            bounds.height = document.documentElement.clientHeight;

        } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
            bounds.width = document.body.clientWidth;
            bounds.height = document.body.clientHeight;

        }

        bounds.height -= heightOffset;

        bounds.bottom = bounds.y + bounds.height;
        bounds.right = bounds.x + bounds.width;

        bounds.centerX = bounds.x + bounds.width / 2;
        bounds.centerY = bounds.y + bounds.height / 2;

    } catch (err) {
        alert(err.Message);
    }
    return bounds;
}

function getElementBounds(element) {
    var $item = $(element);

    var bounds = { x: 0, y: 0, width: $item.width(), height: $item.outerHeight(), bottom: 0, right: 0, centerX: 0, centerX: 0 };

    try {
        var e = element;

        while (e && !isNaN(e.offsetLeft) && !isNaN(e.offsetTop)) {
            bounds.x += e.offsetLeft;
            bounds.y += e.offsetTop;

            if ($item.css("position") == "absolute")
                break;

            e = e.parentNode;


        }

        bounds.bottom = bounds.y + bounds.height;
        bounds.right = bounds.x + bounds.width;
        bounds.centerX = bounds.x + bounds.width / 2;
        bounds.centerY = bounds.y + bounds.height / 2;
    } catch (err) {
        alert(err.Message);
    }
    return bounds;
}