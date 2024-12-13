// Добавляем библиотеку для генерации UUID
// const { v4: uuidv4 } = require('uuid');
// uuidv4();
// import { v4 as uuidv4 } from 'https://jspm.dev/uuid';
// Функция для проверки устройства на iOS
// function isIOS() {
//   return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
// }

// // Скрытие элементов управления видео на iOS
// if (isIOS()) {
//   const videoControlsContainer = document.querySelector('.video-controls-container');
//   if (videoControlsContainer) {
//     videoControlsContainer.style.display = 'none';
//   }
// }

//cast`

//

const playPauseBtn = document.querySelector(".play-pause-btn");
const fullScreenBtn = document.querySelector(".full-screen-btn");
const miniPlayerBtn = document.querySelector(".mini-player-btn");
const muteBtn = document.querySelector(".mute-btn");
const captionsBtn = document.querySelector(".captions-btn");
// const speedBtn = document.querySelector(".speed-btn");
const currentTimeElem = document.querySelector(".current-time");
const totalTimeElem = document.querySelector(".total-time");
const previewImg = document.querySelector(".preview-img");
const thumbnailImg = document.querySelector(".thumbnail-img");
const volumeSlider = document.querySelector(".volume-slider");
const videoContainer = document.querySelector(".video-container");
const timelineContainer = document.querySelector(".timeline-container");
const timelineTouch = document.querySelector(".timeline_touch");
const video = document.querySelector("video");
const spanElement = document.querySelector(".span");

let isScrubbing = false;
let touchInProgress = false;
let touchScrubbingPosition = 0;

timelineTouch.addEventListener("mousedown", (e) => {
  isScrubbing = true;
  touchInProgress = true;
  touchScrubbingPosition = video.currentTime;
});

document.addEventListener("mousemove", (e) => {
  if (!touchInProgress) return;
  handleTimelineTouchUpdate(e);
});

document.addEventListener("mouseup", () => {
  if (touchInProgress) {
    touchInProgress = false;
    video.currentTime = touchScrubbingPosition;
    touchScrubbingPosition = 0;
  }
});

//timeLine show current time
timelineTouch.addEventListener("mousemove", (e) => {
  let offsetX = e.offsetX;
  let timelineWidth = timelineTouch.clientWidth;

  // Ограничиваем offsetX в диапазоне от 0 до timelineWidth
  offsetX = Math.max(0, Math.min(offsetX, timelineWidth));

  const percent = offsetX / timelineWidth;
  const currentTime = percent * video.duration;
  const time = formatDuration(currentTime);
  const progressTime = timelineTouch.querySelector(".span"); // Поправил на ".span"
  const maxLeft = videoContainer.clientWidth - progressTime.clientWidth;
  let spanLeft = offsetX - time.replace(":", "").length;

  // Ограничиваем spanLeft в диапазоне от 0 до maxLeft
  spanLeft = Math.max(0, Math.min(spanLeft, maxLeft));

  progressTime.style.left = `${spanLeft}px`;
  progressTime.innerText = time;
});

//
timelineTouch.addEventListener("mouseenter", () => {
  spanElement.style.display = "block";
});

timelineTouch.addEventListener("mouseleave", () => {
  spanElement.style.display = "none";
});
//

// timelineTouch.addEventListener("touchmove",(e) => {
// let offsetX = e.offsetX;
// let timelineWidth = timelineTouch.clientWidth;

// const percent = (offsetX / timelineWidth) * video.duration;
// const progressTime = timelineTouch.querySelector(".span"); // Исправлено на ".span"
// progressTime.style.left = `${offsetX}px`;
// progressTime.innerText = formatDuration(percent);
// });

timelineTouch.addEventListener("click", (e) => {
  // Проверяем, является ли устройство мышью
  if (e.pointerType === "mouse") {
    const rect = timelineTouch.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
    const videoUrl = videoUrlInput.value;
    const storedVideoIds = JSON.parse(localStorage.getItem("videoIds")) || {};
    if (videoUrl == "") {
      storedVideoIds[defaultVideoUrl] = (percent * video.duration).toString();
    } else {
      storedVideoIds[videoUrl] = (percent * video.duration).toString();
    }
    localStorage.setItem("videoIds", JSON.stringify(storedVideoIds));
  }
});

//drag timeline TouchScreen
timelineTouch.addEventListener("touchstart", (e) => {
  document.querySelector("body").style.overscrollBehavior = "none";
  isScrubbing = true;
  touchInProgress = true;
  touchScrubbingPosition = video.currentTime;
});

timelineTouch.addEventListener("touchmove", (e) => {
  if (!touchInProgress) return;
  handleTimelineTouchUpdate(e.touches[0]);
});

timelineTouch.addEventListener("touchend", () => {
  document.querySelector("body").style.overscrollBehavior = "auto";
  if (touchInProgress) {
    touchInProgress = false;
    video.currentTime = touchScrubbingPosition;
    touchScrubbingPosition = 0;
  }
});

// speedBtn.addEventListener("click", changePlaybackSpeed);
captionsBtn.addEventListener("click", toggleCaptions);
muteBtn.addEventListener("click", toggleMute);
volumeSlider.addEventListener("input", (e) => {
  video.volume = e.target.value;
  video.muted = e.target.value === 0;
});

fullScreenBtn.addEventListener("click", toggleFullScreenMode);
miniPlayerBtn.addEventListener("click", toggleMiniPlayerMode);

playPauseBtn.addEventListener("click", togglePlay);
video.addEventListener("click", (e) => {
  if (
    e.type === "click" &&
    !("ontouchstart" in window || navigator.msMaxTouchPoints)
  ) {
    togglePlay();
  }
});

video.addEventListener("play", () => {
  videoContainer.classList.remove("paused");
});

video.addEventListener("pause", () => {
  videoContainer.classList.add("paused");
});

video.addEventListener("loadeddata", () => {
  const videoUrl = videoUrlInput.value;
  const storedVideoIds = JSON.parse(localStorage.getItem("videoIds")) || {};
  let currentTime;

  if (videoUrl == "") {
    currentTime = storedVideoIds[defaultVideoUrl] ?? 0;
  } else {
    currentTime = storedVideoIds[videoUrl] ?? 0;
  }

  if (isFinite(currentTime)) {
    video.currentTime = currentTime;
  } else {
    video.currentTime = 0; // или любое другое значение по умолчанию
  }

  totalTimeElem.textContent = formatDuration(video.duration);
});

video.addEventListener("timeupdate", () => {
  currentTimeElem.textContent = formatDuration(video.currentTime);
  const percent = video.currentTime / video.duration;
  if (!touchInProgress) {
    timelineContainer.style.setProperty("--progress-position", percent);
  }
});

video.addEventListener("volumechange", () => {
  volumeSlider.value = video.volume;
  let volumeLevel;
  if (video.muted || video.volume === 0) {
    volumeSlider.value = 0;
    volumeLevel = "muted";
  } else if (video.volume >= 0.5) {
    volumeLevel = "high";
  } else {
    volumeLevel = "low";
  }
  videoContainer.dataset.volumeLevel = volumeLevel;
});

document.addEventListener("fullscreenchange", () => {
  const isFullScreen = document.fullscreenElement == null;
  fullScreenBtn.classList.toggle("full-screen", isFullScreen);
});

video.addEventListener("enterpictureinpicture", () => {
  videoContainer.classList.add("mini-player");
});

video.addEventListener("leavepictureinpicture", () => {
  videoContainer.classList.remove("mini-player");
});

function togglePlay() {
  video.paused ? video.play() : video.pause();
}

function toggleScrubbing(e) {
  const rect = timelineContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
  isScrubbing = (e.buttons & 1) === 1;
  videoContainer.classList.toggle("scrubbing", isScrubbing);

  if (isScrubbing) {
    if (video.playbackRate !== 0) {
      video.pause();
    }
  } else {
    video.currentTime = percent * video.duration;
    if (video.playbackRate !== 0) {
      video.play();
    }
  }

  handleTimelineTouchUpdate(e);
  // handleTimelineUpdate(e)
}

function handleTimelineUpdate(e) {
  const rect = timelineContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
  const previewImgNumber = Math.max(
    1,
    Math.floor((percent * video.duration) / 10)
  );
  const previewImgSrc = `/assets/previewImgs/preview${previewImgNumber}.jpg`;
  previewImg.src = previewImgSrc;
  timelineContainer.style.setProperty("--preview-position", percent);

  if (isScrubbing) {
    e.preventDefault();
    thumbnailImg.src = previewImgSrc;
    timelineContainer.style.setProperty("--progress-position", percent);
  }
}

function handleTimelineTouchUpdate(touch) {
  if (!isScrubbing) return;

  const rect = timelineContainer.getBoundingClientRect();
  const touchX = touch.clientX - rect.x;
  const percent = Math.min(Math.max(0, touchX), rect.width) / rect.width;

  touchScrubbingPosition = percent * video.duration;

  thumbnailImg.src = `assets/previewImgs/preview${Math.max(
    1,
    Math.floor((percent * video.duration) / 10)
  )}.jpg`;

  timelineContainer.style.setProperty("--progress-position", percent);
}

function changePlaybackSpeed() {
  let newPlaybackRate = video.playbackRate + 0.25;
  if (newPlaybackRate > 2) newPlaybackRate = 0.25;
  video.playbackRate = newPlaybackRate;
  speedBtn.textContent = `${newPlaybackRate}x`;
}

// speedbutton test
let speedOptions = document.querySelector(".speed-options");
speedOptions.querySelectorAll("li").forEach((option) => {
  option.addEventListener("click", () => {
    video.playbackRate = option.dataset.speed;
    speedOptions.querySelector(".active").classList.remove("active");
    option.classList.add("active");
  });
});

document.addEventListener("click", (e) => {
  if (e.target.tagName !== "IMG") {
    speedOptions.classList.remove("show");
  }
});

// document.addEventListener('mousemove', e => {
//   if (
//     e.target.tagName !== "VIDEO" && e.target.className !== "video-controls-container"
//   ) {
//      document.querySelector('.video-controls-container').style.display = "none"
//     speedOptions.classList.remove("show");
//   } else {
//     document.querySelector('.video-controls-container').style.display = "block"
//   }
// })

let speedBtn = document.querySelector(".playback-speed img");
speedBtn.addEventListener("click", () => speedOptions.classList.toggle("show"));

function toggleCaptions() {
  const isHidden = captions.mode === "hidden";
  captions.mode = isHidden ? "showing" : "hidden";
  videoContainer.classList.toggle("captions", isHidden);
}

function toggleMute() {
  video.muted = !video.muted;
}

function toggleFullScreenMode() {
  document.querySelector(".full-screen-btn").classList.toggle("full-screen");
  if (document.fullscreenElement == null) {
    videoContainer.requestFullscreen();
    window.screen.orientation.lock("landscape");
  } else {
    document.exitFullscreen();
  }
}

function toggleMiniPlayerMode() {
  if (videoContainer.classList.contains("mini-player")) {
    document.exitPictureInPicture();
  } else {
    video.requestPictureInPicture();
  }
}

function formatDuration(time) {
  const seconds = Math.floor(time % 60);
  const minutes = Math.floor(time / 60) % 60;
  const hours = Math.floor(time / 3600);
  if (hours === 0) {
    return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
  } else {
    return `${hours}:${leadingZeroFormatter.format(
      minutes
    )}:${leadingZeroFormatter.format(seconds)}`;
  }
}

function skip(duration) {
  video.currentTime += duration;
}

const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2,
});

// Double Tap start

let lastTapTime = 0;

video.addEventListener("click", function (event) {
  const currentTime = new Date().getTime();
  if (currentTime - lastTapTime < 300) {
    const tapX = event.clientX;
    const screenWidth = window.innerWidth;

    if (tapX < screenWidth / 2) {
      // Перемотка на 10 секунд назад
      video.currentTime -= 10;
    } else {
      // Перемотка на 10 секунд вперед
      video.currentTime += 10;
    }
  }
  lastTapTime = currentTime;
});

// Double Tap End

//Bind Keys
document.addEventListener("keydown", (e) => {
  const tagName = document.activeElement.tagName.toLowerCase();

  if (tagName === "input") return;

  switch (e.key.toLowerCase()) {
    case " ":
      if (tagName === "button") return;
    case "k":
    case "л":
      togglePlay();
      break;
    case "f":
    case "а":
      toggleFullScreenMode();
      break;
    case "p":
    case "з":
      toggleMiniPlayerMode();
      break;
    case "m":
    case "ь":
      toggleMute();
      break;
    case "arrowleft":
    case "j":
    case "о":
      skip(-10);
      break;
    case "arrowright":
    case "l":
    case "д":
      skip(10);
      break;
    case "c":
    case "с":
      toggleCaptions();
      break;
  }
});

// Добавление поля ввода для ссылки на видео файл

const videoUrlInput = document.querySelector(".video-url-input");

videoUrlInput.addEventListener("input", loadVideoFromUrl);
videoUrlInput.addEventListener("click", function () {
  this.select();
});

const defaultVideoUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"; // Ваша ссылка по умолчанию

loadHlsVideo(defaultVideoUrl);
function loadVideoFromUrl() {
  const videoUrl = videoUrlInput.value;
  fetch('https://hplr.onrender.com/api/search?' + videoUrl, {
    method: "GET",
  }).then(x => console.log(x));
  let videoId;

  // Check if the video URL has an associated ID in local storage
  const storedVideoIds = JSON.parse(localStorage.getItem("videoIds")) || {};
  if (storedVideoIds[videoUrl]) {
    videoId = storedVideoIds[videoUrl];
  } else {
    // Generate a new video ID
    // videoId = uuidv4();

    // Save the new video ID to local storage
    saveVideoIdToLocalstorage(videoUrl);
  }

  const correctedVideoUrl = correctVideoUrl(videoUrl);
  const videoType = getVideoType(correctedVideoUrl);

  if (videoType === "mp4") {
    loadMp4Video(correctedVideoUrl, videoId);
  } else if (videoType === "m3u8") {
    loadHlsVideo(correctedVideoUrl, videoId);
  } else if (videoType === "mpd") {
    loadDashVideo(correctedVideoUrl, videoId);
  } else {
    console.error("Unsupported video format");
  }

  video.addEventListener("loadedmetadata", () => {
    // Check if video progress is stored in local storage
    const storedVideoIds = JSON.parse(localStorage.getItem("videoIds")) || {};
    console.log(storedVideoIds);
    if (storedVideoIds[videoUrl]) {
      // Restore video progress from local storage
      video.currentTime = parseFloat(storedVideoIds[videoUrl]);
    } else {
      video.pause();
    }
  });

  console.log(`Video URL: ${videoUrl}, Video ID: ${videoId}`);
}

function saveVideoIdToLocalstorage(videoUrl) {
  // Retrieve existing video IDs from local storage
  const storedVideoIds = JSON.parse(localStorage.getItem("videoIds")) || {};

  // Save the new video ID
  storedVideoIds[videoUrl] = videoUrl;

  // Update local storage with the new video IDs
  localStorage.setItem("videoIds", JSON.stringify(storedVideoIds));
}

window.addEventListener("unload", () => {
  const videoUrl = videoUrlInput.value;
  const storedVideoIds = JSON.parse(localStorage.getItem("videoIds")) || {};
  if (videoUrl == "") {
    storedVideoIds[defaultVideoUrl] = video.currentTime.toString();
  } else {
    storedVideoIds[videoUrl] = video.currentTime.toString();
  }
  localStorage.setItem("videoIds", JSON.stringify(storedVideoIds));
});
//     const videoUrl = videoUrlInput.value;
//     const storedVideoIds = JSON.parse(localStorage.getItem("videoIds")) || {};
//     if(videoUrl == '') {
//       video.currentTime = storedVideoIds[defaultVideoUrl]
//     } else {
//       video.currentTime = storedVideoIds[videoUrl]
//     }
//   // Save the video progress to local storage
//   // const videoUrl = videoUrlInput.value;
//   // const storedVideoIds = JSON.parse(localStorage.getItem("videoIds")) || {};
//   // storedVideoIds[videoUrl] = video.currentTime.toString();
//   // localStorage.setItem("videoIds", JSON.stringify(storedVideoIds));
// });

// //
function getVideoType(url) {
  if (url.endsWith(".mp4")) {
    return "mp4";
  } else if (url.endsWith(".m3u8")) {
    return "m3u8";
  } else if (url.endsWith(".mpd")) {
    return "mpd";
  } else if (url.endsWith(".mp4:hls")) {
    return "m3u8";
  } else {
    return "unknown";
  }
}

//  MP4
function loadMp4Video(url) {
  video.src = url;
  video.load();
}

//  HLS/m3u8
function loadHlsVideo(url) {
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
  }
}

//  DASH
function loadDashVideo(url) {
  const player = dashjs.MediaPlayer().create();
  player.initialize(video, url, true);
}

//  Link Change
function correctVideoUrl(url) {
  const regex = /^(.*?\.mp4:hls).*$/;
  const match = url.match(regex);

  if (match && match[1]) {
    return match[1] + ":manifest.m3u8";
  }

  return url;
}

let holdTimeout;
let isSpeedIncreased = false;

// Добавление возможности увеличения скорости воспроизведения при длительном удерживании
video.addEventListener("touchstart", (e) => {
  holdTimeout = setTimeout(() => {
    video.playbackRate = 2.0; // увеличиваем скорость
    isSpeedIncreased = true;
  }, 1000); // увеличиваем скорость после 1 секунды удерживания
});

video.addEventListener("touchend", () => {
  clearTimeout(holdTimeout);
  if (isSpeedIncreased) {
    video.playbackRate = 1.0; // возвращаем нормальную скорость
    isSpeedIncreased = false;
  }
});

// Проверяем, есть ли сохраненная позиция в localStorage
//  if (localStorage.getItem('videoPosition')) {
//   // Устанавливаем текущее время видео из localStorage
//   video.currentTime = parseFloat(localStorage.getItem('videoPosition'));
// }

// video.addEventListener("timeupdate", () => {
//   localStorage.setItem('videoPosition', video.currentTime.toString());
// });

// import { v4 as uuidv4 } from 'https://jspm.dev/uuid';
// console.log(uuidv4());
