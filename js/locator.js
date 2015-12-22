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

//Get candidate results for searched address

function LocateAddress() {
    var thisSearchTime = lastSearchTime = (new Date()).getTime();
    dojo.byId("imgSearchLoader").style.display = "block";
    map.infoWindow.hide();
    selectedGraphic = null;
    RemoveChildren(dojo.byId('tblAddressResults'));
    RemoveScrollBar(dojo.byId('divAddressScrollContainer'));
    if (dojo.byId("txtAddress").value.trim() === '') {
        dojo.byId("imgSearchLoader").style.display = "none";
        dojo.byId('txtAddress').focus();
        dojo.byId("imgLocate").src = "images/locate.png";
        return;
    }
    var address = [];
    //Set text from search box as input parameter for request
    address[locatorSettings.Locators[0].LocatorParameters] = dojo.byId('txtAddress').value;
    var locator = new esri.tasks.Locator(locatorSettings.Locators[0].LocatorURL);
    locator.outSpatialReference = map.spatialReference;
    locator.addressToLocations(address, [locatorSettings.Locators[0].CandidateFields], function (candidates) {
        // Discard searches made obsolete by new typing from user
        if (thisSearchTime < lastSearchTime) {
            return;
        }
        //Callback function to fire when candidates are returned
        ShowLocatedAddress(candidates);
    },

    function (err) {
        HideProgressIndicator();
        dojo.byId("imgSearchLoader").style.display = "none";
    });

}

//Populate candidate address list in address container

function ShowLocatedAddress(candidates) {
    //Clear previous results
    RemoveChildren(dojo.byId('tblAddressResults'));
    RemoveScrollBar(dojo.byId('divAddressScrollContainer'));
    if (dojo.byId("txtAddress").value.trim() === '') {
        dojo.byId("imgSearchLoader").style.display = "none";
        dojo.byId('txtAddress').focus();
        return;
    }
    var table = dojo.byId("tblAddressResults");
    var tBody = document.createElement("tbody");
    table.appendChild(tBody);
    table.cellSpacing = 0;
    table.cellPadding = 0;

    if (candidates.length > 0) {
        var candidatesLength = 0;
        counter = 0;
        for (var i = 0; i < candidates.length; i++) {
            //Make sure the minimum match score was met
            if (candidates[i].score > locatorSettings.Locators[0].AddressMatchScore) {
                var candidate = candidates[i];
                var tempMapPoint;
                var bmap = null;
                //Create a new point geometry from candidate verticies
                tempMapPoint = new esri.geometry.Point(candidate.location.x, candidate.location.y, map.spatialReference);

                // Use the first visible basemap layer as our extents bounds
                dojo.some(baseMapLayers, function(aBmap) {
                    var layer;
                    if (aBmap.Key) {
                        layer = map.getLayer(aBmap.Key);
                        if (layer && layer.visible) {
                            bmap = layer;
                            return true;
                        }
                    }
                    return false;
                });

                // If there's a visible basemap, use it for the extents check
                if (bmap && !bmap.fullExtent.contains(tempMapPoint)) {
                    tempMapPoint = null;
                    candidatesLength++;

                } else {
                    // Screen by the list of accepted locators
                    for (var j in locatorSettings.Locators[0].LocatorFieldValues) {
                        //Test to make sure matched address was returned by a desired locator
                        if (candidates[i].attributes[locatorSettings.Locators[0].LocatorFieldName] === locatorSettings.Locators[0].LocatorFieldValues[j]) {
                            // Add the result to the display
                            counter++;
                            var tr = document.createElement("tr");
                            tBody.appendChild(tr);
                            var td1 = document.createElement("td");
                            td1.innerHTML = dojo.string.substitute(locatorSettings.Locators[0].DisplayField, candidate.attributes);
                            td1.align = "left";
                            td1.className = 'bottomborder';
                            td1.style.cursor = "pointer";
                            td1.height = 20;
                            td1.setAttribute("x", candidate.location.x);
                            td1.setAttribute("y", candidate.location.y);
                            td1.setAttribute("address", dojo.string.substitute(locatorSettings.Locators[0].DisplayField, candidate.attributes));
                            //Don't start working with geometry of candidates until someone clicks on an address
                            td1.onclick = function () {
                                dojo.byId("txtAddress").value = this.innerHTML;
                                dojo.byId('txtAddress').setAttribute("defaultAddress", this.innerHTML);
                                mapPoint = new esri.geometry.Point(this.getAttribute("x"), this.getAttribute("y"), map.spatialReference);
                                dojo.byId("txtAddress").setAttribute("defaultAddressTitle", this.innerHTML);
                                lastSearchString = dojo.byId("txtAddress").value.trim();
                                //Call external function for drawing the graphic
                                LocateAddressOnMap();
                                HideProgressIndicator();
                            };
                            tr.appendChild(td1);
                        }
                    }
                }
            }
        }
        if (counter == 0) {
            var tr = document.createElement("tr");
            tBody.appendChild(tr);
            var td1 = document.createElement("td");
            td1.align = "left";
            td1.className = 'bottomborder';
            td1.height = 20;
            td1.innerHTML = messages.getElementsByTagName("invalidSearch")[0].childNodes[0].nodeValue;
            tr.appendChild(td1);
            dojo.byId("imgSearchLoader").style.display = "none";
            return;
        }
        dojo.byId("imgSearchLoader").style.display = "none";
        SetHeightAddressResults();
    } else {
        HideProgressIndicator();
        dojo.byId("imgSearchLoader").style.display = "none";
        var tr = document.createElement("tr");
        tBody.appendChild(tr);
        var td1 = document.createElement("td");
        td1.innerHTML = messages.getElementsByTagName("invalidSearch")[0].childNodes[0].nodeValue;
        td1.align = "left";
        td1.className = 'bottomborder';
        td1.height = 20;
        tr.appendChild(td1);
    }
}

//Locate searched address on map with pushpin graphic

function LocateAddressOnMap() {
    //Clear old graphics
    map.getLayer(tempGraphicsLayerId).clear();
    HideServiceLayers();
    map.infoWindow.hide();
    selectedGraphic = null;
    newLeft = 0;
    if (!isMobileDevice) {
        dojo.byId("divCarouselDataContent").style.left = "0px";
        ResetSlideControls();
    }
    //Set symbology from configuration file
    var symbol = new esri.symbol.PictureMarkerSymbol(locatorSettings.LocatorMarkupSymbolPath, locatorSettings.MarkupSymbolSize.width, locatorSettings.MarkupSymbolSize.height, locatorSettings.MarkupSymbolSize.width, locatorSettings.MarkupSymbolSize.height);
    //mapPoint was defined with candidate geometry in ShowLocatedAddress() function above
    var graphic = new esri.Graphic(mapPoint, symbol, null, null);
    map.getLayer(tempGraphicsLayerId).add(graphic);
    HideAddressContainer();
    //Center and zoom on the new point
    map.setLevel(zoomLevel);
    map.centerAt(mapPoint);
    if (!isMobileDevice) {
        WipeInResults();
        ShowProgressIndicator();
        QueryService(mapPoint);
    } else {
        CreateCarousel();
        GetServices();
    }
}

//Get the extent based on the map point

function GetExtent(point) {
    var xmin = point.x;
    var ymin = (point.y) - 30;
    var xmax = point.x;
    var ymax = point.y;
    return new esri.geometry.Extent(xmin, ymin, xmax, ymax, map.spatialReference);
}

//Query the features while sharing infowindow

function ExecuteQueryTask() {
    ShowProgressIndicator();
    var queryTask = new esri.tasks.QueryTask(services[window.location.toString().split("$point=")[1].split("$selectedPod=")[1].split("$featureID=")[0]].ServiceUrl);
    var query = new esri.tasks.Query;
    query.outSpatialReference = map.spatialReference;
    query.where = map.getLayer(window.location.toString().split("$point=")[1].split("$selectedPod=")[1].split("$featureID=")[0]).objectIdField + "=" + featureID;
    query.outFields = ["*"];
    query.returnGeometry = true;
    queryTask.execute(query, function (fset) {
        if (fset.features.length > 0) {
            ShowInfoWindow(fset.features[0].attributes, fset.features[0].geometry, map.getLayer(window.location.toString().split("$point=")[1].split("$selectedPod=")[1].split("$featureID=")[0]), window.location.toString().split("$point=")[1].split("$selectedPod=")[1].split("$featureID=")[0]);
        }
        HideProgressIndicator();
    },

    function (err) {
        HideProgressIndicator();
        alert(err.Message);
    });
}

//Query the features while sharing route

function ExecuteRouteQueryTask() {
    ShowProgressIndicator();
    var queryTask = new esri.tasks.QueryTask(services[window.location.toString().split("$point=")[1].split("$selectedPod=")[1].split("$routeID=")[0]].ServiceUrl);
    var query = new esri.tasks.Query;
    query.outSpatialReference = map.spatialReference;
    query.where = map.getLayer(window.location.toString().split("$point=")[1].split("$selectedPod=")[1].split("$routeID=")[0]).objectIdField + "=" + routeID;
    query.outFields = ["*"];
    query.returnGeometry = true;
    queryTask.execute(query, function (fset) {
        if (fset.features.length > 0) {
            ShowRouteServices(window.location.toString().split("$point=")[1].split("$selectedPod=")[1].split("$routeID=")[0], map.getLayer(window.location.toString().split("$point=")[1].split("$selectedPod=")[1].split("$routeID=")[0]), fset.features[0].attributes, fset.features[0].geometry, services[window.location.toString().split("$point=")[1].split("$selectedPod=")[1].split("$routeID=")[0]], true);
            if (isMobileDevice) {
                ShowMblRouteService(window.location.toString().split("$point=")[1].split("$selectedPod=")[1].split("$routeID=")[0], fset.features[0].geometry, fset.features[0].attributes['FacilitySitePoint.NAME']);
            }
        }
        HideProgressIndicator();
    },

    function (err) {
        HideProgressIndicator();
        alert(err.Message);
    });
}

//Query the features while sharing route with infowindow

function ExecuteRouteFeatureQueryTask() {
    ShowProgressIndicator();
    var queryTask = new esri.tasks.QueryTask(services[window.location.toString().split("$point=")[1].split("$selectedPod=")[1].split("$featureID=")[0].split("$routeID=")[0]].ServiceUrl);
    var query = new esri.tasks.Query;
    query.outSpatialReference = map.spatialReference;
    query.where = map.getLayer(window.location.toString().split("$point=")[1].split("$selectedPod=")[1].split("$featureID=")[0].split("$routeID=")[0]).objectIdField + "=" + routeID;
    query.outFields = ["*"];
    query.returnGeometry = true;
    queryTask.execute(query, function (fset) {
        if (fset.features.length > 0) {
            ShowRouteServices(window.location.toString().split("$point=")[1].split("$selectedPod=")[1].split("$featureID=")[0].split("$routeID=")[0], map.getLayer(window.location.toString().split("$point=")[1].split("$selectedPod=")[1].split("$featureID=")[0].split("$routeID=")[0]), fset.features[0].attributes, fset.features[0].geometry, services[window.location.toString().split("$point=")[1].split("$selectedPod=")[1].split("$featureID=")[0].split("$routeID=")[0]], true);
        }
        featureID = window.location.toString().split("$point=")[1].split("$selectedPod=")[1].split("$featureID=")[1].split("$routeID")[0];
        ExecuteQueryTask();
        HideProgressIndicator();
    },

    function (err) {
        HideProgressIndicator();
        alert(err.Message);
    });
}
