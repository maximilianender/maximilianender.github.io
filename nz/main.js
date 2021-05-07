console.log("Hello World!");
console.log(L);

let stop = {
    nr: 19,
    name: "Picton",
    lat: -41.293056,
    lng: 174.001944,
    user: "maximilianender",
    wikipedia: "https://en.wikipedia.org/wiki/Picton,_New_Zealand"
};



const map = L.map("map", {
    //center: [stop.lat, stop.lng],
    //zoom: 10,
    fullscreenControl: true,
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
});

let nav = document.querySelector("#navigation");

ROUTE.sort((stop1, stop2) => {
    return stop1.nr > stop2.nr
});

//console.log(ROUTE);
for (let entry of ROUTE) {
    //console.log(entry);

    nav.innerHTML += `
    <option value="${entry.user}">Stop  ${entry.nr}: ${entry.name}</option>
    `;

    let mrk = L.marker([entry.lat, entry.lng]).addTo(map);
    mrk.bindPopup(`<h4> ${entry.nr}: ${entry.name}</h4><p><i class="fas fa-external-link-alt mr-3"></i><a href="${entry.wikipedia}">Read about stop in Wikipedia</a></p>`);

    if (entry.nr == 19) {
        map.setView([entry.lat, entry.lng], 13);
        mrk.openPopup();
    }

}

nav.options.selectedIndex = 19 - 1;
nav.onchange = (evt) => {
    let selected = evt.target.selectedIndex;
    let options = evt.target.options;
    let username = options[selected].value;
    let link = `https://${username}.github.io/nz/index.html`
    console.log(username, link);

    window.location.href = link;
};

//console.log(document.querySelector("#map"))

//leaflet minimap
var miniMap = new L.Control.MiniMap(L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"), {
    toggleDisplay: true,
    minimized: false
}).addTo(map);