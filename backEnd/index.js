require('dotenv').config();
const express = require('express')
const app = express()
const port = 3000

const Client = require("@googlemaps/google-maps-services-js");
//console.log(Client)
/*
const client = new Client.Client({});
console.log(process.env.apikey)
client
  .elevation({
    params: {
      locations: [{ lat: 45, lng: -110 }],
      key: process.env.apikey,
    },
    timeout: 1000, // milliseconds
  })
  .then((r) => {
    console.log(r.data.results[0].elevation);
  })
  .catch((e) => {
    console.log(e.response.data.error_message);
  });
*/

// ROUTES------------------------- 
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/publiclocations', (req,res) => {
    // Return locations of all public bathrooms near this latitude and longitude
    // Params: latitude, longitude
    client
        .elevation({
            params: {
            locations: [{ lat: 45, lng: -110 }],
            key: process.env.API_KEY,
            },
            timeout: 1000, // milliseconds
        })
        .then((r) => {
            console.log(r.data.results[0].elevation);
        })
        .catch((e) => {
            console.log(e.response.data.error_message);
        });
    res.send(req.url);
})

app.get('/privatelocations', (req,res) => {
    // Return locations of all private submitted bathrooms
    
    res.send(req.url);
})

app.get('/locations/:user', (req,res) => {
    // Return locations of specific user's submitted bathrooms
    console.log(req.params.user);
    res.send(req.url);
})
//-----------------------------------

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
