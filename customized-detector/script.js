// SDK Needs to create video and canvas nodes in the DOM in order to function
// Here we are adding those nodes a predefined div.
var divRoot = $("#affdex_elements")[0];
var width = 460; //Camera feed's width
var height = 340; //Camera feed's height
var faceMode = affdex.FaceDetectorMode.LARGE_FACES;
//Construct a CameraDetector and specify the image width / height and face detector mode.
var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

//Enable detection of all Expressions, Emotions and Emojis classifiers.
detector.detectAllEmotions();
detector.detectAllExpressions();
detector.detectAllEmojis();
detector.detectAllAppearance();

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
}

//function executes when the Stop button is pushed.
function onStop() {
  log('#logs', "Clicked the stop button");
  if (detector && detector.isRunning) {
    detector.removeEventListener();
    detector.stop();
  }
};

//function executes when the Reset button is pushed.
function onReset() {
  log('#logs', "Clicked the reset button");
  if (detector && detector.isRunning) {
    detector.reset();

    $('#results').html("");
  }
};

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
  log('#results', "Timestamp: " + timestamp.toFixed(2));
  log('#results', "Number of faces found: " + faces.length);
  if (faces.length > 0) {
    // Gets gender, age, facial features
    //Prints all the results to the log
    log('#results', "Appearance: " + JSON.stringify(faces[0].appearance));

    log('#results', "Emotions: " + JSON.stringify(faces[0].emotions,
      function(key, val) {
        return val.toFixed ? Number(val.toFixed(0)) : val;
      }));
    log('#results', "Expressions: " + JSON.stringify(faces[0].expressions,
      function(key, val) {
        return val.toFixed ? Number(val.toFixed(0)) : val;
      }));

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

    if(faces[0].emojis.dominantEmoji.codePointAt(0) == 128542){ //disappointed
          $('body').css({'background-color': '#292c85', "transition": "all .1s ease-in"}); // dark gloomy blue
          $("#face_video_canvas").css("filter", "grayscale(0.7) hue-rotate(270deg)"); //sad blue camera
    }
    else if(faces[0].emojis.dominantEmoji.codePointAt(0) == 128563){ //flushed
          $('body').css({'background-color': '#ffb6c1', "transition": "all .1s ease-in"}); // light pink
          $("#face_video_canvas").css("filter", "hue-rotate(50deg)"); //little more blue
    }
    else if(faces[0].emojis.dominantEmoji.codePointAt(0) == 128535){ //kissing
          $('body').css({'background-color': '#bc1e1b', "transition": "all .1s ease-in"}); //dark heart red
          $("#face_video_canvas").css("filter", "sepia(0.8)"); // sepia
    }
    else if(faces[0].emojis.dominantEmoji.codePointAt(0) == 128514){ //laughing
          $('body').css({'background-color': '#c0ffee', "transition": "all .1s ease-in"}); // pretty baby blue
          $("#face_video_canvas").css("filter", "brightness(5)"); //brightness up- most
    }
    else if(faces[0].emojis.dominantEmoji.codePointAt(0) == 128545){ //rage
          $('body').css({'background-color': '#d43a3a', "transition": "all .1s ease-in"}); // darker but bright red
          $("#face_video_canvas").css("filter", "saturate(8)"); // heatmap
    }
    else if(faces[0].emojis.dominantEmoji.codePointAt(0) == 128528){ //relaxed- default emoji
          $('body').css({'background-color': '#f7f7f7', "transition": "all .1s ease-in"}); // grey- regular background color
          $("#face_video_canvas").css("filter", "hue-rotate(0deg)"); //normal camera
    }
    else if(faces[0].emojis.dominantEmoji.codePointAt(0) == 128561){ //scream
          $('body').css({'background-color': '#0d50f5', "transition": "all .1s ease-in"}); // typical blue
          $("#face_video_canvas").css("filter", "blur(7px)"); //blurred camera
    }
    else if(faces[0].emojis.dominantEmoji.codePointAt(0) == 9786 || faces[0].emojis.dominantEmoji.codePointAt(0) == 128515){ //text-symbol smiley OR emoji open-mouth smiley
          $('body').css({'background-color': '#fff44f', "transition": "all .1s ease-in"}); // yellow
          $("#face_video_canvas").css("filter", "brightness(2)"); //brightness up- mild
    }
    else if(faces[0].emojis.dominantEmoji.codePointAt(0) == 128527){ //smirk
          $('body').css({'background-color': '#297E63', "transition": "all .1s ease-in"}); // turtle body green
          $("#face_video_canvas").css("filter", "grayscale(50%)"); //half-grayscale
    }
    else if(faces[0].emojis.dominantEmoji.codePointAt(0) == 128539){ //stuck out tongue with both eyes open
          $('body').css({'background-color': '#fffcc9', "transition": "all .1s ease-in"}); // baby yellow
          $("#face_video_canvas").css("filter", "saturate(3)"); // mild saturation
    }
    else if(faces[0].emojis.dominantEmoji.codePointAt(0) == 128540){ //stuck out tongue with winking eye
          $('body').css({'background-color': '#5ad', "transition": "all .1s ease-in"}); // pretty, mild blue
          $("#face_video_canvas").css("filter", "saturate(5)"); // medium saturation
    }
    else if(faces[0].emojis.dominantEmoji.codePointAt(0) == 128521){ //wink
          $('body').css({'background-color': '#AEA4A4', "transition": "all .1s ease-in"}); //light brownish-purple
          $("#face_video_canvas").css("filter", "blur(2px) grayscale(.2) opacity(0.8) hue-rotate(20deg)"); // ligh browish-purple blurred out camera
    }
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
