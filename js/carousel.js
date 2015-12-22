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
var horizontalPosition = 0; //variable for storing the scrolling position of scrolling container
var newLeft = 0; //variable for storing the left position of the carousel content
var touchStart = false; //flag for setting the touch events
var discnt; //variable used for disconnecting the dojo connect event
var infoContent; //variable to store info content details
var counter = 0;

//Create Dom node elements for carousel and style carousel

function CreateCarousel() {
    var divDataContainer;
    if (!isMobileDevice) {
        var divToggle = dojo.create("div");
        divToggle.id = "divtoggle";
        divToggle.className = "divtoggle";
        divToggle.style.bottom = "0px";
        document.getElementsByTagName("body")[0].appendChild(divToggle);

        var tblToggle = dojo.create("table");
        tblToggle.cellSpacing = 0;
        tblToggle.cellPadding = 0;
        tblToggle.style.marginLeft = "50px";
        divToggle.appendChild(tblToggle);

        var tbodyToggle = dojo.create("tbody");
        tblToggle.appendChild(tbodyToggle);

        var trToggle = dojo.create("tr");
        tbodyToggle.appendChild(trToggle);

        var tdToggle = dojo.create("td");
        tdToggle.align = "right";
        trToggle.appendChild(tdToggle);

        var divBackground = dojo.create("div");
        divBackground.id = "divImageBackground";
        divBackground.className = "divImageBackground";
        divBackground.style.display = "none";
        tdToggle.appendChild(divBackground);

        var divImgcontainer = dojo.create("div");
        divImgcontainer.id = "divImage";
        divBackground.appendChild(divImgcontainer);

        var tblImageContainer = dojo.create("table");
        tblImageContainer.style.width = "40px";
        tblImageContainer.style.height = "100%";
        divImgcontainer.appendChild(tblImageContainer);

        var tbodyImageContainer = dojo.create("tbody");
        tblImageContainer.appendChild(tbodyImageContainer);

        var trImageContainer = dojo.create("tr");
        tbodyImageContainer.appendChild(trImageContainer);

        var tdImageContainer = dojo.create("td");
        tdImageContainer.align = "center";
        trImageContainer.appendChild(tdImageContainer);

        var imgToggle = dojo.create("img");
        imgToggle.id = "imgToggleResults";
        imgToggle.setAttribute("state", "minimized");
        imgToggle.className = "imgShare";
        imgToggle.src = "images/up.png";
        imgToggle.style.cursor = "pointer";
        imgToggle.onclick = function () {
            ShowHideResult(this);
        };
        tdImageContainer.appendChild(imgToggle);

        var divCarousel = dojo.create("div");
        divCarousel.id = "divCarouselContent";
        divCarousel.className = "divCarouselContent hideBottomContainerHeight";
        document.getElementsByTagName("body")[0].appendChild(divCarousel);

        var divTransparent = dojo.create("div");
        divTransparent.className = "transparentBackground";
        divTransparent.style.height = "250px";
        divCarousel.appendChild(divTransparent);

        var tblCarousel = dojo.create("table");
        tblCarousel.style.width = "100%";
        tblCarousel.style.height = "100%";
        divTransparent.appendChild(tblCarousel);

        var tbodyCarousel = dojo.create("tbody");
        tblCarousel.appendChild(tbodyCarousel);

        var trCarousel = dojo.create("tr");
        tbodyCarousel.appendChild(trCarousel);

        var tdCarouselContainer = dojo.create("td", {}, trCarousel);

        var tableCarouselContent = dojo.create("table", {}, tdCarouselContainer);
        tableCarouselContent.style.width = "100%";
        tableCarouselContent.style.height = "100%";

        var trContent = tableCarouselContent.insertRow(0);

        var tdLeftArrow = trContent.insertCell(0);
        tdLeftArrow.align = "left";
        tdLeftArrow.style.width = "37px";

        var divLeftArrow = dojo.create("div");
        divLeftArrow.id = "divLeftArrow";
        divLeftArrow.style.zIndex = 1000;
        divLeftArrow.style.display = "none";
        tdLeftArrow.appendChild(divLeftArrow);

        var imgLeftArrow = dojo.create("img");
        imgLeftArrow.src = "images/arrLeft.png";
        imgLeftArrow.style.cursor = "pointer";
        imgLeftArrow.style.verticalAlign = "middle";
        imgLeftArrow.className = "imgShare";
        imgLeftArrow.onclick = function () {
            SlideLeft();
        };
        divLeftArrow.appendChild(imgLeftArrow);
        var tdDataContainer = trContent.insertCell(1);
        var divDataHolder = dojo.create("div");
        divDataHolder.id = "divCarouselDataContainer";
        divDataHolder.className = "divCarouselDataContainer";
        tdDataContainer.appendChild(divDataHolder);

        divDataContainer = dojo.create("div");
        divDataContainer.id = "divCarouselDataContent";
        divDataContainer.className = "divCarouselDataContent";
        divDataHolder.appendChild(divDataContainer);
    }
    var divDataContent = dojo.create("div");
    divDataContent.style.height = "100%";
    if (!isMobileDevice) {
        divDataContainer.appendChild(divDataContent);
    } else {
        dojo.byId("listDatacontent").appendChild(divDataContent);
    }
    var tblDataContent = dojo.create("table");
    tblDataContent.style.height = "100%";
    divDataContent.appendChild(tblDataContent);

    var tbodyDataContent = dojo.create("tbody");
    tblDataContent.appendChild(tbodyDataContent);

    var trDataContent = dojo.create("tr");
    trDataContent.id = "trDataContent";
    tbodyDataContent.appendChild(trDataContent);

    var trLinkContent = dojo.create("tr");
    trLinkContent.id = "trLinkContent";
    if (!isMobileDevice) {
        tbodyCarousel.appendChild(trLinkContent);
    } else {
        dojo.byId("listDatacontent").appendChild(trLinkContent);
    }
    var tdDataLink = dojo.create("td");
    dojo.byId("trLinkContent").appendChild(tdDataLink);
    tdDataLink.style.borderTop = "1px solid white";

    var divServiceContainer = dojo.create("div");
    tdDataLink.appendChild(divServiceContainer);
    divServiceContainer.id = "divServiceContainer";
    divServiceContainer.className = "divServiceContainer";

    var divServiceContent = dojo.create("div");
    divServiceContainer.appendChild(divServiceContent);
    divServiceContent.id = "divServiceContent";
    divServiceContent.className = "divServiceContent";

    var tableLink = dojo.create("table");
    divServiceContent.appendChild(tableLink);
    tableLink.style.width = "100%";
    tableLink.style.height = "100%";

    var tBodyLink = dojo.create("tbody");
    tableLink.appendChild(tBodyLink);
    var trLink = dojo.create("tr");
    trLink.id = "trLink";
    tBodyLink.appendChild(trLink);
    if (!isMobileDevice) {
        var tdRightArrow = trContent.insertCell(2);
        tdRightArrow.align = "right";
        tdRightArrow.style.width = "37px";

        var divRightArrow = dojo.create("div");
        divRightArrow.zIndex = 1000;
        divRightArrow.style.display = "block";
        divRightArrow.id = "divRightArrow";
        tdRightArrow.appendChild(divRightArrow);

        var imgRightArrow = dojo.create("img");
        imgRightArrow.src = "images/arrRight.png";
        imgRightArrow.style.cursor = "pointer";
        imgRightArrow.style.verticalAlign = "middle";
        imgRightArrow.className = "imgShare";
        imgRightArrow.onclick = function () {
            SlideRight();
        };
        divRightArrow.appendChild(imgRightArrow);
    }
    CreateCarouselPod();
    if (!isMobileDevice) {
        dojo.connect(dojo.byId('divCarouselDataContainer'), "touchstart", function (e) {
            horizontalPosition = e.touches[0].pageX;
            touchStart = true;
        });
        dojo.connect(dojo.byId('divCarouselDataContainer'), "touchmove", function (e) {
            if (touchStart) {
                touchStart = false;
                var touch = e.touches[0];
                e.cancelBubble = true;
                if (e.stopPropagation) e.stopPropagation();
                e.preventDefault();
                if (touch.pageX - horizontalPosition >= 2) {
                    setTimeout(function () {
                        SlideLeft();
                    }, 100);
                }
                if (horizontalPosition - touch.pageX >= 2) {
                    setTimeout(function () {
                        SlideRight();
                    }, 100);
                }
            }
        });
        dojo.connect(dojo.byId('divCarouselDataContainer'), "touchend", function (e) {
            horizontalPosition = 0;
            touchStart = false;
        });
    }
}

function FixBottomPanelWidth() {
    var width = ((dojo.window.getBox().w) / numberOfServices) - 5;
    var charWidth;
    if (isBrowser) {
        charWidth = "a".getWidth(11);
    } else {
        charWidth = "a".getWidth(13.5);
    }
    var numberChar = Math.floor(width / charWidth) - 2;
    for (var i in services) {
        dojo.byId("divService" + i).style.width = width + "px";
        if (isBrowser) {
            dojo.byId("divService" + i).style.fontSize = "11px";
        } else {
            dojo.byId("divService" + i).style.fontSize = "14px";
        }
        dojo.byId("divService" + i).innerHTML = services[i].Name.trimString(numberChar);
        dojo.byId("divService" + i).title = services[i].Name;
    }
}

//Display result in carousel pods

function ShowHideResult(imgToggle) {
    if (mapPoint) {
        var layerCount = 0;
        var hiddenCount = 0;
        for (var index in services) {
            layerCount++;
            if (dojo.byId('div' + index).style.display == "none") {
                hiddenCount++;
            }
        }
        if (layerCount == hiddenCount) {
            WipeOutResults();
            alert(messages.getElementsByTagName("tinyURLEngine")[0].childNodes[0].nodeValue);
            return;
        }
        if (imgToggle.getAttribute("state") == "minimized") {
            WipeInResults(); // maximize
        } else {
            WipeOutResults(); //minimize
        }
    }
}

//Show bottom panel with Wipe-in animation

function WipeInResults() {
    dojo.byId('divImageBackground').style.display = "block";
    dojo.byId('imgToggleResults').setAttribute("state", "maximized");
    dojo.byId('imgToggleResults').title = "Hide Panel";
    dojo.byId("imgesriLogo").style.bottom = "250px";
    dojo.byId('divtoggle').style.bottom = "250px";
    dojo.byId('divCarouselContent').style.height = "250px";
    dojo.replaceClass("divCarouselContent", "hideBottomContainer", "showBottomContainer");
    dojo.byId('imgToggleResults').src = "images/down.png";
}

//Hide bottom panel with Wipe-out animation

function WipeOutResults() {
    dojo.byId('imgToggleResults').setAttribute("state", "minimized");
    dojo.byId('imgToggleResults').title = "Show Panel";
    dojo.byId("imgesriLogo").style.bottom = "0px";
    dojo.byId('divtoggle').style.bottom = "0px";
    dojo.byId('divCarouselContent').style.height = "0px";
    dojo.replaceClass("divCarouselContent", "showBottomContainer", "hideBottomContainer");
    dojo.byId('imgToggleResults').src = "images/up.png";
}

//Create information pods to display in the carousel

function CreateCarouselPod() {
    for (var i in services) {
        var tdDataContent = dojo.create("td");
        tdDataContent.id = "td" + i;
        dojo.byId("trDataContent").appendChild(tdDataContent);

        var divTemplate = dojo.create("div");
        divTemplate.className = "divDetails";
        divTemplate.style.display = "block";
        divTemplate.id = "div" + i;
        divTemplate.style.width = infoBoxWidth + "px";
        divTemplate.style.marginRight = "5.1px";
        tdDataContent.appendChild(divTemplate);

        var divHeader = dojo.create("div");
        divHeader.className = "divDetailsHeader";
        divHeader.id = "divDetailsHeader";
        divHeader.style.position = "relative";
        divTemplate.appendChild(divHeader);

        var tblHeader = dojo.create("table");
        tblHeader.style.height = "100%";
        tblHeader.style.width = "100%";
        tblHeader.cellSpacing = "0";
        tblHeader.cellPadding = "0";
        divHeader.appendChild(tblHeader);

        var tbodyHeader = dojo.create("tbody");
        tblHeader.appendChild(tbodyHeader);

        var trHeader = dojo.create("tr");
        tbodyHeader.appendChild(trHeader);

        var tdHeaderImage = dojo.create("td");
        tdHeaderImage.className = "imgCarouselHeader";
        tdHeaderImage.style.margin = "2px";
        trHeader.appendChild(tdHeaderImage);

        var serviceImages = dojo.create("img");
        serviceImages.src = services[i].Image;
        serviceImages.className = "imgCarouselHeader";
        tdHeaderImage.appendChild(serviceImages);

        var tdHeader = dojo.create("td");
        trHeader.appendChild(tdHeader);

        var spanHeader = dojo.create("span");
        spanHeader.className = "spanHeader";
        spanHeader.innerHTML = services[i].Name;
        tdHeader.appendChild(spanHeader);

        var divContentHolder = dojo.create("div");
        divContentHolder.id = "divContentHolder" + i;
        divContentHolder.className = "divContentStyle";
        divTemplate.appendChild(divContentHolder);

        var divContent = dojo.create("div");
        divContentHolder.appendChild(divContent);
        divContent.id = "divContent" + i;
        divContent.className = "divContentStyle";

        var divDirectionsContainer = dojo.create("div");
        divDirectionsContainer.id = "divDirectionsContainer" + i;
        divContentHolder.appendChild(divDirectionsContainer);

        divDirectionsContainer.className = "divContentStyle";
        divDirectionsContainer.style.display = "none";

        var divDirectionsContent = dojo.create("div");
        divDirectionsContent.id = "divDirectionsContent" + i;
        divDirectionsContainer.appendChild(divDirectionsContent);

        var br = dojo.create("br");
        divContent.appendChild(br);

        var serviceLinktd = dojo.create("td");
        serviceLinktd.setAttribute("serviceLinkId", i);
        serviceLinktd.setAttribute("position", numberOfServices);
        serviceLinktd.id = "serviceLinktdId" + i;
        numberOfServices++;
        serviceLinktd.style.borderRight = "1px solid white";
        serviceLinktd.style.fontSize = "10px";

        var divServiceLink = dojo.create("div");
        divServiceLink.id = "divService" + i;
        divServiceLink.innerHTML = services[i].Name;
        serviceLinktd.appendChild(divServiceLink);

        serviceLinktd.onclick = function (evt) {
            ShowServicePods(this, false);
        };
        dojo.byId("trLink").appendChild(serviceLinktd);
    }
    FixBottomPanelWidth();
}

//Position bottom Pods

function ShowServicePods(_this, share) {
    map.infoWindow.hide();
    selectedGraphic = null;
    var key;
    var position;
    if (share) {
        key = _this.split("$", 1)[0];
    } else {
        key = _this.getAttribute("serviceLinkId");
    }
    if (dojo.byId('div' + key).style.display == "block") {
        var hiddenContests = 0;
        for (var index in services) {
            if (index == key)
                break;
            if (dojo.byId('div' + index).style.display == "none") {
                hiddenContests++;
            }
        }
        if (share) {
            position = Number(window.location.toString().split("$pos=")[1]) - hiddenContests;
        } else {
            position = Number(_this.getAttribute("position")) - hiddenContests;
        }
        Slide(((position * (infoBoxWidth + 5)) + (position * 4.1)));
    }
    ShowServiceLayer(index);
}

//Create polygon service information

function CreateServicePolygonInfo(service, feature, key) {
    RemoveChildren(dojo.byId("divContent" + key));
    var tableInfo = dojo.create("table");
    tableInfo.id = "tableInfo" + key;
    if (!isMobileDevice) {
        tableInfo.style.marginLeft = "10px";
    } else {
        tableInfo.style.paddingLeft = "8px";
    }
    var tableInfoBody = dojo.create("tbody");
    tableInfo.appendChild(tableInfoBody);
    for (var i = 0; i < service.FieldNames.length; i++) {
        var tr = dojo.create("tr");
        tableInfoBody.appendChild(tr);

        if (service.FieldNames[i].ServiceAvailability) {
            var td = dojo.create("td");
            td.style.vAlign = "top";
            tr.appendChild(td);

            var tablePickUp = dojo.create("table");
            td.appendChild(tablePickUp);
            tablePickUp.cellSpacing = "0";
            tablePickUp.border = "1";
            tablePickUp.className = "tablePickUp";

            var tbodyPickUp = dojo.create("tbody");
            tablePickUp.appendChild(tbodyPickUp);

            var trPickUp = dojo.create("tr");
            tbodyPickUp.appendChild(trPickUp);

            for (var j = 0; j < service.FieldNames[i].ServiceAvailability.length; j++) {
                var tdPickUp = dojo.create("td");
                tdPickUp.align = "center";
                tdPickUp.style.width = "50px";
                tdPickUp.innerHTML = service.FieldNames[i].ServiceAvailability[j].DisplayText;
                trPickUp.appendChild(tdPickUp);

                if (feature.attributes[service.FieldNames[i].ServiceAvailability[j].FieldName] == "Yes") {
                    tdPickUp.style.backgroundColor = "white";
                    tdPickUp.style.color = "black";
                    tdPickUp.style.cursor = "pointer";
                    tdPickUp.onclick = function () {
                        if (isMobileDevice) {
                            dojo.byId("divListContainer").style.display = "none";
                            dojo.byId('divMobileContainerView').style.display = "none";
                            dojo.replaceClass("divMobileContainerView", "opacityShowAnimation", "opacityHideAnimation");
                            dojo.replaceClass("divMobileContainerDetails", "hideContainer", "showContainer");
                        }
                        if (!isMobileDevice) {
                            map.infoWindow.hide();
                            selectedGraphic = null;
                        }
                        ShowServiceLayer(key);
                    };
                }
            }
        } else if (service.FieldNames[i].Links) {
            var tdLink = dojo.create("td");
            tr.appendChild(tdLink);
            var tableLink = dojo.create("table");
            tableLink.cellSpacing = "0";
            tableLink.cellPadding = "0";
            tdLink.appendChild(tableLink);
            var tbodyLink = dojo.create("tbody");
            tableLink.appendChild(tbodyLink);
            var trLink = dojo.create("tr");
            tbodyLink.appendChild(trLink);
            for (var m = 0; m < service.FieldNames[i].Links.length; m++) {
                // Insert separator from previous cell at end of current row
                if(m > 0) {
                    var span = trLink.insertCell(-1);
                    span.style.borderLeft = "1px solid white";
                    span.style.paddingRight = "5px";
                }

                // Create cell for link
                var tdHref = dojo.create("td");
                tdHref.style.paddingRight = "5px";
                tdHref.style.cursor = "pointer";
                tdHref.setAttribute("web", service.FieldNames[i].Links[m].FieldName);
                tdHref.setAttribute("type", service.FieldNames[i].Links[m].DisplayText);
                tdHref.style.textDecoration = "underline";
                tdHref.onclick = function () {
                    if (this.getAttribute("type") == "Website") {
                        OpenWebSite(feature.attributes[this.getAttribute("web")]);
                    } else {
                        OpenServiceMail(feature.attributes[this.getAttribute("web")]);
                    }
                };
                trLink.appendChild(tdHref);
                tdHref.innerHTML = service.FieldNames[i].Links[m].DisplayText;
            }
        } else {
            var attribute_switch;
            var tdDisplayText = dojo.create("td");
            tr.appendChild(tdDisplayText);
            try{
                attribute_switch = dojo.string.substitute(service.FieldNames[i].Field, feature.attributes);
            }
            catch(err){
                attribute_switch = "";
            }
            tdDisplayText.innerHTML = attribute_switch
        }
    }
    dojo.byId("divContent" + key).appendChild(tableInfo);
    CreateScrollbar(dojo.byId("divContentHolder" + key), dojo.byId("divContent" + key));

}

//Create point service information

function CreateServicePointInfo(service, feature, key, distance, featureGeometry) {
    if (!isMobileDevice) {
        dojo.byId("divDirectionsContainer" + key).style.display = "none";
    }
    var tableInfo = dojo.create("table");
    tableInfo.id = "tableInfo" + key;
    if (!isMobileDevice) {
        tableInfo.style.marginLeft = "10px";
    } else {
        tableInfo.style.paddingLeft = "8px";
    }
    tableInfo.style.width = "93%";
    tableInfo.cellSpacing = "0";
    tableInfo.cellPadding = "0";
    tableInfo.style.borderBottom = "1px dashed white";

    tableInfo.setAttribute('x', featureGeometry.x);
    tableInfo.setAttribute('y', featureGeometry.y);
    tableInfo.setAttribute('layer', key);
    if (!isMobileDevice) {
        if (!isTablet) {
            tableInfo.onmouseover = function (evt) {
                if (map.getLayer(this.getAttribute('layer')).visible) {
                    GlowRipple(this, rendererColor);
                }
            };
            tableInfo.onmouseout = function (evt) {
                HideRipple();
            };
        }
    }
    var tableInfoBody = dojo.create("tbody");
    tableInfo.appendChild(tableInfoBody);
    var tr = dojo.create("tr");
    tableInfoBody.appendChild(tr);
    var td = dojo.create("td");
    td.style.paddingTop = "10px";
    tr.appendChild(td);
    var tableData = dojo.create("table");
    td.appendChild(tableData);
    tableData.style.cursor = "pointer";
    tableData.setAttribute('x', featureGeometry.x);
    tableData.setAttribute('y', featureGeometry.y);
    tableData.setAttribute('layer', key);
    if (isTablet) {
        tableData.onmouseover = function (evt) {
            if (map.getLayer(this.getAttribute('layer')).visible) {
                GlowRipple(this, rendererColor);
            }
        };
        tableData.onmouseout = function (evt) {
            HideRipple();
        };
    }
    tableData.onclick = function () {
        if (!isMobileDevice) {
            ShowProgressIndicator();
            map.infoWindow.hide();
            selectedGraphic = null;
        }
        map.centerAndZoom(new esri.geometry.Point(Number(this.getAttribute('x')), Number(this.getAttribute('y')), map.spatialReference), zoomLevel);
        ShowServiceLayer(key);
        if (!isMobileDevice) {
            setTimeout(function () {
                HideProgressIndicator();
            }, 500);
        }
    };
    var tableDataBody = dojo.create("tbody");
    tableData.appendChild(tableDataBody);

    for (var i = 0; i < service.FieldNames.length; i++) {
        var trData = dojo.create("tr");
        tableDataBody.appendChild(trData);
        tdData = dojo.create("td");
        tdData.align = "left";
        trData.appendChild(tdData);
        if (feature[service.FieldNames[i].FieldName] === null) {
            tdData.innerHTML = showNullValueAs;
        } else {
            if (i == 0) {
                tdData.innerHTML = feature[service.FieldNames[i].FieldName] + " (" + FormatDistance(distance, "miles)");
            } else {
                tdData.innerHTML = feature[service.FieldNames[i].FieldName];
            }
        }
    }
    var tdImage = dojo.create("td");
    tdImage.align = "right";
    tr.appendChild(tdImage);
    var image = dojo.create("img");

    if (!isMobileDevice) {
        if (searchforDirections) {
            var divImage = dojo.create("div", {
                "style": "display:block"
            });
        } else {
            var divImage = dojo.create("div", {
                "style": "display:none"
            });
        }
        tdImage.appendChild(divImage);
        if (isTablet) {
            divImage.onclick = function (evt) {
                HideRipple();
            };
        }
        divImage.appendChild(image);
        image.src = "images/imgDirections.png";
        image.className = "imgCarouselHeader";

        dojo.addClass(dojo.byId("divContent" + key), "fadeIn");
        dojo.addClass(dojo.byId("divDirectionsContainer" + key), "fadeIn");
        dojo.replaceClass(dojo.byId("divContent" + key), "fadeIn", "fadeOut");
        dojo.replaceClass(dojo.byId("divDirectionsContainer" + key), "fadeIn", "fadeOut");
    } else {
        var divImage = dojo.create("div");
        divImage.className = "mblListItemIcon";
        tdImage.appendChild(divImage);
        divImage.appendChild(image);
        image.src = "images/arrow.png";
    }

    image.id = 'imgDirections' + i + "$" + key;
    image.title = "Get directions";
    image.pointer = "cursor";
    image.style.cursor = "pointer";
    image.setAttribute('x', featureGeometry.x);
    image.setAttribute('y', featureGeometry.y);
    image.setAttribute('routeObjectId', feature[map.getLayer(key).objectIdField]);
    image.setAttribute('featureName', feature[service.FieldNames[0].FieldName]);
    image.onclick = function (evt) {
        ShowRouteServices(key, this, feature, featureGeometry, service, false);
    };
    dojo.byId("divContent" + key).appendChild(tableInfo);
    if (!isMobileDevice) {
        dojo.byId("divContent" + key).style.display = "block";
    }
    CreateScrollbar(dojo.byId("divContentHolder" + key), dojo.byId("divContent" + key));
}

//Show route on PC browser

function ShowRouteServices(key, _this, feature, featureGeometry, service, share) {
    RemoveScrollBar(dojo.byId("divContentHolder" + key));
    if (!isMobileDevice) {
        ShowProgressIndicator();
        map.infoWindow.hide();
        selectedGraphic = null;
        hidePreviousDirections(key);
    }
    ShowServiceLayer(key);
    routeLayer = _this.id.split("$", 2)[1];
    if (share) {
        routeLayer = key;
        var featurePoint = new esri.geometry.Point(Number(featureGeometry.x), Number(featureGeometry.y), map.spatialReference);
    } else {
        var featurePoint = new esri.geometry.Point(Number(_this.getAttribute('x')), Number(_this.getAttribute('y')), map.spatialReference);
        routeID = _this.getAttribute('routeObjectId');
    }
    if (isMobileDevice) {
        dojo.byId("divContent" + key).style.display = "none";
    } else {
        fadeOut(dojo.byId("divContent" + key));
        fadeIn(dojo.byId("divDirectionsContainer" + key));
        setTimeout(function () {
            dojo.byId("divContent" + key).style.display = "none";
            dojo.byId("divDirectionsContainer" + key).style.display = "block";
        }, 500);
    }
    DisplayDirections(this);
    if (!isMobileDevice) {
        if (feature[service.FieldNames[0].FieldName]) {
            dojo.byId("tdDirectionsListName" + key).innerHTML = 'Directions to ' + feature[service.FieldNames[0].FieldName];
        } else {
            if (_this.getAttribute('featureName')) {
                dojo.byId("tdDirectionsListName" + key).innerHTML = 'Directions to ' + _this.getAttribute('featureName');
            } else {
                dojo.byId("tdDirectionsListName" + key).innerHTML = 'Directions to ' + showNullValueAs;
            }
        }
        ConfigureRoute(mapPoint, featurePoint);
    } else {
        dojo.byId("tblToggleHeader" + key).style.display = "none";
        dojo.byId("divRepresentativeScrollContent" + key).style.display = "none";
        RemoveScrollBar(dojo.byId("divRepresentativeScrollContainer" + key));
        ShowInfoWindow(feature, featureGeometry, service, key);
        if (searchforDirections) {
            dojo.byId("getDirection").style.display = "block";
        } else {
            dojo.byId("getDirection").style.display = "none";
        }
        if (discnt) {
            dojo.disconnect(discnt);
        }
        discnt = dojo.connect(dojo.byId("getDirection"), "onclick", function (evt) {

            ShowMblRouteService(key, featurePoint, feature[service.FieldNames[0].FieldName]);
        });
    }
}

//Show route on mobile browser

function ShowMblRouteService(key, featurePoint, destName) {
    dojo.destroy("divRepresentativeDataPointDetails" + key);
    dojo.destroy(dojo.byId("divRepresentativeDataPointContainer" + key));
    ConfigureRoute(mapPoint, featurePoint, key, destName);
    dojo.byId("divListContainer").style.display = "none";
    dojo.byId('divMobileContainerView').style.display = "none";
    dojo.replaceClass("divMobileContainerView", "opacityShowAnimation", "opacityHideAnimation");
    dojo.replaceClass("divMobileContainerDetails", "hideContainer", "showContainer");

}

//Hide the directions container

function hidePreviousDirections(key) {
    for (var index in services) {
        if (index != key) {
            if (dojo.byId("divDirectionsContainer" + index).style.display == "block") {
                fadeOut(dojo.byId("divDirectionsContainer" + index));
                dojo.byId("divDirectionsContainer" + index).style.display = "none";
                fadeIn(dojo.byId("divContent" + index));
                dojo.byId("divContent" + index).style.display = "block";
                CreateScrollbar(dojo.byId("divContentHolder" + index), dojo.byId("divContent" + index));
            }
        }
    }
}

function fadeIn(container) {
    dojo.replaceClass(container, "fadeIn", "fadeOut");
}

function fadeOut(container) {
    dojo.replaceClass(container, "fadeOut", "fadeIn");
}

//Display map layers

function ShowServiceLayer(layer) {
    if (!layer) {
        return;
    }
    HideServiceLayers();
    dojo.byId("imgShare").setAttribute("selectedPod", layer);
    map.getLayer(layer).show();
    map.infoWindow.hide();
    if (map.getLayer(layer).geometryType != "esriGeometryPoint") {
        if (map.getLayer(layer).getSelectedFeatures().length > 0) {
            if (shareFlag) {

                map.setExtent(startExtent);
            } else {
                map.setExtent(GetExtentFromPolygon(map.getLayer(layer).getSelectedFeatures()[0].geometry.getExtent().expand(3)));
            }
            map.getLayer(layer).show();
            if (isMobileDevice) {
                var center = map.getLayer(layer).graphics[0].geometry.getExtent().getCenter();
                selectedGraphic = center;
                DisplayMblInfo(selectedGraphic, layer);
                map.centerAt(selectedGraphic);
            }
        }
    } else {
        map.getLayer(layer).show();
    }
}

//Hide map layers

function HideServiceLayers() {
    dojo.byId("imgShare").setAttribute("selectedPod", null);
    map.graphics.clear();
    map.getLayer(routeLayerId).hide();
    if (!shareFlag) {
        routeID = null;
        featureID = null;
    }
    for (var index in services) {
        if (map.getLayer(index)) {
            map.getLayer(index).hide();
        }
    }
}

//Get extent of polygon

function GetExtentFromPolygon(extent) {
    var width = extent.getWidth();
    var height = extent.getHeight();
    var xmin = extent.xmin;
    var ymin = extent.ymin - ((2 * height) / 12);
    var xmax = xmin + width;
    var ymax = ymin + height;
    return new esri.geometry.Extent(xmin, ymin, xmax, ymax, map.spatialReference);
}

//Show ripple on mouse over in desktop and tablet browser

function GlowRipple(control, rippleColor) {
    HideRipple();
    var glowPoint = new esri.geometry.Point(Number(control.getAttribute('x')), Number(control.getAttribute('y')), map.spatialReference);
    var layer = map.getLayer(highlightPollLayerId);
    var i = rippleSize;
    var flag = true;
    var intervalID = setInterval(function () {
        layer.clear();
        if (i == rippleSize) {
            flag = false;
        } else if (i == (rippleSize - 4)) {
            flag = true;
        }
        var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, (i - 1) * 2,
        new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
        new dojo.Color(rippleColor), 6),
        new dojo.Color([0, 0, 0, 0])).setOffset(0, -4);

        var graphic = new esri.Graphic(glowPoint, symbol, null, null);
        var features = [];
        features.push(graphic);
        var featureSet = new esri.tasks.FeatureSet();
        featureSet.features = features;
        layer.add(featureSet.features[0]);
        if (flag) i++;
        else i--;
    }, 100);
    intervalIDs[intervalIDs.length] = intervalID;
}

function HideRipple() {
    ClearAllIntervals();
    map.getLayer(highlightPollLayerId).clear();
}

function ClearAllIntervals() {
    for (var i = 0; i < intervalIDs.length; i++) {
        clearInterval(intervalIDs[i]);
        delete intervalIDs[i];
    }
    intervalIDs.length = 0;
}

//Displays directions to go to the target location

function DisplayDirections(evt) {
    map.getLayer(routeLayerId).clear();
    var key = evt.routeLayer;
    if (!dojo.byId('tblDirectionsList' + key)) {
        if (isMobileDevice) {
            var divDataContainer = dojo.create('div');
            divDataContainer.id = "divDataDirectionsContainer" + key;
            divDataContainer.style.marginTop = "10px";
            dojo.byId("divRepresentativeScrollContent" + key).appendChild(divDataContainer);
        }
        if (!isMobileDevice) {
            var divImage = dojo.create('div');
            divImage.className = "divImageBack";
            divImage.id = 'divDirectionsBack' + key;
            dojo.byId("divDirectionsContainer" + key).appendChild(divImage);

            var imgBack = dojo.create('img');
            divImage.appendChild(imgBack);

            imgBack.id = 'imgDirectionsList' + key;
            imgBack.src = 'images/back.png';
            imgBack.className = "imgCarouselHeader";
            imgBack.style.cursor = 'pointer';
            imgBack.title = 'Back';
            imgBack.onclick = function (evt) {
                fadeOut(dojo.byId("divDirectionsContainer" + key));
                fadeIn(dojo.byId("divContent" + key));
                setTimeout(function () {
                    dojo.byId("divDirectionsContainer" + key).style.display = "none";
                    dojo.byId("divContent" + key).style.display = "block";
                    CreateScrollbar(dojo.byId("divContentHolder" + key), dojo.byId("divContent" + key));
                }, 500);
            };
        }
        var divContainer = dojo.create('div');
        divContainer.id = "divDataDirectionsContent" + key;
        divContainer.style.marginTop = "10px";
        if (!isMobileDevice) {
            dojo.byId("divDirectionsContainer" + key).appendChild(divContainer);
        } else {
            divDataContainer.appendChild(divContainer);
            dojo.byId("divDataDirectionsContainer" + key).style.display = 'none';
            divContainer.style.bottom = "2px";
        }

        var directionsListName = dojo.create('table');
        directionsListName.style.width = "87%";
        if (!isMobileDevice) {
            directionsListName.style.marginLeft = "10px";
            directionsListName.cellPadding = "0";
            directionsListName.cellSpacing = "0";
        }
        divContainer.appendChild(directionsListName);

        var tbodyDirectionsListName = dojo.create('tbody');
        directionsListName.appendChild(tbodyDirectionsListName);

        var trDirectionsListName = dojo.create('tr');
        tbodyDirectionsListName.appendChild(trDirectionsListName);

        var tdDirectionsList = dojo.create('td');
        tdDirectionsList.id = 'tdDirectionsListName' + key;
        tdDirectionsList.style.verticalAlign = "top";
        trDirectionsListName.appendChild(tdDirectionsList);

        var directionsList = dojo.create('table');
        directionsList.id = 'tblDirectionsList' + key;

        if (!isMobileDevice) {
            directionsList.style.marginLeft = '10px';
            directionsList.style.width = "95%";
            directionsList.style.borderBottom = "White 1px dashed";
        } else {
            directionsList.style.paddingLeft = '10px';
            directionsList.style.width = "97%";
            directionsList.style.borderBottom = "solid gray 1px";
        }
        directionsList.cellSpacing = 0;
        directionsList.cellPadding = 0;
        divContainer.appendChild(directionsList);

        var tbodyDirectionsList = dojo.create('tbody');
        directionsList.appendChild(tbodyDirectionsList);

        var trDirectionsList = dojo.create('tr');
        tbodyDirectionsList.appendChild(trDirectionsList);
        if (isMobileDevice) {
            trDirectionsList.style.paddingLeft = '10px';
        }

        var trDirectionsTime = dojo.create('tr');
        tbodyDirectionsList.appendChild(trDirectionsTime);

        var tdDirectionsDirections = dojo.create('td');
        tdDirectionsDirections.id = 'tdDirectionsListDirections' + key;
        trDirectionsTime.appendChild(tdDirectionsDirections);

        var tdDirectionsTime = dojo.create('td');
        tdDirectionsTime.id = 'tdDirectionsListTime' + key;
        trDirectionsTime.appendChild(tdDirectionsTime);
    } else {
        if (!isMobileDevice) {
            dojo.byId("divDirectionsContainer" + key).style.display = 'block';
        } else {
            dojo.byId("divDataDirectionsContainer" + key).style.display = "block";
            dojo.byId("divRepresentativeScrollContent" + key).style.display = "block";
        }
    }

    if (!dojo.byId("divRouteListContainer" + key)) {
        var divRouteListContainer = dojo.create('div');
        divRouteListContainer.id = "divRouteListContainer" + key;

        if (!isMobileDevice) {
            divRouteListContainer.style.marginTop = '2px';
            divRouteListContainer.style.position = "relative";
            dojo.byId("divDirectionsContainer" + key).appendChild(divRouteListContainer);
            dojo.byId("divDirectionsContainer" + key).appendChild(divRouteListContainer);
        } else {
            divRouteListContainer.className = "divRepresentativeDataContainer";
            divDataContainer.appendChild(divRouteListContainer);
        }

        var divRouteListContent = dojo.create('div');
        divRouteListContent.id = 'divRouteListContent' + key;
        if (!isMobileDevice) {
            divRouteListContent.style.width = "390px";
            divRouteListContent.style.position = "absolute";
            divRouteListContent.style.overflow = "hidden";
            divRouteListContent.style.marginLeft = "10px";
            if (isTablet) {
                divRouteListContent.style.height = "80px";
            } else {
                divRouteListContent.style.height = "95px";
            }
        } else {
            divRouteListContent.className = "divRepresentativeDirectionScrollContent";
        }
        divRouteListContainer.appendChild(divRouteListContent);
    } else {
        dojo.byId("divRouteListContainer" + key).style.display = 'block';
    }
    map.getLayer(routeLayerId).show();
}

//Open website on click of URL link

function OpenWebSite(webURL) {
    var url = (webURL === null) ? "" : webURL;
    if (url !== "") {
        if (url.indexOf('http://') == -1) {
            url = "http://" + url;
        }
        window.open(url);
    }
}

//Open email application

function OpenServiceMail(email) {
    (email === null) ? "" : window.location = "mailto:" + email;
}

//Query point and polygon services

function QueryService(mapPoint) {
    counter = 0;
    for (var i in services) {
        if (!services[i].distance) {
            counter++;
            QueryRecords(i, services[i], mapPoint);
        } else {
            counter++;
            BufferRadius(mapPoint, i, services[i]);
        }
    }
}

//Query polygon services

function QueryRecords(key, service, mapPoint) {
    var queryTask = new esri.tasks.QueryTask(service.ServiceUrl);
    var query = new esri.tasks.Query();
    query.geometry = mapPoint;
    query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_WITHIN;
    query.outFields = ["*"];
    query.returnGeometry = true;
    map.getLayer(key).selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW, function (features) {
        map.getLayer(key).hide();
        counter--;
        if (features.length > 0) {
            if (!isMobileDevice) {
                dojo.byId('td' + key).style.display = "";
            }
            dojo.byId('div' + key).style.display = "block";
            dojo.byId("divService" + key).style.color = "white";
            dojo.byId("divService" + key).style.cursor = "pointer";
            if (isMobileDevice) {
                dojo.byId("li_" + key).style.display = "block";
            }
            CreateServicePolygonInfo(service, features[0], key);
        } else {
            if (!isMobileDevice) {
                dojo.byId('td' + key).style.display = "none";
            }
            dojo.byId('div' + key).style.display = "none";
            dojo.byId("divService" + key).style.color = "gray";
            dojo.byId("divService" + key).style.cursor = "default";
            if (isMobileDevice) {
                dojo.byId("li_" + key).style.display = "none";
            }
        }
        if (counter === 0) {
            ValidateResults(mapPoint);
            ShareServices();
        }
    });
}

//Query Point services

function BufferRadius(mapPoint, index, serviceInfo) {
    RemoveChildren(dojo.byId("divContent" + index));
    var params = new esri.tasks.BufferParameters();
    params.geometries = [mapPoint];
    params.distances = [serviceInfo.distance];
    params.unit = esri.tasks.GeometryService.UNIT_STATUTE_MILE;
    //if map is Web Mercator, use WGS84 to buffer instead
    if (map.spatialReference.wkid == 102100) {
        params.bufferSpatialReference = new esri.SpatialReference({"wkid":4326});
        params.geodesic = true;
    }
    else
    params.bufferSpatialReference = map.spatialReference;
    params.outSpatialReference = map.spatialReference;
    geometryService.buffer(params, function (geometry) {
        var query = new esri.tasks.Query();
        query.geometry = geometry[0];
        query.where = "1=1";
        query.outFields = ["*"];
        query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_CONTAINS;
        query.returnGeometry = true;
        map.getLayer(index).selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW, function (featureset) {
            counter--;
            map.getLayer(index).hide();
            var featureSet = [];
            for (var i = 0; i < featureset.length; i++) {
                for (var j in featureset[i].attributes) {
                    if (!featureset[i].attributes[j]) {
                        featureset[i].attributes[j] = showNullValueAs;
                    }
                }
                var directions = [];
                if (mapPoint) {
                    var dist = GetDistance(mapPoint, featureset[i].geometry);
                    var distanceMiles = dojo.number.format(dist);
                }
                featureSet.push({
                    name: serviceInfo.Name,
                    attributes: featureset[i].attributes,
                    geometry: featureset[i].geometry,
                    distance: distanceMiles
                });
            }

            featureSet.sort(function (a, b) {
                return a.distance - b.distance;
            });

            if (featureSet.length > 0) {
                for (var i = 0; i < featureSet.length; i++) {
                    dojo.byId('div' + index).style.display = "block";
                    dojo.byId("divService" + index).style.color = "white";
                    dojo.byId("divService" + index).style.cursor = "pointer";
                    if (isMobileDevice) {
                        dojo.byId("li_" + index).style.display = "block";
                    }
                    CreateServicePointInfo(serviceInfo, featureSet[i].attributes, index, featureSet[i].distance, featureSet[i].geometry);
                }
            } else {
                if (serviceInfo.ShowBeyondBuffer) {
                    var query = new esri.tasks.Query();
                    query.where = "1=1";
                    query.outFields = ["*"];
                    query.returnGeometry = true;
                    map.getLayer(index).selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW, function (feature) {
                        var Feature = [];
                        for (var i = 0; i < feature.length; i++) {
                            for (var j in feature[i].attributes) {
                                if (!feature[i].attributes[j]) {
                                    feature[i].attributes[j] = showNullValueAs;
                                }
                            }
                            if (mapPoint) {
                                var dist = GetDistance(mapPoint, feature[i].geometry);
                                var distanceMiles = dojo.number.format(dist);
                            }
                            Feature.push({
                                name: serviceInfo.Name,
                                attributes: feature[i].attributes,
                                geometry: feature[i].geometry,
                                distance: distanceMiles
                            });
                        }
                        Feature.sort(function (a, b) {
                            return a.distance - b.distance;
                        });
                        for (var i = 0; i < Feature.length; i++) {
                            dojo.byId('div' + index).style.display = "block";
                            dojo.byId("divService" + index).style.color = "white";
                            dojo.byId("divService" + index).style.cursor = "pointer";
                            if (isMobileDevice) {
                                dojo.byId("li_" + index).style.display = "block";
                            }
                            CreateServicePointInfo(serviceInfo, Feature[i].attributes, index, Feature[i].distance, Feature[i].geometry);
                        }
                    });
                } else {
                    dojo.byId('div' + index).style.display = "none"
                    dojo.byId("divService" + index).style.color = "gray";
                    dojo.byId("divService" + index).style.cursor = "default";
                    if (isMobileDevice) {
                        dojo.byId("li_" + index).style.display = "none";
                    }
                }
            }
            if (counter === 0) {
                ValidateResults(mapPoint);
                ShareServices();
            }
        });
    });
}

//Validate availability of services in the user selected area

function ValidateResults(mapPoint) {
    HideServiceLayers();
    HideProgressIndicator();
    var layerCount = 0;
    var hiddenCount = 0;
    for (var index in services) {
        layerCount++;
        if (dojo.byId('div' + index).style.display == "none") {
            hiddenCount++;
        }
    }
    if (layerCount == hiddenCount) {
        if (!isMobileDevice) {
            WipeOutResults();
        }
        alert(messages.getElementsByTagName("servicesNotAvailable")[0].childNodes[0].nodeValue);
        return;
    }
    if (!isMobileDevice) {
        WipeInResults();
    } else {
        selectedGraphic = mapPoint;
        map.infoWindow.resize(225, 60);
        map.setExtent(GetBrowserMapExtent(selectedGraphic));
        selectedMapPoint = mapPoint;
        var screenPoint = map.toScreen(selectedMapPoint);
        screenPoint.y = map.height - screenPoint.y;
        map.infoWindow.show(screenPoint);
        if (isMobileDevice) {
            map.infoWindow.setTitle("Address");
            dojo.connect(map.infoWindow.imgDetailsInstance(), "onclick", function () {
                if (isMobileDevice) {
                    map.infoWindow.hide();
                    selectedMapPoint = null;
                    dojo.byId('divListContainer').style.display = "block";
                    dojo.byId('menuList').style.display = "none";
                    dojo.byId('divMobileContainerView').style.display = "block";
                    SetContentHeight("divDataListContent", 60);
                    CreateScrollbar(dojo.byId("divDataListContainer"), dojo.byId("divDataListContent"));
                    dojo.replaceClass("divMobileContainerView", "opacityShowAnimation", "opacityHideAnimation");
                    dojo.replaceClass("divMobileContainerDetails", "showContainer", "hideContainer");
                }
                dojo.byId('divInfoContent').style.display = "block";
            });
        }
    }
}

//Handle sharing functionality

function ShareServices() {
    var extent = GetQuerystring('extent');
    if (shareFlag) {
        if (window.location.toString().split("$point=").length > 1) {
            if (window.location.toString().split("$point=")[1].split("$selectedPod=").length >= 1) {
                if (window.location.toString().split("$point=")[1].split("$selectedPod=")[1]) {
                    var url = esri.urlToObject(window.location.toString());
                    if (isMobileDevice) {
                        routeID = url.query.extent.split("$point=")[1].split("$routeID=")[1];
                        if (routeID) {
                            routeID = url.query.extent.split("$point=")[1].split("$routeID=")[1];
                            ExecuteRouteQueryTask();
                        } else {
                            ShowServiceLayer(window.location.toString().split("$point=")[1].split("$selectedPod=")[1]);
                        }
                    } else {
                        ShowServicePods(window.location.toString().split("$point=")[1].split("$selectedPod=")[1].split("$pos=")[0], true);
                        featureID = url.query.extent.split("$point=")[1].split("$featureID=")[1];
                        routeID = url.query.extent.split("$point=")[1].split("$routeID=")[1];
                        if (featureID && !routeID) {
                            featureID = url.query.extent.split("$point=")[1].split("$pos=")[0].split("$featureID=")[1];
                            ExecuteQueryTask();
                        }
                        if (routeID && !featureID) {
                            routeID = true;
                            routeID = url.query.extent.split("$point=")[1].split("$routeID=")[1].split("$pos=")[0];
                            ExecuteRouteQueryTask();
                        }
                        if (featureID && routeID) {
                            featureID = url.query.extent.split("$point=")[1].split("$pos=")[0].split("$featureID=")[1].split("$routeID=")[0];
                            routeID = url.query.extent.split("$point=")[1].split("$routeID=")[1].split("$pos=")[0];
                            ExecuteRouteFeatureQueryTask();
                        }
                    }
                }
            }
        }
    }
    if (!routeID) {

        shareFlag = false;
    }
}

//Display mobile info callout

function DisplayMblInfo(mapPoint, layer, targetName) {
    var key = layer;
    map.infoWindow.resize(225, 60);
    if (map.getLayer(layer).geometryType == "esriGeometryPoint") {
        targetName = dojo.string.substitute(targetName).trimString(14);
        map.infoWindow.setTitle(targetName);
        map.infoWindow.setContent("Get directions");
    } else {
        map.infoWindow.setTitle(layer);
        map.infoWindow.setContent("");
    }
    setTimeout(function () {
        selectedMapPoint = mapPoint;
        var screenPoint = map.toScreen(selectedMapPoint);
        screenPoint.y = map.height - screenPoint.y;
        map.infoWindow.show(screenPoint);
        if (isMobileDevice) {
            if (map.getLayer(layer).geometryType != "esriGeometryPoint") {
                dojo.connect(map.infoWindow.imgDetailsInstance(), "onclick", function () {
                    if (isMobileDevice) {
                        map.infoWindow.hide();
                        dojo.byId('divMobileContainerView').style.display = "block";
                        dojo.replaceClass("divMobileContainerView", "opacityShowAnimation", "opacityHideAnimation");
                        dojo.replaceClass("divMobileContainerDetails", "showContainer", "hideContainer");
                        dojo.byId('divListContainer').style.display = "none";
                        dojo.byId("divRepresentativeDataContainer").style.display = "block";
                        dojo.byId("tblToggleHeader" + key).style.display = "block";
                        dojo.byId("divRepresentativeScrollContainer" + key).style.display = "block";
                        dojo.byId("divRepresentativeScrollContent" + key).style.display = "block";

                        SetContentHeight("divContent" + key, 80);
                        SetContentHeight("divRepresentativeScrollContent" + key, 80);

                        CreateScrollbar(dojo.byId("divRepresentativeScrollContainer" + key), dojo.byId("divContent" + key));
                        dojo.byId('menuList').style.display = "block";
                    }
                });
            } else {
                dojo.connect(map.infoWindow.imgDetailsInstance(), "onclick", function () {
                    map.infoWindow.hide();
                    dojo.byId("tdListHeader").innerHTML = targetName;
                    dojo.byId("divListContainer").style.display = "none";
                    dojo.byId('divMobileContainerView').style.display = "block";
                    dojo.replaceClass("divMobileContainerView", "opacityShowAnimation", "opacityHideAnimation");
                    dojo.replaceClass("divMobileContainerDetails", "showContainer", "hideContainer");
                    dojo.byId("divDataDirectionsContainer" + key).style.display = "block";
                    dojo.byId("divRepresentativeScrollContent" + key).style.display = "block";
                    dojo.byId("divRepresentativeDataContainer").style.display = "block";
                    dojo.byId("tblToggleHeader" + key).style.display = "block";
                    dojo.byId("divRepresentativeScrollContainer" + key).style.display = "block";
                    dojo.byId('getDirection').style.display = "none";
                    dojo.byId('goBack').style.display = "none";
                    dojo.byId('pointMenuList').style.display = "block";
                    SetContentHeight("divRouteListContent" + key, 150);
                    CreateScrollbar(dojo.byId("divRouteListContainer" + key), dojo.byId("divRouteListContent" + key));

                    dojo.connect(dojo.byId("pointMenuList"), "onclick", function () {
                        dojo.byId("divDataDirectionsContainer" + key).style.display = "none";
                        dojo.byId("divRepresentativeScrollContent" + key).style.display = "none";
                        dojo.byId("tdListHeader").innerHTML = infoContent;
                        dojo.byId("divContent" + key).style.display = "block";
                        dojo.byId("divRepresentativeScrollContent" + key).style.display = "block";
                        dojo.byId("tblToggleHeader" + key).style.display = "block";
                        dojo.byId("pointMenuList").style.display = "none";
                        dojo.byId('menuList').style.display = "block";
                        SetContentHeight("divContent" + key, 80);
                        SetContentHeight("divRepresentativeScrollContent" + key, 80);
                        CreateScrollbar(dojo.byId("divRepresentativeScrollContainer" + key), dojo.byId("divContent" + key));
                    });
                });
            }
        }
    }, 500);
}

//Create list of services available for mobile

function CreateListLayOut() {
    if (isMobileDevice) { //If mobile device, list items are created
        var listServiceTypesContainer = dijit.byId("listContainer");
        for (var i in services) {
            var li = dojo.create("LI");
            listServiceTypesContainer.containerNode.appendChild(li);
            var itemWidget = new dojox.mobile.ListItem({
                label: services[i].Name.trimString(20),
                id: "li_" + i,
                icon: "images/arrow.png"
            }, li);
            itemWidget.startup();
            itemWidget.domNode.setAttribute("key", i);
            MblDataDisplay(i);
            dojo.connect(itemWidget.domNode, "onclick", function (e) {
                key = this.getAttribute("key");
                dojo.byId('divListContainer').style.display = "none";
                dojo.byId("divRepresentativeDataContainer").style.display = "block";
                dojo.byId("tblToggleHeader" + key).style.display = "block";
                dojo.byId("divRepresentativeScrollContainer" + key).style.display = "block";
                dojo.byId("divRepresentativeScrollContent" + key).style.display = "block";
                RemoveScrollBar(dojo.byId("divDataListContainer"));
                SetContentHeight("divContent" + key, 80);
                SetContentHeight("divRepresentativeScrollContent" + key, 80);
                CreateScrollbar(dojo.byId("divRepresentativeScrollContainer" + key), dojo.byId("divContent" + key));
                dojo.byId("menuList").style.display = "block";
                selectedFieldName = key;
            });
            dojo.connect(dojo.byId("menuList"), "onclick", function (e) {
                for (var i in services) {
                    ToggleHeaderIcons(i);
                }
            });
            if (listServiceTypesContainer.redrawBorders) {
                listServiceTypesContainer.redrawBorders();
            }
        }
    }
}

//Clear the layers and the data when ever the user click on close icon in the mobile header

function HideMainContainer() {
    map.infoWindow.hide();
    mapPoint = null;
    selectedGraphic = null;
    HideServiceLayers();
    RemoveChildren(dojo.byId('divRepresentativeDataContainer'));
    dojo.byId('goBack').style.display = "none";
    dojo.byId('getDirection').style.display = "none";
    dojo.byId('pointMenuList').style.display = "none";
    dojo.byId('divMobileContainerView').style.display = "none";
    dojo.replaceClass("divMobileContainerView", "opacityShowAnimation", "opacityHideAnimation");
    dojo.replaceClass("divMobileContainerDetails", "hideContainer", "showContainer");
    dojo.byId('divListContainer').style.display = "block";
    dojo.byId("divRepresentativeDataContainer").style.display = "none";
}

//Create Dom elements and store data in the containers

function MblDataDisplay(key) {
    if (key) {
        var divDataHeader = dojo.byId("divRepresentativeDataContainer");
        var tblToggle = dojo.create("table");
        tblToggle.id = "tblToggleHeader" + key;
        tblToggle.style.paddingLeft = "12px";
        tblToggle.cellSpacing = 0;
        tblToggle.cellPadding = 0;
        divDataHeader.appendChild(tblToggle);

        var tbodyToggle = dojo.create("tbody");
        tblToggle.appendChild(tbodyToggle);

        var trToggle = dojo.create("tr");
        trToggle.className = "trToggleHeader";
        tbodyToggle.appendChild(trToggle);

        var tdToggle = dojo.create("td");
        trToggle.appendChild(tdToggle);
        tdToggle.innerHTML = (services[key].Name).bold();

        var divRepresentativeScrollContainer = dojo.create("div");
        divRepresentativeScrollContainer.id = "divRepresentativeScrollContainer" + key;
        divRepresentativeScrollContainer.className = "divRepresentativeDataContainer";
        divRepresentativeScrollContainer.style.bottom = "0px";
        divDataHeader.appendChild(divRepresentativeScrollContainer);

        var divRepresentativeScrollContent = dojo.create("div");
        divRepresentativeScrollContent.id = "divRepresentativeScrollContent" + key;
        divRepresentativeScrollContent.className = "divRepresentativeScrollContent";
        divRepresentativeScrollContent.style.bottom = "0px";
        divRepresentativeScrollContainer.appendChild(divRepresentativeScrollContent);

        var tblDataContainer = dojo.create("table");
        tblDataContainer.align = "left";
        tblDataContainer.width = "95%";

        var trDataContainer = dojo.create("tr");
        tblDataContainer.appendChild(trDataContainer);

        var tdDataContainer = dojo.create("td");
        trDataContainer.appendChild(tdDataContainer);
        divRepresentativeScrollContent.appendChild(tblDataContainer);
        tdDataContainer.appendChild(dojo.byId("divContent" + key));

        dojo.byId("divRepresentativeScrollContainer" + key).style.display = "none";
        dojo.byId("divRepresentativeScrollContent" + key).style.display = "none";
        dojo.byId("tblToggleHeader" + key).style.display = "none";
    }
}

//Toggle the header icons in mobile

function ToggleHeaderIcons(key) {
    dojo.byId("divRepresentativeDataContainer").style.display = "none";
    dojo.byId("tblToggleHeader" + key).style.display = "none";
    dojo.byId("divRepresentativeScrollContainer" + key).style.display = "none";
    dojo.byId("divRepresentativeScrollContent" + key).style.display = "none";
    dojo.byId("menuList").style.display = "none";
    dojo.byId('divListContainer').style.display = "block";
    SetContentHeight("divDataListContent", 60);
    CreateScrollbar(dojo.byId("divDataListContainer"), dojo.byId("divDataListContent"));
}

//Get the extent based on the map point

function GetBrowserMapExtent(mapPoint) {
    var width = map.extent.getWidth();
    var height = map.extent.getHeight();
    var xmin = mapPoint.x - (width / 2);
    var ymin = mapPoint.y - (height / 4);
    var xmax = xmin + width;
    var ymax = ymin + height;
    return new esri.geometry.Extent(xmin, ymin, xmax, ymax, map.spatialReference);
}

//Get the extent based on the map point for mobile

function GetMobileMapExtent(mapPoint) {
    var width = map.extent.getWidth();
    var height = map.extent.getHeight();
    var xmin = mapPoint.x - (width / 2);
    var ymin = mapPoint.y - (height / 2);
    var xmax = xmin + width;
    var ymax = ymin + height;
    return new esri.geometry.Extent(xmin, ymin, xmax, ymax, map.spatialReference);
}

//Calculate distance between two mapPoints

function GetDistance(startPoint, endPoint) {
    var sPoint = esri.geometry.webMercatorToGeographic(startPoint);
    var ePoint = esri.geometry.webMercatorToGeographic(endPoint);
    var lon1 = sPoint.x;
    var lat1 = sPoint.y;
    var lon2 = ePoint.x;
    var lat2 = ePoint.y;
    var theta = lon1 - lon2;
    var dist = Math.sin(Deg2Rad(lat1)) * Math.sin(Deg2Rad(lat2)) + Math.cos(Deg2Rad(lat1)) * Math.cos(Deg2Rad(lat2)) * Math.cos(Deg2Rad(theta));
    dist = Math.acos(dist);
    dist = Rad2Deg(dist);
    dist = dist * 60 * 1.1515;
    return (dist * 10) / 10;
}

//Convert degrees to radians

function Deg2Rad(deg) {
    return (deg * Math.PI) / 180.0;
}

//Convert radians to degrees

function Rad2Deg(rad) {
    return (rad / Math.PI) * 180.0;
}

//Get width of a control when text and font size are specified
String.prototype.getWidth = function (fontSize) {
    var test = dojo.create("span");
    document.body.appendChild(test);
    test.style.visibility = "hidden";

    test.style.fontSize = fontSize + "px";

    test.innerHTML = this;
    var w = test.offsetWidth;
    document.body.removeChild(test);
    return w;
};

//Slide the carousel pods to the right

function SlideRight() {
    var difference = dojo.byId("divCarouselDataContainer").offsetWidth - dojo.byId("divCarouselDataContent").offsetWidth;
    if (newLeft > difference) {
        dojo.byId('divLeftArrow').style.display = "block";
        dojo.byId('divLeftArrow').style.cursor = "pointer";
        newLeft = newLeft - (infoBoxWidth + 9);
        dojo.byId("divCarouselDataContent").style.left = newLeft + "px";
        dojo.addClass("divCarouselDataContent", "slidePanel");
        ResetSlideControls();
    }
}

//Slide the carousel pods to the left

function SlideLeft() {
    if (newLeft < 0) {
        if (newLeft > -(infoBoxWidth + 9)) {
            newLeft = 0;
        } else {
            newLeft = newLeft + (infoBoxWidth + 9);
        }
        if (newLeft >= -10) {
            newLeft = 0;
        }
        dojo.byId("divCarouselDataContent").style.left = (newLeft) + "px";
        dojo.addClass("divCarouselDataContent", "slidePanel");
        ResetSlideControls();
    }
}

//Slide to the selected info box in the bottom panel

function Slide(position) {
    newLeft = -(position);
    if (position < 10) {
        newLeft = 0;
    }
    if (position > infoBoxWidth) {
        dojo.byId('divLeftArrow').style.display = "block";
        dojo.byId('divLeftArrow').style.cursor = "pointer";
    }
    dojo.byId("divCarouselDataContent").style.left = -(position) + "px";
    dojo.addClass("divCarouselDataContent", "slidePanel");
    ResetSlideControls();
}

//reset the slide controls

function ResetSlideControls() {
    if (newLeft > dojo.byId("divCarouselDataContainer").offsetWidth - dojo.byId("divCarouselDataContent").offsetWidth) {
        dojo.byId('divRightArrow').style.display = "block";
        dojo.byId('divRightArrow').style.cursor = "pointer";
    } else {
        dojo.byId('divRightArrow').style.display = "none";
        dojo.byId('divRightArrow').style.cursor = "default";
    }
    if (newLeft == 0) {
        dojo.byId('divLeftArrow').style.display = "none";
        dojo.byId('divLeftArrow').style.cursor = "default";
    } else {
        dojo.byId('divLeftArrow').style.display = "block";
        dojo.byId('divLeftArrow').style.cursor = "pointer";
    }
}
