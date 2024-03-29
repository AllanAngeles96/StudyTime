// Initialize Firebase
var config = {
    apiKey: "AIzaSyBrWk73kK1HbwSeQ4o6PXw4P4zHOB_cmus",
    authDomain: "project1-bdab9.firebaseapp.com",
    databaseURL: "https://project1-bdab9.firebaseio.com",
    projectId: "project1-bdab9",
    storageBucket: "",
    messagingSenderId: "28327855086",
    appId: "1:28327855086:web:3deb6b4886cf513a"
  };
  firebase.initializeApp(config);

 var database = firebase.database();

//Require
require.config({

  paths: {
    //"jquery": "https://code.jquery.com/jquery-2.2.4.min",
    "moment": "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment",
    "chartjs": "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.1.6/Chart.bundle"
  },
  shim: {
    //     jquery: {
    //         exports: "$"
    // }
  }
});

//TIMER
var time = document.getElementById('timer');
var start = document.getElementById('start');
var pause = document.getElementById('pause');
var stop = document.getElementById('stop');
var seconds = 0;
var minutes = 0;
var hours = 0;
var t;
// addedTime is a decimal / float so that we could see the fractional changes
var addedSeconds = 0, addedMinutes = 0, addedHours = 0, addedTime = 0.01, newTime = 0;


function add()
{
    seconds++;
    if (seconds >= 60)
    {
        seconds = 0;
        minutes++;
        if (minutes >= 60)
        {
            minutes = 0;
            hours++;
        }
    }

    time.innerHTML = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") +
        ":" + (seconds > 9 ? seconds : "0" + seconds);

    timer();
}

function timer()
{
      t = setTimeout(add, 1000);
}


$("#start").on("click", function(event) {
        event.preventDefault();
        $("#start").empty().append("Start");
        clearTimeout(t);
        timer();
        console.log("Start");
    });

$("#pause").on("click", function(){
    clearTimeout(t);
    $("#start").empty().append("Start");
});

$("#stop").on("click", function() {

    console.log("seconds: " + seconds + " minutes: " + minutes + " hours: " + hours);
    //send the values to go get added
    sum(hours, minutes, seconds);
    //console.log("stop");
    $("#start").empty().append("Start");
    clearInterval(t);
    time.textContent = "00:00:00";
    seconds = 0;
    minutes = 0;
    hours = 0;


 });
//END OF TIMER

// this function gets called everytime we stop the timerSection
// basically, take the time we had when we stopped the timer
// then add them all up... we want the answer to be in mins so hrs/secs get converted into minutes
function sum(hrs, mins, secs){
  newTime = (hrs * 60) + (mins) + (secs / 60); //The time displays in munite to show changes during presentation.
  console.log("This is the amount of time studied this session in mins: " + newTime);
  //send the sum to the db
  saveToDb(newTime);
}

//changed it so that we only save one value in the database, the sum
function saveToDb(time) {
  var saveTime = {
    time: time
  };
//everytime you stop the timer send the value of added time to the database so that we could retrieve it later
  database.ref("/allTime").push(saveTime);
}

var weeks = [];



//END OF TIMER

// CHART

//changed the chart to be minutes so that we could see the changes during the demo
require(['moment', 'chartjs'], function(moment, Chart) {

    const CHART = document.getElementById("myChart");

    Chart.defaults.scale.ticks.beginAtZero = true;

    let barChart = new Chart(CHART,{

        type: 'bar',
        data: {
            labels: ["Week 1 ", "Week 2 ", "Week 3 ", "Week 4 ", "Week 5 ", "Week 6 ", "Week 7 ", "Week 8 ", "Week 9 ", "Week 10", "Week 11", "Week 12", "Week 13", "Week 14", "Week 15", "Week 16", "Week 17", "Week 18", "Week 19", "Week 20", "Week 21", "Week 22", "Week 23", "Week 24", "Week 25", "Week 26", "Week 27"],
            datasets: [{
                label: 'Hours Per Week',
                backgroundColor: '#b2c7c8',
                data: [12, 25, 16, 10, 7, 4, 30, 19, 2, 20, 16, 23, 11, 28, 13, 15, 14, 22]

            }]
        }

    });


//retrieve the saved times from the database
    database.ref("/allTime").on("child_added", function(snapshot){
//add every saved value you find in the database and add them to the addedtime variable
      addedTime += snapshot.val().time;
//send the sum, to the chart
      addData(barChart, 19, addedTime);
      console.log("This is the value of addedTime when we send it to chart: " + addedTime);

    });

// this takes whatever you want to send to the chart and then updates the chart
// in this case we want the sum of all the time in the database "addedTime"
// got this idea from http://www.chartjs.org/docs/latest/developers/updates.html
// got the splice syntax from https://devdocs.io/javascript/global_objects/array/splice

    function addData(chart, week, newData) {
//we are picking one specific week in the chart, and replacing it with newData
    chart.data.datasets[0].data.splice(9, 1, newData);
    chart.update();
}

//END OF CHART


// Random Quotes Starts Here

function quote() {
  $.ajax({
    url: "https://api.forismatic.com/api/1.0/",
    jsonp: "jsonp",
    dataType: "jsonp",
    data: {
      method: "getQuote",
      lang: "en",
      format: "jsonp"
    },
    success: function(response) {
      $('#quote').html(response.quoteText)
      $('#author').html("<br/>&dash; " + response.quoteAuthor)

    }
  });
}

$("#quoteButton").on("click", function() {

  quote();
});

// Random quotes Ends Here


// Google map api init. Location default is UW Bootcamp location - Bellevue
function initMap () {
    var uwBootcamp = { lat: 47.610378, lng: -122.200676 };
    var map = new google.maps.Map(document.getElementById('trafficSection'), {
        zoom: 14,
        center: uwBootcamp,
      });

      //traffic layer functionality.
      var trafficLayer = new google.maps.TrafficLayer();
      trafficLayer.setMap(map);

      if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(function (position) {
           const user_location = {
             lat: position.coords.latitude,
             lng: position.coords.longitude
           };

           // Center map with user location
           map.setCenter(user_location);

           // Add a marker for your user location
           var userLocation = new google.maps.Marker({
             position: {
               lat: user_location.lat,
               lng: user_location.lng
             },
             map: map,
             title: "You are here"
           });

     var directionsService = new google.maps.DirectionsService();
     var directionsDisplay = new google.maps.DirectionsRenderer();

     var directionRequest = {
       origin: user_location,
       destination: uwBootcamp,
       travelMode: 'DRIVING'
     };

     directionsService.route(
       directionRequest,
       function(response, status) {
         if (status === 'OK') {
           // everything is ok
           directionsDisplay.setDirections(response);

         } else {
           // something went wrong
          window.alert('Directions request failed due to ' + status);
         }
       }
     );


     directionsDisplay.setMap(map);

    console.log(directionsDisplay);

     }, function () {
       console.log('Error in the geolocation service.');
     });
     } else {
      console.log('Browser does not support geolocation.');
     }

     }

     initMap();


});
// END OF MAP