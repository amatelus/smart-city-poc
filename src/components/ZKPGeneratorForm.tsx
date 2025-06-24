'use client';

import type { DtoId } from 'src/schemas/brandedId';
import { brandedId } from 'src/schemas/brandedId';
import type { VCStorage } from 'src/utils/vc';
import styles from './ZKPGenerator.module.css';

interface ZKPGeneratorFormProps {
  selectedVCId: DtoId['vc'] | null;
  nonce: string;
  isGenerating: boolean;
  error: string;
  residenceVCs: VCStorage[];
  onVCSelect: (vcId: DtoId['vc']) => void;
  onNonceChange: (nonce: string) => void;
  onGenerate: () => void;
}

export default function ZKPGeneratorForm({
  selectedVCId,
  nonce,
  isGenerating,
  error,
  residenceVCs,
  onVCSelect,
  onNonceChange,
  onGenerate,
}: ZKPGeneratorFormProps): React.ReactElement {
  return (
    <div className={styles.formSection}>
      {residenceVCs.length === 0 ? (
        <div className={styles.noVCWarning}>
          生年月日を含む住民票VCが見つかりません。先にサンプルVCを追加するか、適切な住民票VCを追加してください。
        </div>
      ) : (
        <>
          <div className={styles.field}>
            <label htmlFor="vc-select">VC選択:</label>
            <select
              id="vc-select"
              value={selectedVCId ?? residenceVCs[0].data.id}
              onChange={(e) => onVCSelect(brandedId.vc.dto.parse(e.target.value))}
              className={styles.select}
            >
              {residenceVCs.map((vc) => (
                <option key={vc.data.id} value={vc.data.id}>
                  {vc.title} (生年月日: {vc.data.credentialSubject.birthDate})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="nonce-input">チャレンジ文字列（Nonce）:</label>
            <input
              type="text"
              id="nonce-input"
              value={nonce}
              onChange={(e) => onNonceChange(e.target.value)}
              placeholder="検証者から提供されるチャレンジ文字列"
              className={styles.input}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.generateSection}>
            <p className={styles.warning}>
              ⚠️ ZKP生成は計算集約的な処理です。ブラウザがアクティブな状態を保ってください。
            </p>
            <button onClick={onGenerate} disabled={isGenerating} className={styles.generateButton}>
              {isGenerating ? 'ZKP生成中...' : 'ZKP生成開始'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
