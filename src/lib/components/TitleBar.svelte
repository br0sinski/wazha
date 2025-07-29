<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  
  const dispatch = createEventDispatcher();
  let isTauri = false;

  onMount(() => {
    try {
      // @ts-ignore
      isTauri = !!window.__TAURI__;
    } catch {
      isTauri = false;
    }
  });
  
  async function minimizeWindow() {
    if (isTauri) {
      try {
        const { WindowManager } = await import('$lib/utils/windowManager');
        const success = await WindowManager.minimize();
        if (success) {
          dispatch('minimize');
        }
      } catch (error) {
        console.error('Failed to minimize window:', error);
      }
    }
  }
  
  async function closeWindow() {
    if (isTauri) {
      try {
        const { WindowManager } = await import('$lib/utils/windowManager');
        const success = await WindowManager.close();
        if (success) {
          dispatch('close');
        }
      } catch (error) {
        console.error('Failed to close window:', error);
      }
    } else {
      window.close();
      dispatch('close');
    }
  }

  async function startDragging() {
    if (isTauri) {
      try {
        const { WindowManager } = await import('$lib/utils/windowManager');
        await WindowManager.startDragging();
      } catch (error) {
        console.error('Failed to start dragging:', error);
      }
    }
  }
</script>

<div class="title-bar" on:mousedown={startDragging}>
  <div class="title-bar-text">
    <span class="window-icon">🎵</span>
    Wazha Media Player
  </div>
  <div class="title-bar-controls">
    <button class="title-bar-control minimize" on:click={minimizeWindow} title="Minimize">
      <span class="minimize-icon">_</span>
    </button>
    <button class="title-bar-control close" on:click={closeWindow} title="Close">
      <span class="close-icon">×</span>
    </button>
  </div>
</div>

<style>
  .title-bar {
    background: linear-gradient(90deg, #000080 0%, #000040 100%);
    color: white;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px 4px;
    font-family: "MS Sans Serif", sans-serif;
    font-size: 11px;
    font-weight: bold;
    border-bottom: 1px solid #000040;
    cursor: move;
    user-select: none;
    -webkit-app-region: drag;
  }

  .title-bar-text {
    display: flex;
    align-items: center;
    gap: 4px;
    overflow: hidden;
    white-space: nowrap;
  }

  .window-icon {
    font-size: 12px;
  }

  .title-bar-controls {
    display: flex;
    gap: 1px;
    -webkit-app-region: no-drag;
  }

  .title-bar-control {
    background: #c0c0c0;
    border: 1px outset #c0c0c0;
    width: 16px;
    height: 14px;
    font-family: "MS Sans Serif", sans-serif;
    font-size: 8px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: black;
    padding: 0;
  }

  .title-bar-control:active {
    border: 1px inset #c0c0c0;
  }

  .title-bar-control:hover {
    background: #d0d0d0;
  }

  .minimize-icon {
    margin-bottom: 2px;
  }

  .close-icon {
    font-size: 10px;
  }
</style>
