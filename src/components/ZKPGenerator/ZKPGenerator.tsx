'use client';

import { useZKPGenerator } from './useZKPGenerator';
import styles from './ZKPGenerator.module.css';
import ZKPGeneratorForm from './ZKPGeneratorForm';
import ZKPGeneratorResult from './ZKPGeneratorResult';
import ZKPQRModal from './ZKPQRModal';

export default function ZKPGenerator(): React.ReactElement {
  const {
    selectedDID,
    selectedVCId,
    nonce,
    isGenerating,
    zkpResult,
    error,
    showQR,
    allDIDs,
    residenceVCs,
    setSelectedDID,
    setSelectedVCId,
    setNonce,
    generateZKP,
    showQRCode,
    closeQR,
    resetForm,
  } = useZKPGenerator();

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>ZKP生成（20歳以上証明）</h2>

      <div className={styles.section}>
        <p className={styles.description}>
          住民票VCの生年月日情報から、具体的な年齢を開示することなく「20歳以上である」ことを証明するZKPを生成します。
          ※ このPoCでは、実際のcircom回路の代わりに模擬的なZKP生成を行います。
        </p>

        {!zkpResult ? (
          <ZKPGeneratorForm
            selectedDID={selectedDID}
            selectedVCId={selectedVCId}
            nonce={nonce}
            isGenerating={isGenerating}
            error={error}
            allDIDs={allDIDs}
            residenceVCs={residenceVCs}
            onDIDSelect={setSelectedDID}
            onVCSelect={setSelectedVCId}
            onNonceChange={setNonce}
            onGenerate={generateZKP}
          />
        ) : (
          <ZKPGeneratorResult zkpResult={zkpResult} onShowQR={showQRCode} onReset={resetForm} />
        )}
      </div>

      {showQR && zkpResult && <ZKPQRModal zkpProof={zkpResult.proof} onClose={closeQR} />}
    </div>
  );
}
