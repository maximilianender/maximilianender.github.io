console.log("Hello World!");
console.log(L);

const map = L.map("map", {
    center: [-41.293056, 174.001944],
    zoom: 14,
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
});

let mrk = L.marker([-41.293056, 174.001944]).addTo(map);
console.log(document.querySelector("#map"))