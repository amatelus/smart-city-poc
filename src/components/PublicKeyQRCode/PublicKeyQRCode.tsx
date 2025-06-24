'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import type { DtoId } from 'src/schemas/brandedId';
import type { DIDData } from 'src/schemas/did';
import { loadAllDIDsFromStorage } from 'src/utils/did';
import { formatDIDId } from 'src/utils/formatDIDId';
import styles from './PublicKeyQRCode.module.css';

export default function PublicKeyQRCode(): React.ReactElement {
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState<string>('');
  const [availableDIDs, setAvailableDIDs] = useState<DIDData[]>([]);
  const [selectedDID, setSelectedDID] = useState<DtoId['did'] | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const allDIDs = loadAllDIDsFromStorage();
    setAvailableDIDs(allDIDs);
  }, []);

  const generatePublicKeyQR = (): void => {
    setError('');

    if (!selectedDID) {
      setError('DIDを選択してください。');
      return;
    }

    const didData = availableDIDs.find((did) => did.doc.id === selectedDID);
    if (!didData) {
      setError('選択されたDIDが見つかりません。');
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

        <div className={styles.didSelection}>
          <label htmlFor="did-select" className={styles.selectLabel}>
            DIDを選択:
          </label>
          <select
            id="did-select"
            value={selectedDID || ''}
            onChange={(e) => {
              setSelectedDID((e.target.value as DtoId['did']) || null);
              setError('');
            }}
            className={styles.didSelect}
          >
            <option value="">-- DIDを選択してください --</option>
            {availableDIDs.map((did) => (
              <option key={did.doc.id} value={did.doc.id}>
                {formatDIDId(did.doc.id)}
              </option>
            ))}
          </select>
          {availableDIDs.length === 0 && (
            <p className={styles.noDIDs}>
              利用可能なDIDがありません。DID管理画面でDIDを作成してください。
            </p>
          )}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button onClick={generatePublicKeyQR} className={styles.button} disabled={!selectedDID}>
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
              <QRCodeSVG value={qrData} size={300} level="M" />
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
