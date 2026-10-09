/*
GBDA 414 Week 5
Misrecognition Mirror - Extended Sketch

Webcam -> MobileNet -> JSON -> Emoji
Bonus: Short-term memory
*/

let video;
let classifier;
let mappings = [];

let currentLabel = "Waiting for classification...";
let currentConfidence = 0;
let currentRecord = null;

let jsonLoaded = false;
let jsonError = false;

// Bonus memory variables
let history = [];
let lastRecordedLabel = "";
let lastRecordTime = 0;
let memoryInterval = 2500;

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
  console.log("JSON loaded:", data.length);
}

function jsonFailedToLoad(error) {
  console.error("JSON failed:", error);
  jsonError = true;
  mappings = [];
}

function setup() {
  createCanvas(960, 720);

  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();

  classifier = ml5.imageClassifier("MobileNet", { flipped: true });
  classifier.classifyStart(video, gotResults);
}

// Normalize labels before matching.
function normalizeLabel(labelText) {
  return String(labelText).toLowerCase().trim();
}

function firstTerm(labelText) {
  return normalizeLabel(labelText).split(",")[0].trim();
}

function labelTerms(labelText) {
  return normalizeLabel(labelText)
    .split(",")
    .map((term) => term.trim())
    .filter((term) => term.length > 0);
}

// Find a matching JSON record.
function findMapping(modelLabel) {
  if (!jsonLoaded || !Array.isArray(mappings)) return null;

  let modelFull = normalizeLabel(modelLabel);
  let modelFirst = firstTerm(modelLabel);
  let modelTerms = labelTerms(modelLabel);

  // Exact label match
  for (let item of mappings) {
    if (modelFull === normalizeLabel(item.label)) {
      return item;
    }
  }

  // First-term match
  for (let item of mappings) {
    if (modelFirst === firstTerm(item.label)) {
      return item;
    }
  }

  // Synonym match
  for (let item of mappings) {
    let terms = labelTerms(item.label);

    for (let term of modelTerms) {
      if (terms.includes(term)) {
        return item;
      }
    }
  }

  // Partial match
  for (let item of mappings) {
    let terms = labelTerms(item.label);

    for (let term of modelTerms) {
      for (let dataTerm of terms) {
        if (term.length < 4 || dataTerm.length < 4) continue;

        if (term.includes(dataTerm) || dataTerm.includes(term)) {
          return item;
        }
      }
    }
  }

  return null;
}

// Receive MobileNet predictions.
function gotResults(results) {
  if (!results || results.length === 0) return;

  currentLabel = results[0].label;
  currentConfidence = results[0].confidence;

  currentRecord = findMapping(currentLabel);

  // Record a memory when the label changes
  // and enough time has passed.
  if (
    currentLabel !== lastRecordedLabel &&
    millis() - lastRecordTime > memoryInterval
  ) {
    addMemory();
    lastRecordedLabel = currentLabel;
    lastRecordTime = millis();
  }
}

// Bonus: Add a classification to memory.
function addMemory() {
  let emoji = currentRecord ? currentRecord.emoji : "❓";

  history.push({
    emoji: emoji,
    x: random(60, width - 60),
    y: random(490, height - 60),
    age: 0,
    confidence: currentConfidence,
    speed: random(0.2, 0.8),
  });

  // Keep the most recent 30 memories.
  if (history.length > 30) {
    history.shift();
  }
}

function draw() {
  background(245, 240, 250);

  // Title
  fill(40);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(28);
  text("AI Emoji Mirror", 30, 20);

  textSize(15);
  text("What does AI think it sees?", 30, 58);

  // Webcam
  image(video, 30, 95, 580, 350);

  // Information panel
  fill(255);
  rect(630, 95, 300, 350, 15);

  fill(40);
  textSize(17);
  text("MobileNet Prediction", 650, 115);

  textSize(15);
  text(currentLabel, 650, 150, 260, 60);

  text("Confidence: " + nf(currentConfidence * 100, 2, 1) + "%", 650, 215);

  let category = currentRecord ? currentRecord.workshopCategory : "Unknown";

  let parent = currentRecord ? currentRecord.wordnetParent : "Unknown";

  let emoji = currentRecord ? currentRecord.emoji : "❓";

  text("Category: " + category, 650, 250, 260, 40);
  text("WordNet: " + parent, 650, 290, 260, 45);

  // Visual response: emoji size changes
  // based on model confidence.
  textAlign(CENTER, CENTER);

  let emojiSize = map(currentConfidence, 0, 1, 40, 110);
  textSize(emojiSize);
  text(emoji, 780, 385);

  // Memory archive
  textAlign(LEFT, TOP);
  fill(40);
  textSize(22);
  text("AI Memory Archive", 30, 470);

  textSize(13);
  text("Previous predictions remain as fading emojis.", 30, 500);

  // Draw and update memories.
  for (let i = history.length - 1; i >= 0; i--) {
    let memory = history[i];

    memory.age += 1;
    memory.y -= memory.speed;

    let opacity = map(memory.age, 0, 300, 255, 0);
    opacity = constrain(opacity, 0, 255);

    // Emoji size also remembers confidence.
    let size = map(memory.confidence, 0, 1, 20, 55);

    // Use drawingContext to fade emoji text.
    drawingContext.globalAlpha = opacity / 255;

    textAlign(CENTER, CENTER);
    textSize(size);
    text(memory.emoji, memory.x, memory.y);

    drawingContext.globalAlpha = 1;

    // Remove old memories.
    if (memory.age > 300) {
      history.splice(i, 1);
    }
  }

  // Clear memory button
  fill(220, 200, 235);
  rect(750, 465, 180, 45, 10);

  fill(40);
  textAlign(CENTER, CENTER);
  textSize(16);
  text("Clear Memory", 840, 487);

  textAlign(LEFT, TOP);
  textSize(13);
  text("Memories stored: " + history.length, 30, 680);

  if (jsonError) {
    fill(180, 40, 40);
    text("JSON failed to load", 650, 430);
  }
}

// Clear memory when the button is clicked.
function mousePressed() {
  if (mouseX > 750 && mouseX < 930 && mouseY > 465 && mouseY < 510) {
    history = [];
    lastRecordedLabel = "";
    lastRecordTime = millis();
  }
}
