<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let activeMenu: string | null = null;
  let showSettings = false;
  let borderlessMode = false;
  let classicBorderless = false;
  let isTauri = false;

  onMount(async () => {
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
      // In browser -> get from localStorage
      borderlessMode = localStorage.getItem('borderless-mode') === 'true';
    }
    
    classicBorderless = localStorage.getItem('classic-borderless') === 'true';
  });

  function toggleMenu(menu: string) {
    activeMenu = activeMenu === menu ? null : menu;
  }

  function closeMenus() {
    activeMenu = null;
  }

  function openSettings() {
    showSettings = true;
    closeMenus();
  }

  function closeSettings() {
    showSettings = false;
  }

  async function toggleBorderless() {
    borderlessMode = !borderlessMode;
    
    if (classicBorderless && !borderlessMode) {
      classicBorderless = false;
      localStorage.setItem('classic-borderless', 'false');
    }

    if (isTauri) {
      try {
        const { WindowManager } = await import('$lib/utils/windowManager');
        const success = await WindowManager.setBorderless(borderlessMode);
        if (success) {
          WindowManager.setDecoratedState(!borderlessMode);
          localStorage.setItem('borderless-mode', borderlessMode.toString());
        } else {
          borderlessMode = !borderlessMode;
          return;
        }
      } catch (error) {
        console.error('Failed to toggle borderless mode:', error);
        borderlessMode = !borderlessMode;
        return;
      }
    } else {
      localStorage.setItem('borderless-mode', borderlessMode.toString());
    }
    
    dispatch('borderlessChange', { borderless: borderlessMode, classic: classicBorderless });
  }

  async function toggleClassicBorderless() {
    classicBorderless = !classicBorderless;
    
    if (classicBorderless) {
      borderlessMode = true;
      
      if (isTauri) {
        try {
          const { WindowManager } = await import('$lib/utils/windowManager');
          const success = await WindowManager.setBorderless(true);
          if (success) {
            WindowManager.setDecoratedState(false);
            localStorage.setItem('borderless-mode', 'true');
            localStorage.setItem('classic-borderless', 'true');
          } else {
            classicBorderless = false;
            borderlessMode = false;
            localStorage.setItem('classic-borderless', 'false');
            return;
          }
        } catch (error) {
          console.error('Failed to toggle classic borderless mode:', error);
          classicBorderless = false;
          borderlessMode = false;
          localStorage.setItem('classic-borderless', 'false');
          return;
        }
      } else {
        localStorage.setItem('borderless-mode', 'true');
        localStorage.setItem('classic-borderless', 'true');
      }
    } else {
      localStorage.setItem('classic-borderless', 'false');
    }
    
    dispatch('borderlessChange', { borderless: borderlessMode, classic: classicBorderless });
  }

  function openFile() {
    dispatch('openFile');
    closeMenus();
  }

  function showAbout() {
    alert('Wazha Media Player v1.0\nA retro-styled media player inspired by the 2000s\n\nRunning in: ' + (isTauri ? 'Tauri App' : 'Browser'));
    closeMenus();
  }

  async function exitApp() {
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
    closeMenus();
  }
</script>

<div class="menu-bar">
  <div class="menu-items">
    <div class="menu-item" class:active={activeMenu === 'file'}>
      <button class="menu-button" on:click={() => toggleMenu('file')}>File</button>
      {#if activeMenu === 'file'}
        <div class="dropdown-menu">
          <div class="menu-option" on:click={openFile}>Open File...</div>
          <div class="menu-separator"></div>
          <div class="menu-option" on:click={exitApp}>Exit</div>
        </div>
      {/if}
    </div>

    <div class="menu-item" class:active={activeMenu === 'settings'}>
      <button class="menu-button" on:click={() => toggleMenu('settings')}>Settings</button>
      {#if activeMenu === 'settings'}
        <div class="dropdown-menu">
          <div class="menu-option" on:click={openSettings}>Preferences...</div>
        </div>
      {/if}
    </div>

    <div class="menu-item" class:active={activeMenu === 'help'}>
      <button class="menu-button" on:click={() => toggleMenu('help')}>Help</button>
      {#if activeMenu === 'help'}
        <div class="dropdown-menu">
          <div class="menu-option" on:click={showAbout}>About Wazha</div>
        </div>
      {/if}
    </div>
  </div>
</div>

{#if showSettings}
  <div class="settings-overlay" on:click={closeSettings}>
    <div class="settings-dialog" on:click|stopPropagation>
      <div class="settings-title-bar">
        <span class="settings-title">Preferences</span>
        <button class="close-button" on:click={closeSettings}>×</button>
      </div>
      
      <div class="settings-content">
        <table class="settings-table">
          <tbody>
            <tr>
              <td colspan="2" class="settings-section">
                <b>Display Options</b>
              </td>
            </tr>
            <tr>
              <td class="setting-label">
                <label>
                  <input type="checkbox" bind:checked={borderlessMode} on:change={toggleBorderless} />
                  Borderless Mode
                </label>
              </td>
              <td class="setting-description">
                Remove window borders for a cleaner look
              </td>
            </tr>
            <tr>
              <td class="setting-label">
                <label>
                  <input type="checkbox" bind:checked={classicBorderless} on:change={toggleClassicBorderless} />
                  Classic Borderless (Windows 95 Style)
                </label>
              </td>
              <td class="setting-description">
                Use retro Windows 95 title bar instead of OS default
              </td>
            </tr>
          </tbody>
        </table>

        <div class="settings-buttons">
          <button class="ok-button" on:click={closeSettings}>OK</button>
          <button class="cancel-button" on:click={closeSettings}>Cancel</button>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if activeMenu}
  <div class="menu-overlay" on:click={closeMenus}></div>
{/if}

<style>
  .menu-bar {
    background: #c0c0c0;
    border-bottom: 1px solid #808080;
    font-family: "MS Sans Serif", sans-serif;
    font-size: 11px;
    height: 20px;
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1000;
  }

  .menu-items {
    display: flex;
  }

  .menu-item {
    position: relative;
  }

  .menu-button {
    background: transparent;
    border: none;
    padding: 4px 8px;
    font-family: "MS Sans Serif", sans-serif;
    font-size: 11px;
    cursor: pointer;
    color: black;
  }

  .menu-item.active .menu-button,
  .menu-button:hover {
    background: #0000ff;
    color: white;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background: #c0c0c0;
    border: 1px outset #c0c0c0;
    min-width: 120px;
    z-index: 1001;
    box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  }

  .menu-option {
    padding: 4px 12px;
    cursor: pointer;
    font-size: 11px;
  }

  .menu-option:hover {
    background: #0000ff;
    color: white;
  }

  .menu-separator {
    height: 1px;
    background: #808080;
    margin: 2px 0;
  }

  .menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
  }

  .settings-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }

  .settings-dialog {
    background: #c0c0c0;
    border: 2px outset #c0c0c0;
    width: 400px;
    font-family: "MS Sans Serif", sans-serif;
    font-size: 11px;
  }

  .settings-title-bar {
    background: #000080;
    color: white;
    padding: 2px 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
  }

  .settings-title {
    font-size: 11px;
  }

  .close-button {
    background: #c0c0c0;
    border: 1px outset #c0c0c0;
    width: 16px;
    height: 14px;
    font-size: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-button:active {
    border: 1px inset #c0c0c0;
  }

  .settings-content {
    padding: 12px;
  }

  .settings-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12px;
  }

  .settings-section {
    background: #e0e0e0;
    padding: 4px 8px;
    border: 1px inset #c0c0c0;
    font-weight: bold;
  }

  .setting-label {
    padding: 6px 8px;
    vertical-align: top;
    width: 50%;
  }

  .setting-description {
    padding: 6px 8px;
    color: #000080;
    font-size: 10px;
    vertical-align: top;
  }

  .setting-label input[type="checkbox"] {
    margin-right: 4px;
  }

  .settings-buttons {
    text-align: right;
  }

  .ok-button, .cancel-button {
    background: #c0c0c0;
    border: 1px outset #c0c0c0;
    padding: 4px 12px;
    margin-left: 4px;
    font-family: "MS Sans Serif", sans-serif;
    font-size: 11px;
    cursor: pointer;
  }

  .ok-button:active, .cancel-button:active {
    border: 1px inset #c0c0c0;
  }
</style>
