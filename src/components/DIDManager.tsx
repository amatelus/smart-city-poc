'use client';

import { useEffect, useState } from 'react';
import type { DIDData } from 'src/schemas/did';
import { generateDID, loadDIDFromStorage, saveDIDToStorage } from 'src/utils/did';
import styles from './DIDManager.module.css';

export default function DIDManager(): React.ReactElement {
  const [didData, setDidData] = useState<DIDData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = loadDIDFromStorage();
    if (stored) {
      setDidData(stored);
    }
  }, []);

  function handleGenerateDID(): void {
    setLoading(true);
    try {
      const newDID = generateDID();
      saveDIDToStorage(newDID);
      setDidData(newDID);
    } catch (error) {
      console.error('DID生成エラー:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleClearDID(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('amatelus-did');
    }
    setDidData(null);
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>DID管理</h2>

      {!didData ? (
        <div className={styles.noDidSection}>
          <p>DIDが生成されていません</p>
          <button onClick={handleGenerateDID} disabled={loading} className={styles.button}>
            {loading ? '生成中...' : '新しいDIDを生成'}
          </button>
        </div>
      ) : (
        <div className={styles.didSection}>
          <div className={styles.didInfo}>
            <h3>DID情報</h3>
            <div className={styles.field}>
              <label>DID:</label>
              <div className={styles.value}>{didData.doc.id}</div>
            </div>
            <div className={styles.field}>
              <label>公開鍵:</label>
              <div className={styles.value}>{didData.publicKey}</div>
            </div>
            <div className={styles.field}>
              <label>DIDドキュメント:</label>
              <pre className={styles.jsonValue}>{JSON.stringify(didData.doc, null, 2)}</pre>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button onClick={handleGenerateDID} disabled={loading} className={styles.button}>
              {loading ? '生成中...' : '新しいDIDを再生成'}
            </button>
            <button onClick={handleClearDID} className={`${styles.button} ${styles.dangerButton}`}>
              DIDを削除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
