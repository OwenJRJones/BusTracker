// IIFE
(() => {

    //Instantiate a geoJSON layer to add featurtes to
    let currentLayer;

    //Store bus API URL in variable for simplicity sake
    const apiURL = "https://hrmbusapi.herokuapp.com/";

    //Create bus icon object for map markers
    const busIcon = L.icon({
        iconUrl: 'bus.png',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });

    //Create map in leaflet and tie it to the div called 'theMap'
    let map = L.map('theMap').setView([44.650627, -63.597140], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

    //Create function to proccess bus data from API
    function mapBusData(data) {

        //Check if data has already been plotted onto the map (for refresh purposes)
        if (currentLayer != undefined) {
            currentLayer.remove(map);
        }

        //Create array to store bus data from API
        let busData = [];

        // Filter through bus data to retrieve only bus routes 1-10
        data.entity.filter((bus) => {

            if (bus.vehicle.trip.routeId <= 10) {

                busData.push({
                    id: bus.id,
                    routeId: bus.vehicle.trip.routeId,
                    bearing: bus.vehicle.position.bearing,
                    position: {
                        lat: bus.vehicle.position.latitude,
                        lon: bus.vehicle.position.longitude   
                    }
                });
            }
        })

        //For demonstration purposes
        console.log("Bus Data:")
        console.log(busData);

        // Create a feature collection for bus info in geoJSON form
        let busGeoCollection = [];
            
        busData.map((bus) => {
            busGeoCollection.push({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [bus.position.lon, bus.position.lat]
                },
                properties: {
                    popupContent: "<p><strong>Bus ID: " + bus.id + "</br>Route ID: " + bus.routeId + "</br>Bearing: " + bus.bearing + "</strong></p>",
                    bearing: bus.bearing
                }
            })
        });

        //For demonstration purposes
        console.log("GeoJSON Feature Collection:")
        console.log(busGeoCollection);
        
        //Add bus markers to the map accordingly and add popups with respective data
        currentLayer = L.geoJSON(busGeoCollection, {
            pointToLayer: function(feature, latlng) {
                return L.marker(latlng, {
                    icon: busIcon, rotationAngle: feature.properties.bearing
                });
            },
            onEachFeature: function(feature, layer) {
                if (feature.geometry.type === "Point") {
                    layer.bindPopup(feature.properties.popupContent);
                }
            }
        }).addTo(map);
    }      
    
    //Create function to call API and also refresh data
    function fetchApiData() {
        fetch(apiURL)
        .then((response) => response.json())
        .then((data) => {
            mapBusData(data);
            setTimeout(fetchApiData, 13000);
        });
    }

    //Set the whole thing in motion!
    fetchApiData();

})()