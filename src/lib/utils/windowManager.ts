import { getCurrentWindow } from '@tauri-apps/api/window';

export class WindowManager {
  private static window = getCurrentWindow();

  static async setBorderless(borderless: boolean) {
    try {
      await this.window.setDecorations(!borderless);
      return true;
    } catch (error) {
      console.error('Failed to set borderless mode:', error);
      return false;
    }
  }

  static async minimize() {
    try {
      await this.window.minimize();
      return true;
    } catch (error) {
      console.error('Failed to minimize window:', error);
      return false;
    }
  }

  static async close() {
    try {
      await this.window.close();
      return true;
    } catch (error) {
      console.error('Failed to close window:', error);
      return false;
    }
  }

  static async startDragging() {
    try {
      await this.window.startDragging();
      return true;
    } catch (error) {
      console.error('Failed to start dragging:', error);
      return false;
    }
  }

  static async setTitle(title: string) {
    try {
      await this.window.setTitle(title);
      return true;
    } catch (error) {
      console.error('Failed to set title:', error);
      return false;
    }
  }

  static async isDecorated() {
    try {
      // This is a workaround since there's no direct way to check decorations
      // We'll store the state in localStorage
      return localStorage.getItem('window-decorated') !== 'false';
    } catch (error) {
      console.error('Failed to check decoration state:', error);
      return true;
    }
  }

  static setDecoratedState(decorated: boolean) {
    localStorage.setItem('window-decorated', decorated.toString());
  }
}
