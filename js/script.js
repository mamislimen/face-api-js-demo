// select video tag
const video = document.getElementById("video");
// Load Models
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models/'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models/'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models/'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models/'),
    faceapi.nets.ageGenderNet.loadFromUri('/models/')
]
).then(startVideo())
function startVideo() {
   // Run WebCam 
  navigator.getUserMedia(
    { video: {} },
    stream => (video.srcObject = stream),
    err => console.log(err)
  );
}

video.addEventListener('play',()=>
{
    // Create Canvas
    const canvas=faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    // define display size
    const displaySize={ width:video.width,height:video.height}
    // match dispaly size to canvas 
    faceapi.matchDimensions(canvas,displaySize)

setInterval(async () => {
    
    // detect all faces
    const detections=await faceapi.detectAllFaces(video,
        new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender()
    // apply resize to detection
    const resizedDetection=faceapi.resizeResults(detections,displaySize)
    // clear canvas before draw the new
    canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height)
    // Draw Canvas
    faceapi.draw.drawDetections(canvas,resizedDetection ,{ withScore: true })
    // Draw  Face Landmarks
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetection, { drawLines: true, color: 'red' })
    // Draw a textbox displaying the face expressions with minimum probability into the canvas
    const minProbability = 0.05
    faceapi.draw.drawFaceExpressions(canvas, resizedDetection,minProbability)
    // add age and gender
    resizedDetection.forEach(result => {
        const { age, gender, genderProbability } = result
        new faceapi.draw.DrawTextField(
          [
            `${faceapi.round(age, 0)} years`,
            `${gender} (${faceapi.round(genderProbability)})`
          ],
          result.detection.box.bottomRight
        ).draw(canvas)
      })

    
}, 100);
})