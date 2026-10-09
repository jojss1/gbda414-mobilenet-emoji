/*
WEEK 5 WORKSHOP: MISRECOGNITION MIRROR

Steps 1–3 created two separate systems:

webcam -> MobileNet -> label
JSON file -> ImageNet translation records

Step 4 connects them:

MobileNet label -> JSON record -> workshop category -> emoji

The matching process uses several passes, from stricter to more flexible:
1. exact full-label match;
2. first-term match;
3. exact match between comma-separated synonym terms; and
4. careful containment matching for terms of at least four characters.

A missing match remains visible. The program does not pretend that every
MobileNet prediction has a perfect emoji translation. The model prediction,
the data record, and the human-designed interpretation are separate layers.
*/

let video;
let classifier;
let mappings = [];
let currentLabel = "Waiting for classification...";
let currentConfidence = 0;
let currentRecord = null;
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
}

function jsonFailedToLoad(error) {
  console.error("JSON failed:", error);
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

function findMapping(modelLabel) {
  if (!jsonLoaded || !Array.isArray(mappings)) return null;

  let modelFull = normalizeLabel(modelLabel);
  let modelFirst = firstTerm(modelLabel);
  let modelTerms = labelTerms(modelLabel);

  // First try an exact match.
  for (let item of mappings) {
    if (modelFull === normalizeLabel(item.label)) {
      return item;
    }
  }

  // Then compare the first term.
  for (let item of mappings) {
    if (modelFirst === firstTerm(item.label)) {
      return item;
    }
  }

  // Then compare individual synonyms.
  for (let item of mappings) {
    let terms = labelTerms(item.label);

    for (let term of modelTerms) {
      if (terms.includes(term)) {
        return item;
      }
    }
  }

  // Finally try a partial match.
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

function gotResults(results) {
  if (!results || results.length === 0) return;

  currentLabel = results[0].label;
  currentConfidence = results[0].confidence;
  currentRecord = findMapping(currentLabel);
}

function draw() {
  image(video, 0, 0, width, height);

  fill(0, 190);
  noStroke();
  rect(20, 20, 850, 300);

  fill(255);
  textSize(24);
  text("Step 4: Label Translation", 40, 55);

  textSize(19);
  text("MobileNet: " + currentLabel, 40, 95, 780, 55);
  text("Confidence: " + nf(currentConfidence * 100, 2, 1) + "%", 40, 160);

  if (jsonError) {
    text("JSON failed to load", 40, 205);
  } else if (currentRecord) {
    text("Category: " + currentRecord.workshopCategory, 40, 205);
    text("WordNet Parent: " + currentRecord.wordnetParent, 40, 240);
    text("Emoji: " + currentRecord.emoji, 40, 285);
  } else {
    text("Category: Unknown", 40, 205);
    text("WordNet Parent: Unknown", 40, 240);
    text("Emoji: ❓", 40, 285);
  }
}
