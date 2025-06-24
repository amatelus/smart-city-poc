'use client';

import { condition } from 'src/utils/condition';
import styles from './VCReceiver.module.css';

interface VCScanningStepsProps {
  step: 'initial' | 'scanning-meta' | 'scanning-parts' | 'completed';
  progress: { current: number; total: number };
  onStartReceive: () => void;
  onResetAndRestart: () => void;
}

export default function VCScanningSteps({
  step,
  onStartReceive,
  onResetAndRestart,
}: VCScanningStepsProps): React.ReactElement {
  return condition(step)
    .case('initial', () => (
      <button onClick={onStartReceive} className={styles.button}>
        VC受信を開始
      </button>
    ))
    .case('scanning-meta', () => (
      <div className={styles.statusSection}>
        <h3>ステップ1: メタデータQRをスキャン</h3>
        <p>VC全体のハッシュ値と分割数情報を含むQRコードをスキャンしてください。</p>
      </div>
    ))
    .case('scanning-parts', () => (
      <div className={styles.statusSection}>
        <h3>ステップ2: VCパーツQRをスキャン</h3>
      </div>
    ))
    .case('completed', () => (
      <div className={styles.successSection}>
        <h3>✓ VC受信完了</h3>
        <p>VCが正常に受信・検証されました。VC管理画面で確認できます。</p>
        <button onClick={onResetAndRestart} className={styles.button}>
          新しいVC受信を開始
        </button>
      </div>
    )).done;
}

interface VCProgressDisplayProps {
  progress: { current: number; total: number };
  missingParts: number[];
}

function VCProgressDisplay({ progress, missingParts }: VCProgressDisplayProps): React.ReactElement {
  return (
    <div className={styles.progressInfo}>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${(progress.current / progress.total) * 100}%` }}
        />
      </div>
      <div className={styles.progressText}>
        {progress.current} / {progress.total} パーツ受信完了
      </div>
      {missingParts.length > 0 && (
        <div className={styles.missingParts}>
          <strong>未受信パーツ:</strong> {missingParts.join(', ')}
        </div>
      )}
    </div>
  );
}

export { VCProgressDisplay };
