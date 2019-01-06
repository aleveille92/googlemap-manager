# googlemap-manager

## Usage

1\.  Add the latest *googlemap-manager* javascript file

```html
<script src="/path/to/googlemap-manager.js"></script>

<!-- optional -->
<!-- required if markers.cluster is used  -->
<script src="/path/to/markerclusterer.js"></script>
<!-- required if markers.infoBubble is used  -->
<script src="/path/to/infobubble.js"></script>
```

2\.  Create a element with an unique ID

```html
<div id="myCustomMap"></div>
```

3\.  Initialize a new GoogleMapManager instance

```js
var newMap = new GoogleMapManager('myCustomMap', {
    // Settings
});
```

## Settings
| Name | Type | Description |
| --- | --- | --- |
| `googleMap` | object | Support all the same options as a normal google map. |
| `markers` | object | An object regrouping all the below settings. |
| `markers.closeOthers` | boolean<br/>Default **true** | Determine if all other markers should close when a new one is opened. |
| `markers.cluster` | object | When use enable the *markerclusterer.js* extension. Support all the options of the plugin. |
| `markers.infoBubble` | object | When use enable the *infobubble.js* extension. Support all the options of the plugin. |
| `styles` | object | An object representing the colors and elements to show on the map. Can be generated online on a site like [Snazzy Maps](https://snazzymaps.com/). |

## Methods
```js
newMap.addMarker({
    id: 1,
    title: "My marker",
    lat: 45,
    lng: -73,
    template: "<div>Content of the infowindow...</div>",
    categories: markers[i][2]
});
```
| Name | Options | Description |
| --- | --- | --- |
| `on` | eventName, callback | Listen to  an event by name |
| `zoomIn` | number<br/>*optional* | Increase the zoom by the amount specified. |
| `zoomOut` | number<br/>*optional* | Decrease the zoom by the amount specified. |
| `boundZoom` | - | Set the zoom of the map so that all markers fit in the view. |
| `addMarker` | `id:number`<br/>`title:string`<br/>`lat:number`<br/>`lng:number`<br/>`icon:path`<br/>`template:number`<br/>`categories:number` | Add a marker to the map. If no template is passed the title will be used. |
| `getMarker` | id | Retrieve a marker by ID. |
| `showMarker` | id *or* marker | Make the marker visible on the map. |
| `hideMarker` | id *or* marker | Make the marker invisible on the map. |
| `openMarker` | id *or* marker | Open the infowindow associated to the marker. |
| `filterMarkers` | category | Show only the marker that have the category. |
| `getInfowindow` | id | Retrieve an infowindow by marker ID. |
| `trigger` | EventName, data | Trigger an event by name |

## Events
All the event receive the manager has `this`. Example:
```js
newMap.on('markerOpened', function(marker) {
    this.zoomIn();
    this.map.panTo(marker.getPosition());
});
```

| Name | Callback | Description |
| --- | --- | --- |
| `markerOpened` | (marker) | Triggered when the marker infowindow as been opened. |
| `markerClosed` | (marker) | Triggered when the marker infowindow as been closed. |
| `boundZoomed` | - | Triggered when the method `boundZoom` is called. |
