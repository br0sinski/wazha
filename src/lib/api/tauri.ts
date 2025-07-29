import { invoke } from '@tauri-apps/api/core';

export interface AudioMetadata {
  title: string;
  artist: string;
  album: string;
  duration: number;
  file_path: string;
}

export async function getAudioMetadata(filePath: string): Promise<AudioMetadata> {
  try {
    return await invoke('get_audio_metadata', { filePath });
  } catch (error) {
    console.error('Failed to get audio metadata:', error);
    throw error;
  }
}

export async function openFileDialog(): Promise<string | null> {
  try {
    return await invoke('open_file_dialog');
  } catch (error) {
    console.error('Failed to open file dialog:', error);
    return null;
  }
}
