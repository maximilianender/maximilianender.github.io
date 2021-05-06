// OGD-Wien Beispiel

// Kartenhintergründe der basemap.at definieren
let baselayers = {
    standard: L.tileLayer.provider("BasemapAT.basemap"),
    grau: L.tileLayer.provider("BasemapAT.grau"),
    terrain: L.tileLayer.provider("BasemapAT.terrain"),
    surface: L.tileLayer.provider("BasemapAT.surface"),
    highdpi: L.tileLayer.provider("BasemapAT.highdpi"),
    ortho_overlay: L.layerGroup([
        L.tileLayer.provider("BasemapAT.orthofoto"),
        L.tileLayer.provider("BasemapAT.overlay")
    ])
};

// Overlays für die Themen zum Ein- und Ausschalten definieren
let overlays = {
    busLines: L.featureGroup(),
    busStops: L.markerClusterGroup(),
    pedAreas: L.featureGroup(),
    sights: L.markerClusterGroup()
};

// Karte initialisieren und auf Wiens Wikipedia Koordinate blicken
let map = L.map("map", {
    //Leaflet Fullscreen:
    fullscreenControl: true,
    center: [48.208333, 16.373056],
    zoom: 11.5,
    layers: [
        baselayers.grau
    ]
});

// Kartenhintergründe und Overlays zur Layer-Control hinzufügen
let layerControl = L.control.layers({
    "basemap.at Standard": baselayers.standard,
    "basemap.at grau": baselayers.grau,
    "basemap.at Relief": baselayers.terrain,
    "basemap.at Oberfläche": baselayers.surface,
    "basemap.at hochauflösend": baselayers.highdpi,
    "basemap.at Orthofoto beschriftet": baselayers.ortho_overlay
}, {
    "Liniennetz Vienna Sightseeing": overlays.busLines,
    "Haltestellen Vienna Sightseeing": overlays.busStops,
    "Fußgängerzonen": overlays.pedAreas,
    "Sehenswürdigkeiten": overlays.sights
}).addTo(map);

// alle Overlays nach dem Laden anzeigen
overlays.busLines.addTo(map);
overlays.busStops.addTo(map);
overlays.pedAreas.addTo(map);
overlays.sights.addTo(map);

let drawBusStop = (geojsonData) => {
    L.geoJson(geojsonData, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>${feature.properties.STAT_NAME} <hr>${feature.properties.LINE_NAME}`)
        },
        pointToLayer: (geoJsonPoint, latlng) => {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/busstop.png",
                    iconSize: [35, 35]
                })
            })
        },
        attribution: "<a href='https://data.wien.gv.at '>Stadt Wien </a>, <a href= 'https://mapicons.mapsmaker.com'>Maps Icons Collection</a>"
    }).addTo(overlays.busStops);
}

let drawBusLine = (geojsonData) => {
    L.geoJson(geojsonData, {
        style: (feature) => {
            let col = COLORS.buslines[feature.properties.LINE_NAME];
            return {
                color: col
            }
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>${feature.properties.LINE_NAME}</strong><hr> von:  <strong>${feature.properties.FROM_NAME}</strong><br> nach: <strong>
            ${feature.properties.TO_NAME}</strong>`)
        },
        attribution: "<a href='https://data.wien.gv.at '>Stadt Wien </a>"
    }).addTo(overlays.busLines);
}

let drawPedAreas = (geojsonData) => {
    L.geoJson(geojsonData, {
        style: (feature) => {
            return{
                stroke: true,
                color: "silver",
                fillColor: "yellow",
                fillOpacity: 0.5
            }
        },
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>Fußgängerzone ${feature.properties.ADRESSE}</strong><hr>
            ${feature.properties.ZEITRAUM || ''}<br>
            ${feature.properties.AUSN_TEXT || ''}`);
        },
        attribution: "<a href='https://data.wien.gv.at'>Stadt Wien </a>"
    }).addTo(overlays.pedAreas);
}

let drawSights = (geojsonData) => {
    L.geoJson(geojsonData, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>${feature.properties.NAME}</strong> <hr>${feature.properties.ADRESSE}`)
        },
        pointToLayer: (geoJsonPoint, latlng) => {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/sight.png",
                    iconSize: [20, 20]
                })
            })
        },
        attribution: "<a href='https://data.wien.gv.at '>Stadt Wien </a>, <a href= 'https://mapicons.mapsmaker.com'>Maps Icons Collection</a>"
    }).addTo(overlays.sights);
}


//Bushaltestellen-Layer
/*fetch("data/TOURISTIKHTSVSLOGD.json") 
.then(response => response.json())
.then(stations => {
    L.geoJson(stations, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(feature.properties.STAT_NAME)
        },
        pointToLayer: (geoJsonPoint, latlng) => {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/busstop.png",
                    iconSize: [35, 35]
                })
            })
        }
    }).addTo(map);
})*/

//Schleife über OGD 
for (let config of OGDWIEN) {
    console.log("Cofig: ", config.data);
    fetch(config.data)
        .then(response => response.json())
        .then(geojsonData => {
            console.log("Data: ", geojsonData);
            if (config.title == "Haltestellen Vienna Sightseeing") {
                drawBusStop(geojsonData);
            } else if (config.title == "Liniennetz Vienna Sightseeing") {
                drawBusLine(geojsonData);
            } else if (config.title == "Fußgängerzonen") {
                drawPedAreas(geojsonData);
            } else if (config.title == "Sehenswürdigkeiten") {
                drawSights(geojsonData);
            }
        })
}

//leaflet hash 
L.Hash(map);

var miniMap = new L.Control.MiniMap(L.tileLayer.provider("BasemapAT.basemap")).addTo(map);

