let video = document.getElementById("video");
let model;
// let canvas = document.getElementById("canvas");
// let ctx = canvas.getContext("2d");
let windowHeight = window.outerHeight * 0.4;
let windowWidth = window.outerWidth - 100;
// alert(windowWidth)
// alert(document.getElementsByClassName("test").offsetWidth);
// alert(window.outerWidth);

var thresholdAngle = 130;

var rightHandCount = 0;
var canBeProceedForRightCount = true;
var hasRightCountIncreasedOnce = false;

var leftHandCount = 0;
var canBeProceedForLeftCount = true;
var hasLeftCountIncreasedOnce = false;

var isGoalAchieved = false;
const detectorConfig = {
  modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
};

var targetCount = 10;


// Hacks for Mobile Safari
video.setAttribute("playsinline", true);
video.setAttribute("controls", true);
setTimeout(() => {
    video.removeAttribute("controls");
});


let detector;

const setupCamera = () => {
  navigator.mediaDevices
    .getUserMedia({
      video: { width: windowWidth, height: windowHeight },
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
      // document.getElementById('goalCount').innerHTML = goalCount
    });
};

const detectPose = async () => {
  // alert(document.getElementById("video").offsetWidth)
  const poses = await detector.estimatePoses(document.querySelector("video"));

  // const predictions = await model.estimateHands(document.querySelector("video"));
  // console.log(poses);

  if (poses.length) angleCalculation(poses[0].keypoints);

  // ctx.drawImage(video, 0, 0, windowWidth, windowHeight);

  // poses.forEach((eachPose) => {
  //   ctx.beginPath();
  //   ctx.lineWidth = "4";
  //   ctx.strokeStyle = "blue";
    

  //   ctx.fillStyle = "red";
  //   eachPose.keypoints.forEach((key, index) => {
  //     ctx.fillRect(key.x, key.y, 5, 5);

   
  //   });
  //   // ctx.lineTo(1,5,5,100,25,20);

  //   ctx.stroke();
  // });
};

function angleCalculation(arr) {
  let right_shoulder = arr.find((x) => x.name == "right_shoulder");
  let right_elbow = arr.find((x) => x.name == "right_elbow");
  let right_wrist = arr.find((x) => x.name == "right_wrist");

  let left_shoulder = arr.find((x) => x.name == "left_shoulder");
  let left_elbow = arr.find((x) => x.name == "left_elbow");
  let left_wrist = arr.find((x) => x.name == "left_wrist");

  // angle = Math.degrees(Math.atan2(right_wrist.y - right_elbow.y, right_wrist.x - right_elbow.x) - Math.atan2(right_shoulder.y - right_elbow.y, right_shoulder.x - right_elbow.x))

  if (rightHandCount > targetCount && leftHandCount > targetCount && !isGoalAchieved) {
    console.log("IAM  DONE");
    isGoalAchieved = true;
    document.getElementById("goalMessage").innerHTML =  "🎇 Target Achieved 🎇";
    sendMessagetoFlutter(true);
    return;
  }

  if (
    right_shoulder.score > 0.5 &&
    right_elbow.score > 0.5 &&
    right_wrist.score > 0.5 && 
    left_shoulder.score > 0.5 &&
    left_elbow.score > 0.5 &&
    left_wrist.score > 0.5
  ) {

    document.getElementById("video").style.borderColor = "green";

    off()


    radians_to_degrees_rightHand(
      Math.atan2(right_wrist.y - right_elbow.y, right_wrist.x - right_elbow.x) -
        Math.atan2(
          right_shoulder.y - right_elbow.y,
          right_shoulder.x - right_elbow.x
        )
    );

    radians_to_degrees_LeftHand(
      Math.atan2(left_wrist.y - left_elbow.y, left_wrist.x - left_elbow.x) -
        Math.atan2(
          left_shoulder.y - left_elbow.y,
          left_shoulder.x - left_elbow.x
        )
    );


  }

  // if (
  //   left_shoulder.score > 0.5 &&
  //   left_elbow.score > 0.5 &&
  //   left_wrist.score > 0.5
  // ) {
  //   radians_to_degrees_LeftHand(
  //     Math.atan2(left_wrist.y - left_elbow.y, left_wrist.x - left_elbow.x) -
  //       Math.atan2(
  //         left_shoulder.y - left_elbow.y,
  //         left_shoulder.x - left_elbow.x
  //       )
  //   );
  // }

}

function radians_to_degrees_rightHand(radians) {
  var pi = Math.PI;
  let angle = radians * (180 / pi);

  if (angle < thresholdAngle && hasRightCountIncreasedOnce) {
    canBeProceedForRightCount = true;
  }

  if (angle > thresholdAngle && canBeProceedForRightCount) {
    hasRightCountIncreasedOnce = true;
    canBeProceedForRightCount = false;
    ++rightHandCount;
    document.getElementById("rightHandCount").innerHTML = rightHandCount - 1;
    // document.getElementById("myParagraph").innerHTML = "This is your paragraph!";
    // console.log("handCount", rightHandCount);
  }
}

function radians_to_degrees_LeftHand(radians) {
  var pi = Math.PI;
  let angle = radians * (180 / pi);

  if (Math.sign(angle) == 0) return false;

  if (angle < thresholdAngle && hasLeftCountIncreasedOnce) {
    canBeProceedForLeftCount = true;
  }

  if (angle > thresholdAngle && canBeProceedForLeftCount) {
    hasLeftCountIncreasedOnce = true;
    canBeProceedForLeftCount = false;
    ++leftHandCount;
    document.getElementById("leftHandCount").innerHTML = leftHandCount - 1;
    // document.getElementById("myParagraph").innerHTML = "This is your paragraph!";
    // console.log("handCount", rightHandCount);
  }
}

setupCamera();
video.addEventListener("loadeddata", async () => {
  // document.getElementById("video").offsetWidth, document.getElementById("video").offsetHeight

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (urlParams.get("goal")) {
    targetCount = urlParams.get("goal");
  }
  document.getElementById("targetCount").innerHTML = targetCount;




  // canvas.width = document.getElementById("video").offsetWidth;
  // canvas.height = document.getElementById("video").offsetHeight;
  // canvas.setAttribute("width", windowWidth);
  // canvas.setAttribute("height", windowHeight);


  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
  );



  document.getElementById("loadingText").innerHTML =
    "Please stand in front of camera";
  setInterval(detectPose, 30);
  on();
  document.getElementById("overlaytext").innerHTML = "Detecting";
});

function sendMessagetoFlutter(value) {
  console.log(value);
  // window.CHANNEL_NAME.postMessage('Hello from JS');
}


function on() {
  document.getElementById("overlay").style.display = "block";
}

function off() {
  document.getElementById("overlay").style.display = "none";
}
