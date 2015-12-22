/*global dojo */
/*jslint browser:true,sloppy:true,nomen:true,unparam:true,plusplus:true */
/*
 | Copyright 2012 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
dojo.require("js.commonShare");

var commonShare = null;
var getTinyUrl = null;
var orientationChange = false; //variable for setting the flag on orientation
var tinyResponse; //variable for storing the response getting from tiny URL api
var tinyUrl; //variable for storing the tiny URL
var routeID; //variable to store graphics layer ID of route for sharing
var featureID; //variable to store ID for infowindow

//Refresh address container div

function RemoveChildren(parentNode) {
    if (parentNode) {
        while (parentNode.hasChildNodes()) {
            parentNode.removeChild(parentNode.lastChild);
        }
    }
}

//Remove scroll bar

function RemoveScrollBar(container) {
    if (dojo.byId(container.id + 'scrollbar_track')) {
        container.removeChild(dojo.byId(container.id + 'scrollbar_track'));
    }
}

//Trim string

String.prototype.trim = function () {
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
};

//Append "..." for a long string

String.prototype.trimString = function (len) {
    return (this.length > len) ? this.substring(0, len) + "..." : this;
};

//Display the current location of the user

function ShowMyLocation() {
    if (dojo.coords("divLayerContainer").h > 0) {
        dojo.replaceClass("divLayerContainer", "hideContainerHeight", "showContainerHeight");
        dojo.byId('divLayerContainer').style.height = '0px';
    }
    if (!isMobileDevice) {
        if (dojo.coords("divAddressHolder").h > 0) {
            dojo.replaceClass("divAddressHolder", "hideContainerHeight", "showContainerHeight");
            dojo.byId('divAddressHolder').style.height = '0px';
        }
    }
    navigator.geolocation.getCurrentPosition(

    function (position) {
        ShowProgressIndicator();
        mapPoint = new esri.geometry.Point(position.coords.longitude, position.coords.latitude, new esri.SpatialReference({
            wkid: 4326
        }));
        var graphicCollection = new esri.geometry.Multipoint(new esri.SpatialReference({
            wkid: 4326
        }));
        var bmap;
        graphicCollection.addPoint(mapPoint);
        geometryService.project([graphicCollection], map.spatialReference, function (newPointCollection) {
            for (var bMap = 0; bMap < baseMapLayers.length; bMap++) {
                if (map.getLayer(baseMapLayers[bMap].Key).visible) {
                    bmap = baseMapLayers[bMap].Key;
                }
            }
            if (!map.getLayer(bmap).fullExtent.contains(newPointCollection[0].getPoint(0))) {
                map.infoWindow.hide();
                mapPoint = null;
                selectedMapPoint = null;
                HideProgressIndicator();
                if (!isMobileDevice) {
                    HideServiceLayers();
                    WipeOutResults();
                }
                alert(messages.getElementsByTagName("geoLocation")[0].childNodes[0].nodeValue);
                return;
            }
            map.getLayer(tempGraphicsLayerId).clear();
            mapPoint = newPointCollection[0].getPoint(0);
            var ext = GetExtent(mapPoint);
            map.setExtent(ext.getExtent().expand(zoomLevel));
            var symbol = new esri.symbol.PictureMarkerSymbol(locatorSettings.LocatorMarkupSymbolPath, locatorSettings.MarkupSymbolSize.width, locatorSettings.MarkupSymbolSize.height, locatorSettings.MarkupSymbolSize.width, locatorSettings.MarkupSymbolSize.height);
            var graphic = new esri.Graphic(mapPoint, symbol, null, null);
            map.getLayer(tempGraphicsLayerId).add(graphic);
            if (!isMobileDevice) {
                WipeInResults();
                ShowProgressIndicator();
                QueryService(mapPoint);
            } else {
                CreateCarousel();
                GetServices();
            }
            HideProgressIndicator();
        });
    },

    function (error) {
        HideProgressIndicator();
        switch (error.code) {
            case error.TIMEOUT:
                alert(messages.getElementsByTagName("geolocationTimeout")[0].childNodes[0].nodeValue);
                break;
            case error.POSITION_UNAVAILABLE:
                alert(messages.getElementsByTagName("geolocationPositionUnavailable")[0].childNodes[0].nodeValue);
                break;
            case error.PERMISSION_DENIED:
                alert(messages.getElementsByTagName("geolocationPermissionDenied")[0].childNodes[0].nodeValue);
                break;
            case error.UNKNOWN_ERROR:
                alert(messages.getElementsByTagName("geolocationUnKnownError")[0].childNodes[0].nodeValue);
                break;
        }
    }, {
        timeout: 10000
    });
}

//Handle orientation change event

function orientationChanged() {
    orientationChange = true;
    if (map) {
        var timeout = (isMobileDevice && isiOS) ? 100 : 500;
        map.infoWindow.hide();
        setTimeout(function () {
            if (isMobileDevice) {
                map.reposition();
                map.resize();
                setTimeout(function () {
                    SetHeightAddressResults();
                    SetHeightSplashScreen();
                    setTimeout(function () {
                        if (mapPoint) {
                            map.setExtent(GetBrowserMapExtent(mapPoint));
                        }
                        orientationChange = false;
                    }, 300);
                    SetMblListContainer();
                }, 300);
            } else {
                setTimeout(function () {
                    if (mapPoint) {
                        map.setExtent(GetMobileMapExtent(selectedGraphic));
                    }
                    orientationChange = false;
                }, 500);
                FixBottomPanelWidth(); //function to set width of shortcut links in ipad orientation change
                if ((dojo.byId("imgToggleResults").getAttribute("state") == "maximized") && isAndroidTablet && isTablet && window.matchMedia("(orientation: landscape)").matches) {
                    if (document.activeElement.id == "txtAddress") {
                        WipeOutResults();
                    }
                }
            }
        }, timeout);
    }
}

//Set the height for the content div used in mobile devices in orientation change event

function SetContentHeight(content, heightReduced) {
    var height = map.height;
    if (height > 0) {
        dojo.byId(content).style.height = (height - heightReduced) + "px";
    }
}

//Set scroll bar when orientation is changed

function SetMblListContainer() {
    if ((dojo.byId("divListContainer").style.display) == "block") {
        SetContentHeight("divDataListContent", 60);
        CreateScrollbar(dojo.byId("divDataListContainer"), dojo.byId("divDataListContent"));
    }
    if (dojo.byId("divRepresentativeDataContainer").style.display == "block") {
        if (dojo.byId("divRepresentativeScrollContent" + selectedFieldName).style.display == "block") {
            SetContentHeight("divContent" + selectedFieldName, 80);
            SetContentHeight("divRepresentativeScrollContent" + selectedFieldName, 80);
            CreateScrollbar(dojo.byId("divRepresentativeScrollContainer" + selectedFieldName), dojo.byId("divContent" + selectedFieldName));
        }
        if (dojo.byId("divRepresentativeDataPointDetails" + selectedFieldName)) {
            if ((dojo.byId("divRepresentativeDataPointDetails" + selectedFieldName).style.display) == "block") {
                SetContentHeight("divRepresentativeDataPointDetails" + selectedFieldName, 60);
                CreateScrollbar(dojo.byId("divRepresentativeDataPointContainer" + selectedFieldName), dojo.byId('divRepresentativeDataPointDetails' + selectedFieldName));
            }
        }
        if ((dojo.byId("divDataDirectionsContainer" + selectedFieldName).style.display) == "block") {
            SetContentHeight("divRouteListContent" + selectedFieldName, 150);
            CreateScrollbar(dojo.byId("divRouteListContainer" + selectedFieldName), dojo.byId("divRouteListContent" + selectedFieldName));
        }
    }
}

//Hide splash screen container

function HideSplashScreenMessage() {
    if (dojo.isIE < 9) {
        dojo.byId("divSplashScreenContent").style.display = "none";
    }
    dojo.addClass('divSplashScreenContainer', "opacityHideAnimation");
    dojo.replaceClass("divSplashScreenContent", "hideContainer", "showContainer");
}

//Set height for splash screen

function SetHeightSplashScreen() {
    var height = (isMobileDevice) ? (dojo.window.getBox().h - 110) : (dojo.coords(dojo.byId('divSplashScreenContent')).h - 80);
    dojo.byId('divSplashContent').style.height = (height + 10) + "px";
    CreateScrollbar(dojo.byId("divSplashContainer"), dojo.byId("divSplashContent"));
}

//Handle resize browser event

function ResizeHandler() {
    if (map) {
        map.reposition();
        map.resize();
        FixBottomPanelWidth();
    }
}

//Show address container

function ShowLocateContainer() {
    dojo.byId('txtAddress').blur();
    dojo.byId("imgLocate").src = "images/locate.png";
    if (dojo.coords("divAppContainer").h > 0) {
        dojo.replaceClass("divAppContainer", "hideContainerHeight", "showContainerHeight");
        dojo.byId('divAppContainer').style.height = '0px';
    }
    if (dojo.coords("divLayerContainer").h > 0) {
        dojo.replaceClass("divLayerContainer", "hideContainerHeight", "showContainerHeight");
        dojo.byId('divLayerContainer').style.height = '0px';
    }
    if (isMobileDevice) {
        dojo.byId('divAddressContainer').style.display = "block";
        dojo.replaceClass("divAddressHolder", "showContainer", "hideContainer");
        dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultAddress");
        lastSearchString = dojo.byId("txtAddress").value.trim();
    } else {
        if (dojo.coords("divAddressHolder").h > 0) {
            dojo.replaceClass("divAddressHolder", "hideContainerHeight", "showContainerHeight");
            dojo.byId('divAddressHolder').style.height = '0px';
            dojo.byId('txtAddress').blur();
        } else {
            dojo.byId('divAddressHolder').style.height = "300px";
            dojo.replaceClass("divAddressHolder", "showContainerHeight", "hideContainerHeight");
            dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultAddress");
            lastSearchString = dojo.byId("txtAddress").value.trim();
        }
    }
    RemoveChildren(dojo.byId('tblAddressResults'));
    SetHeightAddressResults();
}

//Hide address container

function HideAddressContainer() {
    if (isMobileDevice) {
        setTimeout(function () {
            dojo.byId('divAddressContainer').style.display = "none";
        }, 500);
        dojo.replaceClass("divAddressHolder", "hideContainerHeight", "showContainerHeight");
    } else {
        dojo.replaceClass("divAddressHolder", "hideContainerHeight", "showContainerHeight");
        dojo.byId('divAddressHolder').style.height = '0px';
    }
    routeID = null;
    FeatureId = null;
}

//Set height and create scrollbar for address results

function SetHeightAddressResults() {
    var height = (isMobileDevice) ? (dojo.window.getBox().h - 50) : dojo.coords(dojo.byId('divAddressHolder')).h;
    if (height > 0) {
        dojo.byId('divAddressScrollContent').style.height = (height - ((!isTablet) ? 120 : 140)) + "px";
    }
    CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));
}

//Create the tiny URL with current extent and selected feature

function ShareLink(ext) {
    if (!commonShare) {
        commonShare = new js.CommonShare();
     }
    tinyUrl = null;
    mapExtent = GetMapExtent();
    var url = esri.urlToObject(window.location.toString());
    var urlStr;
    var group = dojo.byId("imgShare").getAttribute("selectedPod");
    if (mapPoint) {
        if (group !== "null" && group) {
            if (isMobileDevice) {
                if (routeID) {
                    urlStr = encodeURI(url.path) + "?extent=" + mapExtent + "$point=" + mapPoint.x + "," + mapPoint.y + "$selectedPod=" + group + "$routeID=" + routeID;
                } else {
                    urlStr = encodeURI(url.path) + "?extent=" + mapExtent + "$point=" + mapPoint.x + "," + mapPoint.y + "$selectedPod=" + group;
                }
            } else {
                urlStr = encodeURI(url.path) + "?extent=" + mapExtent + "$point=" + mapPoint.x + "," + mapPoint.y + "$selectedPod=" + group + "$pos=" + dojo.byId("serviceLinktdId" + group).getAttribute("position");
                if (featureID && !routeID) {
                    urlStr = encodeURI(url.path) + "?extent=" + mapExtent + "$point=" + mapPoint.x + "," + mapPoint.y + "$selectedPod=" + group + "$featureID=" + featureID + "$pos=" + dojo.byId("serviceLinktdId" + group).getAttribute("position");

                }
                if (routeID && !featureID) {
                    urlStr = encodeURI(url.path) + "?extent=" + mapExtent + "$point=" + mapPoint.x + "," + mapPoint.y + "$selectedPod=" + group + "$routeID=" + routeID + "$pos=" + dojo.byId("serviceLinktdId" + group).getAttribute("position");
                }
                if (featureID && routeID) {
                    urlStr = encodeURI(url.path) + "?extent=" + mapExtent + "$point=" + mapPoint.x + "," + mapPoint.y + "$selectedPod=" + group + "$featureID=" + featureID + "$routeID=" + routeID + "$pos=" + dojo.byId("serviceLinktdId" + group).getAttribute("position");
                }
            }
        } else {
            urlStr = encodeURI(url.path) + "?extent=" + mapExtent + "$point=" + mapPoint.x + "," + mapPoint.y;
        }
    } else {
        urlStr = encodeURI(url.path) + "?extent=" + mapExtent;
    }
     // Attempt the shrinking of the URL
    getTinyUrl = commonShare.getTinyLink(urlStr, mapSharingOptions.TinyURLServiceURL);
   
    if (ext) {
        if (dojo.coords("divLayerContainer").h > 0) {
            dojo.replaceClass("divLayerContainer", "hideContainerHeight", "showContainerHeight");
            dojo.byId('divLayerContainer').style.height = '0px';
        }
        if (!isMobileDevice) {
            if (dojo.coords("divAddressHolder").h > 0) {
                dojo.replaceClass("divAddressHolder", "hideContainerHeight", "showContainerHeight");
                dojo.byId('divAddressHolder').style.height = '0px';
            }
        }
        var cellHeight = (isMobileDevice || isTablet) ? 81 : 60;
        if (dojo.coords("divAppContainer").h > 0) {
            dojo.replaceClass("divAppContainer", "hideContainerHeight", "showContainerHeight");
            dojo.byId('divAppContainer').style.height = '0px';
        } else {
            dojo.byId('divAppContainer').style.height = cellHeight + "px";
            dojo.replaceClass("divAppContainer", "showContainerHeight", "hideContainerHeight");
        }
    }
}

//Open login page for facebook,tweet and open Email client with shared link for Email

function Share(site) {
    if (dojo.coords("divAppContainer").h > 0) {
        dojo.replaceClass("divAppContainer", "hideContainerHeight", "showContainerHeight");
        dojo.byId('divAppContainer').style.height = '0px';
    }
 // Do the share
    commonShare.share(getTinyUrl, mapSharingOptions, site);
}

//Get current map Extent
function GetMapExtent() {
    var extents = Math.round(map.extent.xmin).toString() + "," + Math.round(map.extent.ymin).toString() + "," +
                  Math.round(map.extent.xmax).toString() + "," + Math.round(map.extent.ymax).toString();
    return (extents);
}

//Get the query string value of the provided key
function GetQuerystring(key) {
    var _default;
    if (_default == null) _default = "";
    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
    var qs = regex.exec(window.location.href);
    if (qs == null)
        return _default;
    else
        return qs[1];
}

//Show progress indicator

function ShowProgressIndicator() {
    dojo.byId('divLoadingIndicator').style.display = "block";
}

//Hide progress indicator

function HideProgressIndicator() {
    dojo.byId('divLoadingIndicator').style.display = "none";
}

//Create scroll-bar

function CreateScrollbar(container, content) {
    var yMax;
    var pxLeft, pxTop, xCoord, yCoord;
    var scrollbar_track;
    var isHandleClicked = false;
    this.container = container;
    this.content = content;
    content.scrollTop = 0;
    if (dojo.byId(container.id + 'scrollbar_track')) {
        RemoveChildren(dojo.byId(container.id + 'scrollbar_track'));
        container.removeChild(dojo.byId(container.id + 'scrollbar_track'));
    }
    if (!dojo.byId(container.id + 'scrollbar_track')) {
        scrollbar_track = dojo.create('div');
        scrollbar_track.id = container.id + "scrollbar_track";
        scrollbar_track.className = "scrollbar_track";
    } else {
        scrollbar_track = dojo.byId(container.id + 'scrollbar_track');
    }

    var containerHeight = dojo.coords(container);
    if ((containerHeight.h - 6) > 0) {
        scrollbar_track.style.height = (containerHeight.h - 6) + "px";
    }
    scrollbar_track.style.right = 5 + 'px';

    var scrollbar_handle = dojo.create('div');
    scrollbar_handle.className = 'scrollbar_handle';
    scrollbar_handle.id = container.id + "scrollbar_handle";

    scrollbar_track.appendChild(scrollbar_handle);
    container.appendChild(scrollbar_track);

    if ((content.scrollHeight - content.offsetHeight) <= 5) {
        scrollbar_handle.style.display = 'none';
        scrollbar_track.style.display = 'none';
        return;
    } else {
        scrollbar_handle.style.display = 'block';
        scrollbar_track.style.display = 'block';
        scrollbar_handle.style.height = Math.max(this.content.offsetHeight * (this.content.offsetHeight / this.content.scrollHeight), 25) + 'px';
        yMax = this.content.offsetHeight - scrollbar_handle.offsetHeight;
        yMax = yMax - 5; //for getting rounded bottom of handle
        if (window.addEventListener) {
            content.addEventListener('DOMMouseScroll', ScrollDiv, false);
        }
        content.onmousewheel = function (evt) {
            console.log(content.id);
            ScrollDiv(evt);
        }
    }

    function ScrollDiv(evt) {
        evt = window.event || evt //equalize event object
        var delta = evt.detail ? evt.detail * (-120) : evt.wheelDelta //delta returns +120 when wheel is scrolled up, -120 when scrolled down
        pxTop = scrollbar_handle.offsetTop;
        var y;
        if (delta <= -120) {
            y = pxTop + 10;
            if (y > yMax) y = yMax // Limit vertical movement
            if (y < 0) y = 0 // Limit vertical movement
            scrollbar_handle.style.top = y + "px";
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
        } else {
            y = pxTop - 10;
            if (y > yMax) y = yMax // Limit vertical movement
            if (y < 0) y = 2 // Limit vertical movement
            scrollbar_handle.style.top = (y - 2) + "px";
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
        }
    }

    //Attaching events to scrollbar components
    scrollbar_track.onclick = function (evt) {
        if (!isHandleClicked) {
            evt = (evt) ? evt : event;
            pxTop = scrollbar_handle.offsetTop // Sliders vertical position at start of slide.
            var offsetY;
            if (!evt.offsetY) {
                var coords = dojo.coords(evt.target);
                offsetY = evt.layerY - coords.t;
            } else
                offsetY = evt.offsetY;
            if (offsetY < scrollbar_handle.offsetTop) {
                scrollbar_handle.style.top = offsetY + "px";
                content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
            } else if (offsetY > (scrollbar_handle.offsetTop + scrollbar_handle.clientHeight)) {
                var y = offsetY - scrollbar_handle.clientHeight;
                if (y > yMax) y = yMax // Limit vertical movement
                if (y < 0) y = 0 // Limit vertical movement
                scrollbar_handle.style.top = y + "px";
                content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
            } else {
                return;
            }
        }
        isHandleClicked = false;
    };

    //Attaching events to scrollbar components
    scrollbar_handle.onmousedown = function (evt) {
        isHandleClicked = true;
        evt = (evt) ? evt : event;
        evt.cancelBubble = true;
        if (evt.stopPropagation) evt.stopPropagation();
        pxTop = scrollbar_handle.offsetTop // Sliders vertical position at start of slide.
        yCoord = evt.screenY // Vertical mouse position at start of slide.
        document.body.style.MozUserSelect = 'none';
        document.body.style.userSelect = 'none';
        document.onselectstart = function () {
            return false;
        }
        document.onmousemove = function (evt) {
            evt = (evt) ? evt : event;
            evt.cancelBubble = true;
            if (evt.stopPropagation) evt.stopPropagation();
            var y = pxTop + evt.screenY - yCoord;
            if (y > yMax) y = yMax // Limit vertical movement
            if (y < 0) y = 0 // Limit vertical movement
            scrollbar_handle.style.top = y + "px";
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
        }
    };

    document.onmouseup = function () {
        document.body.onselectstart = null;
        document.onmousemove = null;
    };
    scrollbar_handle.onmouseout = function (evt) {
        document.body.onselectstart = null;
    };
    var startPos;
    var scrollingTimer;

    dojo.connect(container, "touchstart", function (evt) {
        touchStartHandler(evt);
    });

    dojo.connect(container, "touchmove", function (evt) {
        touchMoveHandler(evt);
    });

    dojo.connect(content, "touchstart", function (evt) {
        // Needed for iOS 8
    });

    dojo.connect(content, "touchmove", function (evt) {
        // Needed for iOS 8
    });

    //Handlers for Touch Events

    function touchStartHandler(e) {
        startPos = e.touches[0].pageY;
    }

    function touchMoveHandler(e) {
        var touch = e.touches[0];
        if (e.cancelBubble) e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
        e.preventDefault();

        var change = startPos - touch.pageY;
        if (change !== 0) {
            pxTop = scrollbar_handle.offsetTop;
            var y = pxTop + change;

            //setting scrollbar handle
            if (y > yMax) y = yMax // Limit vertical movement
            if (y < 0) y = 0 // Limit vertical movement
            scrollbar_handle.style.top = y + "px";

            //setting content position
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));

            startPos = touch.pageY;
        }
    }
}

//Clear default value

function ClearDefaultText(e) {
    var target = window.event ? window.event.srcElement : e ? e.target : null;
    if (!target) return;
    target.style.color = "#FFF";
    target.value = '';
}

//Set default value

function ReplaceDefaultText(e) {
    var target = window.event ? window.event.srcElement : e ? e.target : null;
    if (!target) return;
    else {
        ResetTargetValue(target, "defaultAddressTitle", "gray");
    }
}

//Set changed value for address

function ResetTargetValue(target, title, color) {
    if (target.value == '' && target.getAttribute(title)) {
        target.value = target.title;
        if (target.title == "") {
            target.value = target.getAttribute(title);

        }
    }
    target.style.color = color;
    lastSearchString = dojo.byId("txtAddress").value.trim();
}

//Add FeatureLayer services on map

function CreateFeatureLayerSelectionMode(featureLayerURL, featureLayerID, outFields, rendererColor, renderer, isFillColorSolid) {
    var tempLayer = new esri.layers.FeatureLayer(featureLayerURL, {
        mode: esri.layers.FeatureLayer.MODE_SELECTION,
        outFields: [outFields]
    });
    tempLayer.id = featureLayerID;
    var color;
    var symbol;
    var rederer;
    if (isFillColorSolid) {
        color = new dojo.Color([parseInt(rendererColor.substr(1, 2), 16), parseInt(rendererColor.substr(3, 2), 16), parseInt(rendererColor.substr(5, 2), 16), 0.4]);
        symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
        new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, color, 6),
        color);
        rederer = new esri.renderer.SimpleRenderer(symbol);
    }
    tempLayer.setRenderer(rederer);
    return tempLayer;
}

//Add Point FeatureLayer services on map

function CreatePointFeatureLayer(featureLayerURL, featureLayerID, outFields, rendererImage, renderer) {
    var tempLayer = new esri.layers.FeatureLayer(featureLayerURL, {
        mode: esri.layers.FeatureLayer.MODE_SELECTION,
        outFields: [outFields],
        id: featureLayerID
    });
    tempLayer.id = featureLayerID;
    if (renderer) {
        var pictureSymbol = new esri.symbol.PictureMarkerSymbol(rendererImage, 30, 30);
        var Renderer = new esri.renderer.SimpleRenderer(pictureSymbol);
        tempLayer.setRenderer(Renderer);
    }
    dojo.connect(tempLayer, "onClick", function (evtArgs) {
        if (!isMobileDevice) {
            ShowProgressIndicator();
            selectedGraphic = evtArgs.graphic.geometry;
            map.centerAt(selectedGraphic);
            setTimeout(function () {
                ShowInfoWindow(evtArgs.graphic.attributes, selectedGraphic, tempLayer, featureLayerID);
            }, 500);

            evtArgs = (evtArgs) ? evtArgs : event;
            evtArgs.cancelBubble = true;
            if (evtArgs.stopPropagation) {
                evtArgs.stopPropagation();
            }
            setTimeout(function () {
                HideProgressIndicator();
            }, 1000);
        } else {
            routeID = evtArgs.graphic.attributes[map.getLayer(featureLayerID).objectIdField];
            map.infoWindow.hide();
            if (evtArgs.stopPropagation) {
                evtArgs.stopPropagation();
            }
            ConfigureRoute(mapPoint, evtArgs.graphic.geometry);
            selectedGraphic = evtArgs.graphic.geometry;
            map.centerAt(selectedGraphic);
            if (routeLayerId) {
                DisplayMblInfo(selectedGraphic, featureLayerID, evtArgs.graphic.attributes[infoWindowHeader]);
            }
        }
    });
    return tempLayer;
}

//show info-window

function ShowInfoWindow(attributes, geometry, layer, key) {
    featureID = attributes[layer.objectIdField];
    dojo.byId("tdTitle").innerHTML = attributes[infoWindowHeader];
    selectedGraphic = geometry;

    if (!isMobileDevice) {
        if (isBrowser) {
            map.infoWindow.resize(infoPopupWidth, infoPopupHeight);
        } else {
            map.infoWindow.resize(infoPopupWidth + 95, infoPopupHeight + 30);
        }
        var screenPoint = map.toScreen(geometry);
        screenPoint.y = map.height - screenPoint.y;
        map.infoWindow.show(screenPoint);
        RemoveChildren(dojo.byId("divInfoContent"));
    } else {
        var headerData = dojo.string.substitute(attributes[infoPopupFieldsCollection[0].FieldName]).trimString(Math.round(225 / 20));
        dojo.byId("tdListHeader").innerHTML = headerData;
    }
    var table = dojo.create("table");
    if (!isMobileDevice) {
        dojo.byId("divInfoContent").appendChild(table);
    } else {
        var containerDiv = dojo.create("div");
        containerDiv.id = "divRepresentativeDataPointContainer" + key;
        dojo.byId("divRepresentativeScrollContainer" + key).appendChild(containerDiv);

        var contentDiv = dojo.create("div");
        contentDiv.id = "divRepresentativeDataPointDetails" + key;
        contentDiv.className = "divRepresentativeScrollContent";
        containerDiv.appendChild(contentDiv);
        contentDiv.appendChild(table);
        dojo.byId('divRepresentativeDataPointDetails' + key).style.display = "block";
    }
    if (!isMobileDevice) {
        table.style.paddingLeft = "10px";
        table.style.width = "95%";
    } else {
        table.style.paddingLeft = "10px";
        table.style.width = "100%";
    }
    table.style.paddingTop = "4px";
    table.cellPadding = "0";
    table.cellSpacing = "0";
    var tbody = dojo.create("tbody");
    table.appendChild(tbody);
    for (var i = 0; i < infoPopupFieldsCollection.length; i++) {
        var tr = dojo.create("tr");
        tbody.appendChild(tr);

        var tdDisplay = dojo.create("td");
        tr.appendChild(tdDisplay);
        tdDisplay.style.paddingBottom = "3px";

        var tableDisplay = dojo.create("table");
        tableDisplay.cellPadding = "0";
        tableDisplay.cellSpacing = "0";
        tdDisplay.appendChild(tableDisplay);

        var tbodyDisplay = dojo.create("tbody");
        tableDisplay.appendChild(tbodyDisplay);
        var trDisplay = dojo.create("tr");
        tbodyDisplay.appendChild(trDisplay);

        var tdDisplayText = dojo.create("td");
        tdDisplayText.vAlign = "top";
        if (!isTablet) {
            tdDisplayText.width = "120px";
        } else {
            tdDisplayText.width = "160px";
        }
        trDisplay.appendChild(tdDisplayText);
        tdDisplayText.innerHTML = infoPopupFieldsCollection[i].DisplayText;

        var tdFieldName = dojo.create("td");
        tdFieldName.vAlign = "top";

        trDisplay.appendChild(tdFieldName);

        if (attributes[infoPopupFieldsCollection[i].FieldName] == null) {
            tdFieldName.innerHTML = showNullValueAs;
        } else {
            var value = attributes[infoPopupFieldsCollection[i].FieldName].split(" ");
            if (value.length > 1) {
                tdFieldName.className = "tdBreak";
            } else {
                tdFieldName.className = "tdBreakWord";
            }
            tdFieldName.innerHTML = attributes[infoPopupFieldsCollection[i].FieldName];
            dojo.byId("menuList").style.display = "none";
            dojo.byId("goBack").style.display = "block";
            dojo.connect(dojo.byId("goBack"), "onclick", function () {
                dojo.destroy(dojo.byId("divRepresentativeDataPointContainer" + key));
                dojo.destroy("divRepresentativeDataPointDetails" + key);
                dojo.byId("tdListHeader").innerHTML = infoContent;
                dojo.byId("divRepresentativeScrollContent" + key).style.display = "block";
                if (isMobileDevice) {
                    dojo.byId('divDataDirectionsContainer' + key).style.display = "none";
                    dojo.byId("tblToggleHeader" + key).style.display = "block";
                    dojo.byId("divContent" + key).style.display = "block";
                    dojo.byId("divRepresentativeScrollContent" + key).style.display = "block";
                    SetContentHeight("divContent" + key, 80);
                    SetContentHeight("divRepresentativeScrollContent" + key, 80);
                    CreateScrollbar(dojo.byId("divRepresentativeScrollContainer" + key), dojo.byId("divContent" + key));
                } else {
                    if ((key) == selectedFieldName) {
                        dojo.byId('divDataDirectionsContainer' + key).style.display = "none";
                        dojo.byId("tblToggleHeader" + key).style.display = "block";
                        dojo.byId("divContent" + key).style.display = "block";
                        dojo.byId("divRepresentativeScrollContent" + key).style.display = "block";
                        SetContentHeight("divContent" + selectedFieldName, 80);
                        SetContentHeight("divRepresentativeScrollContent" + selectedFieldName, 80);
                        CreateScrollbar(dojo.byId("divRepresentativeScrollContainer" + key), dojo.byId("divContent" + key));
                    } else {
                        dojo.byId("tblToggleHeader" + key).style.display = "none";
                        dojo.byId("divContent" + key).style.display = "none";
                        dojo.byId("divRepresentativeScrollContent" + key).style.display = "none";
                    }
                }
                dojo.byId("goBack").style.display = "none";
                dojo.byId("getDirection").style.display = "none";
                dojo.byId("menuList").style.display = "block";
            });
            dojo.byId("getDirection").style.display = "block";
        }
    }
    if (!isMobileDevice) {
        dojo.byId("divInfoContent").style.height = (dojo.coords("divInfoWindowContainer").h) - 60 + "px";
        CreateScrollbar(dojo.byId("divInfoContainer"), dojo.byId("divInfoContent"));
    } else {
        SetContentHeight("divRepresentativeDataPointDetails" + key, 60);
        CreateScrollbar(dojo.byId("divRepresentativeDataPointContainer" + key), dojo.byId('divRepresentativeDataPointDetails' + key));
    }
}

//Hide information container

function HideInformationContainer() {
    map.infoWindow.hide();
    selectedGraphic = null;
    featureID = null;
}
