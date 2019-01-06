var newMap;
jQuery(document).ready(function() {
    newMap = new GoogleMapManager('myCustomMap', {
        googleMap: {

        },
        markers: {
            // cluster: {
            //     imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
            // },
            // infobubble: {}
        }
    });
    var markers = [
        [45.501526, -73.567853, 'My test 1'],
        [43.501526, -73.567853, 'My test 2'],
        [44.501526, -72.567853, 'My test 3'],
        [44.501526, -72.667853, 'My test 4'],
    ];
    for (var i = 0; i < markers.length; i++) {
        newMap.addMarker({
            id: i,
            title: markers[i][2],
            lat: markers[i][0],
            lng: markers[i][1],
            template: "<div><h1>" + markers[i][2] + "</h1></div>",
            categories: markers[i][2]
        });
    }

    newMap.on('markerOpened', function(marker) {
        this.zoomIn();
        this.map.panTo(marker.getPosition());
    });

    newMap.on('markerClosed', function(marker) {
        this.boundZoom();
    });

    newMap.on('boundZoomed', function() {
        this.map.panBy(300, 0);
    });

    newMap.boundZoom();
});
