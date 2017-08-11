var config = {
    apiKey: "AIzaSyDm-klsxUWh0R28Q5ySKHl63ReuQ0tx6jY",
    authDomain: "train-scheduler-3198c.firebaseapp.com",
    databaseURL: "https://train-scheduler-3198c.firebaseio.com",
    projectId: "train-scheduler-3198c",
    storageBucket: "",
    messagingSenderId: "51840787465"
  };

  firebase.initializeApp(config);

var database = firebase.database();
var name = "";
var destination = "";
var frequency = 0;
var firstTrain = "";
var minutesAway = 0;
var schedule = [];
var firstTrainTotalMin = 0;
var trainTime = 0;
var currentTimeTotalMin = 0;
var nextArrivalInMin = 0;
var nextArrival = "";

$("#add-train-btn").on("click", function() {
  // Don't refresh page!
  event.preventDefault();

  name = $("#trainName-input").val().trim();
  firstTrain = $("#firstTrain-input").val().trim();
  destination = $("#destination-input").val().trim();
  frequency = $("#frequency-input").val().trim();

  convertCurrentTimeToMinutes();
  convertFirstTrainToMinutes(firstTrain);

    createTrainSchedule(firstTrainTotalMin, frequency);
    determineNextTrain(currentTimeTotalMin, schedule);
    determineMinutesAway(nextArrivalInMin, currentTimeTotalMin);
    
  convertNextTrainToHoursMin(nextArrivalInMin);

  $("#trainName-input").val("");
  $("#firstTrain-input").val("");
  $("#destination-input").val("");
  $("#frequency-input").val("");

  // Push data to database.
  database.ref().push({
    name: name,
    destination: destination,
    frequency: frequency,
    nextArrival: nextArrival,
    minutesAway: minutesAway
  });

});

// Retrieve list of trains using child_added
database.ref().on("child_added", function(snapshot) {
  
  // Build up train table in DOM.
  $("#trainSchedule").append("<tr>" +
                        "<th>" + snapshot.val().name + "</th>" +
                        "<th>" + snapshot.val().destination + "</th>" +
                        "<th>" + snapshot.val().frequency + "</th>" +
                        "<th>" + snapshot.val().nextArrival + "</th>" +
                        "<th>" + snapshot.val().minutesAway + "</th>" +
                      "</tr>");
});

function convertFirstTrainToMinutes(firstTrain) {
  firstTrain = moment(firstTrain, "hh:mm");
  firstTrainHours = firstTrain.hours();
  firstTrainMin = firstTrain.minutes();

  firstTrainTotalMin = firstTrainMin + firstTrainHours*60;
}

function createTrainSchedule(firstTrainTotalMin, frequency) {
  
  // Need to reset these values to create new schedule array.
  trainTime = 0;
  schedule = [];
  for (var i = 0; trainTime < 1440; i++) {
    trainTime = firstTrainTotalMin + (frequency*i);
    if (trainTime > 1440) {
      return schedule;
    } else {
      schedule.push(trainTime);
    }
  }
};


function determineNextTrain(currentTimeTotalMin, schedule) {

  for (var i = 0; i < schedule.length; i++) {
    if (schedule[i] > currentTimeTotalMin) {
      nextArrivalInMin = schedule[i];
      return nextArrivalInMin;
    }
  }
}

function convertCurrentTimeToMinutes() {
  var currentHours = moment().hours();
  var currentMinutes = moment().minutes();

  currentTimeTotalMin = currentMinutes + currentHours*60;
}

function convertNextTrainToHoursMin(nextArrivalInMin) {
  var nextArrivalHours = Math.floor(nextArrivalInMin / 60);

  var nextArrivalMin = nextArrivalInMin % 60;
  if (nextArrivalHours < 10) {
    nextArrivalHours = "0" + nextArrivalHours;
  }
  if (nextArrivalMin < 10) {
    nextArrivalMin = "0" + nextArrivalMin;
  }
  nextArrival = nextArrivalHours + ":" + nextArrivalMin;
}

function determineMinutesAway(nextArrivalInMin, currentTimeTotalMin) {
  minutesAway = nextArrivalInMin - currentTimeTotalMin;

  return minutesAway;
}

