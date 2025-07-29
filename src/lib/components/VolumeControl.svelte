<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { volume } from '$lib/stores/mediaPlayer';

  const dispatch = createEventDispatcher();

  let volumeBar: HTMLElement;
  let isDragging = false;
  let isMuted = false;
  let previousVolume = $volume;

  $: volumePercentage = $volume * 100;

  function handleVolumeClick(event: MouseEvent) {
    if (!volumeBar) return;
    
    const rect = volumeBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(clickX / rect.width, 1));
    
    dispatch('volumeChange', percentage);
  }

  function handleVolumeDrag(event: MouseEvent) {
    if (!isDragging || !volumeBar) return;
    
    const rect = volumeBar.getBoundingClientRect();
    const dragX = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const percentage = dragX / rect.width;
    
    dispatch('volumeChange', percentage);
  }

  function startDrag() {
    isDragging = true;
    document.addEventListener('mousemove', handleVolumeDrag);
    document.addEventListener('mouseup', stopDrag);
  }

  function stopDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', handleVolumeDrag);
    document.removeEventListener('mouseup', stopDrag);
  }

  function toggleMute() {
    if (isMuted) {
      dispatch('volumeChange', previousVolume);
      isMuted = false;
    } else {
      previousVolume = $volume;
      dispatch('volumeChange', 0);
      isMuted = true;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const step = 0.05;
      const newVolume = event.key === 'ArrowRight' 
        ? Math.min($volume + step, 1)
        : Math.max($volume - step, 0);
      dispatch('volumeChange', newVolume);
    }
  }

  $: {
    if ($volume === 0 && !isMuted) {
      isMuted = true;
    } else if ($volume > 0 && isMuted) {
      isMuted = false;
    }
  }
</script>

<div class="volume-control">
  <button 
    class="volume-button"
    on:click={toggleMute}
    title={isMuted ? "Unmute" : "Mute"}
  >
    {#if isMuted || $volume === 0}
      M
    {:else}
      V
    {/if}
  </button>

  <div 
    class="volume-bar"
    bind:this={volumeBar}
    on:click={handleVolumeClick}
    on:mousedown={startDrag}
    on:keydown={handleKeydown}
    role="slider"
    tabindex="0"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow={Math.round(volumePercentage)}
    aria-label="Volume"
  >
    <div class="volume-track">
      <div 
        class="volume-fill"
        style="width: {volumePercentage}%"
      ></div>
    </div>
  </div>

  <div class="volume-display">
    <span class="volume-text">{Math.round(volumePercentage)}%</span>
  </div>
</div>

<style>
  .volume-control {
    background: #e0e0e0;
    border: 2px inset #e0e0e0;
    padding: 6px;
    margin: 5px 0;
    font-size: 11px;
    display: table;
    width: calc(100% - 16px);
  }

  .volume-button {
    display: table-cell;
    width: 30px;
    background: #c0c0c0;
    border: 2px outset #c0c0c0;
    cursor: pointer;
    text-align: center;
    vertical-align: middle;
    height: 20px;
    font-size: 10px;
    font-weight: bold;
  }

  .volume-button:active {
    border: 2px inset #c0c0c0;
  }

  .volume-bar {
    display: table-cell;
    width: auto;
    vertical-align: middle;
    cursor: pointer;
    padding: 0 8px;
  }

  .volume-track {
    width: 100%;
    height: 12px;
    background: #ffffff;
    border: 2px inset #c0c0c0;
    position: relative;
  }

  .volume-fill {
    height: 100%;
    background: #008000;
    border-right: 2px outset #008000;
  }

  .volume-display {
    display: table-cell;
    width: 35px;
    text-align: center;
    vertical-align: middle;
    font-family: monospace;
    padding-left: 5px;
  }
</style>
