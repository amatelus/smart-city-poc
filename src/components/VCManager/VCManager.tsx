'use client';

import { useEffect, useState } from 'react';
import type { DtoId } from 'src/schemas/brandedId';
import type { DIDData } from 'src/schemas/did';
import type { VCStorage } from 'src/schemas/vc';
import { loadAllDIDsFromStorage } from 'src/utils/did';
import {
  createSampleResidentVC,
  loadVCsFromStorage,
  removeVCFromStorage,
  saveVCToStorage,
} from 'src/utils/vc';
import VCAddModal from './VCAddModal';
import VCDetailModal from './VCDetailModal';
import VCDIDSelector from './VCDIDSelector';
import styles from './VCManager.module.css';

export default function VCManager(): React.ReactElement {
  const [vcs, setVCs] = useState<VCStorage[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [vcJsonInput, setVcJsonInput] = useState('');
  const [selectedVC, setSelectedVC] = useState<VCStorage | null>(null);
  const [error, setError] = useState<string>('');
  const [allDIDs, setAllDIDs] = useState<DIDData[]>([]);
  const [selectedDID, setSelectedDID] = useState<DtoId['did'] | null>(null);

  useEffect(() => {
    const allDIDs = loadAllDIDsFromStorage();
    setAllDIDs(allDIDs);

    if (!selectedDID && allDIDs.length > 0) {
      setVCs([]);
    } else if (selectedDID) {
      const vcsForDID = loadVCsFromStorage(selectedDID);
      setVCs(vcsForDID);
    }
  }, [selectedDID]);

  useEffect(() => {
    if (selectedDID) {
      const vcsForDID = loadVCsFromStorage(selectedDID);
      setVCs(vcsForDID);
    } else {
      setVCs([]);
    }
  }, [selectedDID]);

  const handleAddSampleVC = (): void => {
    if (!selectedDID) {
      setError('DIDを選択してください。');
      return;
    }

    const sampleVC = createSampleResidentVC(selectedDID);
    saveVCToStorage({ title: 'サンプル住民票VC', data: sampleVC });
    const updated = loadVCsFromStorage(selectedDID);
    setVCs(updated);
  };

  const handleRemoveVC = (id: DtoId['vc']): void => {
    if (confirm('このVCを削除しますか？')) {
      removeVCFromStorage(id);
      const updated = selectedDID ? loadVCsFromStorage(selectedDID) : [];
      setVCs(updated);
      if (selectedVC && selectedVC.data.id === id) {
        setSelectedVC(null);
      }
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>VC（Verifiable Credentials）管理</h2>

      <VCDIDSelector
        allDIDs={allDIDs}
        selectedDID={selectedDID}
        onDIDSelect={setSelectedDID}
        onError={setError}
      />

      <div className={styles.section}>
        <div className={styles.vcList}>
          <div className={styles.listHeader}>
            <h3>保有VC一覧 ({vcs.length}件)</h3>
            <div className={styles.buttonGroup}>
              <button
                onClick={handleAddSampleVC}
                disabled={!selectedDID}
                className={`${styles.button} ${styles.sampleButton}`}
              >
                サンプルVC追加
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                disabled={!selectedDID}
                className={styles.button}
              >
                VC追加
              </button>
            </div>
          </div>

          {!selectedDID ? (
            <div className={styles.emptyState}>
              <p>DIDを選択してVCを表示してください</p>
            </div>
          ) : vcs.length === 0 ? (
            <div className={styles.emptyState}>
              <p>選択されたDIDにVCが登録されていません</p>
            </div>
          ) : (
            <div className={styles.vcItems}>
              {vcs.map((vcStorage) => (
                <div
                  key={vcStorage.data.id}
                  className={styles.vcItem}
                  onClick={() => setSelectedVC(vcStorage)}
                >
                  <div className={styles.vcItemHeader}>
                    <h4>{vcStorage.title}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveVC(vcStorage.data.id);
                      }}
                      className={styles.removeButton}
                    >
                      削除
                    </button>
                  </div>
                  <div className={styles.vcItemInfo}>
                    <div>発行者: {vcStorage.data.issuer}</div>
                    <div>発行日: {formatDate(vcStorage.data.issuanceDate)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddForm && (
        <VCAddModal
          selectedDID={selectedDID}
          vcJsonInput={vcJsonInput}
          error={error}
          onVcJsonInputChange={setVcJsonInput}
          onError={setError}
          onVCsUpdate={setVCs}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {selectedVC && <VCDetailModal selectedVC={selectedVC} onClose={() => setSelectedVC(null)} />}
    </div>
  );
}
