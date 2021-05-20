/* global L */
// Bike Trail Tirol Beispiel

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
    ]),
};

// Overlays für die Themen zum Ein- und Ausschalten definieren
let overlays = {
    tracks: L.featureGroup()
};

// Karte initialisieren und auf Innsbrucks Wikipedia Koordinate blicken
let map = L.map("map", {
    fullscreenControl: true,
    center: [47.267222, 11.392778],
    zoom: 9,
    layers: [
        baselayers.grau
    ]
})
// Kartenhintergründe und Overlays zur Layer-Control hinzufügen
let layerControl = L.control.layers({
    "basemap.at Standard": baselayers.standard,
    "basemap.at grau": baselayers.grau,
    "basemap.at Relief": baselayers.terrain,
    "basemap.at Oberfläche": baselayers.surface,
    "basemap.at hochauflösend": baselayers.highdpi,
    "basemap.at Orthofoto beschriftet": baselayers.ortho_overlay
}, {
    "GPX-Tracks": overlays.tracks
}).addTo(map);

// Overlay mit GPX-Track anzeigen
overlays.tracks.addTo(map);

//Leaflet Elevationprofile Plugin
const elevationControl = L.control.elevation({
    elevationDiv: "#profile", 
    followMarker: false,
    theme: "lime-theme"
}).addTo(map);

// Leaflet GPX Profil
const drawTrack = (nr) => {
    //console.log("track:", nr);
    elevationControl.clear();
    overlays.tracks.clearLayers();
    let gpxTrack = new L.GPX(`tracks/${nr}.gpx`, {
        async: true,
        marker_options: {
            startIconUrl: `icons/number_${nr}.png`,
            endIconUrl: 'icons/finish.png',
            shadowUrl: null
          },
          polyline_options: {
              color: 'black',
              dashArray: [2, 5] 
          }
    }).addTo(overlays.tracks);
    gpxTrack.on("loaded", () => {
        //console.log("loaded.gpx");
        map.fitBounds(gpxTrack.getBounds());
    gpxTrack.bindPopup(`<h3>${gpxTrack.get_name(nr)}</h3>
    <ul>
        <li><strong> Distance: </strong>${gpxTrack.get_distance(nr)/1000} km</li>
        <li><strong>Manimal Height: </strong>${gpxTrack.get_elevation_min(nr)} m.ü.A.</li>
        <li><strong>Maximal Height: </strong>${gpxTrack.get_elevation_max(nr)} m.ü.A</li>
    </ul>`);
    });
    elevationControl.load(`tracks/${nr}.gpx`);
};

const selectedTrack = 8;

drawTrack(selectedTrack);

//Pulldown Menü
//console.log("biketirol json: ", BIKETIROL);
let pulldown = document.querySelector("#pulldown"); 
console.log("pulldown: ", pulldown);
let selected = '';
for(let track of BIKETIROL) {
    if(selectedTrack == track.nr) {
        selected = 'selected';
    } else {
        selected = '';
    }
    pulldown.innerHTML += `<option  ${selected} value="${track.nr}">${track.nr}: ${track.etappe}</option>`
}

pulldown.onchange = () => {
    //console.log("changed!!!", pulldown.value);
    drawTrack(pulldown.value);
};