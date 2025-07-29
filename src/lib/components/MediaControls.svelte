<script lang="ts">
  import { mediaPlayerActions, isPlaying, currentTrack } from '$lib/stores/mediaPlayer';

  function handlePlayPause() {
    console.log('Play/pause button clicked, current state:', $isPlaying);
    mediaPlayerActions.togglePlayPause();
  }

  function handleNext() {
    mediaPlayerActions.nextTrack();
  }

  function handlePrevious() {
    mediaPlayerActions.previousTrack();
  }
</script>

<div class="control-buttons">
  <button 
    class="control-btn"
    on:click={handlePrevious}
    disabled={!$currentTrack}
    title="Previous Track"
    aria-label="Previous Track"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
    </svg>
  </button>

  <button 
    class="control-btn play-pause"
    on:click={handlePlayPause}
    disabled={!$currentTrack}
    title={$isPlaying ? "Pause" : "Play"}
  >
    {#if $isPlaying}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
    {:else}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z"/>
      </svg>
    {/if}
  </button>

  <button 
    class="control-btn"
    on:click={handleNext}
    disabled={!$currentTrack}
    title="Next Track"
    aria-label="Next Track"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
    </svg>
  </button>
</div>

<style>
  .control-buttons {
    text-align: center;
    padding: 8px;
    background: #e0e0e0;
    border: 2px inset #e0e0e0;
    margin: 5px 0;
  }

  .control-btn {
    background: #c0c0c0;
    border: 2px outset #c0c0c0;
    width: 32px;
    height: 28px;
    margin: 0 2px;
    cursor: pointer;
    font-size: 10px;
  }

  .control-btn:active {
    border: 2px inset #c0c0c0;
  }

  .control-btn:disabled {
    background: #a0a0a0;
    color: #808080;
    cursor: default;
  }

  .play-pause {
    width: 40px;
    height: 32px;
    margin: 0 4px;
  }

  .control-btn svg {
    width: 14px;
    height: 14px;
  }

  .play-pause svg {
    width: 16px;
    height: 16px;
  }
</style>
