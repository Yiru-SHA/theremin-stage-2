console.log("connected!")

//load camera
let myVideo;
let otherVideo;
let myCanvas;

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
    myCanvas.position((windowWidth - width) / 2, 100);

    //load ML5
    poseNet = ml5.poseNet(myVideo, modelLoaded);
    poseNet.on('pose', gotPoses);

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
    // osc.start();
}


document.getElementById('poseReady').addEventListener('click', () => {
    console.log("clicked!")
    location.replace("/index.html")
})

// function myFunction() {
//     location.replace("https://www.w3schools.com")
//   }

function draw() {
    background(220);

    //mirror the camera
    push();
    translate(myVideo.width, 0);
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

    //ellipse(mouseX, mouseY, 50, 50);
    ellipseMode(RADIUS);
    stroke(0,255,255);
    strokeWeight(5);
    noFill();
    ellipse(width / 2, (height / 2) - 30, 80, 100);

    //leftWrist
    ellipse(width/4,height/4*3,50,50);
    ellipse(width/4*3,height/4*3,50,50);

    //RightWrist

    //poseNET
    if (pose) {
        // let noseX = pose.keypoints[0].position.x
        // let noseY = pose.keypoints[0].position.y

        let leftWristX = pose.keypoints[9].position.x;
        let leftWristY = pose.keypoints[9].position.y;

        let rightWristX = pose.keypoints[10].position.x;
        let rightWristY = pose.keypoints[10].position.y;

        noStroke();
        fill('red')
        circle(width - leftWristX, leftWristY, 20);
        circle(width - rightWristX, rightWristY, 20);
        

        fill('blue');
        circle(100,300,20)
        
        let d = dist(leftWristX, leftWristY, width-100,300);
        console.log(leftWristX,leftWristY);

        if(d<100){
            console.log("checkdistance!!")
            return true;
        }
        //console.log(d);
    }

}

// function distanceCheck(){
   
// }

function gotStream(stream) {
    // This is just like a video/stream from createCapture(VIDEO)
    otherVideo = stream;
    //otherVideo.id is the unique identifier for this peer
    //otherVideo.hide();
}