'use client';

import type { VCStorage } from 'src/utils/vc';
import styles from './VCManager.module.css';

interface VCDetailModalProps {
  selectedVC: VCStorage;
  onClose: () => void;
}

export default function VCDetailModal({
  selectedVC,
  onClose,
}: VCDetailModalProps): React.ReactElement {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>VC詳細: {selectedVC.title}</h3>
          <button onClick={onClose} className={styles.closeButton}>
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
  );
}
