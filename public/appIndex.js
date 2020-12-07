console.log("connected!")
/* Initialization */
// <script type="text/javascript" src="/socket.io/socket.io.js"></script> to index.html
let socket = io();
socket.on('connect', function () {
    console.log("Connected");
    socket.emit('joined');
});

// socket.on('joined', function(data){
//     console.log("get Data");
// })

/* -----P5 setup----- */
// Make sure you move your mouse around
// Open this sketch up 2 times to send video back and forth

let myVideo;
let otherVideo;
let myCanvas;
let poses = [];
//Code by Mister Bomb
let osc;
//大调
let notes = [55, 57, 59, 60, 62, 64, 66, 67];
let letters = ['G', 'A', 'B', 'C', 'D', 'E', 'F#', 'G'];

let poseNet;
let pose;
let video
//let w;
let leftWrist;
let rightWrist;

let leftWristX;
let leftWristY;

let rightWristX;
let rightWristY;

let leftPoseX;
let rightPoseX;

let leftPoseY;
let rightPoseY;

//string rect array
//let StringRect = []

function setup() {
    myCanvas = createCanvas(960, 720);
    console.log(width);
    myVideo = createCapture(VIDEO);
    //300
    console.log("video", myVideo.width)
    myVideo.muted = true;
    myVideo.hide();
    // myCanvas.position((windowWidth - width)/2,100);
    myCanvas.parent("canvas-container");

    //load ML5
    poseNet = ml5.poseNet(myVideo, modelLoaded);
    poseNet.on('pose', gotPoses);

    //sound sine triangle
    osc = new p5.Oscillator('sine');
    osc.start();
    osc.amp(0);
    //let ssp = new SimpleSimplePeer(this,"CANVAS",myCanvas);
    // Work-around a bug introduced by using the editor.p5js.org and iFrames.  Hardcoding the room name.
    let p5l = new p5LiveMedia(this, "CANVAS", myCanvas, "p5LiveMediaPeerTestFun");
    p5l.on('stream', gotStream);
}

function gotPoses(results) {
    poses = results;
    //
    if (poses.length > 0) {
        pose = poses[0].pose;
        //console.log(pose);
    }

    for (let i = 0; i < poses.length; i++) {

        leftWrist = poses[i].pose.keypoints[9];
        rightWrist = poses[i].pose.keypoints[10];
        //map location of pose to canvas
        leftPoseX = map(leftWrist.position.x, 0, myVideo.width, 0, width);
        leftPoseY = map(leftWrist.position.y, 0, myVideo.height, 0, height);
        //console.log(leftPoseX)
        rightPoseX = map(rightWrist.position.x, 0, myVideo.width, 0, width);
        rightPoseY = map(rightWrist.position.y, 0, myVideo.height, 0, height);
        //mirror
        leftWristX = width - leftPoseX;
        leftWristY = leftPoseY;
        //console.log("LEFT",leftWristX);
        rightWristX = width - rightPoseX;
        rightWristY = rightPoseY;
        //console.log("left", leftWristY);
    }
}

function modelLoaded() {
    console.log('poses Ready');
    // MG - Regarding #1, you can move osc.start in here so that the sound starts only AFTER the model is ready. 
    // Another solution is that you can start it before, but set the volume to 0. So that way, the volume will be 
    // set only after the poses are available.  
    // osc.start();
    osc.amp(1);
}

function draw() {
    background(220);
    

    //mirror the camera
    push();
    translate(width, 0);
    //translate(myVideo.width, 0);

    scale(-1, 1);
    image(myVideo, 0, 0, width, height);
    pop();

    // Do the threshold 1 time in setup
    loadPixels();
    for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i];
        let g = pixels[i + 1];
        let b = pixels[i + 2];

        if (r + b + g > 200) {
            pixels[i] = 255;
            pixels[i + 1] = 255;
            pixels[i + 2] = 255;
        } else {
            pixels[i] = 0;
            pixels[i + 1] = 0;
            pixels[i + 2] = 0;
        }
    }
    updatePixels();

    //instruction for left hand;
    if(pose){
    textSize(16);
            fill(11, 85, 243);
            text('Lefthand: volume up and down',30,50);
    }
    PoseCheck();
    PlaybyPose();
}

//check if position score is higher than 0.4
function PoseCheck() {
    if (pose) {
        if ((leftWrist.score > 0.4) && (rightWrist.score > 0.4)) {
            //check if pose within canvas
              poseChecked = true;

        }
        else {
            poseChecked = false;
        }
    }
}

// pose to change sound
function PlaybyPose() {
    if (pose) {
        let n = floor(map(rightWristX, 0, width, 0, 8));
        let amp = map(leftWristY, 0, height, 1, 0);

        if (rightWristX > 0 && rightWristX < width) {
            // //console.log(n);
            osc.freq(midiToFreq(notes[n]));
        }
        // //amp(vol,[rampTime],[timeFromNow])fade out
        if (leftWristY > 0 && leftWristY < height) {
            osc.amp(amp, 0.1);
        }
        //osc.amp(amp);    
        else if (!poseChecked) {
            // stop sound when pose out of screen
            osc.amp(0);
            console.log("out of screen!!!!")
        }
    }

    //draw strings
    let w = width / 8;
    //console.log(w);
    for (let i = 0; i < 8; i++) {
        let stringX = w * i;

        if (pose) {
            if ((rightWristX > stringX) && (rightWristX < stringX + w)) {
                fill(0, 250, 255, 200);
            } else {
                fill(0, 0, 150, 100);
            }

            //strings
            stroke(1);
            rect(stringX, 0, w, height);
            //text
            textSize(35);
            fill(255);
            text(letters[i], w * i, height / 2);
        }
    }

    // //Red nose poseNet
    if (pose) {
        if (leftWrist.score > 0.4) {
            //check if pose within canvas
           
            stroke('red');
            strokeWeight(1);
            noFill();
            line(leftWristX,leftWristY,width,leftWristY);

            fill('red');
            circle(leftWristX, leftWristY, 30);
            if(rightWrist.score > 0.4)   { 
                circle(rightWristX, rightWristY, 30);
            }
        }
    }
}

// We got a new stream!
function gotStream(stream) {
    // This is just like a video/stream from createCapture(VIDEO)
    otherVideo = stream;
    //otherVideo.id is the unique identifier for this peer
    //otherVideo.hide();
}
