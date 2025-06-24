'use client';

import { useState } from 'react';
import type { VCMetadata } from 'src/schemas/vc';
import { condition } from 'src/utils/condition';
import QRScanner from './QRScanner';
import VCErrorDisplay from './VCErrorDisplay';
import styles from './VCReceiver.module.css';
import { useVCScannerLogic } from './VCScannerLogic';
import VCScanningSteps, { VCProgressDisplay } from './VCScanningSteps';

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

  const closeScannerAndReset = (): void => {
    setStep('initial');
    setVCMetadata(null);
    setVCParts(new Map());
    setProgress({ current: 0, total: 0 });
    setError('');
  };

  const { handleMetadataScan, handlePartScan, getMissingParts } = useVCScannerLogic({
    vcMetadata,
    vcParts,
    onMetadataSet: (metadata) => {
      setVCMetadata(metadata);
      setStep('scanning-parts');
    },
    onPartAdded: setVCParts,
    onProgressUpdate: (current, total) => setProgress({ current, total }),
    onError: setError,
    onCompleted: () => {
      setStep('completed');
      setError('');
    },
  });

  const handleScanError = (error: string): void => {
    console.error('QRスキャンエラー:', error);
    setError('QRコードの読み取りに失敗しました。');
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

        <VCScanningSteps
          step={step}
          progress={progress}
          onStartReceive={startVCReceive}
          onResetAndRestart={closeScannerAndReset}
        />

        {step === 'scanning-parts' && (
          <VCProgressDisplay progress={progress} missingParts={getMissingParts()} />
        )}

        {error && <VCErrorDisplay error={error} onReset={closeScannerAndReset} />}
      </div>

      {condition(step)
        .case(['scanning-meta', 'scanning-parts'], (s) => (
          <QRScanner
            onScan={s === 'scanning-meta' ? handleMetadataScan : handlePartScan}
            onError={handleScanError}
            onClose={closeScannerAndReset}
          />
        ))
        .else(() => null)}
    </div>
  );
}
