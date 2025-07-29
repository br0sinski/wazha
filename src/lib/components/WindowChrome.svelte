<script lang="ts">
  export let title = "WAZHA Media Player";
  
  function minimize() {
    console.log("Minimize clicked");
  }
  
  function maximize() {
    console.log("Maximize clicked");
  }
  
  function close() {
    console.log("Close clicked");
  }
</script>

<div class="window-chrome">
  <div class="title-bar chrome-panel">
    <div class="title-bar-left">
      <div class="window-icon">🎵</div>
      <span class="window-title">{title}</span>
    </div>
    
    <div class="title-bar-controls">
      <button class="control-button minimize" on:click={minimize} title="Minimize">
        ⎯
      </button>
      <button class="control-button maximize" on:click={maximize} title="Maximize">
        ⬜
      </button>
      <button class="control-button close" on:click={close} title="Close">
        ✕
      </button>
    </div>
  </div>
  
  <div class="window-content">
    <slot />
  </div>
</div>

<style>
  .window-chrome {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--primary-bg);
    border: 2px solid var(--border-color);
  }

  .title-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: linear-gradient(135deg, #2a2a40 0%, #1a1a30 100%);
    border-bottom: 2px solid var(--border-color);
    user-select: none;
    cursor: move;
  }

  .title-bar-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .window-icon {
    font-size: 1.2em;
  }

  .window-title {
    font-family: 'Orbitron', monospace;
    font-weight: bold;
    color: var(--accent-color);
    font-size: 0.9em;
    letter-spacing: 1px;
  }

  .title-bar-controls {
    display: flex;
    gap: 4px;
  }

  .control-button {
    width: 28px;
    height: 20px;
    border: 1px solid var(--border-color);
    background: linear-gradient(135deg, #444 0%, #222 100%);
    color: var(--text-primary);
    font-size: 0.8em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    border-radius: 2px;
  }

  .control-button:hover {
    background: linear-gradient(135deg, #555 0%, #333 100%);
    transform: translateY(-1px);
  }

  .control-button:active {
    transform: translateY(0);
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.3);
  }

  .control-button.minimize:hover {
    background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%);
    color: #000;
  }

  .control-button.maximize:hover {
    background: linear-gradient(135deg, #32cd32 0%, #228b22 100%);
    color: #000;
  }

  .control-button.close:hover {
    background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
    color: white;
  }

  .window-content {
    flex: 1;
    overflow: hidden;
  }

  @media (max-width: 768px) {
    .window-chrome {
      border: none;
    }

    .title-bar {
      padding: 6px 8px;
    }

    .window-title {
      font-size: 0.8em;
    }

    .control-button {
      width: 24px;
      height: 18px;
      font-size: 0.7em;
    }
  }
</style>
