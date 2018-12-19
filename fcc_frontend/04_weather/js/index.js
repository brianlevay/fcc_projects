//// This function places an API call to get the user's location based on IP address. I know IP addresses aren't the most reliable way to get locations, but I don't want to use brower geolocation. It's intrusive and annoying. If the location call is successful, the callback function launches the weather API call ////

function getLocation() {
  var locationWrite = document.getElementById("location");
  var errorWrite = document.getElementById("error");
  $.ajax({
    url: '//freegeoip.net/json/',
    type: 'GET',
    dataType: 'jsonp',
    success: function(location) {
      locationWrite.innerHTML = location.city + ', ' + location.region_code;
      getWeather(location.city,location.region_code);
    },
    error: function() {
      errorWrite.innerHTML = 'Unable to determine your location.';
    }
  });
}

//// This is the weather API call. It gets data from Weather Underground. It's called as part of the getLocation function above ////

function getWeather(city,state) {
  var iconWrite = document.getElementById("icon");
  var weatherWrite = document.getElementById("weather");
  var tempfWrite = document.getElementById("temp-f");
  var tempcWrite = document.getElementById("temp-c");
  var humidityWrite = document.getElementById("humidity");
  var precipWrite = document.getElementById("precip");
  var windWrite = document.getElementById("wind");
  var stationWrite = document.getElementById("station");
  var timeWrite = document.getElementById("time");
  var forecastWrite = document.getElementById("forecast");
  var errorWrite = document.getElementById("error");
  
  var urlBase = 'http://api.wunderground.com/api/';
  var apiKey = 'YOUR KEY';
  var query = '/conditions/q/' + state + '/' + city + '.json';
  var urlCall = urlBase + apiKey + query;
  
  $.ajax({
    url: urlCall,
    type: 'GET',
    dataType: 'jsonp',
    success: function(weather) {
      iconWrite.innerHTML = '<img src=' + weather.current_observation.icon_url + '>';
      weatherWrite.innerHTML = weather.current_observation.weather;
      tempfWrite.innerHTML = weather.current_observation.temp_f + ' F';
      tempcWrite.innerHTML = weather.current_observation.temp_c + ' C';
      humidityWrite.innerHTML = weather.current_observation.relative_humidity;
      precipWrite.innerHTML = weather.current_observation.precip_today_string;
      windWrite.innerHTML = weather.current_observation.wind_string;
      stationWrite.innerHTML = weather.current_observation.observation_location.full;
      timeWrite.innerHTML = weather.current_observation.observation_time;
      forecastWrite.innerHTML = '<a href=' + weather.current_observation.forecast_url + ' target="_blank">Click here for the forecast</a>';
    },
    error: function() {
      errorWrite.innerHTML = 'There was an error getting your weather. You may have exceeded your allowable API calls, or the server may be experiencing problems. Please wait for some time to pass before trying again.';
    }
  });
}

//// This starts the two API calls ////

getLocation();

//// This creates the toggle for temperature values by simply changing DOM element visibilities ////

$("#toggle").click(function(){
  if ($("#temp-f").css('display') == "table-cell") {
    $("#temp-f").css('display','none');
    $("#temp-c").css('display','table-cell');
  } else {
    $("#temp-f").css('display','table-cell');
    $("#temp-c").css('display','none');
  }
});

//// End of script ////