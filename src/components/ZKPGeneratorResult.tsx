'use client';

import type { ZKPProof } from 'src/utils/zkp';
import styles from './ZKPGenerator.module.css';

interface ZKPGeneratorResultProps {
  zkpResult: { proof: ZKPProof; generationTime: number };
  onShowQR: () => void;
  onReset: () => void;
}

export default function ZKPGeneratorResult({
  zkpResult,
  onShowQR,
  onReset,
}: ZKPGeneratorResultProps): React.ReactElement {
  return (
    <div className={styles.resultSection}>
      <h3>✓ ZKP生成完了</h3>

      <div className={styles.zkpInfo}>
        <div className={styles.infoItem}>
          <strong>生成時間:</strong> {zkpResult.generationTime.toFixed(2)}ms
        </div>
        <div className={styles.infoItem}>
          <strong>証明タイプ:</strong> 20歳以上であることの証明
        </div>
        <div className={styles.infoItem}>
          <strong>Nonce:</strong> {zkpResult.proof.nonce}
        </div>
        <div className={styles.infoItem}>
          <strong>生成日時:</strong>{' '}
          {new Date(zkpResult.proof.metadata.generatedAt).toLocaleString('ja-JP')}
        </div>
      </div>

      <div className={styles.proofData}>
        <strong>ZKP証明データ:</strong>
        <pre className={styles.jsonDisplay}>{JSON.stringify(zkpResult.proof, null, 2)}</pre>
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={onShowQR} className={styles.button}>
          QRコードで提示
        </button>
        <button onClick={onReset} className={styles.secondaryButton}>
          新しいZKPを生成
        </button>
      </div>
    </div>
  );
}
