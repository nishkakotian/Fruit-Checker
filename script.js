Parse.initialize(
    "2CRQF9JTGgwiN3m4o2Q7EX29m3PSYV97BRk5MRSU",
    "w4x7Il39dd1x5ixCkd6uzTO9SRMSpm6VOSMR3PYn"
);
Parse.serverURL = 'https://pg-app-s4xeiqcvd9vyl5lycfvuzz49fbtelr.scalabl.cloud/1/';

const URL = "https://teachablemachine.withgoogle.com/models/r6WxaGerd/";

let model, webcam, labelContainer, maxPredictions;

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

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

$(document).ready(function () {
    $("#loadBtn").on("click", function () {
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

            parseFile.save().then(function () {
                // The file has been saved to Parse
                document.getElementById("uploadedImage").src = parseFile.url();

                const prediction = await model.predict(parseFile.url());
                var bestPrediction = "";

                for (let i = 0; i < maxPredictions; i++) {
                    const classPrediction =
                        prediction[i].className + ": " + prediction[i].probability.toFixed(2);
                    labelContainer.childNodes[i].innerHTML = classPrediction;
                }

            }, function (error) {
                // The file either could not be read, or could not be saved to Parse.
                document.getElementById("result").innerHTML = "NOo Success!";
            });



        }
        else {
            document.getElementById("result").innerHTML = "did not work only!";
        }
    });
});

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}