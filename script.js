let video = document.getElementById("video");
let model;
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
const setupCamera = () => {
  console.log("ss");
  navigator.mediaDevices
    .getUserMedia({
      video: { width: 600, height: 400 },
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
    });
};

const detectPose = async () => {
  const poses = await detector.estimatePoses(document.querySelector("video"));

  // const predictions = await model.estimateHands(document.querySelector("video"));
  console.log(poses);

  if (poses.length) angleCalculation(poses[0].keypoints);

  ctx.drawImage(video, 0, 0, window.innerWidth, window.innerHeight);

  poses.forEach((eachPose) => {
    ctx.beginPath();
    ctx.lineWidth = "4";
    ctx.strokeStyle = "blue";
    //  ctx.rect(
    //   eachPose.keypoints.topLeft[0],
    //   eachPose.keypoints.topLeft[1],
    //   eachPose.keypoints.bottomRight[0] -eachPose.keypoints.topLeft[0],
    //   eachPose.keypoints.bottomRight[1] -eachPose.keypoints.topLeft[1]

    //  )

    ctx.fillStyle = "red";
    eachPose.keypoints.forEach((key, index) => {
      ctx.fillRect(key.x, key.y, 5, 5);

      // if(index == 0){
      //   ctx.moveTo(0, 0);
      // }
      // ctx.lineTo(key.x, key.y);
    });
    // ctx.lineTo(1,5,5,100,25,20);

    ctx.stroke();
  });
};

function angleCalculation(arr) {
  let right_shoulder = arr.find((x) => x.name == "right_shoulder");
  let right_elbow = arr.find((x) => x.name == "right_elbow");
  let right_wrist = arr.find((x) => x.name == "right_wrist");

  let left_shoulder = arr.find((x) => x.name == "left_shoulder");
  let left_elbow = arr.find((x) => x.name == "left_elbow");
  let left_wrist = arr.find((x) => x.name == "left_wrist");

  // angle = Math.degrees(Math.atan2(right_wrist.y - right_elbow.y, right_wrist.x - right_elbow.x) - Math.atan2(right_shoulder.y - right_elbow.y, right_shoulder.x - right_elbow.x))

  if (
    right_shoulder.score > 0.5 &&
    right_elbow.score > 0.5 &&
    right_wrist.score > 0.5
  ) {
    radians_to_degrees(
      Math.atan2(right_wrist.y - right_elbow.y, right_wrist.x - right_elbow.x) -
        Math.atan2(
          right_shoulder.y - right_elbow.y,
          right_shoulder.x - right_elbow.x
        )
    );
  }

  if (
    left_shoulder.score > 0.5 &&
    left_elbow.score > 0.5 &&
    left_wrist.score > 0.5
  ) {
    radians_to_degrees2(
      Math.atan2(left_wrist.y - left_elbow.y, left_wrist.x - left_elbow.x) -
        Math.atan2(
          left_shoulder.y - left_elbow.y,
          left_shoulder.x - left_elbow.x
        )
    );
  }
  // radians_to_degrees2(
  //   Math.atan2(left_wrist.y - left_elbow.y, left_wrist.x - left_elbow.x) -
  //     Math.atan2(left_shoulder.y - left_elbow.y, left_shoulder.x - left_elbow.x)
  // );
}

var thresholdAngle = 130;

var rightHandCount = 0;
var canBeProceedForRightCount = true;
var hasRightCountIncreasedOnce = false;

var leftHandCount = 0;
var canBeProceedForLeftCount = true;
var hasLeftCountIncreasedOnce = false;

function radians_to_degrees(radians) {
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

  // if (angle < thresholdAngle && hasLeftCountIncreasedOnce) {
  //   canBeProceedForLeftCount = true;
  // }

  // if (angle > thresholdAngle && canBeProceedForLeftCount) {
  //   hasLeftCountIncreasedOnce = true;
  //   canBeProceedForLeftCount = false;
  //   ++leftHandCount;
  //   document.getElementById("leftHandCount").innerHTML = leftHandCount;
  //   // document.getElementById("myParagraph").innerHTML = "This is your paragraph!";
  //   // console.log("handCount", rightHandCount);
  // }
}

function radians_to_degrees2(radians) {
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

const detectorConfig = {
  modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
};

let detector;

setupCamera();
video.addEventListener("loadeddata", async () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
  );

  document.getElementById("loadingText").innerHTML =
    "Please stand in camera so that it can see full body";
  setInterval(detectPose, 30);
});
