Parse.initialize(
    "2CRQF9JTGgwiN3m4o2Q7EX29m3PSYV97BRk5MRSU",
    "w4x7Il39dd1x5ixCkd6uzTO9SRMSpm6VOSMR3PYn"
);
Parse.serverURL = 'https://pg-app-s4xeiqcvd9vyl5lycfvuzz49fbtelr.scalabl.cloud/1/';

const URL = "https://teachablemachine.withgoogle.com/models/N58PlX_GN/";

let model, webcam, newlabel, labelContainer, maxPredictions, camera_on = false;

function useWebcam() {
    camera_on = !camera_on;

    if (camera_on) {
        init();
        document.getElementById("webcam").innerHTML = "Close Webcam";
    }
    else {
        stopWebcam();
        document.getElementById("webcam").innerHTML = "Start Webcam";
    }
}

async function stopWebcam() {
    await webcam.stop();
    document.getElementById("webcam-container").removeChild(webcam.canvas);
    labelContainer.removeChild(newlabel);
}

// Load the image model and setup the webcam
async function init() {

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append element to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);

    newlabel = document.createElement("div");

    labelContainer = document.getElementById("label-container");
    labelContainer.appendChild(newlabel);
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);

    var highestVal = 0.00;
    var bestClass = "";
    result = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        var classPrediction = prediction[i].probability.toFixed(2);
        if (classPrediction > highestVal) {
            highestVal = classPrediction;
            bestClass = prediction[i].className;
        }
    }

    if (bestClass == "Fresh Banana" || bestClass == "Fresh Apple" || bestClass == "Fresh Orange") {
        newlabel.className = "alert alert-success";
    }
    else {
        newlabel.className = "alert alert-danger";
    }

    newlabel.innerHTML = bestClass;
}

async function getPredictions() {

    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    canvas.width = "224";
    canvas.height = "224";
    context.drawImage(img, 0, 0);
    document.getElementById("uploadedImage").appendChild(canvas);

    const pred = await model.predict(canvas);

    var highestVal = 0.00;
    var bestClass = "";

    for (let i = 0; i < maxPredictions; i++) {
        var classPrediction = pred[i].probability.toFixed(2);
        if (classPrediction > highestVal) {
            highestVal = classPrediction;
            bestClass = pred[i].className;
        }
    }

    if (bestClass == "Fresh Banana" || bestClass == "Fresh Apple" || bestClass == "Fresh Orange") {
        labelContainer.className = "alert alert-success";
    }
    else {
        labelContainer.className = "alert alert-danger";
    }

    labelContainer.innerHTML = bestClass;
}


$(document).ready(function () {
    $("#loadBtn").on("click", async function () {

        const fileUploadControl = $("#fruitimg")[0];
        if (fileUploadControl.files.length > 0) {

            const modelURL = URL + "model.json";
            const metadataURL = URL + "metadata.json";

            // load the model and metadata
            model = await tmImage.load(modelURL, metadataURL);
            maxPredictions = model.getTotalClasses();

            const file = fileUploadControl.files[0];

            const name = "photo.jpg";
            const parseFile = new Parse.File(name, file);

            labelContainer = document.getElementById("label-container");

            parseFile.save().then(async function () {
                //The file has been saved to the Parse server

                img = new Image(224, 224);
                img.crossOrigin = "Anonymous";
                img.addEventListener("load", getPredictions, false);
                img.src = parseFile.url();


            }, function (error) {
                // The file either could not be read, or could not be saved to Parse.
                result.innerHTML = "Uploading your image failed!";
            });
        }
        else {
            result.innerHTML = "Try Again!";
        }
    });
});