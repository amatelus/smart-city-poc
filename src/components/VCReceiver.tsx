'use client';

import { sha3_256 } from 'js-sha3';
import { useState } from 'react';
import { VCDtoSchema, VCMetadataSchema, VCPartSchema, type VCMetadata } from 'src/schemas/vc';
import { saveVCToStorage } from 'src/utils/vc';
import QRScanner from './QRScanner';
import styles from './VCReceiver.module.css';

export default function VCReceiver(): React.ReactElement {
  const [step, setStep] = useState<'initial' | 'scanning-meta' | 'scanning-parts' | 'completed'>(
    'initial',
  );
  const [vcMetadata, setVCMetadata] = useState<VCMetadata | null>(null);
  const [vcParts, setVCParts] = useState<Map<number, string>>(new Map());
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string>('');

  const startVCReceive = (): void => {
    setStep('scanning-meta');
    setVCMetadata(null);
    setVCParts(new Map());
    setProgress({ current: 0, total: 0 });
    setError('');
  };

  const handleMetadataScan = (result: string): void => {
    try {
      const metadata = VCMetadataSchema.safeParse(JSON.parse(result)).data;

      if (!metadata) {
        setError('無効なVC メタデータです。');
        return;
      }

      setVCMetadata(metadata);
      setProgress({ current: 0, total: metadata.totalParts });
      setStep('scanning-parts');
    } catch {
      setError('VC メタデータの解析に失敗しました。');
    }
  };

  const handlePartScan = (result: string): void => {
    try {
      const partData = VCPartSchema.safeParse(JSON.parse(result)).data;

      if (!partData) {
        setError('無効なVCパーツデータです。形式は [index, data] である必要があります。');
        return;
      }

      const [index, data] = partData;

      if (typeof index !== 'number' || typeof data !== 'string') {
        setError('無効なVCパーツデータ形式です。');
        return;
      }

      if (!vcMetadata || index < 0 || index >= vcMetadata.totalParts) {
        setError(
          `無効なパーツインデックスです。有効範囲: 0-${vcMetadata ? vcMetadata.totalParts - 1 : 'N/A'}`,
        );
        return;
      }

      if (vcParts.has(index)) {
        setError(`パーツ ${index} は既に受信済みです。`);
        return;
      }

      const newParts = new Map(vcParts);
      newParts.set(index, data);
      setVCParts(newParts);
      setProgress({ current: newParts.size, total: vcMetadata.totalParts });

      if (newParts.size === vcMetadata.totalParts) {
        reconstructVC(newParts, vcMetadata);
      }
    } catch {
      setError('VCパーツの解析に失敗しました。');
    }
  };

  const reconstructVC = (parts: Map<number, string>, metadata: VCMetadata): void => {
    try {
      const sortedParts: string[] = [];
      for (let i = 0; i < metadata.totalParts; i++) {
        const part = parts.get(i);
        if (!part) {
          setError(`パーツ ${i} が見つかりません。`);
          return;
        }
        sortedParts.push(part);
      }

      const reconstructedVCString = sortedParts.join('');
      const computedHash = sha3_256(reconstructedVCString);

      if (computedHash !== metadata.hash) {
        setError('VCの整合性チェックに失敗しました。ハッシュが一致しません。');
        return;
      }

      const vcData = VCDtoSchema.safeParse(JSON.parse(reconstructedVCString)).data;

      if (!vcData) {
        setError('再構築されたVCが無効です。');
        return;
      }

      saveVCToStorage({ title: '受信VC', data: vcData });
      setStep('completed');
      setError('');
    } catch {
      setError('VCの再構築に失敗しました。');
    }
  };

  const handleScanError = (error: string): void => {
    console.error('QRスキャンエラー:', error);
    setError('QRコードの読み取りに失敗しました。');
  };

  const closeScannerAndReset = (): void => {
    setStep('initial');
    setVCMetadata(null);
    setVCParts(new Map());
    setProgress({ current: 0, total: 0 });
    setError('');
  };

  const getMissingParts = (): number[] => {
    if (!vcMetadata) return [];
    const missing: number[] = [];
    for (let i = 0; i < vcMetadata.totalParts; i++) {
      if (!vcParts.has(i)) {
        missing.push(i);
      }
    }
    return missing;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>大容量VC受信</h2>

      <div className={styles.section}>
        <p className={styles.description}>
          自治体から大容量VCを分割QRコードで受け取ります。
          <br />
          1. VC全体のハッシュと分割数を含むメタデータQRをスキャン
          <br />
          2. 各VCパーツQRを順不同でスキャン
          <br />
          3. 全パーツが揃うと自動的にVCを再構築・検証
        </p>

        {step === 'initial' && (
          <button onClick={startVCReceive} className={styles.button}>
            VC受信を開始
          </button>
        )}

        {step === 'scanning-meta' && (
          <div className={styles.statusSection}>
            <h3>ステップ1: メタデータQRをスキャン</h3>
            <p>VC全体のハッシュ値と分割数情報を含むQRコードをスキャンしてください。</p>
          </div>
        )}

        {step === 'scanning-parts' && vcMetadata && (
          <div className={styles.statusSection}>
            <h3>ステップ2: VCパーツQRをスキャン</h3>
            <div className={styles.progressInfo}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              <div className={styles.progressText}>
                {progress.current} / {progress.total} パーツ受信完了
              </div>
            </div>

            {getMissingParts().length > 0 && (
              <div className={styles.missingParts}>
                <strong>未受信パーツ:</strong> {getMissingParts().join(', ')}
              </div>
            )}
          </div>
        )}

        {step === 'completed' && (
          <div className={styles.successSection}>
            <h3>✓ VC受信完了</h3>
            <p>VCが正常に受信・検証されました。VC管理画面で確認できます。</p>
            <button onClick={closeScannerAndReset} className={styles.button}>
              新しいVC受信を開始
            </button>
          </div>
        )}

        {error && (
          <div className={styles.errorSection}>
            <strong>エラー:</strong> {error}
            <button onClick={closeScannerAndReset} className={styles.retryButton}>
              最初からやり直し
            </button>
          </div>
        )}
      </div>

      <QRScanner
        isActive={step === 'scanning-meta' || step === 'scanning-parts'}
        onScan={step === 'scanning-meta' ? handleMetadataScan : handlePartScan}
        onError={handleScanError}
        onClose={closeScannerAndReset}
      />
    </div>
  );
}
