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
    tracks: L.featureGroup(),
    wikipedia: L.featureGroup()
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
    "GPX-Tracks": overlays.tracks,
    "Wikipedia-Artikel": overlays.wikipedia
}).addTo(map);

//Wikipedia Artikelzeichnen
let articleDrawn = {};
const drawWikipedia = (bounds) => {
    let url = `https://secure.geonames.org/wikipediaBoundingBoxJSON?formatted=true&north=${bounds.getNorth()}&south=${bounds.getSouth()}&east=${bounds.getEast()}&west=${bounds.getWest()}&username=maximilianender&lang=de&maxRows=30`;

    let icons = {
        adm1st: "wikipedia_administration.png",
        adm2nd: "wikipedia_administration.png",
        adm3rd: "wikipedia_administration.png",
        airport: "wikipedia_helicopter.png",
        city: "wikipedia_smallcity.png",
        glacier: "wikipedia_glacier-2.png",
        landmark: "wikipedia_landmark.png",
        railwaystation: "wikipedia_train.png",
        river: "wikipedia_river-2.png",
        mountain: "wikipedia_mountains.png",
        waterbody: "wikipedia_lake.png",
        default: "wikipedia_information.png",
    };

    //URL bei geonames.org aufrufen und JSON-Daten abholen
    fetch(url).then(
        response => response.json()
    ).then(jsonData => {
        // Artikel Marker erzeugen
        for (let article of jsonData.geonames) {
            //Hab ich den Artikel schon gezeichnet?
            if (articleDrawn[article.wikipediaUrl]) {
                //Ja, nicht noch einmals zeichnen
                continue;
            } else {
                //Nein
                articleDrawn[article.wikipediaUrl] = true;
            }
            // Welches Icon soll verwendet werden? 
            if (icons[article.feature]) {
                // ein Bekanntes
            } else {
                // Generisches Info-Icon
                article.feature = "default";
            };

            let mrk = L.marker([article.lat, article.lng], {
                icon: L.icon({
                    iconUrl: `icons/${icons[article.feature]}`,
                    iconSize: [32, 37],
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37],
                })
            });
            mrk.addTo(overlays.wikipedia);

            // optionales Bild definieren
            let img = "";
            if (article.thumbnailImg) {
                img = `<img src="${article.thumbnailImg}" alt="Thumbnail">`;
            }

            // Popup definieren 
            mrk.bindPopup(`
                <small>${article.feature}</small>
                <h3>${article.title} (${article.elevation}m)</h3>
                ${img}
                <p>${article.summary}</p>
                <a href="https://${article.wikipediaUrl}">'Wikipedia</a>
            `);
        }
    });
};

// Overlay mit GPX-Track anzeigen
overlays.tracks.addTo(map);
overlays.wikipedia.addTo(map);

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
        gpxTrack.bindPopup(`
    <h3>${gpxTrack.get_name()}</h3>
    <ul>
        <li>Streckenlänge: ${gpxTrack.get_distance()} m</li>
        <li>tiefster Punkt: ${gpxTrack.get_elevation_min()} m</li>
        <li>höchster Punkt: ${gpxTrack.get_elevation_max()} m</li>
        <li>Höhenmeter bergauf: ${gpxTrack.get_elevation_gain()} m</li>
        <li>Höhenmeter bergab: ${gpxTrack.get_elevation_loss()} m</li>
    </ul>
    `);
    });
    elevationControl.load(`tracks/${nr}.gpx`);
};

const selectedTrack = 8;

drawTrack(selectedTrack);

const updateTexts = (nr) => {
    console.log(nr);
    for (let etappe of BIKETIROL) {
        //console.log(etappe);
        // Ist es die aktuelle Etappe? 
        if (etappe.nr == nr) {
            console.log("unsere Etappe", etappe);
            for (let key in etappe) {
                console.log("key:", key, "value", etappe[key]);
                // gibt es ein Element im HTML mit der ID von "key"
                if (document.querySelector(`#${key}`)) {
                    console.log("Juhu", key, etappe[key]);
                    document.querySelector(`#${key}`).innerHTML = etappe[key];
                }
            }
        };
    }
};

//Pulldown Menü
//console.log("biketirol json: ", BIKETIROL);
let pulldown = document.querySelector("#pulldown");
console.log("pulldown: ", pulldown);
let selected = '';
for (let track of BIKETIROL) {
    if (selectedTrack == track.nr) {
        selected = 'selected';
    } else {
        selected = '';
    }
    pulldown.innerHTML += `<option  ${selected} value="${track.nr}">${track.nr}: ${track.etappe}</option>`
}
// Metadaten der Etappe updaten
updateTexts(pulldown.value);

pulldown.onchange = () => {
    //console.log("changed!!!", pulldown.value);
    drawTrack(pulldown.value);

    //Metadaten der Etappe updaten 
    updateTexts(pulldown.value);
};

map.on("zoomend moveend", () => {
    //Wikipedia Artikel zeichnen 
    drawWikipedia(map.getBounds());
});