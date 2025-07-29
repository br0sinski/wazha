<script lang="ts">
  import { onMount } from 'svelte';
  import { mediaPlayerActions, playerState, audioElement, currentTrack } from '$lib/stores/mediaPlayer';
  import { generateId } from '$lib/utils/helpers';
  import MediaControls from './MediaControls.svelte';
  import ProgressBar from './ProgressBar.svelte';
  import VolumeControl from './VolumeControl.svelte';
  import TrackInfo from './TrackInfo.svelte';
  import Playlist from './Playlist.svelte';
  import MenuBar from './MenuBar.svelte';
  import TitleBar from './TitleBar.svelte';
  import type { Track } from '$lib/stores/mediaPlayer';

  let audio: HTMLAudioElement;
  let showPlaylist = true;
  let fileInput: HTMLInputElement;
  let borderlessMode = false;
  let classicBorderless = false;
  let isTauri = false;

  onMount(async () => {
    audioElement.set(audio);

    // Check if we're running in Tauri
    try {
      // @ts-ignore
      isTauri = !!window.__TAURI__;
    } catch {
      isTauri = false;
    }

    if (isTauri) {
      const { WindowManager } = await import('$lib/utils/windowManager');
      const isDecorated = await WindowManager.isDecorated();
      borderlessMode = !isDecorated;
    } else {
      // In browser, get from localStorage
      borderlessMode = localStorage.getItem('borderless-mode') === 'true';
    }
    
    classicBorderless = localStorage.getItem('classic-borderless') === 'true';

    const handleLoadedMetadata = () => {
      if (audio.duration && $currentTrack) {
        mediaPlayerActions.updateTrackDuration($currentTrack.id, audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      mediaPlayerActions.setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      if ($playerState.repeat === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else if ($playerState.repeat === 'all' || $playerState.playlist.length > 1) {
        mediaPlayerActions.nextTrack();
      } else {
        mediaPlayerActions.setPlaying(false);
      }
    };

    const handlePlay = () => {
      mediaPlayerActions.setPlaying(true);
    };

    const handlePause = () => {
      mediaPlayerActions.setPlaying(false);
    };

    const handleLoadStart = () => {
      mediaPlayerActions.setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  });

  // Reactive statements for audio control
  $: if (audio && $currentTrack) {
    console.log('Setting audio source:', $currentTrack.filePath);
    if (audio.src !== $currentTrack.filePath) {
      audio.src = $currentTrack.filePath;
      audio.load();
      console.log('Audio loaded');
    }
  }

  $: if (audio && $playerState) {
    console.log('Player state changed:', $playerState.isPlaying, 'audio paused:', audio.paused, 'ready state:', audio.readyState);
    if ($playerState.isPlaying && audio.paused) {
      console.log('Attempting to play audio');
      if (audio.readyState >= 3) { // HAVE_ENOUGH_DATA
        audio.play().catch(error => {
          console.error('Audio play failed:', error);
        });
      } else {
        console.log('Audio not ready, waiting for canplay event');
        audio.addEventListener('canplay', () => {
          if ($playerState.isPlaying) {
            audio.play().catch(error => {
              console.error('Audio play failed after canplay:', error);
            });
          }
        }, { once: true });
      }
    } else if (!$playerState.isPlaying && !audio.paused) {
      console.log('Pausing audio');
      audio.pause();
    }
  }

  $: if (audio && $playerState) {
    audio.volume = $playerState.volume;
  }

  function handleSeek(event: CustomEvent<number>) {
    if (audio) {
      audio.currentTime = event.detail;
    }
  }

  function handleVolumeChange(event: CustomEvent<number>) {
    mediaPlayerActions.setVolume(event.detail);
  }

  function handleFileSelect() {
    fileInput.click();
  }

  function handleFilesSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    
    if (files) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('audio/') || 
            ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].some(ext => 
              file.name.toLowerCase().endsWith('.' + ext))) {
          
          const track: Track = {
            id: generateId(),
            title: file.name.replace(/\.[^/.]+$/, ''),
            artist: 'Unknown Artist',
            album: 'Unknown Album',
            duration: 0, 
            filePath: URL.createObjectURL(file)
          };
          
          mediaPlayerActions.addToPlaylist(track);
          
          if (!$currentTrack) {
            mediaPlayerActions.setCurrentTrack(track);
          }
        }
      });
    }
    
    target.value = '';
  }

  function togglePlaylist() {
    showPlaylist = !showPlaylist;
  }

  function toggleShuffle() {
    mediaPlayerActions.toggleShuffle();
  }

  function toggleRepeat() {
    mediaPlayerActions.toggleRepeat();
  }

  function handleBorderlessChange(event: CustomEvent<{borderless: boolean, classic: boolean}>) {
    borderlessMode = event.detail.borderless;
    classicBorderless = event.detail.classic;
  }

  function handleOpenFile() {
    handleFileSelect();
  }

  async function handleMinimize() {
    if (isTauri) {
      try {
        const { WindowManager } = await import('$lib/utils/windowManager');
        await WindowManager.minimize();
      } catch (error) {
        console.error('Failed to minimize window:', error);
      }
    }
  }

  async function handleClose() {
    if (isTauri) {
      try {
        const { WindowManager } = await import('$lib/utils/windowManager');
        await WindowManager.close();
      } catch (error) {
        console.error('Failed to close window:', error);
      }
    } else {
      window.close();
    }
  }
</script>

<audio bind:this={audio} preload="metadata"></audio>

<input
  bind:this={fileInput}
  type="file"
  accept="audio/*"
  multiple
  style="display: none"
  on:change={handleFilesSelected}
/>

<div class="media-player" class:borderless={borderlessMode} class:classic-borderless={classicBorderless}>
  <!-- Windows 95 style title bar (only shown in classic borderless mode) -->
  {#if classicBorderless}
    <TitleBar 
      on:minimize={handleMinimize}
      on:close={handleClose}
    />
  {/if}
  <MenuBar 
    on:borderlessChange={handleBorderlessChange}
    on:openFile={handleOpenFile}
  />

  <div class="top-bar">
    <div class="app-title">
      <h1>Media Player</h1>
    </div>
    
    <div class="file-controls">
      <button on:click={handleFileSelect}>
        Open Files
      </button>
      <button on:click={togglePlaylist}>
        {showPlaylist ? 'Hide Playlist' : 'Show Playlist'}
      </button>
    </div>
  </div>

  <div class="content-area">
    <div class="left-panel">
      <TrackInfo size="full" />
      
      <div class="controls-section">
        <MediaControls />
        
        <div class="additional-controls">
          <button 
            class="mode-button"
            class:active={$playerState.shuffle}
            on:click={toggleShuffle}
            title="Shuffle"
          >
            S
          </button>
          
          <button 
            class="mode-button"
            class:active={$playerState.repeat !== 'none'}
            on:click={toggleRepeat}
            title="Repeat: {$playerState.repeat}"
          >
            R
          </button>
        </div>
      </div>
      
      <ProgressBar on:seek={handleSeek} />
      <VolumeControl on:volumeChange={handleVolumeChange} />
      
    </div>

    {#if showPlaylist}
      <div class="right-panel">
        <Playlist isVisible={showPlaylist} />
      </div>
    {/if}
  </div>

  <div class="status-bar">
    <div class="status-info">
      <span>
        {#if $currentTrack}
          Playing: {$currentTrack.title}
        {:else}
          Ready
        {/if}
      </span>
    </div>
    
    <div class="version-info">
      <span>v1.0</span>
    </div>
  </div>
</div>

<style>
  .media-player {
    height: 100vh;
    background: #f0f0f0;
    color: #000;
    font-family: Arial, sans-serif;
    font-size: 12px;
    border: 2px outset #c0c0c0;
  }

  .media-player.borderless {
    border: none;
  }

  .media-player.classic-borderless {
    border: 1px solid #000080;
  }

  .top-bar {
    background: #e0e0e0;
    border: 2px outset #e0e0e0;
    padding: 8px;
    margin: 2px;
  }

  .app-title h1 {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
    color: #000080;
  }

  .file-controls {
    margin-top: 5px;
  }

  .file-controls button {
    background: #c0c0c0;
    border: 2px outset #c0c0c0;
    padding: 4px 8px;
    margin-right: 5px;
    font-size: 11px;
    cursor: pointer;
  }

  .file-controls button:active {
    border: 2px inset #c0c0c0;
  }

  .content-area {
    display: table;
    width: 100%;
    margin: 5px;
  }

  .left-panel {
    display: table-cell;
    width: 60%;
    vertical-align: top;
    padding-right: 10px;
  }

  .right-panel {
    display: table-cell;
    width: 40%;
    vertical-align: top;
    background: #ffffff;
    border: 2px inset #c0c0c0;
    padding: 5px;
  }

  .controls-section {
    background: #ffffff;
    border: 2px inset #c0c0c0;
    padding: 10px;
    margin: 5px 0;
  }

  .additional-controls {
    text-align: center;
    margin-top: 8px;
  }

  .mode-button {
    background: #c0c0c0;
    border: 2px outset #c0c0c0;
    width: 30px;
    height: 25px;
    margin: 0 3px;
    font-size: 10px;
    font-weight: bold;
    cursor: pointer;
  }

  .mode-button:active {
    border: 2px inset #c0c0c0;
  }

  .mode-button.active {
    background: #0000ff;
    color: #ffffff;
    border: 2px inset #0000ff;
  }

  .status-bar {
    background: #c0c0c0;
    border: 2px inset #c0c0c0;
    padding: 4px 8px;
    margin: 2px;
    font-size: 10px;
    display: table;
    width: calc(100% - 20px);
  }

  .status-info {
    display: table-cell;
    text-align: left;
  }

  .version-info {
    display: table-cell;
    text-align: right;
  }
</style>
