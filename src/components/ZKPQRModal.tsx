'use client';

import { QRCodeSVG } from 'qrcode.react';
import type { ZKPProof } from 'src/utils/zkp';
import { formatZKPForQR } from 'src/utils/zkp';
import styles from './ZKPGenerator.module.css';

interface ZKPQRModalProps {
  zkpProof: ZKPProof;
  onClose: () => void;
}

export default function ZKPQRModal({ zkpProof, onClose }: ZKPQRModalProps): React.ReactElement {
  return (
    <div className={styles.qrModal}>
      <div className={styles.qrContainer}>
        <div className={styles.qrHeader}>
          <h3>ZKP証明QRコード</h3>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        <div className={styles.qrCodeWrapper}>
          <QRCodeSVG value={formatZKPForQR(zkpProof)} size={300} level="M" includeMargin={true} />
        </div>

        <div className={styles.qrInfo}>
          <p>
            <strong>証明内容:</strong> 20歳以上であることの証明
          </p>
          <p>
            <strong>有効期限:</strong> 生成から5分間
          </p>
          <p className={styles.instruction}>
            検証者にこのQRコードをスキャンしてもらい、ZKP証明を検証してもらってください。
          </p>
        </div>
      </div>
    </div>
  );
}
