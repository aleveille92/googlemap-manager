var GoogleMapManager = function(id, settings) {
    settings = typeof settings === 'undefined' ? {} : settings;

    var defaultSettings = {
        googleMap: {
            center: {
                lat: 0,
                lng: 0
            },
            zoom: 5,
            maxZoom: 20,
            minZoom: 3,
            disableDefaultUI: true,
            clickableIcons: false,
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_BOTTOM,
                style: google.maps.ZoomControlStyle.SMALL
            },
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
            }
        },
        markers: {
            closeOthers: true,
            cluster: false,
            infoBubble: false,
        },
        styles: []
    };

    this.settings = {};
    this.settings.googleMap = this.merge(defaultSettings.googleMap, settings.googleMap);
    this.settings.markers = this.merge(defaultSettings.markers, settings.markers);
    this.settings.styles = settings.styles ? settings.styles : defaultSettings.styles;


    //Create the map object and store it
    this.elementId = id;
    var mapContainer = this.getElement();
    this.map = new google.maps.Map(mapContainer, this.settings.googleMap);

    //Apply the style to hte map
    this.map.mapTypes.set('map_style', new google.maps.StyledMapType(this.settings.styles, {
        name: "Styled Map"
    }));
    this.map.setMapTypeId('map_style');

    //Prepare for markers
    this.markers = {};
    this.infowindows = {};

    mapContainer.googleMapManager = this;

    this.createCluster();
    this.canUseInfoBubble();

    return this;
};

GoogleMapManager.prototype.getElement = function() {
    return document.getElementById(this.elementId);;
};


GoogleMapManager.prototype.addMarker = function(marker, options) {
    manager = this;

    // MARKER
    var newMarker = new google.maps.Marker({
        position: new google.maps.LatLng(marker.lat, marker.lng),
        map: this.map,
        icon: marker.icon || "",
        title: marker.title || "",
    });

    if (typeof marker.categories === 'string') {
        marker.categories = [marker.categories];
    }

    newMarker.id = marker.id;
    newMarker.categories = marker.categories || [];
    newMarker.unfilterable = marker.unfilterable;

    this.markers[marker.id] = newMarker;


    // INFOWINDOW
    var newInfowindow;
    if (this.infobubble) {
        var defaultOptions = {
            content: '<div class="map-info-window">' + (marker.template || marker.title) + '</div>',
            padding: 15,
            borderRadius: 0,
            shadowStyle: 0,
            disableAutoPan: true,
            disableAnimation: true,
        };
        var options = this.merge(defaultOptions, this.settings.markers.infobubble);

        newInfowindow = new InfoBubble(options);
    } else {
        newInfowindow = new google.maps.InfoWindow({
            content: '<div class="map-info-window">' + (marker.template || marker.title) + '</div>',
            // maxWidth: 2000,
            // pixelOffset: new google.maps.Size(-(707/2 + 50), 468/2 + 20)
        });
    }

    this.infowindows[marker.id] = newInfowindow;


    // EVENTS
    google.maps.event.addListener(newMarker, 'click', function(marker) {
        // check if should close other window
        if (manager.settings.markers.closeOthers) {
            for (var infoWindowID in manager.infowindows) {
                manager.getInfowindow(infoWindowID).close();
            }
        }

        // open window
        manager.getInfowindow(this.id).open(manager.map, this);

        // trigger event marker opened
        manager.trigger('markerOpened', this);
    });

    google.maps.event.addListener(newInfowindow, 'closeclick', function() {
        // trigger event marker closed
        manager.trigger('markerClosed', this);
    });

    if (this.cluster) {
        this.cluster.addMarker(newMarker);
    }

    return newMarker;
};

GoogleMapManager.prototype.createCluster = function(markers) {
    if (typeof markers === 'undefined') markers = [];
    if (this.settings.markers.cluster) {
        if (typeof MarkerClusterer === 'function') {
            this.cluster = new MarkerClusterer(this.map, markers, this.settings.markers.cluster);
            return this.cluster;
        } else {
            console.error('MarkerClusterer is required with "options.markers.cluster: {...}" : https://github.com/googlemaps/js-marker-clusterer');
            return false;
        }
    }
};

GoogleMapManager.prototype.getMarker = function(id) {
    return this.markers[id];
};

GoogleMapManager.prototype.showMarker = function(marker, show) {
    if (typeof marker === 'number' || typeof marker === 'string') marker = this.getMarker(marker);
    if (typeof show === 'undefined') show = true;

    if (show) {
        marker.setMap(this.map);
        if (this.cluster) {
            this.cluster.addMarker(marker);
        }
    } else {
        this.getInfowindow(marker.id).close();
        marker.setMap(null);
        if (this.cluster) {
            this.cluster.removeMarker(marker);
        }
    }
};
GoogleMapManager.prototype.hideMarker = function(marker) {
    this.showMarker(marker, false);
};

GoogleMapManager.prototype.openMarker = function(marker) {
    if (typeof marker === 'number' || typeof marker === 'string') marker = this.getMarker(marker);
    new google.maps.event.trigger(marker, 'click');
};

GoogleMapManager.prototype.filterMarkers = function(category) {
    if (this.cluster) {
        this.cluster.clearMarkers();
    }

    var markers = this.markers;
    for (var id in markers) {
        var marker = this.getMarker(id);
        if (!marker.unfilterable) {
            if (marker.categories.indexOf(category) >= 0 || !category) {
                this.showMarker(marker);
            } else {
                this.hideMarker(marker);
            }
        }
    }
};


GoogleMapManager.prototype.getInfowindow = function(id) {
    return this.infowindows[id];
};
GoogleMapManager.prototype.canUseInfoBubble = function() {
    if (this.settings.markers.infobubble) {
        if (typeof InfoBubble === 'function') {
            this.infobubble = true;
        } else {
            console.error('InfoBubble is required with "options.markers.infobubble: {...}" : https://github.com/googlemaps/js-info-bubble');
        }
    }
};

GoogleMapManager.prototype.zoomIn = function(increment) {
    if (typeof increment === 'undefined') increment = 1;
    this.map.setZoom(this.map.getZoom() + increment);

    return this;
};

GoogleMapManager.prototype.zoomOut = function(increment) {
    if (typeof increment === 'undefined') increment = 1;
    this.map.setZoom(this.map.getZoom() - increment);

    return this;
};

GoogleMapManager.prototype.boundZoom = function() {
    var bounds = new google.maps.LatLngBounds();

    var foundMarkesNb = 0;
    for (var id in this.markers) {
        if (this.markers[id].getMap() !== null && !this.markers[id].unfilterable) {
            foundMarkesNb++;
            bounds.extend(this.markers[id].getPosition());
        }
    }
    if (foundMarkesNb) {
        this.map.fitBounds(bounds);

        // trigger event bound zoomed
        var manager = this;
        // setTimeout(function() {
            manager.trigger('boundZoomed', manager);
        // }, 600);
    }

    return this;
};


//EVENTS
GoogleMapManager.prototype.trigger = function(eventName, detail) {
    // create and dispatch the event
    var event = new CustomEvent(eventName, {
        'detail': detail
    });
    this.getElement().dispatchEvent(event);
};



GoogleMapManager.prototype.on = function(eventName, callback) {
    // add an event listener
    var manager = this;
    return this.getElement().addEventListener(eventName, function(e) {
        callback.call(manager, e.detail);
    });
};


//UTILS
GoogleMapManager.prototype.merge = function() {
    var obj = {},
        i = 0,
        il = arguments.length,
        key;
    for (; i < il; i++) {
        for (key in arguments[i]) {
            if (arguments[i].hasOwnProperty(key)) {
                obj[key] = arguments[i][key];
            }
        }
    }
    return obj;
};


//POLYFILL
(function() {

    if (typeof window.CustomEvent === "function") return false;

    function CustomEvent(event, params) {
        params = params || {
            bubbles: false,
            cancelable: false,
            detail: undefined
        };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();
