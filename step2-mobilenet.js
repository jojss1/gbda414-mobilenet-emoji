/*
WEEK 5 WORKSHOP: MISRECOGNITION MIRROR

Step 1 displayed webcam pixels. Step 2 adds MobileNet, a pretrained image-
classification model supplied through ml5.js.

Pipeline so far:
webcam image -> MobileNet -> label and confidence

MobileNet does not return a perfect description of reality. It returns a
prediction based on patterns learned from its training data. The confidence
value is also a model score, not a guarantee that the label is correct.

This sketch does not load the JSON translation dataset yet. That happens in
Step 3. At this stage, focus on the difference between the raw camera input,
the classifier object, the label returned by the classifier, and the
confidence associated with that label.
*/

let video;
let classifier;
let currentLabel = "Waiting for classification...";
let currentConfidence = 0;

function setup() {
  createCanvas(960, 720);

  video = createCapture(VIDEO, { flipped: true });
  video.size(width, height);
  video.hide();

  classifier = ml5.imageClassifier("MobileNet", { flipped: true });
  classifier.classifyStart(video, gotResults);
}

function gotResults(results) {
  if (!results || results.length === 0) return;

  currentLabel = results[0].label;
  currentConfidence = results[0].confidence;
}

function draw() {
  image(video, 0, 0, width, height);

  fill(0, 190);
  noStroke();
  rect(20, 20, 800, 180);

  fill(255);
  textSize(24);
  text("Step 2: MobileNet Classification", 40, 55);

  textSize(20);
  text("Label: " + currentLabel, 40, 100, 740, 55);
  text("Confidence: " + nf(currentConfidence * 100, 2, 1) + "%", 40, 165);
}
