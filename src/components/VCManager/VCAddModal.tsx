'use client';

import type { DtoId } from 'src/schemas/brandedId';
import { VCDtoSchema } from 'src/schemas/vc';
import { safeJsonParse } from 'src/utils/safeJsonParse';
import { loadVCsFromStorage, saveVCToStorage, type VCStorage } from 'src/utils/vc';
import styles from './VCManager.module.css';

interface VCAddModalProps {
  selectedDID: DtoId['did'] | null;
  vcJsonInput: string;
  error: string;
  onVcJsonInputChange: (value: string) => void;
  onError: (error: string) => void;
  onVCsUpdate: (vcs: VCStorage[]) => void;
  onClose: () => void;
}

export default function VCAddModal({
  selectedDID,
  vcJsonInput,
  error,
  onVcJsonInputChange,
  onError,
  onVCsUpdate,
  onClose,
}: VCAddModalProps): React.ReactElement {
  const handleAddVC = (): void => {
    if (!selectedDID) {
      onError('DIDを選択してください。');
      return;
    }

    onError('');
    const vcData = VCDtoSchema.safeParse(safeJsonParse(vcJsonInput)).data;

    if (!vcData) {
      onError('無効なVCフォーマットです。');
      return;
    }

    saveVCToStorage({ title: 'サンプルVC', data: vcData });
    const updated = loadVCsFromStorage(selectedDID);
    onVCsUpdate(updated);
    onVcJsonInputChange('');
    onClose();
  };

  const handleClose = (): void => {
    onVcJsonInputChange('');
    onError('');
    onClose();
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>VC追加</h3>
          <button onClick={handleClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        <div className={styles.formSection}>
          <label>VC JSON:</label>
          <textarea
            value={vcJsonInput}
            onChange={(e) => onVcJsonInputChange(e.target.value)}
            placeholder="VCのJSON形式データを貼り付けてください"
            className={styles.textarea}
            rows={10}
          />

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.buttonGroup}>
            <button onClick={handleAddVC} className={styles.button} disabled={!vcJsonInput.trim()}>
              追加
            </button>
            <button onClick={handleClose} className={`${styles.button} ${styles.cancelButton}`}>
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
