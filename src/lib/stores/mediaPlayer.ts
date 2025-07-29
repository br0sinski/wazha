import { writable, derived } from 'svelte/store';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  filePath: string;
}

export interface PlayerState {
  currentTrack: Track | null;
  playlist: Track[];
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';
}

const initialState: PlayerState = {
  currentTrack: null,
  playlist: [],
  isPlaying: false,
  currentTime: 0,
  volume: 0.7,
  shuffle: false,
  repeat: 'none'
};

export const playerState = writable<PlayerState>(initialState);

export const audioElement = writable<HTMLAudioElement | null>(null);

export const currentTrack = derived(playerState, $state => $state.currentTrack);
export const playlist = derived(playerState, $state => $state.playlist);
export const isPlaying = derived(playerState, $state => $state.isPlaying);
export const currentTime = derived(playerState, $state => $state.currentTime);
export const volume = derived(playerState, $state => $state.volume);

export const mediaPlayerActions = {
  setCurrentTrack: (track: Track | null) => {
    playerState.update(state => ({
      ...state,
      currentTrack: track
    }));
  },

  addToPlaylist: (track: Track) => {
    playerState.update(state => ({
      ...state,
      playlist: [...state.playlist, track]
    }));
  },

  removeFromPlaylist: (trackId: string) => {
    playerState.update(state => ({
      ...state,
      playlist: state.playlist.filter(track => track.id !== trackId)
    }));
  },

  clearPlaylist: () => {
    playerState.update(state => ({
      ...state,
      playlist: []
    }));
  },

  togglePlayPause: () => {
    playerState.update(state => {
      console.log('Store: togglePlayPause called, current isPlaying:', state.isPlaying);
      const newState = {
        ...state,
        isPlaying: !state.isPlaying
      };
      console.log('Store: new isPlaying state:', newState.isPlaying);
      return newState;
    });
  },

  setPlaying: (playing: boolean) => {
    playerState.update(state => ({
      ...state,
      isPlaying: playing
    }));
  },

  setCurrentTime: (time: number) => {
    playerState.update(state => ({
      ...state,
      currentTime: time
    }));
  },

  setVolume: (vol: number) => {
    playerState.update(state => ({
      ...state,
      volume: Math.max(0, Math.min(1, vol))
    }));
  },

  updateTrackDuration: (trackId: string, duration: number) => {
    playerState.update(state => ({
      ...state,
      currentTrack: state.currentTrack?.id === trackId 
        ? { ...state.currentTrack, duration }
        : state.currentTrack,
      playlist: state.playlist.map(track => 
        track.id === trackId ? { ...track, duration } : track
      )
    }));
  },

  toggleShuffle: () => {
    playerState.update(state => ({
      ...state,
      shuffle: !state.shuffle
    }));
  },

  toggleRepeat: () => {
    playerState.update(state => {
      const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
      const currentIndex = modes.indexOf(state.repeat);
      const nextIndex = (currentIndex + 1) % modes.length;
      return {
        ...state,
        repeat: modes[nextIndex]
      };
    });
  },

  nextTrack: () => {
    playerState.update(state => {
      if (state.playlist.length === 0) return state;
      
      const currentIndex = state.currentTrack 
        ? state.playlist.findIndex(track => track.id === state.currentTrack!.id)
        : -1;
      
      let nextIndex: number;
      
      if (state.shuffle) {
        nextIndex = Math.floor(Math.random() * state.playlist.length);
      } else {
        nextIndex = (currentIndex + 1) % state.playlist.length;
      }
      
      return {
        ...state,
        currentTrack: state.playlist[nextIndex]
      };
    });
  },

  previousTrack: () => {
    playerState.update(state => {
      if (state.playlist.length === 0) return state;
      
      const currentIndex = state.currentTrack 
        ? state.playlist.findIndex(track => track.id === state.currentTrack!.id)
        : -1;
      
      let prevIndex: number;
      
      if (state.shuffle) {
        prevIndex = Math.floor(Math.random() * state.playlist.length);
      } else {
        prevIndex = currentIndex <= 0 ? state.playlist.length - 1 : currentIndex - 1;
      }
      
      return {
        ...state,
        currentTrack: state.playlist[prevIndex]
      };
    });
  }
};
