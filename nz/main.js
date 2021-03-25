console.log("Hello World!");
console.log(L);

let stop = {
    nr: 19,
    name: "Picton",
    lat: -41.293056,
    lng:  174.001944,
    user: "maximilianender",
    wikipedia: "https://en.wikipedia.org/wiki/Picton,_New_Zealand"
};



const map = L.map("map", {
    center: [stop.lat, stop.lng],
    zoom: 10,
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
});

console.log(ROUTE);
for (let entry of ROUTE) {
    console.log(entry);

    let mrk = L.marker([entry.lat, entry.lng]).addTo(map);
    mrk.bindPopup(`<h4> ${entry.nr}: ${entry.name}</h4><p><i class="fas fa-external-link-alt mr-3"></i><a href="${entry.wikipedia}">Read about stop in Wikipedia</a></p>`);

    if (entry.nr == 19) {
        map.setView([entry.lat, entry.lng],13);
        mrk.openPopup();
    }

}


//console.log(document.querySelector("#map"))