<template>
  <div class="video-editor">
    <!-- Video Display and Custom Frame -->
    <div class="video-container">
      <div class="video-frame">
        <video
          ref="video"
          :class="{ boomerang: isBoomerang }"
          controls
          :width="videoWidth"
          :height="videoHeight"
          @play="startDrawing"
          @pause="stopDrawing"
        ></video>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <label>
        Upload Video:
        <input type="file" @change="loadVideo" accept="video/*" />
      </label>

      <div class="control-item">
        <label>Playback Speed: {{ playbackSpeed }}x</label>
        <input type="range" v-model="playbackSpeed" min="0.1" max="2" step="0.1" />
      </div>

      <div class="control-item">
        <label>Volume: {{ volume * 100 }}%</label>
        <input type="range" v-model="volume" min="0" max="1" step="0.1" />
      </div>

      <!-- Effect Selection -->
      <div class="control-item">
        <label>Video Effect:</label>
        <select v-model="selectedEffect">
          <option v-for="effect in effects" :key="effect.value" :value="effect.value">
            {{ effect.label }}
          </option>
        </select>
      </div>

      <button @click="togglePlay">{{ isPlaying ? "Pause" : "Play" }}</button>
      <button @click="toggleBoomerang">{{ isBoomerang ? "Stop Boomerang" : "Boomerang" }}</button>
      <button @click="toggleLoop">{{ isLooping ? "Stop Repeat" : "Repeat" }}</button> <!-- New Repeat Button -->
    </div>

    <!-- Canvas to Render Video with Effects -->
    <div class="canvas-section">
      <canvas ref="canvas" :width="videoWidth" :height="videoHeight" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";

const video = ref(null);
const canvas = ref(null);
const playbackSpeed = ref(1);
const volume = ref(1);
const isPlaying = ref(false);
const isBoomerang = ref(false);
const isLooping = ref(false); // New state to track repeat mode
const videoWidth = ref(640);
const videoHeight = ref(480);
const selectedEffect = ref("none");
const frameId = ref(null);
let direction = 1;

const effects = [
  { value: "none", label: "None" },
  { value: "grayscale", label: "Grayscale" },
  { value: "sepia", label: "Sepia" },
  { value: "invert", label: "Invert" },
  { value: "brightness", label: "Brightness" },
  { value: "contrast", label: "Contrast" },
  { value: "saturate", label: "Saturate" },
  { value: "blur", label: "Blur" }
];

// Load video file
const loadVideo = (event) => {
  const file = event.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    video.value.src = url;
    video.value.onloadedmetadata = () => {
      videoWidth.value = video.value.videoWidth;
      videoHeight.value = video.value.videoHeight;
      video.value.playbackRate = playbackSpeed.value;
      video.value.volume = volume.value;
      drawFrame();
    };
  }
};

// Draw each frame with the selected effect
const drawFrame = () => {
  if (!video.value.paused && !video.value.ended) {
    const ctx = canvas.value.getContext("2d");
    ctx.drawImage(video.value, 0, 0, videoWidth.value, videoHeight.value);

    // Apply the selected effect
    const frame = ctx.getImageData(0, 0, videoWidth.value, videoHeight.value);
    applyEffect(frame);
    ctx.putImageData(frame, 0, 0);

    frameId.value = requestAnimationFrame(drawFrame);
  }
};

// Apply the selected effect to the frame data
const applyEffect = (frame) => {
  const data = frame.data;
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    switch (selectedEffect.value) {
      case "grayscale":
        const avg = (r + g + b) / 3;
        data[i] = data[i + 1] = data[i + 2] = avg;
        break;
      case "sepia":
        data[i] = r * 0.393 + g * 0.769 + b * 0.189;
        data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
        data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
        break;
      case "invert":
        data[i] = 255 - r;
        data[i + 1] = 255 - g;
        data[i + 2] = 255 - b;
        break;
      case "brightness":
        data[i] = r * 1.2;
        data[i + 1] = g * 1.2;
        data[i + 2] = b * 1.2;
        break;
      case "contrast":
        const contrast = 2.0;
        data[i] = (r - 128) * contrast + 128;
        data[i + 1] = (g - 128) * contrast + 128;
        data[i + 2] = (b - 128) * contrast + 128;
        break;
      case "saturate":
        data[i] = r * 1.2;
        data[i + 1] = g * 1.2;
        data[i + 2] = b * 1.2;
        break;
      case "blur":
        data[i] = (r + data[i + 4]) / 2;
        data[i + 1] = (g + data[i + 5]) / 2;
        data[i + 2] = (b + data[i + 6]) / 2;
        break;
      default:
        break;
    }
  }
};

// Boomerang functionality
const toggleBoomerang = () => {
  isBoomerang.value = !isBoomerang.value;
  if (isBoomerang.value) {
    direction = 1;
    video.value.currentTime = 0;
    video.value.play();
  } else {
    video.value.currentTime = 0;
  }
};

// Toggle repeat (loop) mode
const toggleLoop = () => {
  isLooping.value = !isLooping.value;
  if (video.value) {
    video.value.loop = isLooping.value;
  }
};

// Start and stop drawing frames
const startDrawing = () => {
  isPlaying.value = true;
  drawFrame();
};

const stopDrawing = () => {
  isPlaying.value = false;
  cancelAnimationFrame(frameId.value);
};

// Toggle play/pause
const togglePlay = () => {
  if (!video.value) return;
  isPlaying.value ? video.value.pause() : video.value.play();
};

// Watch for playback speed and volume changes
watch(playbackSpeed, (newSpeed) => {
  if (video.value) video.value.playbackRate = newSpeed * direction;
});

watch(volume, (newVolume) => {
  if (video.value) video.value.volume = newVolume;
});

// Cleanup on component unmount
onBeforeUnmount(() => {
  cancelAnimationFrame(frameId.value);
  if (video.value) video.value.pause();
});

onMounted(() => {
  if (video.value) {
    video.value.addEventListener("timeupdate", handleTimeUpdate);
  }
});
</script>

<style scoped>
.video-editor {
  display: flex;
  gap: 20px;
}

.video-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.video-frame {
  border: 8px solid #22b6e2;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.canvas-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
