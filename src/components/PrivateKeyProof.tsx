'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { loadDIDFromStorage, signMessage } from 'src/utils/did';
import styles from './PrivateKeyProof.module.css';
import QRScanner from './QRScanner';

export default function PrivateKeyProof(): React.ReactElement {
  const [step, setStep] = useState<'initial' | 'scanning' | 'nonce-received' | 'signature-ready'>(
    'initial',
  );
  const [nonce, setNonce] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [signatureQR, setSignatureQR] = useState<string>('');

  const startProofProcess = (): void => {
    const didData = loadDIDFromStorage();
    if (!didData) {
      alert('DIDが生成されていません。まずDIDを生成してください。');
      return;
    }
    setStep('scanning');
  };

  const handleNonceScan = (result: string): void => {
    try {
      setNonce(result);
      setStep('nonce-received');

      const didData = loadDIDFromStorage();
      if (!didData) {
        alert('DIDが生成されていません。');
        return;
      }

      const signatureData = signMessage(result, didData.privateKey);
      setSignature(signatureData);

      const qrPayload = { nonce: result, signature: signatureData, publicKey: didData.publicKey };

      setSignatureQR(JSON.stringify(qrPayload));
      setStep('signature-ready');
    } catch (error) {
      console.error('署名生成エラー:', error);
      alert('署名の生成に失敗しました。');
    }
  };

  const handleScanError = (error: string): void => {
    console.error('QRスキャンエラー:', error);
    alert('QRコードの読み取りに失敗しました。');
  };

  const closeScannerAndReset = (): void => {
    setStep('initial');
    setNonce('');
    setSignature('');
    setSignatureQR('');
  };

  const closeSignatureQR = (): void => {
    setStep('initial');
    setNonce('');
    setSignature('');
    setSignatureQR('');
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>秘密鍵所有権確認</h2>

      <div className={styles.section}>
        <p className={styles.description}>
          2段階QRスキャンによる本人認証を行います。
          <br />
          1. 自治体のNonce QRコードをスキャン
          <br />
          2. 署名済みQRコードを提示
        </p>

        {step === 'initial' && (
          <button onClick={startProofProcess} className={styles.button}>
            本人認証を開始
          </button>
        )}

        {step === 'nonce-received' && (
          <div className={styles.nonceSection}>
            <h3>Nonce受信完了</h3>
            <div className={styles.nonceValue}>
              <strong>受信したNonce:</strong>
              <div className={styles.valueDisplay}>{nonce}</div>
            </div>
            <p>署名を生成中...</p>
          </div>
        )}
      </div>

      <QRScanner
        isActive={step === 'scanning'}
        onScan={handleNonceScan}
        onError={handleScanError}
        onClose={closeScannerAndReset}
      />

      {step === 'signature-ready' && (
        <div className={styles.signatureModal}>
          <div className={styles.signatureContainer}>
            <div className={styles.signatureHeader}>
              <h3>署名済みQRコード</h3>
              <button onClick={closeSignatureQR} className={styles.closeButton}>
                ✕
              </button>
            </div>

            <div className={styles.qrCodeWrapper}>
              <QRCodeSVG value={signatureQR} size={300} level="M" includeMargin={true} />
            </div>

            <div className={styles.signatureInfo}>
              <div className={styles.infoItem}>
                <strong>Nonce:</strong>
                <div className={styles.valueDisplay}>{nonce}</div>
              </div>
              <div className={styles.infoItem}>
                <strong>署名:</strong>
                <div className={styles.valueDisplay}>{signature}</div>
              </div>
              <p className={styles.instruction}>
                自治体の担当者にこのQRコードをスキャンしてもらい、署名を検証してもらってください。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
