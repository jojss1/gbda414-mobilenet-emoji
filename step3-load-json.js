/*
WEEK 5 WORKSHOP: MISRECOGNITION MIRROR

Step 2 produced a live MobileNet label. Step 3 adds a local JSON dataset
containing ImageNet-related records.

We are not matching the label yet. We are first checking that two systems can
run at the same time:

webcam -> MobileNet -> label
JSON file -> translation records

The required file is finalImageNetLabelsAndEmojis.json. The JSON file is a
separate source of information. Loading it does not mean that the program has
already found the correct record. The connection between the model label and
the dataset is the main task of Step 4.

preload() is used because p5.js can wait for the file to load before setup()
begins. The success and failure callback functions make the loading state
visible and give useful debugging information.
*/

let video;
let classifier;
let mappings = [];
let currentLabel = "Waiting for classification...";
let currentConfidence = 0;
let jsonLoaded = false;
let jsonError = false;

function preload() {
  mappings = loadJSON(
    "finalImageNetLabelsAndEmojis.json",
    jsonLoadedSuccessfully,
    jsonFailedToLoad,
  );
}

function jsonLoadedSuccessfully(data) {
  mappings = data;
  jsonLoaded = true;
  console.log("JSON loaded successfully:", data.length);
}

function jsonFailedToLoad(error) {
  console.error("JSON failed to load:", error);
  jsonError = true;
  mappings = [];
}

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
  rect(20, 20, 850, 240);

  fill(255);
  textSize(24);
  text("Step 3: JSON Translation Data", 40, 55);

  textSize(19);
  text("Model label: " + currentLabel, 40, 95, 780, 55);
  text("Confidence: " + nf(currentConfidence * 100, 2, 1) + "%", 40, 165);

  if (jsonError) {
    text("JSON: Failed to load", 40, 205);
  } else if (jsonLoaded) {
    text("JSON records loaded: " + mappings.length, 40, 205);
  } else {
    text("JSON: Loading...", 40, 205);
  }
}
