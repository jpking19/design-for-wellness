// SDK Needs to create video and canvas nodes in the DOM in order to function
// Here we are adding those nodes a predefined div.
var divRoot = $("#affdex_elements")[0];
var width = 460; //Camera feed's width
var height = 340; //Camera feed's height
var faceMode = affdex.FaceDetectorMode.LARGE_FACES;
//Construct a CameraDetector and specify the image width / height and face detector mode.
var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);
var totalframes = 0;
var joyframes = 0;

//Enable detection of all Expressions, Emotions and Emojis classifiers.
detector.detectAllEmojis();
detector.detectAllAppearance();
detector.detectEmotions.joy = true;

//Add a callback to notify when the detector is initialized and ready for running.
detector.addEventListener("onInitializeSuccess", function() {
  log('#logs', "The detector reports initialized");
  //Display canvas instead of video feed because we want to draw the feature points on it
  $("#face_video_canvas").css("display", "block");
  $("#face_video").css("display", "none");
});

function log(node_name, msg) {
  $(node_name).append("<span>" + msg + "</span><br />")
}

//function executes when Start button is pushed.
function onStart() {
  if (detector && !detector.isRunning) {
    $("#logs").html("");
    detector.start();
  }
  log('#logs', "Clicked the start button");

  // Allow genre buttons to be picked
  document.getElementById('rock').disabled = false;
  document.getElementById('pop').disabled = false;
  document.getElementById('country').disabled = false;
  document.getElementById('edm').disabled = false;
  document.getElementById('rap').disabled = false;
  document.getElementById('rb').disabled = false;

}

//function executes when the Stop button is pushed.
function onStop() {
  log('#logs', "Clicked the stop button");
  if (detector && detector.isRunning) {
    detector.removeEventListener();
    detector.stop();
  }
};

// //function executes when the Reset button is pushed.
// function onReset() {
//   log('#logs', "Clicked the reset button");
//   if (detector && detector.isRunning) {
//     detector.reset();
//
//     $('#results').html("");
//   }
// };

//Add a callback to notify when camera access is allowed
detector.addEventListener("onWebcamConnectSuccess", function() {
  log('#logs', "Webcam access allowed");
  console.log("Webcam access allowed");
});

//Add a callback to notify when camera access is denied
detector.addEventListener("onWebcamConnectFailure", function() {
  log('#logs', "Webcam denied");
  console.log("Webcam access denied");
});

//Add a callback to notify when detector is stopped
detector.addEventListener("onStopSuccess", function() {
  log('#logs', "The detector reports stopped");
  $("#results").html("");
});

//Add a callback to receive the results from processing an image.
//The faces object contains the list of the faces detected in an image.
//Faces object contains probabilities for all the different expressions, emotions and appearance metrics
detector.addEventListener("onImageResultsSuccess", function(faces, image,
  timestamp) {
  $('#results').html("");

  log('#results', "Number of faces found: " + faces.length);
  if (faces.length > 0) {
    // Gets gender, age, facial features
    //Prints all the results to the log
    log('#results', "Appearance: " + JSON.stringify(faces[0].appearance));

    //prints out timestamp and joy ratio when dominant emotion is present
    if(faces[0].emotions.joy > 80) {
        log('#results', "Timestamp: " + timestamp.toFixed(2));
            joyframes+=100;
        }
            totalframes++;
            log('#results', "Joyratio: " + Math.floor(joyframes/totalframes));

    log('#results', "Joy Meter: " + JSON.stringify(faces[0].emotions,
      function(key, val) {
        return val.toFixed ? Number(val.toFixed(0)) : val;
      }));

    // log('#results', "Expressions: " + JSON.stringify(faces[0].expressions,
    //   function(key, val) {
    //     return val.toFixed ? Number(val.toFixed(0)) : val;
    //   }));

    // Return an emoji of face
    log('#results', "Emoji: " + faces[0].emojis.dominantEmoji);
    drawFeaturePoints(image, faces[0].featurePoints);

    /* IGNORE- debugging code
    console.log("dominant emoji: ", faces[0].emojis.dominantEmoji);
    console.log("other emoji test: ", faces[0].emojis.dominantEmoji.codePointAt(0));
    */

    //CSS photo/camera filter generator: http://html5-demos.appspot.com/static/css/filters/index.html

    // CODE DEBRIEFING:
    // The following code modifies the entire screen's background color and camera feed's filter based upon
    // the emoji Affectiva thinks best represents your current detected emotions

    // CODE EXPLANATIONS:
    // faces[0].emojis.dominantEmoji returns the actual emoji character
    // someCharacter.codePointAt(0) returns a character's (including emojis) unicode number as an integer
    // $('IDorCLASSselector').css(....) is jQuery code for changing an elements CSS- more on that here: https://www.w3schools.com/jquery/css_css.asp
    // #face_video_canvas is Affectiva's camera element ID. When using video filter effects this is the element you select to modify with the jQuery code.
  }
});

//Draw the detected facial feature points on the image
function drawFeaturePoints(img, featurePoints) {
  var contxt = $('#face_video_canvas')[0].getContext('2d');

  var hRatio = contxt.canvas.width / img.width;
  var vRatio = contxt.canvas.height / img.height;
  var ratio = Math.min(hRatio, vRatio);

  contxt.strokeStyle = "#FFFFFF";
  for (var id in featurePoints) {
    contxt.beginPath();
    contxt.arc(featurePoints[id].x,
      featurePoints[id].y, 2, 0, 2 * Math.PI);
    contxt.stroke();

  }
}


// CUSTOM FUNCTIONS & JQUERY


function play_genre_music(genre, song, title, artist, color) {
    // play song
    document.getElementById(song).play();

    // set song-specific text
    $("#title").text(title);
    $("#g").text(genre);
    $("#artist").text(artist);

    // set background to genre color
    $("#g").attr("background-color",color);

    startTimer();
}

function startTimer() {
   // start logging data
   totalframes = 0;
   joyframes = 0;
   // $("")

   var timer = 14, seconds;
   duration = 15
   display = document.querySelector('#time');

   var interval = setInterval(function () {
       seconds = parseInt(timer, 10);

       seconds = seconds < 10 ? "0" + seconds : seconds;

       display.textContent = seconds;

       if (--timer < 0) {
           display.textContent = duration;
           document.getElementById('rock_song').pause();
           clearInterval(interval);

           // stop logging data
           tf = totalframes;
           jf = joyframes;
           console.log(tf);
           console.log(jf);

           // set background to black

       }
   }, 1000);
}

$(document).ready(function(){
    $("#rock").click(function(){
        play_genre_music('Classic Rock', 'rock_song', 'Stairway to Heaven', 'Led Zeppelin', 'green');
        this.style.display = "none";
    });

    // $("#pop").click(function(){
    //     play_genre_music('Classic Rock', 'rock_song', 'Stairway to Heaven', 'Led Zeppelin', 'green');
    //     this.style.display = "none";
    // });
});
