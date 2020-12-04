console.log("connected!")
/* Initialization */
// <script type="text/javascript" src="/socket.io/socket.io.js"></script> to index.html
let socket = io();
socket.on('connect', function () {
    console.log("Connected");
    socket.emit('joined');
  });

/* -----P5 setup----- */
// Make sure you move your mouse around
// Open this sketch up 2 times to send video back and forth

let myVideo;
let otherVideo;
let myCanvas;

//Code by Mister Bomb
let osc;
//大调
let notes = [55, 57, 59, 60, 62, 64, 66, 67];
let letters = ['G', 'A', 'B', 'C', 'D', 'E', 'F#', 'G'];

let poseNet;
let pose;
let video
let w;
let noseX;
let noseY;

function setup() {
    myCanvas = createCanvas(640, 480);
    myVideo = createCapture(VIDEO);
    myVideo.muted = true;
    myVideo.hide();
    myCanvas.position((windowWidth - width)/2,100);

    //load ML5
    poseNet = ml5.poseNet(myVideo, modelLoaded);
    poseNet.on('pose', gotPoses);

    //sound
    osc = new p5.Oscillator('triangle');


    //let ssp = new SimpleSimplePeer(this,"CANVAS",myCanvas);
    // Work-around a bug introduced by using the editor.p5js.org and iFrames.  Hardcoding the room name.
    let p5l = new p5LiveMedia(this, "CANVAS", myCanvas, "p5LiveMediaPeerTestFun");
    p5l.on('stream', gotStream);
}

function gotPoses(poses) {
    //console.log(poses);

    if (poses.length > 0) {
        pose = poses[0].pose;
        //console.log(pose);
    }

    for (let i = 0; i < poses.length; i++) {
        let pose = poses[i].pose;
    }
}

function modelLoaded() {
    console.log('poses Ready');
    // MG - Regarding #1, you can move osc.start in here so that the sound starts only AFTER the model is ready. 
    // Another solution is that you can start it before, but set the volume to 0. So that way, the volume will be 
    // set only after the poses are available.
    osc.start();
}

function draw() {
    background(220);

    //mirror the camera
    push();
    translate(myVideo.width, 0);
    scale(-1, 1);
    image(myVideo, 0, 0, width, height);
    pop();

    ellipse(mouseX, mouseY, 50, 50);

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

    // pose to change sound
    if (pose) {

        //let nose = pose.keypoints[0];
        //console.log(nose);
        // let noseX = pose.keypoints[0].position.x
        // let noseY = pose.keypoints[0].position.y
        let leftWristX = pose.keypoints[9].position.x;
        let leftWristY = pose.keypoints[9].position.y;

        let rightWristX = pose.keypoints[10].position.x;
        let rightWristY = pose.keypoints[10].position.y;



        // console.log(nose.score)
        let n = floor(map(width - rightWristX, 0, width, 0, 8));
        let amp = map(leftWristY, 0, height, 1, 0);
        console.log(n);
        osc.freq(midiToFreq(notes[n]));
        //amp(vol,[rampTime],[timeFromNow])fade out
        osc.amp(amp, 0.1);
        //osc.amp(amp);
    }

    //draw strings

    let w = myVideo.width / 8;
    console.log(w);
    for (let i = 0; i < 8; i++) {
        let stringX = w * i;

        if (pose) {

            let leftWristX = pose.keypoints[9].position.x;
            let leftWristY = pose.keypoints[9].position.y;

            let rightWristX = pose.keypoints[10].position.x;
            let rightWristY = pose.keypoints[10].position.y;

            if (width - rightWristX > stringX && width - rightWristX < stringX + w) {
                fill(0, 250, 255, 200);
            } else {
                fill(0, 0, 150, 100);
            }

            //strings
            stroke(255);
            rect(stringX, 0, w, height);
            //text
            textSize(35);
            fill(255);
            text(letters[i], w * i, height / 2);
        }
    }

    //Red nose poseNet
    if (pose) {
        // let noseX = pose.keypoints[0].position.x
        // let noseY = pose.keypoints[0].position.y

        let leftWristX = pose.keypoints[9].position.x;
        let leftWristY = pose.keypoints[9].position.y;

        let rightWristX = pose.keypoints[10].position.x;
        let rightWristY = pose.keypoints[10].position.y;


        fill('red')
        circle(width - leftWristX, leftWristY, 30);
        circle(width - rightWristX, rightWristY, 30);
        
        line(width - leftWristX,leftWristY,width,leftWristY);

    }
}

// We got a new stream!
function gotStream(stream) {
    // This is just like a video/stream from createCapture(VIDEO)
    otherVideo = stream;
    //otherVideo.id is the unique identifier for this peer
    //otherVideo.hide();
}
