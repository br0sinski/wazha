<script lang="ts">
  import { playlist, currentTrack, mediaPlayerActions } from '$lib/stores/mediaPlayer';
  import { formatTime, truncateText } from '$lib/utils/helpers';
  import type { Track } from '$lib/stores/mediaPlayer';

  export let isVisible = true;

  function playTrack(track: Track) {
    mediaPlayerActions.setCurrentTrack(track);
    mediaPlayerActions.setPlaying(true);
  }

  function removeTrack(trackId: string, event: Event) {
    event.stopPropagation();
    mediaPlayerActions.removeFromPlaylist(trackId);
  }

  function clearPlaylist() {
    mediaPlayerActions.clearPlaylist();
  }
</script>

<div class="playlist-container" class:hidden={!isVisible}>
  <table class="playlist-header-table">
    <tbody>
      <tr>
        <td class="playlist-title-cell">
          <b>PLAYLIST</b>
        </td>
        <td class="playlist-info-cell">
          <span class="track-count">{$playlist.length} tracks</span>
          <button 
            class="clear-button"
            on:click={clearPlaylist}
            disabled={$playlist.length === 0}
            title="Clear Playlist"
          >
            CLEAR
          </button>
        </td>
      </tr>
    </tbody>
  </table>

  <div class="playlist-content">
    {#if $playlist.length === 0}
      <table class="empty-playlist-table">
        <tbody>
          <tr>
            <td align="center">
              <div class="empty-icon">🎵</div>
              <p>No tracks in playlist</p>
              <p class="empty-subtitle">Add some music to get started</p>
            </td>
          </tr>
        </tbody>
      </table>
    {:else}
      <table class="track-table">
        <thead>
          <tr class="track-headers">
            <th>#</th>
            <th>TITLE</th>
            <th>ARTIST</th>
            <th>TIME</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each $playlist as track, index (track.id)}
            <tr 
              class="track-item"
              class:current={$currentTrack?.id === track.id}
              on:click={() => playTrack(track)}
              on:keydown={(e) => e.key === 'Enter' && playTrack(track)}
              role="button"
              tabindex="0"
            >
              <td class="track-number">
                {#if $currentTrack?.id === track.id}
                  <span class="now-playing">♪</span>
                {:else}
                  {index + 1}
                {/if}
              </td>
            <td class="track-title" title={track.title}>
              {truncateText(track.title, 30)}
            </td>
            <td class="track-artist" title={track.artist}>
              {truncateText(track.artist, 25)}
            </td>
            <td class="track-duration">
              {formatTime(track.duration)}
            </td>
            <td class="track-actions">
              <button 
                class="remove-button"
                on:click={(e) => removeTrack(track.id, e)}
                title="Remove from playlist"
              >
                X
              </button>
            </td>
          </tr>
        {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>

<style>
  .playlist-container {
    background: #f0f0f0;
    border: 2px inset #c0c0c0;
    padding: 4px;
    font-family: "MS Sans Serif", sans-serif;
    font-size: 11px;
    height: 100%;
    min-height: 300px;
    max-height: 600px;
    overflow: hidden;
  }

  .playlist-container.hidden {
    display: none;
  }

  .playlist-header-table {
    width: 100%;
    border-collapse: collapse;
    background: #c0c0c0;
    border: 1px outset #c0c0c0;
    margin-bottom: 2px;
  }

  .playlist-title-cell {
    padding: 4px 8px;
    font-weight: bold;
    font-size: 12px;
    border-right: 1px inset #c0c0c0;
  }

  .playlist-info-cell {
    padding: 4px 8px;
    text-align: right;
    white-space: nowrap;
  }

  .track-count {
    margin-right: 8px;
    color: #000080;
    font-weight: bold;
  }

  .clear-button {
    background: #c0c0c0;
    border: 1px outset #c0c0c0;
    padding: 2px 8px;
    font-family: "MS Sans Serif", sans-serif;
    font-size: 11px;
    cursor: pointer;
  }

  .clear-button:active:not(:disabled) {
    border: 1px inset #c0c0c0;
  }

  .clear-button:disabled {
    color: #808080;
    cursor: default;
  }

  .playlist-content {
    height: calc(100% - 30px);
    overflow: auto;
    background: white;
    border: 1px inset #c0c0c0;
  }

  .empty-playlist-table {
    width: 100%;
    height: 100%;
    border-collapse: collapse;
  }

  .empty-playlist-table td {
    text-align: center;
    vertical-align: middle;
    padding: 40px;
    color: #808080;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .empty-subtitle {
    font-size: 10px;
    margin-top: 4px;
  }

  .track-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }

  .track-headers {
    background: #c0c0c0;
    border-bottom: 1px solid #808080;
  }

  .track-headers th {
    padding: 4px 8px;
    text-align: left;
    font-weight: bold;
    border-right: 1px solid #808080;
    font-size: 10px;
  }

  .track-headers th:last-child {
    border-right: none;
    width: 30px;
  }

  .track-item {
    border-bottom: 1px solid #e0e0e0;
    cursor: pointer;
  }

  .track-item:hover {
    background: #e0e0ff;
  }

  .track-item.current {
    background: #0000ff;
    color: white;
  }

  .track-item td {
    padding: 4px 8px;
    border-right: 1px solid #e0e0e0;
  }

  .track-item td:last-child {
    border-right: none;
  }

  .track-number {
    text-align: center;
    width: 30px;
    font-weight: bold;
  }

  .now-playing {
    color: #008000;
    font-weight: bold;
  }

  .track-item.current .now-playing {
    color: #00ff00;
  }

  .track-title {
    font-weight: bold;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .track-artist {
    color: #000080;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .track-item.current .track-artist {
    color: #add8e6;
  }

  .track-duration {
    text-align: right;
    font-family: "Courier New", monospace;
    width: 60px;
  }

  .track-actions {
    text-align: center;
    width: 30px;
  }

  .remove-button {
    background: #c0c0c0;
    border: 1px outset #c0c0c0;
    width: 18px;
    height: 18px;
    font-family: "MS Sans Serif", sans-serif;
    font-size: 10px;
    font-weight: bold;
    cursor: pointer;
    padding: 0;
  }

  .remove-button:active {
    border: 1px inset #c0c0c0;
  }

  .remove-button:hover {
    background: #ff8080;
  }
</style>
