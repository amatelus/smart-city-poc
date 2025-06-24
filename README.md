# AMATELUS 市民ウォレット PoC

自己主権型アイデンティティ（SSI）とゼロ知識証明（ZKP）を核とする未来の都市OSアーキテクチャ「AMATELUS」における市民向けスマートフォンウォレットアプリケーションの概念実証（PoC）実装です。

## プロジェクト概要

本プロジェクトは、AMATELUSプロトコルにおける市民（Holder）向けのウォレットアプリケーションのMVP（Minimum Viable Product）として、現代のスマートフォンブラウザ環境におけるDID/VC/ZKPの運用フローと計算時間の検証を目的としています。

### 主な機能

1. **DID（分散型識別子）管理**

   - Ed25519 秘密鍵/公開鍵ペアの生成
   - DIDドキュメントの生成と表示
   - localStorage による永続化

2. **本人確認フロー**

   - 公開鍵配列提示用QRコード生成（バージョン番号 + 公開鍵）
   - 2段階QRスキャンによる秘密鍵所有権確認

3. **VC（Verifiable Credentials）管理**

   - 手動でのVC追加（JSON貼り付け）
   - サンプル住民票VCの自動生成
   - VC一覧表示と詳細確認

4. **大容量VCの分割受信**

   - メタデータQRコード（ハッシュ + 分割数）の読み取り
   - VCパーツの順不同受信
   - ハッシュ検証による完全性確認

5. **ZKP（ゼロ知識証明）生成**
   - 20歳以上であることの証明（模擬実装）
   - チャレンジ・レスポンス認証
   - QRコードによる証明の提示

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript
- **スタイル**: CSS Modules
- **暗号ライブラリ**:
  - `tweetnacl` (Ed25519 署名/検証)
  - `js-sha3` (SHA3-512 ハッシュ生成)
- **QRコード**:
  - `qrcode.react` (QRコード生成)
  - `html5-qrcode` (QRコード読み取り)
- **データ永続化**: localStorage

## セットアップ方法

### 前提条件

- Node.js 22.0.0 以上
- npm または yarn

### インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd smart-city-poc

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### ビルドとテスト

```bash
# TypeScript型チェック
npm run typecheck

# リンター実行
npm run lint

# プロダクションビルド
npm run build
```

## 使用方法

### 基本的な操作フロー

1. **DID生成**

   - アプリを初回起動時に「新しいDIDを生成」をクリック
   - 生成されたDID情報を確認

2. **本人確認**

   - 「本人確認用QRコードを表示」で公開鍵を提示
   - 「本人認証を開始」でNonceをスキャンし署名を生成

3. **VC管理**

   - 「サンプルVC追加」で住民票VCを生成
   - 「VC追加」で手動でVCを追加
   - 一覧からVCの詳細を確認

4. **ZKP生成**
   - 住民票VCを選択
   - チャレンジ文字列を入力
   - 「ZKP生成開始」で20歳以上の証明を生成

### QRコード運用

- **公開鍵提示**: `[バージョン, 公開鍵]` 形式
- **署名提示**: `{nonce, signature, publicKey, did}` 形式
- **ZKP提示**: 圧縮されたZKP証明データ

## アーキテクチャ

### ディレクトリ構造

```
src/
├── app/                 # Next.js App Router
├── components/          # Reactコンポーネント
│   ├── DIDManager.tsx           # DID管理
│   ├── PublicKeyQRCode.tsx      # 公開鍵QR生成
│   ├── PrivateKeyProof.tsx      # 秘密鍵証明
│   ├── VCManager.tsx            # VC管理
│   ├── VCReceiver.tsx           # 大容量VC受信
│   ├── ZKPGenerator.tsx         # ZKP生成
│   └── QRScanner.tsx            # QRスキャナー
├── utils/               # ユーティリティ関数
│   ├── did.ts                   # DID関連処理
│   ├── vc.ts                    # VC関連処理
│   └── zkp.ts                   # ZKP関連処理（模擬実装）
└── styles/              # グローバルスタイル
```

### DID生成プロセス

1. Ed25519 秘密鍵/公開鍵ペア生成
2. DIDドキュメントテンプレートの構築
3. `{version, publicKey, template}` のSHA3-512ハッシュ計算
4. `did:amatelus:{hash}` 形式でDIDを生成

### VC検証プロセス

1. JSON形式の妥当性検証
2. 必須フィールド（@context, id, type, issuer等）の確認
3. localStorage への保存

### ZKP生成プロセス（模擬実装）

1. 住民票VCから生年月日を取得
2. 現在日付との比較で20歳以上かを判定
3. `{birthDateHash, currentDate, nonce, did}` からプルーフ生成
4. チャレンジ・レスポンス形式で証明データを構築

## セキュリティ考慮事項

### PoC における制約

- **秘密鍵保管**: HSMではなくlocalStorageを使用（実装の簡便性のため）
- **ZKP実装**: 実際のcircom回路ではなく模擬実装
- **PQC**: 実際の耐量子計算機暗号ではなくSHA3による模擬
- **ネットワーク通信**: オフライン動作、実際のDID解決なし

### 実装されたセキュリティ対策

- **リプレイ攻撃対策**: Nonceによるチャレンジ・レスポンス
- **完全性検証**: VCパーツのハッシュ検証
- **時間制限**: ZKP証明の5分間有効期限
- **Ed25519署名**: 暗号学的に安全な電子署名

## 制約事項とトレードオフ

### PoCスコープでの簡略化

1. **ZKP回路**: 実際のSnarkJS + Circomではなく、コンセプト実証のための模擬実装
2. **DID解決**: ブロックチェーンやIPFSを使わず、本人提示による検証
3. **VC失効**: 失効リストの実装は含まれていない
4. **秘密鍵管理**: プロダクション環境では適切なキー管理システムが必要

### パフォーマンス考慮

- ZKP生成時間の測定・表示
- 大容量VCの分割による効率的な転送
- 進捗表示によるUX向上

## 今後の発展

### 本格実装に向けた課題

1. **Circom回路の実装**: 実際のZKP回路の設計・実装
2. **HSM統合**: ハードウェアセキュリティモジュールでの鍵管理
3. **DID解決**: 分散型レジストリとの統合
4. **VC失効**: Merkle Treeベースの失効リスト実装
5. **PQC対応**: 実際の耐量子計算機暗号の採用

### スケーラビリティ対応

- WebAssembly最適化によるZKP高速化
- Progressive Web App（PWA）対応
- オフライン機能の強化

## ライセンス

本プロジェクトは概念実証目的で作成されています。

## 関連資料

- [W3C DID仕様](https://www.w3.org/TR/did-core/)
- [W3C VC仕様](https://www.w3.org/TR/vc-data-model/)
