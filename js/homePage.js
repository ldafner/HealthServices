/*global */
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
dojo.require("dojo.date.locale");
dojo.require("dojo.window");
dojo.require("dojo.number");
dojo.require("esri.map");
dojo.require("esri.tasks.geometry");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.tasks.query");
dojo.require("esri.tasks.locator");
dojo.require("esri.tasks.route");
dojo.require("js.Config");
dojo.require("js.date");
dojo.require("mobile.InfoWindow");

/*Global variables*/
var map; //variable to store map object
var isBrowser = false; //This variable is set to true when the app is running on desktop browsers
var isiOS = false; //flag set for ios devices(ipad, iphone)
var isMobileDevice = false; //This variable is set to true when the app is running on mobile device
var isTablet = false; //This variable is set to true when the app is running on tablets
var isAndroidTablet = false; //This variable will be set to 'true' when application is accessed from android tablet device
var baseMapLayers; //Variable for storing base map layers
var fontSize; //variable for storing font sizes for all devices.
var infoBoxWidth; //variable to store the width of the carousel pod
var mapPoint; //variable to store map point
var selectedGraphic = null; //variable to store selected graphics
var mapSharingOptions; //variable for storing the tiny service URL
var geometryService; //variable to store the Geometry service
var messages; //variable used for storing the error messages
var showNullValueAs; //variable to store the default value for replacing null values
var tempGraphicsLayerId = 'tempGraphicsLayerID'; //variable to store graphics layer ID
var services; //variable to store services from the config file
var numberOfServices = 0; //number of services
var routeParams; // variable for storing the route parameters
var routeLayerId = "routeLayerId"; //variable to store graphics layer ID for routing
var routeSymbol; //Symbol to mark the route.
var routeTask; //Route Task to find the route.
var routeLayer; //variable for storing the particular layer id when you click on directions button
var rendererColor; //variable to set renderer color
var referenceOverlayLayer; //variable to store the reference overlay layer
var intervalIDs = []; //Array of IntervalID of glow-effect.
var highlightPollLayerId = "highlightPollLayerId"; //Graphics layer object for displaying selected service
var infoPopupFieldsCollection; //variable to Set the content to be displayed on the info-Popup
var infoWindowHeader; //variable used to store the info window header
var searchforDirections; //variable used to store directions to be displayed on map
var locatorSettings; //variable used to store address search setting
var firstClick = true; //check for the first click on the map used in order to destroy the Dom elements
var selectedMapPoint; // variable to store selected map point
var lastSearchTime; //variable for store the time of last search
var stagedSearch; //variable for store the time limit for search
var lastSearchString; //variable for store the last search string
var infoPopupHeight; //variable used for storing the info window height
var shareFlag = false; //variable to store sharing flag
var infoPopupWidth; //variable used for storing the info window width
var zoomLevel; //variable to set required zoom level.
var rippleSize; //variable to set ripple Size
var callOutAddress; //variable to set Address to be displayed on mobile callout.
var featureLayerID; //variable to store ID for feature layer
var startExtent; //variable to store current extent of map
var selectedFieldName;

//This initialization function is called when the DOM elements are ready

function Init() {
    esriConfig.defaults.io.timeout = 180000; //esri request timeout value
    var userAgent = window.navigator.userAgent; //used to detect the type of devices
    if (userAgent.indexOf("iPhone") >= 0 || userAgent.indexOf("iPad") >= 0) {
        isiOS = true;
    }
    if ((userAgent.indexOf("Android") >= 0 && userAgent.indexOf("Mobile") >= 0) || userAgent.indexOf("iPhone") >= 0) {
        fontSize = 15;
        isMobileDevice = true;
        dojo.byId('dynamicStyleSheet').href = "styles/mobile.css";
    } else if ((userAgent.indexOf("iPad") >= 0) || (userAgent.indexOf("Android") >= 0)) {
        isAndroidTablet = navigator.userAgent.indexOf("Android") >= 0;
        fontSize = 14;
        isTablet = true;
        dojo.byId('dynamicStyleSheet').href = "styles/tablet.css";
    } else {
        fontSize = 11;
        isBrowser = true;
        dojo.byId('dynamicStyleSheet').href = "styles/browser.css";
    }
    ShowProgressIndicator();
    dojo.byId("divSplashContent").style.fontSize = fontSize + "px";
    var eventFired = false;
    var responseObject = new js.Config();
    Initialize(responseObject);
    // Identify the key presses while implementing auto-complete and assign appropriate actions
    dojo.connect(dojo.byId("txtAddress"), 'onkeyup', function (evt) {
        if (evt) {
            var keyCode = evt.keyCode;
            if (keyCode == dojo.keys.ENTER) {
                if (dojo.byId("txtAddress").value.trim() != '') {
                    dojo.byId("imgSearchLoader").style.display = "block";
                    LocateAddress();
                    return;
                }
            }
            if ((!((keyCode >= 46 && keyCode < 58) || (keyCode > 64 && keyCode < 91) || (keyCode > 95 && keyCode < 106) || keyCode == 8 || keyCode == 110 || keyCode == 188)) || (keyCode == 86 && evt.ctrlKey) || (keyCode == 88 && evt.ctrlKey)) {
                evt = (evt) ? evt : event;
                evt.cancelBubble = true;
                if (evt.stopPropagation) evt.stopPropagation();
                return;
            }
            if (dojo.coords("divAddressHolder").h > 0) {
                if (dojo.byId("txtAddress").value.trim() != '') {
                    if (lastSearchString !== dojo.byId("txtAddress").value.trim()) {
                        lastSearchString = dojo.byId("txtAddress").value.trim();
                        RemoveChildren(dojo.byId('tblAddressResults'));
                        // Clear any staged search
                        clearTimeout(stagedSearch);
                        if (dojo.byId("txtAddress").value.trim().length > 0) {
                            // Stage a new search, which will launch if no new searches show up
                            // before the timeout
                            stagedSearch = setTimeout(function () {
                                dojo.byId("imgSearchLoader").style.display = "block";
                                LocateAddress();
                                lastSearchString = dojo.byId("txtAddress").value.trim();
                            }, 500);
                        }
                    }
                } else {
                    lastSearchString = dojo.byId("txtAddress").value.trim();
                    dojo.byId("imgSearchLoader").style.display = "none";
                    dojo.empty(dojo.byId('tblAddressResults'));
                    RemoveScrollBar(dojo.byId('divAddressScrollContainer'));
                }
            }
        }
    });
    dojo.connect(dojo.byId("txtAddress"), 'onfocus', function (evt) {
        if ((dojo.byId("imgToggleResults").getAttribute("state") == "maximized") && isAndroidTablet && isTablet && window.matchMedia("(orientation: landscape)").matches) {
            WipeOutResults();
        }
    });

    dojo.connect(dojo.byId("imgLocate"), 'onclick', function (evt) {

        if (dojo.byId('txtAddress').value.trim() == "") {
            alert(messages.getElementsByTagName("addressToLocate")[0].childNodes[0].nodeValue);
            dojo.byId("imgLocate").src = "images/locate.png";
            return;
        }
        LocateAddress();

    });

    if (!Modernizr.geolocation) {
        dojo.byId("tdGeolocation").style.display = "none"; //geo location icon is made invisible for the non supported browsers
    }

}

//This function is called at the initialize state

function Initialize(responseObject) {
    esri.config.defaults.io.proxyUrl = responseObject.ProxyURL;
    esriConfig.defaults.io.alwaysUseProxy = false;
    esri.addProxyRule({
        urlPrefix: responseObject.RouteServiceURL,
        proxyUrl: responseObject.ProxyURL
    });
    esri.addProxyRule({
        urlPrefix: responseObject.GeometryService,
        proxyUrl: responseObject.ProxyURL
    });

    if (isMobileDevice) {
        dojo.replaceClass("divAddressHolder", "hideContainer", "hideContainerHeight");
        dojo.byId('divAddressContainer').style.display = "none";
        dojo.removeClass(dojo.byId('divAddressContainer'), "hideContainerHeight");
        dojo.byId('divSplashScreenContent').style.width = "95%";
        dojo.byId('divSplashScreenContent').style.height = "95%";
        dojo.byId("divLogo").style.display = "none";
        dojo.byId("lblAppName").style.display = "none";
        dojo.byId("lblAppName").style.width = "80%";

        // Create the mobile list programmatically because info windows won't
        // work in IE 11 if dojox.mobile is included
        require(["dojox/mobile", "dojox/mobile/parser"], function () {
            new dojox.mobile.EdgeToEdgeList({
                id: "listContainer",
                select: "single"
            }, "listContainer").startup();
        });
    } else {
        var imgBasemap = dojo.create('img');
        imgBasemap.src = "images/imgBaseMap.png";
        imgBasemap.className = "imgOptions";
        imgBasemap.title = "Switch Basemap";
        imgBasemap.id = "imgBaseMap";
        imgBasemap.style.cursor = "pointer";
        imgBasemap.onclick = function () {
            ShowBaseMaps();
        };
        dojo.byId("tdBaseMap").appendChild(imgBasemap);
        dojo.byId("tdBaseMap").className = "tdHeader";
        dojo.byId('divSplashScreenContent').style.width = "350px";
        dojo.byId('divSplashScreenContent').style.height = "290px";
        dojo.byId('divAddressContainer').style.display = "block";
        dojo.byId("divLogo").style.display = "block";
    }
    infoBoxWidth = responseObject.InfoBoxWidth;
    dojo.byId('imgApp').src = responseObject.ApplicationIcon;
    dojo.byId("lblAppName").innerHTML = responseObject.ApplicationName;
    dojo.byId('divSplashContent').innerHTML = responseObject.SplashScreenMessage;

    dojo.xhrGet({
        url: "ErrorMessages.xml",
        handleAs: "xml",
        preventCache: true,
        load: function (xmlResponse) {
            messages = xmlResponse;
        }
    });

    var infoWindow = new mobile.InfoWindow({
        domNode: dojo.create("div", null, dojo.byId("map"))
    });
    map = new esri.Map("map", {
        slider: true,
        infoWindow: infoWindow
    });

    ShowProgressIndicator();
    geometryService = new esri.tasks.GeometryService(responseObject.GeometryService);
    baseMapLayers = responseObject.BaseMapLayers;
    mapSharingOptions = responseObject.MapSharingOptions;
    showNullValueAs = responseObject.ShowNullValueAs;
    services = responseObject.Services;
    searchforDirections = responseObject.SearchforDirections;
    if (searchforDirections) {
        routeTask = new esri.tasks.RouteTask(responseObject.RouteServiceURL);
    }
    rendererColor = responseObject.RendererColor;
    rippleSize = responseObject.RippleSize;
    referenceOverlayLayer = responseObject.ReferenceOverlayLayer;
    infoPopupFieldsCollection = responseObject.InfoPopupFieldsCollection;
    infoWindowHeader = responseObject.InfoWindowHeader;
    infoPopupWidth = responseObject.InfoPopupWidth;
    infoPopupHeight = responseObject.InfoPopupHeight;
    callOutAddress = responseObject.CallOutAddress;
    locatorSettings = responseObject.LocatorSettings;
    zoomLevel = responseObject.ZoomLevel;
    dojo.connect(routeTask, "onSolveComplete", ShowRoute);
    dojo.connect(routeTask, "onError", ErrorHandler);
    routeSymbol = new esri.symbol.SimpleLineSymbol().setColor(responseObject.RouteColor).setWidth(responseObject.RouteWidth);
    CreateBaseMapComponent();
    if (!isMobileDevice) {
        CreateCarousel();
    }
    dojo.connect(map, "onLoad", function () {
        dojo.byId("divInfowindowContent").style.display = "block";
        var zoomExtent;
        var url = esri.urlToObject(window.location.toString().replace(/\$/g, "&"));
        if (url.query && url.query.extent){
           zoomExtent = url.query.extent.split(',');
        } else { 
            zoomExtent = responseObject.DefaultExtent.split(",");
        }
        MapInitFunction();
        if (url.query && url.query.point){
            var wlDecodePoint = url.query.point.split(',');
            mapPoint = new esri.geometry.Point(wlDecodePoint[0], wlDecodePoint[1], map.spatialReference);
        
            if (url.query && url.query.selectedPod){
                shareFlag = true;
            }  
            if (isMobileDevice) {
                CreateCarousel();
            }            
            GetServices(mapPoint, true);
        }
      
        startExtent = new esri.geometry.Extent(parseFloat(zoomExtent[0]), parseFloat(zoomExtent[1]), parseFloat(zoomExtent[2]), parseFloat(zoomExtent[3]), map.spatialReference);
        map.setExtent(startExtent);

    });

    dojo.connect(map, "onExtentChange", function (evt) {
        if (dojo.coords("divAppContainer").h > 0) {
            ShareLink(false);
        }
        if (selectedGraphic) {
            var screenPoint = map.toScreen(selectedGraphic);
            screenPoint.y = map.height - screenPoint.y;
            setTimeout(function () {
                map.infoWindow.setLocation(screenPoint);
            }, 700);
            return;
        }
    });

    dojo.byId("tdSearchAddress").innerHTML = responseObject.LocatorSettings.Locators[0].DisplayText;
    dojo.byId("txtAddress").setAttribute("defaultAddress", responseObject.LocatorSettings.Locators[0].DefaultValue);
    dojo.byId('txtAddress').value = responseObject.LocatorSettings.Locators[0].DefaultValue;
    lastSearchString = dojo.byId("txtAddress").value.trim();
    dojo.byId("txtAddress").setAttribute("defaultAddressTitle", responseObject.LocatorSettings.Locators[0].DefaultValue);
    dojo.byId("txtAddress").style.color = "gray";
    dojo.connect(dojo.byId('txtAddress'), "ondblclick", ClearDefaultText);
    dojo.connect(dojo.byId('txtAddress'), "onfocus", function () {
        this.style.color = "#FFF";
    });
    dojo.connect(dojo.byId('txtAddress'), "onblur", ReplaceDefaultText);

    dojo.connect(dojo.byId('imgHelp'), "onclick", function () {

        window.open(responseObject.HelpURL);
    });
}

//initialize map

function MapInitFunction() {
    if (dojo.query('.logo-med', dojo.byId('map')).length > 0) {
        dojo.query('.logo-med', dojo.byId('map'))[0].id = "imgesriLogo";
    } else if (dojo.query('.logo-sm', dojo.byId('map')).length > 0) {
        dojo.query('.logo-sm', dojo.byId('map'))[0].id = "imgesriLogo";
    }
    dojo.addClass("imgesriLogo", "esriLogo");
    var gLayer = new esri.layers.GraphicsLayer();
    gLayer.id = tempGraphicsLayerId;
    map.addLayer(gLayer);

    gLayer = new esri.layers.GraphicsLayer();
    gLayer.id = highlightPollLayerId;
    map.addLayer(gLayer);

    routeParams = new esri.tasks.RouteParameters();
    routeParams.stops = new esri.tasks.FeatureSet();
    routeParams.returnRoutes = false;
    routeParams.returnDirections = true;
    routeParams.directionsLengthUnits = esri.Units.MILES;
    routeParams.outSpatialReference = map.spatialReference;

    routeLayer = new esri.layers.GraphicsLayer();
    routeLayer.id = routeLayerId;
    map.addLayer(routeLayer);

    dojo.byId('divSplashScreenContainer').style.display = "block";
    dojo.replaceClass("divSplashScreenContent", "showContainer", "hideContainer");
    SetHeightSplashScreen();

    if (referenceOverlayLayer.DisplayOnLoad) {
        var overlaymap;
        var layerType = referenceOverlayLayer.ServiceUrl.substring(((referenceOverlayLayer.ServiceUrl.lastIndexOf("/")) + 1), (referenceOverlayLayer.ServiceUrl.length));
        if (!isNaN(layerType)) {
            overlaymap = new esri.layers.FeatureLayer(referenceOverlayLayer.ServiceUrl, {
                mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
                outFields: ["*"]
            });
            map.addLayer(overlaymap);
        } else {
            var url1 = referenceOverlayLayer.ServiceUrl + "?f=json";
            esri.request({
                url: url1,
                handleAs: "json",
                load: function (data) {
                    if (!data.singleFusedMapCache) {
                        var imageParameters = new esri.layers.ImageParameters();
                        //Takes a URL to a non cached map service.
                        overlaymap = new esri.layers.ArcGISDynamicMapServiceLayer(referenceOverlayLayer.ServiceUrl, {
                            "imageParameters": imageParameters
                        });
                        map.addLayer(overlaymap);
                    } else {
                        overlaymap = new esri.layers.ArcGISTiledMapServiceLayer(referenceOverlayLayer.ServiceUrl);
                        map.addLayer(overlaymap);
                    }
                }
            });
        }
    }
    window.onresize = function () {
        if (!isMobileDevice) {
            ResizeHandler();
            ResetSlideControls();
        } else {
            orientationChanged();
        }
    };
    HideProgressIndicator();
    if (!isMobileDevice) {
        dojo.connect(map, "onClick", "GetServices");
    } else {
        dojo.connect(map, "onClick", function (evt) {

            map.infoWindow.hide();
            mapPoint = null;
            selectedGraphic = null;
            CreateCarousel();
            GetServices(evt);
        });
    }
    for (var i in services) {
        if (services[i].LayerVisibility) {
            var featureLayer;
            if (!services[i].distance) {
                featureLayer = CreateFeatureLayerSelectionMode(services[i].ServiceUrl, i, '*', services[i].Color, services[i].HasRendererImage, services[i].isRendererColor);
            } else {
                featureLayer = CreatePointFeatureLayer(services[i].ServiceUrl, i, '*', services[i].Image, services[i].HasRendererImage);
            }
            map.addLayer(featureLayer);
        }
    }
}

//Get services on map

function GetServices(evt, share) {
    newLeft = 0;
    if (!isMobileDevice) {
        dojo.byId("divCarouselDataContent").style.left = "0px";
        ResetSlideControls();
        map.infoWindow.hide();
        mapPoint = null;
        selectedGraphic = null;
    } else {
        if (!firstClick) {
            RemoveChildren(dojo.byId('divRepresentativeDataContainer'));
            dojo.byId('goBack').style.display = "none";
            dojo.byId('getDirection').style.display = "none";
            for (var i in services) {
                var thisDijit = dijit.byNode(dojo.byId("li_" + i));
                thisDijit.destroy();
            }
        }
        firstClick = false;
    }
    if (share) {
        map.getLayer(tempGraphicsLayerId).clear();
        mapPoint = new esri.geometry.Point(evt.x, evt.y, map.spatialReference);
        map.centerAndZoom(mapPoint, zoomLevel);
        SelectedPointAddress();
    } else {
        if (evt) {
            map.getLayer(tempGraphicsLayerId).clear();
            mapPoint = new esri.geometry.Point(evt.mapPoint.x, evt.mapPoint.y, map.spatialReference);
            map.centerAndZoom(mapPoint, zoomLevel);
            SelectedPointAddress();
        }
    }
    ShowProgressIndicator();
    QueryService(mapPoint);

    if (isMobileDevice) {
        CallOutAddressDisplay(evt);
        CreateListLayOut();
    }
}

//Reverse geocoding to display address in mobile mode

function CallOutAddressDisplay(evt) {
    var locator = new esri.tasks.Locator(locatorSettings.Locators[0].LocatorURL);
    if (evt) {
        locator.locationToAddress(mapPoint, 100);
    } else {
        locator.locationToAddress(mapPoint, 1);
    }
    var infoTemplate = new esri.InfoTemplate("Location", callOutAddress);
    dojo.connect(locator, "onLocationToAddressComplete", function (candidate) {
        if (candidate.address) {
            var infoData = new esri.Graphic(candidate.location, candidate.address, infoTemplate).symbol.Address;
            if (infoData !== null) {
                infoContent = dojo.string.substitute(infoData).trimString(16);
                map.infoWindow.setContent(infoContent);
                dojo.byId("tdListHeader").innerHTML = infoContent;
            } else {
                infoData = showNullValueAs;
                infoContent = dojo.string.substitute(infoData).trimString(16);
                map.infoWindow.setContent(infoContent);
                dojo.byId("tdListHeader").innerHTML = infoContent;
            }
        }
    });
}

//Reverse geocoding to get address

function SelectedPointAddress() {
    var locator = new esri.tasks.Locator(locatorSettings.Locators[0].LocatorURL);
    locator.locationToAddress(mapPoint, 100);
    dojo.connect(locator, "onLocationToAddressComplete", function (candidate) {
        if (candidate.address) {
            var symbol = new esri.symbol.PictureMarkerSymbol(locatorSettings.LocatorMarkupSymbolPath, locatorSettings.MarkupSymbolSize.width, locatorSettings.MarkupSymbolSize.height, locatorSettings.MarkupSymbolSize.width, locatorSettings.MarkupSymbolSize.height);
            var attr = [];
            if (candidate.address.Loc_name === "US_Zipcode") {
                attr = {
                    Address: candidate.address.Zip
                };
            } else {
                var address = [];
                var fields = "Address,City,State,Zip";
                for (var att = 0; att < fields.split(",").length; att++) {
                    if (candidate.address[fields.split(",")[att]]) {
                        address.push(candidate.address[fields.split(",")[att]]);
                    }
                }
                attr = {
                    Address: address.join(',')
                };
            }
            var graphic = new esri.Graphic(mapPoint, symbol, attr, null);
            map.getLayer(tempGraphicsLayerId).add(graphic);
        }
    });
}

dojo.addOnLoad(Init);
