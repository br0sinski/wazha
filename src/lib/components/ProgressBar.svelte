<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { currentTime, currentTrack, audioElement } from '$lib/stores/mediaPlayer';
  import { formatTime } from '$lib/utils/helpers';

  const dispatch = createEventDispatcher();

  let progressBar: HTMLElement;
  let isDragging = false;
  let duration = 0;

  $: progress = duration > 0 ? ($currentTime / duration) * 100 : 0;

  onMount(() => {
    const audio = $audioElement;
    if (audio) {
      const updateDuration = () => {
        duration = audio.duration || 0;
      };
      
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('durationchange', updateDuration);
      
      return () => {
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('durationchange', updateDuration);
      };
    }
  });

  function handleProgressClick(event: MouseEvent) {
    if (!progressBar || duration === 0) return;
    
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    dispatch('seek', newTime);
  }

  function handleProgressDrag(event: MouseEvent) {
    if (!isDragging || !progressBar || duration === 0) return;
    
    const rect = progressBar.getBoundingClientRect();
    const dragX = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const percentage = dragX / rect.width;
    const newTime = percentage * duration;
    
    dispatch('seek', newTime);
  }

  function startDrag() {
    isDragging = true;
    document.addEventListener('mousemove', handleProgressDrag);
    document.addEventListener('mouseup', stopDrag);
  }

  function stopDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', handleProgressDrag);
    document.removeEventListener('mouseup', stopDrag);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const step = duration * 0.01; 
      const newTime = event.key === 'ArrowRight' 
        ? Math.min($currentTime + step, duration)
        : Math.max($currentTime - step, 0);
      dispatch('seek', newTime);
    }
  }
</script>

<div class="progress-container">
  <div class="time-display">
    <span class="current-time">{formatTime($currentTime)}</span>
  </div>
  
  <div 
    class="progress-bar"
    bind:this={progressBar}
    on:click={handleProgressClick}
    on:mousedown={startDrag}
    on:keydown={handleKeydown}
    role="slider"
    tabindex="0"
    aria-valuemin="0"
    aria-valuemax={duration}
    aria-valuenow={$currentTime}
    aria-label="Seek position"
  >
    <div class="progress-track">
      <div 
        class="progress-fill"
        style="width: {progress}%"
      ></div>
    </div>
  </div>
  
  <div class="time-display">
    <span class="duration">{formatTime(duration)}</span>
  </div>
</div>

<style>
  .progress-container {
    background: #e0e0e0;
    border: 2px inset #e0e0e0;
    padding: 6px;
    margin: 5px 0;
    font-size: 11px;
    display: table;
    width: calc(100% - 16px);
  }

  .time-display {
    display: table-cell;
    width: 50px;
    text-align: center;
    vertical-align: middle;
    padding: 0 5px;
    font-family: monospace;
  }

  .progress-bar {
    display: table-cell;
    width: auto;
    vertical-align: middle;
    cursor: pointer;
    padding: 0 8px;
  }

  .progress-track {
    width: 100%;
    height: 16px;
    background: #ffffff;
    border: 2px inset #c0c0c0;
    position: relative;
  }

  .progress-fill {
    height: 100%;
    background: #0000ff;
    border-right: 2px outset #0000ff;
  }
</style>
