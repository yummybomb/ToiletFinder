require('dotenv').config();
const express = require('express')
const app = express()
const port = 3000
var axios = require('axios');
app.use(express.json());

const Client = require("@googlemaps/google-maps-services-js");
const client = new Client.Client({});

privateLocations = []; // Should hold object of {owner, name, latitude, longitude, vicinity}

// ROUTES------------------------- 

// Params: latitude, longitude
// Return locations of all public bathrooms near this latitude and longitude
app.get('/publiclocations', (req,res) => {
    console.log(`getting public locations`);
    const { latitude, longitude } = req.query;
    //console.log(latitude);
    var config = {
        method: 'get',
        url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude}%2C${longitude}&radius=800&keyword=public%20bathrooms&type=&key=${process.env.API_KEY}`
    };
    
    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data.results));
            response.data.results.forEach(element => {
                console.log(`Name: ${element.name}, Location: Lat:${element.geometry.location.lat} Long:${element.geometry.location.lng}`);
            })
            res.json(response.data.results);
        })
        .catch(function (error) {
            console.log(error);
            res.json();
        });
})

// Return locations of all private submitted bathrooms
app.get('/privatelocations', (req,res) => { 
    console.log("getting private locations")
    res.status(200).json(privateLocations);
})

// Return locations of specific user's submitted bathrooms
app.get('/locations/:user', (req,res) => {
    console.log(`getting ${req.params.user}'s locations`);
    user = req.params.user;
    returnArr = [];
    privateLocations.forEach(element => {
        if (element.owner == user)
            returnArr.push(element);
    })
    res.json(returnArr);
})

// Adds location to list
app.post('/locations', (req,res) => {
    const {owner, name, latitude, longitude, vicinity} = req.body;
    if (owner && name && latitude && longitude && vicinity) {
        privateLocations.push({owner, name, latitude, longitude, vicinity});
        res.status(200).json("success");
    } else {
        res.status(400).json("failed");
    }

})
//-----------------------------------

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
