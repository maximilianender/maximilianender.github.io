
let basemapGray = L.tileLayer.provider('BasemapAT.grau');

let map = L.map("map", {
    center: [47, 11],
    zoom: 9, 
    layers: [
        basemapGray
    ]
}
);

let layerControl = L.control.layers({
    "BasemapAT.grau": basemapGray,
    "BasemapAT.orthofoto": L.tileLayer.provider('BasemapAT.orthofoto'),
    "BasemapAT.surface": L.tileLayer.provider('BasemapAT.surface'),
    "BAsemapAT.overlay": L.tileLayer.provider('BasemapAT.overlay'),
    "BasemapAT.overlay+ortho":
    L.layerGroup([
        L.tileLayer.provider('BasemapAT.orthofoto'),
        L.tileLayer.provider('BasemapAT.overlay')
    ])
}).addTo(map);

let awsUrl="https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson"; 

let awsLayer = L.featureGroup();
layerControl.addOverlay(awsLayer, "Wetterstationen Tirol");
awsLayer.addTo(map);

fetch(awsUrl) .then(response => response.json())
.then(json=>{console.log("Daten konvertier: ", json);
for(station of json.features) {
    console.log("Station: ", station);
    let marker = L.marker([
    station.geometry.coordinates[1],
    station.geometry.coordinates[0]]);
    marker.bindPopup(`
    <h3>${station.properties.name}</h3>
    <ul>
        <li>Datum: ${station.properties.date}</li>
        <li>Temperatur: ${station.properties.LT}</li>
    </ul>
    `);
    marker.addTo(awsLayer);
}
// set map view to all stations
map.fitBounds(awsLayer.getBounds());
}); 

