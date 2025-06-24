'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { loadDIDFromStorage } from 'src/utils/did';
import { loadVCsFromStorage } from 'src/utils/vc';
import type { ZKPProof } from 'src/utils/zkp';
import { formatZKPForQR, generateAgeProofZKP } from 'src/utils/zkp';
import styles from './ZKPGenerator.module.css';

export default function ZKPGenerator(): React.ReactElement {
  const [selectedVCId, setSelectedVCId] = useState<string>('');
  const [nonce, setNonce] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [zkpResult, setZkpResult] = useState<{ proof: ZKPProof; generationTime: number } | null>(
    null,
  );
  const [error, setError] = useState<string>('');
  const [showQR, setShowQR] = useState(false);

  const vcs = loadVCsFromStorage();
  const residenceVCs = vcs.filter(
    (vc) => vc.data.type.includes('ResidentCredential') && vc.data.credentialSubject.birthDate,
  );

  const generateZKP = async (): Promise<void> => {
    try {
      setError('');
      setIsGenerating(true);

      if (!selectedVCId) {
        setError('住民票VCを選択してください。');
        return;
      }

      if (!nonce.trim()) {
        setError('チャレンジ文字列（Nonce）を入力してください。');
        return;
      }

      const didData = loadDIDFromStorage();
      if (!didData) {
        setError('DIDが生成されていません。');
        return;
      }

      const selectedVC = vcs.find((vc) => vc.data.id === selectedVCId);
      if (!selectedVC) {
        setError('選択されたVCが見つかりません。');
        return;
      }

      const birthDate = selectedVC.data.credentialSubject.birthDate as string;
      if (!birthDate) {
        setError('選択されたVCに生年月日が含まれていません。');
        return;
      }

      const result = await generateAgeProofZKP(birthDate, nonce.trim(), didData.doc.id);
      setZkpResult(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('ZKP生成中にエラーが発生しました。');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const showQRCode = (): void => {
    setShowQR(true);
  };

  const closeQR = (): void => {
    setShowQR(false);
  };

  const resetForm = (): void => {
    setSelectedVCId('');
    setNonce('');
    setZkpResult(null);
    setError('');
    setShowQR(false);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>ZKP生成（20歳以上証明）</h2>

      <div className={styles.section}>
        <p className={styles.description}>
          住民票VCの生年月日情報から、具体的な年齢を開示することなく「20歳以上である」ことを証明するZKPを生成します。
          ※ このPoCでは、実際のcircom回路の代わりに模擬的なZKP生成を行います。
        </p>

        {!zkpResult ? (
          <div className={styles.formSection}>
            <div className={styles.field}>
              <label htmlFor="vc-select">住民票VC選択:</label>
              <select
                id="vc-select"
                value={selectedVCId}
                onChange={(e) => setSelectedVCId(e.target.value)}
                className={styles.select}
              >
                <option value="">-- VCを選択してください --</option>
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
                onChange={(e) => setNonce(e.target.value)}
                placeholder="検証者から提供されるチャレンジ文字列"
                className={styles.input}
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.generateSection}>
              <p className={styles.warning}>
                ⚠️ ZKP生成は計算集約的な処理です。ブラウザがアクティブな状態を保ってください。
              </p>
              <button
                onClick={generateZKP}
                disabled={isGenerating || !selectedVCId || !nonce.trim()}
                className={styles.generateButton}
              >
                {isGenerating ? 'ZKP生成中...' : 'ZKP生成開始'}
              </button>
            </div>

            {residenceVCs.length === 0 && (
              <div className={styles.noVCWarning}>
                生年月日を含む住民票VCが見つかりません。先にサンプルVCを追加するか、適切な住民票VCを追加してください。
              </div>
            )}
          </div>
        ) : (
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
              <button onClick={showQRCode} className={styles.button}>
                QRコードで提示
              </button>
              <button onClick={resetForm} className={styles.secondaryButton}>
                新しいZKPを生成
              </button>
            </div>
          </div>
        )}
      </div>

      {showQR && zkpResult && (
        <div className={styles.qrModal}>
          <div className={styles.qrContainer}>
            <div className={styles.qrHeader}>
              <h3>ZKP証明QRコード</h3>
              <button onClick={closeQR} className={styles.closeButton}>
                ✕
              </button>
            </div>

            <div className={styles.qrCodeWrapper}>
              <QRCodeSVG
                value={formatZKPForQR(zkpResult.proof)}
                size={300}
                level="M"
                includeMargin={true}
              />
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
      )}
    </div>
  );
}
