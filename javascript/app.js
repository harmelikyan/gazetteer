//preloader
$(window).on('load', function() {
  if ($('#preloader').length) {
    $('#preloader').delay(3000).fadeOut('slow', function() {
      $(this).remove();
    });
  }
});
var currencies;
var countryName;
var countryCodeGlobal = "";
var countryBoundary;
var map;
var citiesMarker;
var wikiMarker;
var country_code;
var symbol;
let lati;
let longi;
let alpha2Code;
let  cloack;
let names;



$(document).ready(function () {
  $("#countries").change(function(){
    locateCountry($(this).val());
  });

  $(document).ready(function() {
    $('.js-example-basic-single').select2();
});

map = L.map("issMap", {
  attributionControl: false,
}).setView([0, 0], 1.5);

const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const tiles = L.tileLayer(tileUrl, { attribution })
tiles.addTo(map)


 countryBoundary = new L.geoJson().addTo(map);

 citiesMarker = L.markerClusterGroup();
 map.addLayer(citiesMarker);

wikiMarker = L.markerClusterGroup();
map.addLayer(wikiMarker);

 getCountry();
 getUserLocation();
});

// // countryName
function getCountry() {
  $.ajax({
    url: 'php/getCountriesCode.php',
    type: 'GET',
    dataType: 'json',
    success: function(result) {
      // console.log(result)
      for(var country of result) {
        countryName =  $('#countries').append(`<option value="${country["iso_a2"]}">${country["name"]}</option>`);
        // names2 = country["name"];
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // your error code
      console.log(jqXHR);
    }  
  })
}

function getUserLocation() {
  console.log("Getting user location");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const {
          latitude
        } = position.coords;
         const {
          longitude
        } = position.coords;
        
        
        const coords = [latitude, longitude];
        // console.log(position);
        $.ajax({
          url: "php/getLatLong.php?lat=" +
            latitude +
            "&lng=" +
            longitude +
            "&username=harmelikyan",
          type: "GET",
          success: function (json) {
            let info = JSON.stringify(json)
            // console.log("json: ", json["data"]);
            // 
             country_code = json["data"].countryCode;
            $("#countries").val(country_code.toUpperCase()).change();
          },
          error: function(jqXHR, textStatus, errorThrown) {
            // your error code
            console.log(jqXHR);
          }
        });
      },
    )
  }
}


//   //country border
  function getCountryBorder(countryCode) {
    $.ajax({
      url: 'php/getCountryBorders.php',
      type: 'GET',
      dataType: 'json', 
      data: {
          countryCode: $('#countries').val(),
      },
      
      success: function(json) {
        // console.log(JSON.stringify(json))
        countryBoundary.clearLayers();
        countryBoundary.addData(json).setStyle(countryStyle());
        const bounds = countryBoundary.getBounds();
        map.fitBounds(bounds);

        const east = bounds.getEast();
        const west = bounds.getWest();
        const north = bounds.getNorth();
        const south = bounds.getSouth();
        ;
        getNearbyCities(east, west, north, south);
        getNearbyWikis(east, west, north, south);
        

 },

      error: function(jqXHR, textStatus, errorThrown) {
        // your error code
        console.log(jqXHR);
      }
            
    })
    
  }

function countryStyle() {
  return {
    fillColor: "blue",
    weight: 2,
    fillOpacity: 0.2,
  }
}

function locateCountry(countryCode) {
  if (countryCode == "") return;
  countryName = $("#country option:selected").text();
  countryCodeGlobal = countryCode;
  getCountryBorder(countryCode);
  getCountryInfo(countryCode);
  getCoat(countryCode);
  
}

//get nearby cities and put markers
function getNearbyCities(east, west, north, south) {
  citiesMarker.clearLayers();
  $.ajax({
    url: "php/getCitiesNearby.php",
    type: "GET",
    data: {
      east: east,
      west: west,
      north: north,
      south: south,
      username: "harmelikyan",
    },
    success: function (json) {
      // json = JSON.stringify(json);
      // console.log(json);
      // const data = json.geonames;
      const city_icon = L.ExtraMarkers.icon({
        icon: "fa-building",
        markerColor: 'red',
        shape: 'circle',
        prefix: 'fa'
        
      });
       lati = json.data[0].lat
       longi = json.data[0].lng
      getWeatherData(lati, longi)
      getCloack(lati, longi)
      for (let i = 0; i < json.data.length; i++) {
        const marker = L.marker([json.data[i].lat, json.data[i].lng], {
          icon: city_icon,
        }).bindPopup(
          "<b>" +
          json.data[i].name +
          "</b><br>Population: " +
          parseInt(json.data[i].population).toLocaleString("en")
          
        );
        
        citiesMarker.addLayer(marker);
        
      }
    },
  });
}

// //get nearby wikipedias
function getNearbyWikis(east, west, north, south) {
  wikiMarker.clearLayers();
  $.ajax({
    url: "php/getWikipedia.php",
    type: "GET",
    data: {
      east: east,
      west: west,
      north: north,
      south: south,
    },
    success: function (json) {
      // json = JSON.stringify(json);
      // console.log(json);
      // const data = json.geonames;
      const wiki_icon = L.ExtraMarkers.icon({
        icon: 'fa-info',
        markerColor: 'blue',
        shape: 'circle',
        prefix: 'fas'
      });
      for (let i = 0; i < json.data.length; i++) {
        const marker = L.marker([json.data[i].lat, json.data[i].lng], {
          icon: wiki_icon,
        }).bindPopup(
          "<img src='" +
          json.data[i].thumbnailImg +
          "' width='300px' height='100px' alt= id='wikiImage'>'" +
          json.data[i].summary + 
          "</b><br><a href='https://" +
          json.data[i].wikipediaUrl +
          "' target='_blank'>Wikipedia Link</a>"
        );
        wikiMarker.addLayer(marker);
      }
    },
  });
}


// //get country info
function getCountryInfo(countryCode) {
  $.ajax({
    url: "php/getCountryInfo.php",
    type: "GET",
    datatype: 'json',
    data: {
      countryCodeGlobal: countryCode
    },
    success: function(response) {
      // let info = JSON.stringify(response);
            // console.log(response);
            // lat = response['data'].latlng[0];
            // lng = response['data'].latlng[1];
            alpha2Code =  response['data'].alpha2Code;
            names = response['data'].altSpellings[2];
             $("#countryInfo").html(response['data'].altSpellings[2])
            symbol = response['data'].currencies[0].symbol;
            currencies = $("#currency").html(symbol +  " " + response['data'].currencies[0].name);
            $("#country_capital").html(response['data'].capital);
            $("#country_population").html(parseInt(response['data'].population).toLocaleString("en"));
            $("#country_flag").attr("src", response['data'].flag);
            $("#nativeName").html(response['data'].nativeName);
            $("#region").html(response['data'].region);
            $("#timeZone").html(response['data'].timezones);
            $("#language").html(response['data'].languages[0].name);
            $("#area").html(parseInt(response['data'].area).toLocaleString("en"));
           
            $("#countryWikipedia").attr(
              "href",
              "https://en.wikipedia.org/wiki/" + response['data'].name
              );
               getExchangeRates(response['data'].currencies[0].code);
               getNationalHoliday(alpha2Code)


    }
  })

}


//coat of arms
function getCoat(countryCode) {
  $.ajax({
    url: "php/coatOfArms.php",
    type: "GET",
    datatype: 'json',
    data: {
      countryCodeGlobal: countryCode
    },
    success: function(response) {
      // let info = JSON.stringify(response);
            // console.log(info);
          $('#coat').attr("src", response['data'][0].coatOfArms.png);
    }
  })
}


// //Weather data
function getWeatherData(latitude, longitude) {
  $.ajax({
    url: "php/getWeather.php",
    type: "GET",
    datatype: 'json',
    data: {
      lat: lati,
      lng: longi
    },
    success: function (response) {
      // let details = JSON.stringify(response);
      // console.log(response);
      $("#first-row").html("");
      $("#second-row").html("");
      $("#third-row").html("");
      const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      for (let i = 0; i < 5; i++) {
        let daily = response.data.daily
        const d = response.data.daily[i];
        const day = days[new Date(d.dt * 1000).getDay()];
        
        $("#first-row").append("<td>" + day + "</td>");
        $("#second-row").append("<td>" + parseInt(d["temp"]["max"]) + "°</td>");
        $("#clouds").html(response.data.current.weather[0].description)
        $("#currentTemp").html(response.data.current.temp + "°");
        $("#countrysName").html(names);
        $("#weatherInfo").html(response.data.current.weather[0].description);
        $("#wind_speed").html(response.data.current.wind_speed + " m/s");
        $("#humidity").html(response.data.current.humidity);
        $("#cloud2").attr("src",'https://openweathermap.org/img/wn/'+response.data.current.weather[0].icon+'@2x.png');
        $("#uvi").html(response.data.current.uvi);

 

        
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // your error code
      console.log(jqXHR);
    } 
  });
}




function getNews() {
    $("#news").html("");
    $.ajax({
      url: "php/getNews.php",
      type: "GET",
      datatype: 'json',
      data: {   
        countryCodeGlobal: countryCodeGlobal,
      },
        success: function (json) {        
        console.log(json);
        for (let i = 0; i < json.data.length; i++) {
          $("#news").append(newsCard(json.data[i]));  
          $("#countryname3").html(names);
        }
      },
  
      error: function(jqXHR, textStatus, errorThrown) {
  
        // your error code
  
        console.log(jqXHR);
  
      } 
  
    });
  
  }

function newsCard(data) {
  const card =
    '<div class="card2" style= display: inline"> <img class="card-img-top" src="' +
    data["urlToImage"] +
    '" alt="News Image"> <div class="card-body"> <h5 class="card-title">' +
    data["author"] +
    '</h5> <p class="card-text">' +
    data["title"] +
    '</p> <a href="' +
    data["url"] +
    '" target="_blank" class="btn btn-primary">See More</a> </div> </div>';
  return card;
}


  function covidData() {
  $.ajax({
    url: "php/covid.php",
    type: "GET",
    datatype: "json",
    data: {
      countryName: countryCodeGlobal
    },
    success: function(result) {
      let info = JSON.stringify(result);
      // parseInt(response['data'].population).toLocaleString("en"));
      // console.log(info);
      $("#cases").html(parseInt(result['data'].cases).toLocaleString("en"));
      $("#todayCases").html(parseInt(result['data'].todayCases).toLocaleString("en"));
      $("#deaths").html(parseInt(result['data'].deaths).toLocaleString("en"));
      $("#todayDeaths").html(parseInt(result['data'].todayDeaths).toLocaleString("en"));
      $("#recovered").html(parseInt(result['data'].recovered).toLocaleString("en"));
      $("#countryName2").html(names);
      $("#todayRecovered").html(parseInt(result['data'].todayRecovered).toLocaleString("en"));
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // your error code
      console.log(jqXHR);
    } 
  })
}


//Exchange rates
function getExchangeRates(currencies) {
  $.ajax({
    url: "php/getExchange.php",
    type: "GET",
    datatype: "json",
    data: {
      code: currencies
    },
    success: function(response) {
      // console.log(response)
      $("#exchangeRates").html(symbol + response['data'].rates[currencies] + " " + "= $1")
      }
  })
}


function getNationalHoliday(alpha2Code) {
  $.ajax({
    url: "php/getNationalHoliday.php",
    type: "GET",
    datatype: "json",
    data: {
      alphaCode: alpha2Code
    },
    success: function(response) {
      // console.log(response)
      $("#holiday").html(response['data'].response.holidays[0].name);
      $("#countryNamee").html(names);
      $("#holidayDate").html(moment(response['data'].response.holidays[0].date.iso).format('MMMM Do'));
      $("#holiday2").html(response['data'].response.holidays[4].name)
      $("#holidayDate2").html(moment(response['data'].response.holidays[4].date.iso).format('MMMM Do'))
      $("#holiday3").html(response['data'].response.holidays[7].name)
      $("#holidayDate3").html(moment(response['data'].response.holidays[7].date.iso).format('MMMM Do'))
      $("#holiday4").html(response['data'].response.holidays[9].name)
      $("#holidayDate4").html(moment(response['data'].response.holidays[9].date.iso).format('MMMM Do'))
      $("#holiday5").html(response['data'].response.holidays[10].name)
      $("#holidayDate5").html(moment(response['data'].response.holidays[10].date.iso).format('MMMM Do'))
      $("#holiday6").html(response['data'].response.holidays[29].name)
      $("#holidayDate6").html(moment(response['data'].response.holidays[29].date.iso).format('MMMM Do'))
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // your error code
      console.log(jqXHR);
    } 
  })
}

function getCloack(lati, longi) {
  $.ajax({
    url: "php/clock.php",
    type: "GET",
    datatype: "json",
    data: {
      lat: lati,
      lng: longi
    },
    success: function(json) {
      // console.log(json)
        const dates = $("#cloack").html(moment(json.data.time).format('LT'));
        $("#sunrise").html(moment(json.data.sunrise).format('LT'))
        $("#sunset").html(moment(json.data.sunset).format('LT'))
        $("#uvi").html(json.data.uvi)
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // your error code
      console.log(jqXHR);
    } 
  })
}

function getPhotos() {
  $.ajax({
    url: "php/photos.php",
    type: "GET",
    datatype: "json",
    data: {
      country: names
    },
    success: function(json) {
      // console.log(json)
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // your error code
      console.log(jqXHR);
    } 
  })
}





$("#exchangeImg").click(
  getExchangeRates
);

$("#weatherImg").click(
  getWeatherData
);


$("#covidImg").click(
  covidData
  )

  $("#newsImg").click(
    getNews
  )