/*global dojo */
/** @license
 | Version 10.2
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
dojo.provide("js.Config");
dojo.declare("js.Config", null, {

    // This file contains various configuration settings for "HTML5" template
    //
    // Use this file to perform the following:
    //
    // 1.  Specify application title                  - [ Tag(s) to look for: ApplicationName ]
    // 2.  Set path for application icon              - [ Tag(s) to look for: ApplicationIcon ]
    // 3.  Set splash screen message                  - [ Tag(s) to look for: SplashScreenMessage ]
    // 4.  Set URL for help page                      - [ Tag(s) to look for: HelpURL ]
    //
    // 5.  Specify URLs for base maps                  - [ Tag(s) to look for: BaseMapLayers ]
    // 6.  Set initial map extent                     - [ Tag(s) to look for: DefaultExtent ]
    //
    // 7.  Or for using map services:
    // 7a. Customize info-Window settings             - [ Tag(s) to look for: InfoWindowHeader, InfoPopupFieldsCollection ]
    // 7b. Customize info-Popup size                  - [ Tag(s) to look for: InfoPopupHeight, InfoPopupWidth ]
    // 7c. Customize data formatting                  - [ Tag(s) to look for: ShowNullValueAs]
    //
    // 8. Customize address search settings           - [ Tag(s) to look for: LocatorURL, LocatorFields, DefaultValue, LocatorMarkupSymbolPath, LocatorRippleSize ]
    //
    // 9. Set URL for geometry service               - [ Tag(s) to look for: GeometryService ]
    //
    // 10. Customize routing settings for directions  - [ Tag(s) to look for: RouteServiceURL, RouteColor, RouteWidth, SearchforDirections]
    //
    // 11. Configure data to be displayed on the bottom panel, ReferenceOverlayLayer
    //                                                - [ Tag(s) to look for: InfoBoxWidth, Services, ReferenceOverlayLayer]
    //
    // 12. Customize the Zoom level, CallOutAddress, Render color, ripple size
    //                                                - [ Tag(s) to look for: Zoom level, CallOutAddress, RendererColor, RippleSize]
    //
    // 13. Specify URLs for map sharing               - [ Tag(s) to look for: MapSharingOptions (set TinyURLServiceURL, TinyURLResponseAttribute) ]
    // 13a.In case of changing the TinyURL service
    //     Specify URL for the new service            - [ Tag(s) to look for: FacebookShareURL, TwitterShareURL, ShareByMailLink ]
    //
    //

    // ------------------------------------------------------------------------------------------------------------------------
    // GENERAL SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Set application title.
    ApplicationName: "My Health Services",

    // Set application icon path.
    ApplicationIcon: "images/MyHealth.png",

    // Set splash window content - Message that appears when the application starts.
    SplashScreenMessage: "<b>My Health Services Information</b><br/><hr/><br/>The <b>Health Services Information</b> application helps constituents discover health facility locations that exist in their community and obtain information about services provided.<br/> <br/>To locate an area of interest, simply enter an address in the search box, or use your current location. Your location will then be highlighted on the map and relevant evacuation and facility information will be presented to the user.<br/><br/>",

    // Set URL of help page/portal.
    HelpURL: "helpHealth.htm",

// URL to proxy program
    ProxyURL: "proxy/proxy.ashx",

    // ------------------------------------------------------------------------------------------------------------------------
    // BASEMAP SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Set baseMap layers.
    // Please note: All base maps need to use the same spatial reference. By default, on application start the first base map will be loaded
    BaseMapLayers: [{
        Key: "grayCanvas",
        ThumbnailSource: "images/grayCanvas.png",
        Name: "Gray Canvas",
        MapURL: "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer"
    }, {
        Key: "streetMap",
        ThumbnailSource: "images/world_street_map.jpg",
        Name: "Street Map",
        MapURL: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer"
    }],

    // Initial map extent. Use comma (,) to separate values and don t delete the last comma.
    DefaultExtent: "-9401000,3787000,-8618000,4202000",


    // ------------------------------------------------------------------------------------------------------------------------
    // INFO-POPUP SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Info-popup is a popup dialog that gets displayed on selecting a feature

    //Field for Displaying the features as info window header.
    InfoWindowHeader: "FACTYPE",

    // Set the content to be displayed on the info-Popup. Define labels, field values, field types and field formats.
    InfoPopupFieldsCollection: [{
        DisplayText: "Name:",
        FieldName: "FACNAME"
    }, {
        DisplayText: "Address:",
        FieldName: "ADDRESS"
    },  {
        DisplayText: "Phone:",
        FieldName: "FACPHONE"
    }, {
        DisplayText: "County:",
        FieldName: "COUNTY"
    }, {
        DisplayText: "Facility Type:",
        FieldName: "FACTYPE"
    }],

    // Set size of the info-Popup - select maximum height and width in pixels.
    //minimum height should be 200 for the info-popup in pixels
    InfoPopupHeight: 200,

    //minimum width should be 300 for the info-popup in pixels
    InfoPopupWidth: 300,

    // Set string value to be shown for null or blank values.
    ShowNullValueAs: "N/A",

    // ------------------------------------------------------------------------------------------------------------------------
    // ADDRESS SEARCH SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Set Locator service URL.

    LocatorSettings: {
        LocatorMarkupSymbolPath: "images/RedPushpin.png", // Set pushpin image path.
        MarkupSymbolSize: {
            width: 25,
            height: 25
        },
        Locators: [{
            DisplayText: "Search Address", //Set placeholder text
            DefaultValue: "2600 Bull Street, Columbia, SC 29201", // Set default address to search.
            LocatorParameters: ["SingleLine"], // Set Locator fields (fields to be used for searching).
            LocatorURL: "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
            CandidateFields: "Loc_name, Score, Match_addr", //Set which fields are returned in results
            DisplayField: "${Match_addr}", //Set which field from results is displayed
            AddressMatchScore: 80, //Set minimum score to be considered a match
            LocatorFieldName: 'Loc_name', //The returned field which specifies match type (specific locator within composite)
            LocatorFieldValues: ["USA.StreetName", "USA.PointAddress", "USA.StreetAddress", "USA.POI"] //List of acceptable individual locators (within composite)
        }]
    },

    // ------------------------------------------------------------------------------------------------------------------------
    // GEOMETRY SERVICE SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Set geometry service URL.
    GeometryService: "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",

    // ------------------------------------------------------------------------------------------------------------------------
    // DRIVING DIRECTIONS SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Set URL for routing service (network analyst).
    RouteServiceURL: "http://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World",

    // Set color for the route symbol.
    RouteColor: "#CC6633",

    // Set width of the route.
    RouteWidth: 4,

    // Set this to true to show directions on map
    SearchforDirections: true,

    // ------------------------------------------------------------------------------------------------------------------------
    // SETTINGS FOR INFO-PODS ON THE BOTTOM PANEL
    // ------------------------------------------------------------------------------------------------------------------------
    // Set width of the boxes in the bottom panel.
    InfoBoxWidth: 417,

    //Operational layer collection.
    Services: {
        StateClinics: {
            Name: "State Health Clinics",
            Image: "images/StateClinic.png",
            HasRendererImage: false,
            ServiceUrl: "http://tryitlive.arcgis.com/arcgis/rest/services/HealthFacility/MapServer/11",
            distance: 4,
            FieldNames: [{
                FieldName: "FACNAME"
            }, {
                FieldName: "ADDRESS"
            }, {
                FieldName: "SERVICES"
            }],
            LayerVisibility: true,
            ShowBeyondBuffer: true
        },
	Hospitals: {
            Name: "Hospitals and Clinics",
            Image: "images/hospital.png",
            HasRendererImage: false,
            ServiceUrl: "http://tryitlive.arcgis.com/arcgis/rest/services/HealthFacility/MapServer/10",
            distance: 4,
            FieldNames: [{
                FieldName: "FACNAME"
            }, {
                FieldName: "ADDRESS"
            }, {
                FieldName: "FACPHONE"
            }],
            LayerVisibility: true,
            ShowBeyondBuffer: true
        },
        Hospice: {
            Name: "Hospice Care",
            Image: "images/Hospice.png",
            HasRendererImage: false,
            ServiceUrl: "http://tryitlive.arcgis.com/arcgis/rest/services/HealthFacility/MapServer/6",
            distance: 4,
            FieldNames: [{
                FieldName: "FACNAME"
            }, {
                FieldName: "ADDRESS"
            }, {
                FieldName: "FACPHONE"
            }],
            LayerVisibility: true,
            ShowBeyondBuffer: true
        },
        Dialysis: {
            Name: "Dialysis Center",
            Image: "images/Dialysis.png",
            HasRendererImage: false,
            ServiceUrl: "http://tryitlive.arcgis.com/arcgis/rest/services/HealthFacility/MapServer/2",
            distance: 4,
            FieldNames: [{
                FieldName: "FACNAME"
            }, {
                FieldName: "ADDRESS"
            }, {
                FieldName: "FACPHONE"
            }],
            LayerVisibility: true,
            ShowBeyondBuffer: true
        },
        Habilitation: {
            Name: "Habilitation",
            Image: "images/Habilitation.png",
            HasRendererImage: false,
            ServiceUrl: "http://tryitlive.arcgis.com/arcgis/rest/services/HealthFacility/MapServer/3",
            distance: 4,
            FieldNames: [{
                FieldName: "FACNAME"
            }, {
                FieldName: "ADDRESS"
            }, {
                FieldName: "FACPHONE"
            }],
            LayerVisibility: true,
            ShowBeyondBuffer: true
        },
        Hearing: {
            Name: "Hearing",
            Image: "images/Hearing.png",
            HasRendererImage: false,
            ServiceUrl: "http://tryitlive.arcgis.com/arcgis/rest/services/HealthFacility/MapServer/4",
            distance: 4,
            FieldNames: [{
                FieldName: "FACNAME"
            }, {
                FieldName: "ADDRESS"
            }, {
                FieldName: "FACPHONE"
            }],
            LayerVisibility: true,
            ShowBeyondBuffer: true
        },
        HomeHealth: {
            Name: "Home Health Services",
            Image: "images/HomeHealth.png",
            HasRendererImage: false,
            ServiceUrl: "http://tryitlive.arcgis.com/arcgis/rest/services/HealthFacility/MapServer/6",
            distance: 4,
            FieldNames: [{
                FieldName: "FACNAME"
            }, {
                FieldName: "ADDRESS"
            }, {
                FieldName: "FACPHONE"
            }],
            LayerVisibility: true,
            ShowBeyondBuffer: true
        },
  	BirthServices: {
            Name: "Birth Services",
            Image: "images/Birth.png",
            HasRendererImage: false,
            ServiceUrl: "http://tryitlive.arcgis.com/arcgis/rest/services/HealthFacility/MapServer/1",
            distance: 4,
            FieldNames: [{
                FieldName: "FACNAME"
            }, {
                FieldName: "ADDRESS"
            }, {
                FieldName: "FACPHONE"
            }],
            LayerVisibility: true,
            ShowBeyondBuffer: true
        },
	AdultCare: {
            Name: "Adult Care",
            Image: "images/AdultCare.png",
            HasRendererImage: false,
            ServiceUrl: "http://tryitlive.arcgis.com/arcgis/rest/services/HealthFacility/MapServer/0",
            distance: 4,
            FieldNames: [{
                FieldName: "FACNAME"
            }, {
                FieldName: "ADDRESS"
            }, {
                FieldName: "FACPHONE"
            }],
            LayerVisibility: true,
            ShowBeyondBuffer: true
        },
          SubstanceAbuse: {
            Name: "Substance Abuse",
            Image: "images/Substance.png",
            HasRendererImage: false,
            ServiceUrl: "http://tryitlive.arcgis.com/arcgis/rest/services/HealthFacility/MapServer/10",
            distance: 4,
            FieldNames: [{
                FieldName: "FACNAME"
            }, {
                FieldName: "ADDRESS"
            }, {
                FieldName: "FACPHONE"
            }],
            LayerVisibility: true,
            ShowBeyondBuffer: true
        },
	        ResidentialCare: {
            Name: "Residential Care",
            Image: "images/ResidentialCare.png",
            HasRendererImage: false,
            ServiceUrl: "http://tryitlive.arcgis.com/arcgis/rest/services/HealthFacility/MapServer/8",
            distance: 4,
            FieldNames: [{
                FieldName: "FACNAME"
            }, {
                FieldName: "ADDRESS"
            }, {
                FieldName: "FACPHONE"
            }],
            LayerVisibility: true,
            ShowBeyondBuffer: true
        },
 	},

    // ServiceUrl is the REST end point for the reference overlay layer
    // DisplayOnLoad setting this will show the reference overlay layer on load
    ReferenceOverlayLayer: {
        ServiceUrl: "http://tryitlive.arcgis.com/arcgis/rest/services/CountyLayer/MapServer",
        DisplayOnLoad: false
    },

    //Set required zoom level.
    ZoomLevel: 15,

    //Set Address to be displayed on mobile callout.
    CallOutAddress: "Street: ${ADDRESS}",

    //Set Renderer color for selected feature.
    RendererColor: "#CC6633",

    //Set size of the ripple.
    RippleSize: 25,

    // ------------------------------------------------------------------------------------------------------------------------
    // SETTINGS FOR MAP SHARING
    // ------------------------------------------------------------------------------------------------------------------------
    // Set URL for TinyURL service, and URLs for social media.
    MapSharingOptions: {
        TinyURLServiceURL: "https://api-ssl.bitly.com/v3/shorten?longUrl=${0}",
        FacebookShareURL: "http://www.facebook.com/sharer.php?u=${0}&t=My%20Health%20Services",
        TwitterShareURL: "http://mobile.twitter.com/compose/tweet?status=My%20Health%20Services ${0}",
        ShareByMailLink: "mailto:%20?subject=Check%20out%20this%20map!&body=${0}"
    }
});
