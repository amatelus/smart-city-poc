'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { loadDIDFromStorage } from 'src/utils/did';
import styles from './PublicKeyQRCode.module.css';

export default function PublicKeyQRCode(): React.ReactElement {
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState<string>('');

  const generatePublicKeyQR = (): void => {
    const didData = loadDIDFromStorage();
    if (!didData) {
      alert('DIDが生成されていません。まずDIDを生成してください。');
      return;
    }

    const version = 1;
    const publicKey = didData.publicKey;
    const qrPayload = [version, publicKey];

    const qrString = JSON.stringify(qrPayload);
    setQrData(qrString);
    setShowQR(true);
  };

  const closeQR = (): void => {
    setShowQR(false);
    setQrData('');
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>本人確認用QRコード</h2>

      <div className={styles.section}>
        <p className={styles.description}>
          自治体窓口での本人確認時に使用するQRコードを生成します。
          このQRコードには、バージョン番号と公開鍵が含まれます。
        </p>

        <button onClick={generatePublicKeyQR} className={styles.button}>
          本人確認用QRコードを表示
        </button>
      </div>

      {showQR && (
        <div className={styles.qrModal}>
          <div className={styles.qrContainer}>
            <div className={styles.qrHeader}>
              <h3>本人確認用QRコード</h3>
              <button onClick={closeQR} className={styles.closeButton}>
                ✕
              </button>
            </div>

            <div className={styles.qrCodeWrapper}>
              <QRCodeSVG value={qrData} size={300} level="M" includeMargin={true} />
            </div>

            <div className={styles.qrInfo}>
              <p>
                <strong>データ構造:</strong> [バージョン, 公開鍵]
              </p>
              <p>
                <strong>使用方法:</strong>{' '}
                自治体の担当者にこのQRコードをスキャンしてもらってください
              </p>
              <div className={styles.qrDataPreview}>
                <strong>QRコードデータ:</strong>
                <pre>{qrData}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
