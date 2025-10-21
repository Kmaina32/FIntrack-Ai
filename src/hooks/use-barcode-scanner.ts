'use client';
import { useEffect, useState } from 'react';

// Barcode scanners often type very quickly and end with an "Enter" key press.
const SCAN_TIMEOUT_MS = 100; // Time between keystrokes to be considered a scan
const MIN_BARCODE_LENGTH = 4; // Minimum length to be considered a barcode

export function useBarcodeScanner(onScan: (barcode: string) => void) {
  const [barcode, setBarcode] = useState('');
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore modifier keys, etc.
      if (e.key.length > 1 && e.key !== 'Enter') {
        return;
      }
      
      const currentTime = performance.now();

      if (e.key === 'Enter') {
        if (barcode.length >= MIN_BARCODE_LENGTH) {
          onScan(barcode);
        }
        setBarcode(''); // Reset after Enter
        return;
      }

      // If there's a long pause, it's probably not a scan, so reset.
      if (currentTime - lastKeystrokeTime > SCAN_TIMEOUT_MS) {
        setBarcode(e.key);
      } else {
        setBarcode((prevBarcode) => prevBarcode + e.key);
      }
      
      setLastKeystrokeTime(currentTime);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [barcode, lastKeystrokeTime, onScan]);
}
