function Weather(city, data){
    this.forecast = data.weather.description;
    this.time = new Date(data.valid_date).toString().substr(0, 15);
  }
  
  exports.default = Weather;
  