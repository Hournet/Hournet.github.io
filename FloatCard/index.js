document.addEventListener("DOMContentLoaded", ready);

var xPosition = 0;
var yPosition = 0;

function handleMotionEvent(event) {
  let card = document.getElementById("card");
  
  if (!flag) {
    card.classList.remove("heartBeat");
  }
  var accelerationX = event.acceleration.x;
  var accelerationY = event.acceleration.y;
  var rotationRateBeta = event.rotationRate.beta;
  var rotationRateGamma = event.rotationRate.alpha;

  var movementX = (accelerationX + rotationRateBeta / 100) * 8; // Множитель для увеличения скорости движения по оси X
  var movementY = (accelerationY + rotationRateGamma / 100) * 8; // Множитель для увеличения скорости движения по оси Y

  xPosition += movementX;
  yPosition += movementY;

  // Ограничиваем движение по оси X до -100 и 100 пикселей
  if (xPosition < -100) {
    xPosition = -100;
  } else if (xPosition > 100) {
    xPosition = 100;
  }

  // Ограничиваем движение по оси Y до -100 и 100 пикселей
  if (yPosition < -100) {
    yPosition = -100;
  } else if (yPosition > 100) {
    yPosition = 100;
  }

  card.style.transform =
    "translate3d(" + xPosition + "px, " + yPosition + "px, 0)";
}
let flag = true;

function ready() {
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
    let card = document.getElementById("card");
    if (flag) {
      card.classList.add("heartBeat");
    }
    card.addEventListener("click", function () {
      getAccel();
    });
  }

  window.addEventListener("devicemotion", handleMotionEvent);
}

function getAccel() {
  DeviceMotionEvent.requestPermission().then((response) => {
    if (response == "granted") {
      console.log("accelerometer permission granted");
      flag = false;
    }
  });
}
