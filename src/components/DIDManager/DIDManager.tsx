'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DIDData } from 'src/schemas/did';
import {
  generateDID,
  loadAllDIDsFromStorage,
  removeDIDFromStorage,
  saveDIDToStorage,
} from 'src/utils/did';
import { formatDIDId } from 'src/utils/formatDIDId';
import styles from './DIDManager.module.css';

export default function DIDManager(): React.ReactElement {
  const [allDIDs, setAllDIDs] = useState<DIDData[]>([]);
  const [selectedDID, setSelectedDID] = useState<DIDData | null>(null);

  const handleGenerateDID = useCallback(() => {
    const newDID = generateDID();
    saveDIDToStorage(newDID);
    setAllDIDs((prev) => [...prev, newDID]);

    return newDID;
  }, []);

  useEffect(() => {
    const dids = loadAllDIDsFromStorage();
    setAllDIDs(dids);

    if (dids.length === 0) {
      const newDID = generateDID();
      saveDIDToStorage(newDID);
      setAllDIDs([newDID]);
    }
  }, []);

  function handleRemoveDID(did: DIDData): void {
    if (!confirm(`DID ${did.doc.id.slice(-8)} を削除しますか？`)) return;

    removeDIDFromStorage(did.doc.id);
    const updatedDIDs = allDIDs.filter((d) => d.doc.id !== did.doc.id);
    setAllDIDs(updatedDIDs);

    if (selectedDID?.doc.id === did.doc.id) {
      setSelectedDID(null);
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>DID管理</h2>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>DID一覧 ({allDIDs.length}件)</h3>
          <button onClick={handleGenerateDID} className={styles.button}>
            新しいDIDを生成
          </button>
        </div>

        {allDIDs.length === 0 ? (
          <div className={styles.emptyState}>
            <p>DIDが生成されていません</p>
          </div>
        ) : (
          <div className={styles.didList}>
            {allDIDs.map((did) => (
              <div key={did.doc.id} className={styles.didItem} onClick={() => setSelectedDID(did)}>
                <div className={styles.didItemHeader}>
                  <span className={styles.didId}>{formatDIDId(did.doc.id)}</span>
                </div>
                <div className={styles.didItemActions}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveDID(did);
                    }}
                    className={styles.removeButton}
                    disabled={allDIDs.length === 1}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedDID && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>DID詳細: {formatDIDId(selectedDID.doc.id)}</h3>
              <button onClick={() => setSelectedDID(null)} className={styles.closeButton}>
                ✕
              </button>
            </div>

            <div className={styles.didDetail}>
              <div className={styles.field}>
                <label>DID:</label>
                <div className={styles.value}>{selectedDID.doc.id}</div>
              </div>
              <div className={styles.field}>
                <label>公開鍵:</label>
                <div className={styles.value}>{selectedDID.publicKey}</div>
              </div>
              <div className={styles.field}>
                <label>DIDドキュメント:</label>
                <pre className={styles.jsonValue}>{JSON.stringify(selectedDID.doc, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
