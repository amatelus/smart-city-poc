'use client';

import { useEffect, useState } from 'react';
import type { DtoId } from 'src/schemas/brandedId';
import { VCDtoSchema, type VCStorage } from 'src/schemas/vc';
import { safeJsonParse } from 'src/utils/safeJsonParse';
import { loadVCsFromStorage, removeVCFromStorage, saveVCToStorage } from 'src/utils/vc';
import styles from './VCManager.module.css';

export default function VCManager(): React.ReactElement {
  const [vcs, setVCs] = useState<VCStorage[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [vcJsonInput, setVcJsonInput] = useState('');
  const [selectedVC, setSelectedVC] = useState<VCStorage | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const stored = loadVCsFromStorage();
    setVCs(stored);
  }, []);

  const handleAddVC = (): void => {
    setError('');
    const vcData = VCDtoSchema.safeParse(safeJsonParse(vcJsonInput)).data;

    if (!vcData) {
      setError('無効なVCフォーマットです。');
      return;
    }

    saveVCToStorage({ title: 'サンプルVC', data: vcData });
    const updated = loadVCsFromStorage();
    setVCs(updated);
    setVcJsonInput('');
    setShowAddForm(false);
  };

  const handleRemoveVC = (id: DtoId['vc']): void => {
    if (confirm('このVCを削除しますか？')) {
      removeVCFromStorage(id);
      const updated = loadVCsFromStorage();
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

      <div className={styles.section}>
        <div className={styles.vcList}>
          <div className={styles.listHeader}>
            <h3>保有VC一覧 ({vcs.length}件)</h3>
            <div className={styles.buttonGroup}>
              <button onClick={() => setShowAddForm(true)} className={styles.button}>
                VC追加
              </button>
            </div>
          </div>

          {vcs.length === 0 ? (
            <div className={styles.emptyState}>
              <p>VCが登録されていません</p>
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
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>VC追加</h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setVcJsonInput('');
                  setError('');
                }}
                className={styles.closeButton}
              >
                ✕
              </button>
            </div>

            <div className={styles.formSection}>
              <label>VC JSON:</label>
              <textarea
                value={vcJsonInput}
                onChange={(e) => setVcJsonInput(e.target.value)}
                placeholder="VCのJSON形式データを貼り付けてください"
                className={styles.textarea}
                rows={10}
              />

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.buttonGroup}>
                <button
                  onClick={handleAddVC}
                  className={styles.button}
                  disabled={!vcJsonInput.trim()}
                >
                  追加
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setVcJsonInput('');
                    setError('');
                  }}
                  className={`${styles.button} ${styles.cancelButton}`}
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedVC && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>VC詳細: {selectedVC.title}</h3>
              <button onClick={() => setSelectedVC(null)} className={styles.closeButton}>
                ✕
              </button>
            </div>

            <div className={styles.vcDetail}>
              <div className={styles.vcInfo}>
                <div className={styles.infoItem}>
                  <strong>発行者:</strong> {selectedVC.data.issuer}
                </div>
                <div className={styles.infoItem}>
                  <strong>発行日:</strong> {formatDate(selectedVC.data.issuanceDate)}
                </div>
                <div className={styles.infoItem}>
                  <strong>対象DID:</strong> {selectedVC.data.credentialSubject.id}
                </div>
              </div>

              <div className={styles.jsonSection}>
                <strong>VC JSON:</strong>
                <pre className={styles.jsonDisplay}>{JSON.stringify(selectedVC.data, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
