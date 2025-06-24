'use client';

import { Html5QrcodeScanner } from 'html5-qrcode';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './QRScanner.module.css';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  isActive: boolean;
  onClose: () => void;
}

export default function QRScanner({
  onScan,
  onError,
  isActive,
  onClose,
}: QRScannerProps): React.ReactNode {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const startScanner = useCallback(() => {
    if (scannerRef.current) return;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    scannerRef.current = new Html5QrcodeScanner('qr-reader', config, false);

    scannerRef.current.render(
      (decodedText: string) => {
        onScan(decodedText);
        stopScanner();
      },
      (error: string) => {
        if (onError && !error.includes('No QR code found')) {
          onError(error);
        }
      },
    );

    setIsScanning(true);
  }, [onScan, onError]);

  useEffect(() => {
    if (isActive && !isScanning) {
      startScanner();
    } else if (!isActive && isScanning) {
      stopScanner();
    }

    return (): void => {
      if (scannerRef.current) {
        stopScanner();
      }
    };
  }, [isActive, isScanning, startScanner]);

  const stopScanner = (): void => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  if (!isActive) return null;

  return (
    <div className={styles.scannerModal}>
      <div className={styles.scannerContainer}>
        <div className={styles.scannerHeader}>
          <h3>QRコードをスキャン</h3>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className={styles.closeButton}
          >
            ✕
          </button>
        </div>

        <div className={styles.scannerWrapper}>
          <div id="qr-reader" className={styles.qrReader} />
        </div>

        <div className={styles.scannerInfo}>
          <p>カメラをQRコードに向けてください</p>
        </div>
      </div>
    </div>
  );
}
