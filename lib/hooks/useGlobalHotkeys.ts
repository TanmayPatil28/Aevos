import { useEffect } from 'react';

type HotkeyCallback = () => void;

export function useGlobalHotkeys(key: string, callback: HotkeyCallback, metaOrCtrl: boolean = false) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (metaOrCtrl) {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === key.toLowerCase()) {
          e.preventDefault();
          callback();
        }
      } else {
        if (e.key === key) {
          callback();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, metaOrCtrl]);
}
