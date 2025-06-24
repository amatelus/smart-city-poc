'use client';

import type { DtoId } from 'src/schemas/brandedId';
import { brandedId } from 'src/schemas/brandedId';
import type { DIDData } from 'src/schemas/did';
import { formatDIDId } from 'src/utils/formatDIDId';
import type { VCStorage } from 'src/utils/vc';
import styles from './ZKPGenerator.module.css';

interface ZKPGeneratorFormProps {
  selectedDID: DtoId['did'] | null;
  selectedVCId: DtoId['vc'] | null;
  challenge: string;
  isGenerating: boolean;
  error: string;
  allDIDs: DIDData[];
  residenceVCs: VCStorage[];
  onDIDSelect: (didId: DtoId['did'] | null) => void;
  onVCSelect: (vcId: DtoId['vc']) => void;
  onChallengeChange: (challenge: string) => void;
  onGenerate: () => void;
}

function DIDSelector({
  selectedDID,
  allDIDs,
  onDIDSelect,
}: {
  selectedDID: DtoId['did'] | null;
  allDIDs: DIDData[];
  onDIDSelect: (didId: DtoId['did'] | null) => void;
}): React.ReactElement {
  return (
    <div className={styles.field}>
      <label htmlFor="did-select">DID選択:</label>
      <select
        id="did-select"
        value={selectedDID || ''}
        onChange={(e) => onDIDSelect((e.target.value as DtoId['did']) || null)}
        className={styles.select}
      >
        <option value="">-- DIDを選択してください --</option>
        {allDIDs.map((did) => (
          <option key={did.doc.id} value={did.doc.id}>
            {formatDIDId(did.doc.id)}
          </option>
        ))}
      </select>
    </div>
  );
}

function VCSelector({
  selectedVCId,
  residenceVCs,
  onVCSelect,
}: {
  selectedVCId: DtoId['vc'] | null;
  residenceVCs: VCStorage[];
  onVCSelect: (vcId: DtoId['vc']) => void;
}): React.ReactElement {
  return (
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
  );
}

function ChallengeInput({
  challenge,
  onChallengeChange,
}: {
  challenge: string;
  onChallengeChange: (challenge: string) => void;
}): React.ReactElement {
  return (
    <div className={styles.field}>
      <label htmlFor="challenge-input">チャレンジ文字列:</label>
      <input
        type="text"
        id="challenge-input"
        value={challenge}
        onChange={(e) => onChallengeChange(e.target.value)}
        placeholder="検証者から提供されるチャレンジ文字列"
        className={styles.input}
      />
    </div>
  );
}

function GenerateButton({
  isGenerating,
  onGenerate,
}: {
  isGenerating: boolean;
  onGenerate: () => void;
}): React.ReactElement {
  return (
    <div className={styles.generateSection}>
      <p className={styles.warning}>
        ⚠️ ZKP生成は計算集約的な処理です。ブラウザがアクティブな状態を保ってください。
      </p>
      <button onClick={onGenerate} disabled={isGenerating} className={styles.generateButton}>
        {isGenerating ? 'ZKP生成中...' : 'ZKP生成開始'}
      </button>
    </div>
  );
}

export default function ZKPGeneratorForm({
  selectedDID,
  selectedVCId,
  challenge,
  isGenerating,
  error,
  allDIDs,
  residenceVCs,
  onDIDSelect,
  onVCSelect,
  onChallengeChange,
  onGenerate,
}: ZKPGeneratorFormProps): React.ReactElement {
  return allDIDs.length === 0 ? (
    <div className={styles.formSection}>
      <div className={styles.noVCWarning}>
        利用可能なDIDがありません。DID管理画面でDIDを作成してください。
      </div>
    </div>
  ) : (
    <div className={styles.formSection}>
      <DIDSelector selectedDID={selectedDID} allDIDs={allDIDs} onDIDSelect={onDIDSelect} />

      {!selectedDID ? (
        <div className={styles.noVCWarning}>DIDを選択してVCを表示してください。</div>
      ) : residenceVCs.length === 0 ? (
        <div className={styles.noVCWarning}>
          選択されたDIDに生年月日を含む住民票VCが見つかりません。先にサンプルVCを追加するか、適切な住民票VCを追加してください。
        </div>
      ) : (
        <>
          <VCSelector
            selectedVCId={selectedVCId}
            residenceVCs={residenceVCs}
            onVCSelect={onVCSelect}
          />

          <ChallengeInput challenge={challenge} onChallengeChange={onChallengeChange} />

          {error && <div className={styles.error}>{error}</div>}

          <GenerateButton isGenerating={isGenerating} onGenerate={onGenerate} />
        </>
      )}
    </div>
  );
}
