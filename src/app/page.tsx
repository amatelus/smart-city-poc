'use client';

import DIDManager from 'src/components/DIDManager';
import PrivateKeyProof from 'src/components/PrivateKeyProof';
import PublicKeyQRCode from 'src/components/PublicKeyQRCode';
import VCManager from 'src/components/VCManager';
import VCReceiver from 'src/components/VCReceiver';
import ZKPGenerator from 'src/components/ZKPGenerator';
import styles from './page.module.css';

export default function Home(): React.ReactElement {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>AMATELUS 市民ウォレット PoC</h1>

        <p className={styles.description}>
          自己主権型アイデンティティ（SSI）とゼロ知識証明（ZKP）を活用したスマートシティウォレット
        </p>

        <DIDManager />
        <PublicKeyQRCode />
        <PrivateKeyProof />
        <VCManager />
        <VCReceiver />
        <ZKPGenerator />
      </main>
    </div>
  );
}
