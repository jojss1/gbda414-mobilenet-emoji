/*
WEEK 5 WORKSHOP: MISRECOGNITION MIRROR

This is Step 1 of a sequence of sketches. Each sketch adds one layer to an
interactive machine-vision system:

1. Step 1 receives and displays webcam pixels.
2. Step 2 sends those pixels to MobileNet for classification.
3. Step 3 loads a local JSON dataset beside the classifier.
4. Step 4 matches the model label to a JSON record.
5. The full sketch turns the match into an emoji-based interpretation mirror.
6. The bonus sketch gives the system short-term memory.

In this first sketch, the program has input but no interpretation. The webcam
is a stream of changing pixel data. The program does not know what appears in
the image, and no machine-learning model is involved yet.

Important concepts:
- A video element stores the camera stream.
- A p5.js canvas is where the stream is displayed.
- setup() runs once; draw() repeats continuously.
- createCapture(VIDEO) may require browser permission.
*/

// This variable stores the HTML video element created by p5.js.

let video;

function setup() {
  createCanvas(960, 720);

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
}

function draw() {
  image(video, 0, 0, width, height);

  fill(0, 180);
  noStroke();
  rect(20, 20, 600, 80);

  fill(255);
  textSize(24);
  text("Step 1: Webcam Input", 40, 55);
}
