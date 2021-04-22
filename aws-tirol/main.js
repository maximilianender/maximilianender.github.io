//https://leafletjs.com/reference-1.7.1.html#tilelayer
let basemapGray = L.tileLayer.provider('BasemapAT.grau');

//https://leafletjs.com/reference-1.7.1.html#map-example
let map = L.map("map", {
    center: [47, 11],
    zoom: 9,
    layers: [
        basemapGray
    ]
});

//https://leafletjs.com/reference-1.7.1.html#layer

let overlays = {
stations: L.featureGroup(),
temperature: L.featureGroup(),
snowheight: L.featureGroup(),
windspeed: L.featureGroup(),
winddirection: L.featureGroup(),
};

let layerControl = L.control.layers({
    "BasemapAT.grau": basemapGray,
    "BasemapAT.orthofoto": L.tileLayer.provider('BasemapAT.orthofoto'),
    "BasemapAT.surface": L.tileLayer.provider('BasemapAT.surface'),
    "BasemapAT.overlay": L.tileLayer.provider('BasemapAT.overlay'),
    "BasemapAT.overlay+ortho": L.layerGroup([
        L.tileLayer.provider('BasemapAT.orthofoto'),
        L.tileLayer.provider('BasemapAT.overlay')
    ])
}, {
    'Wetterstationen Tirol': overlays.stations,
    'Lufttemperatur (°C)': overlays.temperature,
    'Schneehöhe (cm)': overlays.snowheight,
    'Windgeschwindigkeit (km/h)': overlays.windspeed,
    'Windrichtung': overlays.winddirection
}, {
    collapsed: false
}).addTo(map);
overlays.temperature.addTo(map);

L.control.scale(
    {
        maxWidth: 200,
        metric: true,
        imperial: false
    }
).addTo(map);

let getColor = (value, colorRamp) => {
    for (let rule of colorRamp) {
        if (value >= rule.min && value < rule.max) {
            return rule.col;
        }
    }
    return "black"; 
};

let newLabel = (coords, options) => {
    let color = getColor(options.value, options.colors)
    let label = L.divIcon({
        html: `<div>${options.value}</div>`,
        className: "text-label"
    })
    let marker = L.marker([coords[1],coords[0]], {
        icon: label
    });
    return marker;
    //Label zurückgeben
};
// .text-label div
let awsUrl = "https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson";

//https://leafletjs.com/reference-1.7.1.html#featuregroup

fetch(awsUrl).then(response => response.json())
    .then(json => {
        console.log("Daten konvertiert: ", json);
        for (station of json.features) {
            console.log("Station: ", station);
            let marker = L.marker([
                station.geometry.coordinates[1],
                station.geometry.coordinates[0]
            ]);
            let formattedDate = new Date(station.properties.date);
            marker.bindPopup(`
    <h3>${station.properties.name}</h3>
    <ul>
        <li>Datum: ${formattedDate.toLocaleString("de")} Uhr</li>
        <li>Seehöhe: ${station.geometry.coordinates[2] ||"?"} m.ü.A.</li>
        <li>Temperatur: ${station.properties.LT||"?"} °C</li>
        <li>Relative Luftfeuchtigkeit: ${station.properties.RH||"?"} %</li>
        <li>Schneehöhe: ${station.properties.HS||"?"} cm</li>
        <li>Windgeschwindigkeit: ${station.properties.WG||"?"} km/h</li>
        <li>Windrichtung: ${station.properties.WR||"?"} °</li>
    </ul>
    <a target="_blank" href="https://wiski.tirol.gv.at/lawine/grafiken/1100/standard/tag/${station.properties.plot}.png">Grafik</a>
    `);
            //marker.addTo(awsLayer);
            marker.addTo(overlays.stations);
            //Schneehöhe
            if (typeof station.properties.HS == 'number'){
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.HS,
                    colors: COLORS.snowheight
                });
                marker.addTo(overlays.snowheight);
            } 
            //Windgeschwindigkeit
            if(typeof station.properties.WG == 'number'){
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.WG,
                    colors: COLORS.windspeed
                });
                marker.addTo(overlays.windspeed);
            }
            //Lufttemperatur 
            if(typeof station.properties.LT == 'number'){
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.LT,
                    colors: COLORS.temperature
                });
                marker.addTo(overlays.temperature);
            }
        }
        // set map view to all stations
        map.fitBounds(overlays.stations.getBounds());
    });

    