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
    zoom: 12,
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
});

let mrk = L.marker([stop.lat, stop.lng]).addTo(map);
    mrk.bindPopup(`<h4> ${stop.nr}: ${stop.name}</h4><p><i class="fasfa-external-link-alt mr-3"></i><a href="${stop.wikipedia}">Read about stop in Wikipedia</a></p>`).openPopup();


//console.log(document.querySelector("#map"))