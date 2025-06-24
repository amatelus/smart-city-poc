'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import type { DtoId } from 'src/schemas/brandedId';
import type { DIDData } from 'src/schemas/did';
import { condition } from 'src/utils/condition';
import { loadAllDIDsFromStorage, signMessage } from 'src/utils/did';
import { formatDIDId } from 'src/utils/formatDIDId';
import styles from './PrivateKeyProof.module.css';
import QRScanner from './QRScanner';

export default function PrivateKeyProof(): React.ReactElement {
  const [step, setStep] = useState<'initial' | 'scanning' | 'nonce-received' | 'signature-ready'>(
    'initial',
  );
  const [nonce, setNonce] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [signatureQR, setSignatureQR] = useState<string>('');
  const [availableDIDs, setAvailableDIDs] = useState<DIDData[]>([]);
  const [selectedDID, setSelectedDID] = useState<DtoId['did'] | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const allDIDs = loadAllDIDsFromStorage();
    setAvailableDIDs(allDIDs);
  }, []);

  const startProofProcess = (): void => {
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

    setStep('scanning');
  };

  const handleNonceScan = (result: string): void => {
    try {
      setNonce(result);
      setStep('nonce-received');

      const didData = availableDIDs.find((did) => did.doc.id === selectedDID);
      if (!didData) {
        setError('選択されたDIDが見つかりません。');
        return;
      }

      const signatureData = signMessage(result, didData.privateKey);
      setSignature(signatureData);

      const qrPayload = { nonce: result, signature: signatureData, publicKey: didData.publicKey };

      setSignatureQR(JSON.stringify(qrPayload));
      setStep('signature-ready');
    } catch (error) {
      console.error('署名生成エラー:', error);
      setError('署名の生成に失敗しました。');
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
    setError('');
  };

  const closeSignatureQR = (): void => {
    setStep('initial');
    setNonce('');
    setSignature('');
    setSignatureQR('');
    setError('');
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>秘密鍵所有権確認</h2>

      {
        condition(step)
          .case(['initial', 'nonce-received'], (s) => (
            <div className={styles.section}>
              <p className={styles.description}>
                2段階QRスキャンによる本人認証を行います。
                <br />
                1. 自治体のNonce QRコードをスキャン
                <br />
                2. 署名済みQRコードを提示
              </p>
              {
                condition(s)
                  .case('initial', () => (
                    <>
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

                      <button
                        onClick={startProofProcess}
                        className={styles.button}
                        disabled={!selectedDID}
                      >
                        本人認証を開始
                      </button>
                    </>
                  ))
                  .case('nonce-received', () => (
                    <div className={styles.nonceSection}>
                      <h3>Nonce受信完了</h3>
                      <div className={styles.nonceValue}>
                        <strong>受信したNonce:</strong>
                        <div className={styles.valueDisplay}>{nonce}</div>
                      </div>
                      <p>署名を生成中...</p>
                    </div>
                  )).done
              }
            </div>
          ))
          .case('scanning', () => (
            <QRScanner
              onScan={handleNonceScan}
              onError={handleScanError}
              onClose={closeScannerAndReset}
            />
          ))
          .case('signature-ready', () => (
            <div className={styles.signatureModal}>
              <div className={styles.signatureContainer}>
                <div className={styles.signatureHeader}>
                  <h3>署名済みQRコード</h3>
                  <button onClick={closeSignatureQR} className={styles.closeButton}>
                    ✕
                  </button>
                </div>
                <div className={styles.qrCodeWrapper}>
                  <QRCodeSVG value={signatureQR} size={300} level="M" />
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
          )).done
      }
    </div>
  );
}
