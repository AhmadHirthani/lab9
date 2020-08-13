"use strict";
const express = require("express");
const pg = require('pg');
require('dotenv').config();
const axios = require("axios");
const { default: Movie } = require("./Models/Movie");
const Location = require("./Models/Location").default;
const Weather = require("./Models/Weather").default;
const Trails = require("./Models/Trails").default;
const Yelp = require("./Models/Yelp").default;
const superagent = require('superagent');
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
const PORT = process.env.PORT || 3000;

app.all("*", (req, res, next) => {
    //console.log(`${req.method} ${req.url}`);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, HEAD, PUT, PATCH, POST, DELETE"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
});

app.get("/", (req, res) => {
    res.status(200).send({ msg: "Welcome to my App. Ahmad Alhrthani" });
});
app.get("/location", handleLocation);
app.get("/weather", handelWeather);
app.get("/trails", handelTrails);
app.get("/movies", handelMovies);
// app.get("/yelp", handelYelp);

//handle location function
function handleLocation(req, res, next) {
    const { city } = req.query;
    try {
        if (!city) throw new Error();
        else if (!isNaN(city)) throw new Error();
        getLocationFromDB(city, function(locationData) {

            if (locationData) {
                res.status(200).send(locationData);
            } else {
                getLocationFromAPI(city, (locationItem) => {
                    addLocationToDB(locationItem);
                    res.status(200).send(locationItem);
                });
            }
        })
    } catch (e) {
        next(e);
    }
};

//get location from API function
function getLocationFromAPI(city, callback) {
    let APIKEY = process.env.LOCATION_API_KEY;
    let url = `https://api.locationiq.com/v1/autocomplete.php?key=${APIKEY}&q=${city}`;
    axios.get(url).then(response => {
        callback(new Location(
            city,
            response.data[0].display_place,
            response.data[0].lat,
            response.data[0].lon,
            response.data[0].address.country_code));
    });
}

//get location from DB function
function getLocationFromDB(city, callback) {
    const SQL = `SELECT * FROM locations WHERE search_query=$1;`;
    const values = [city];
    client.query(SQL, values)
        .then(result => {
            console.log('result.rowCount', result.rowCount);
            if (result.rowCount > 0) {
                console.log('From DB');
                let locationItem = result.rows[0];
                let locationData = new Location(
                    city,
                    locationItem.display_name,
                    locationItem.lat,
                    locationItem.lon,
                    locationItem.region_code);
                callback(locationData);
            } else {
                callback(null);
            }
        });
}

//add location to DB function
function addLocationToDB(locationData) {
    const SQL = `INSERT INTO locations (search_query,display_name,lat,lon,region_code) VALUES ('${locationData.search_query}','${locationData.formatted_query}','${locationData.latitude}','${locationData.longitude}','${locationData.region_code}');`;
    console.log('SQL: ', SQL);
    client.query(SQL)
        .then(result => {
            // //console.log("addLocationToDB result: ", result);
            // Check to see if the location was found and return the results
        });
}

//handle weather function
function handelWeather(req, res) {
    let city = req.query.search_query;
    getWeatherFromAPI(city, (returnedData) => {
        res.status(200).send(returnedData);
    });
}

//get weather from API function
function getWeatherFromAPI(city, callback) {
    Weather.all = [];
    let WEATHER_API_KEY = process.env.WEATHER_API_KEY;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${WEATHER_API_KEY}`;
    axios.get(url).then(data => {
        const returnedData = data.data.data.map(item => {
            return new Weather(city, item);
        });
        callback(returnedData);
    });
}

//handle Trails function
function handelTrails(req, res) {
    let latitude = req.query.latitude;
    let longitude = req.query.longitude;
    getTrailsFromAPI(latitude, longitude).then(returnedData => {
        // console.log('returnedData:',returnedData);
        res.send(returnedData);
    }).catch((err) => {});
}

//get Trails from API function
function getTrailsFromAPI(lat, lon) {
    let APIKEY = process.env.HIKING_API_KEY;
    let url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=200&key=${APIKEY}`;
    return axios.get(url).then(data => {
        return data.data.trails.map(data => {
            return new Trails(data);
        });
    });
}

//handle Movies function
function handelMovies(req, res) {
    let region_code = req.query.region_code;
    getMoviesFromAPI(region_code, (returnedData) => {
        res.status(200).send(returnedData);
    });
};

//get Movies from API function
function getMoviesFromAPI(region_code, callback) {
    Movie.all = [];
    let APIKEY = process.env.MOVIE_API_KEY;
    let url = `https://api.themoviedb.org/3/discover/movie?api_key=${APIKEY}&language=ar-Ar-En-en&region=${region_code}&release_date.gte=2016-11-16&release_date.lte=2016-12-02&with_release_type=2|3`;
    axios.get(url).then(data => {
        const returnedData = data.data.results.map(item => {
            return new Movie(item);
        });
        callback(returnedData);
    });
}

//handle yelp function
app.get("/yelp", async(request, response) => {
    let lat = request.query.latitude;
    let lon = request.query.longitude;
    let page = request.query.page;
    response.send(await getYelp(lat, lon, page));
});

//get Yelp from API function
function getYelp(lat, lon, page) {
    let APIKEY = process.env.YELP_API_KEY;
    let limit = 5;
    let offset = (page - 1) * limit;
    let url = `https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=${lat}&longitude=${lon}&limit=${limit}&offset=${offset}`;
    let data = superagent
        .get(url)
        .set('Authorization', `Bearer ${APIKEY}`)
        .then((res) => {
            return res.body.businesses.map((yelpItem) => {
                return new Yelp(yelpItem);
            });
        })
        .catch((error) => {
            console.log(error);
        });
    return data;
}

//conect to database then start listening
client.connect()
    .then(() => {
        app.listen(PORT, () =>
            console.log(`listening on ${PORT}`)
        );
    }).catch((err) => {});

app.all("*", (req, res) => {
    res.status(404).send({ msg: "Sorry, page not found !" });
});

app.use((err, req, res, next) => { // eslint-disable-line
    res.status(500).send({ msg: "Sorry, something went wrong !" });
});