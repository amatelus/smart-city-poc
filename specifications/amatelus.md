# AMATELUS: 自己主権型アイデンティティとゼロ知識証明に基づく信頼のプロトコル

本論文では、デジタル社会が直面するプライバシー侵害、中央集権型IDシステムへの依存、行政サービスの透明性・信頼性といった課題に対し、自己主権型アイデンティティ（SSI）とゼロ知識証明（ZKP）を核とする新たな都市OSアーキテクチャ「AMATELUS」を提案する。AMATELUSは、特定の管理者を持たない「プロトコル」として機能し、不変なDIDドキュメント、徹底したVC再発行モデル、耐量子計算機暗号（PQC）の採用、およびZKPによる究極のプライバシー保護を特徴とする。さらに、未来の市民生活において、個人が所有するAIエージェントがDID/VCsの複雑な管理を自動化し、ユーザー体験の課題を解決する可能性を探る。

## 1. 序論

情報技術の急速な発展は、私たちの生活を豊かにする一方で、個人情報の不正利用、中央集権的なデータ管理によるプライバシー侵害、そして行政サービスの信頼性・透明性に関する懸念といった新たな課題をもたらしている。特に、都市をインテリジェント化する「都市OS」の概念は、これらの課題解決の中核を担うと期待されるが、その設計思想によっては新たなリスクを生み出す可能性も秘めている。

既存の都市OSモデル、例えばエストニアのX-Roadは組織間の安全なデータ交換層として機能し、EUのFIWAREはスマートシティアプリケーション開発のためのオープンソースプラットフォームを提供する。これらはそれぞれ異なる問題空間で成果を上げているが、データ交換時のセキュリティやアクセス制御を重視しつつも、データの内容そのものを開示せずに証明する究極のプライバシー保護や、徹底した自己主権的アイデンティティ（SSI）の追求には課題を残している。

本論文では、これらの課題に対し、W3Cの分散型識別子（DID）およびVerifiable Credentials（VCs）の標準を基盤とし、ゼロ知識証明（ZKP）を最大限に活用することで、市民のプライバシーを極限まで保護しつつ、行政サービスの信頼性と透明性を確保する未来の都市OSアーキテクチャ「AMATELUS」を提案する。AMATELUSは、インターネットのように実体を持たずプロトコルとして機能することで、真の非中央集権性と高い耐障害性を目指す。

## 2. AMATELUSの設計思想とアーキテクチャ

AMATELUSは、市民中心のデジタル体験と、政府の効率的かつ透明なサービス提供を両立させるために、以下の設計原則に基づいている。

### 2.1. DIDの設計

AMATELUSのDIDメソッド `did:amatelus` は、その識別子の核となるDIDドキュメントの「不変性」を徹底する。

* **不変なDIDドキュメントとDIDの生成:** DIDドキュメント自体は更新されない固定的なデータ構造である。そのコンテンツの耐量子計算機（PQC）ハッシュ値がDIDの method-specific-id となる（例: did:amatelus:\<DIDドキュメントの耐量子計算機ハッシュ\>）。この設計は、did:keyメソッドの自己証明的特性に類似する。  
  * **循環参照の解決:** DIDドキュメントの内容にそのDID自身を含めることによる循環参照の問題は、ハッシュ計算時にはidフィールドを一時的に空とするかプレースホルダーを使用し、ハッシュ値確定後に最終的なDIDをidフィールドに注入することで解決される。  
* **DIDドキュメントの最小化:** 各DIDドキュメントは、そのDIDを制御する署名用の公開鍵を一つだけ持ち、その他は最小限の不変情報のみを保持する。氏名、住所、資格といった変動・機微な個人情報は、DIDドキュメントには含まれず、全てVCとして管理される。  
* **DIDの寿命と新規作成:** 公開鍵のセキュリティ上の理由（ローテーション、紛失、漏洩など）により公開鍵を更新する必要が生じた場合、DIDドキュメントのハッシュが変化するため、AMATELUSでは新しいDIDを新規作成する。  
* **プライバシー保護のためのDID使い分け:** 市民は一人で複数のDIDを保有できる。これにより、サービスやユースケース（例: 行政サービス用、民間サービス用、健康データ用）ごとに異なるDIDを使い分けることが可能となり、活動の関連付けによるプロファイリングを防止し、市民のプライバシーを最大化する。

DID解決にはブロックチェーンやIPFSを使わず、本人がDID文字列と完全なDIDドキュメントを提示することで、発行者（例：自治体）が確認可能なモデルを採用する。

### 2.2. VC（Verifiable Credentials）管理と信頼連鎖モデル

AMATELUSにおけるVCは、住民証明などの政府発行VCから始まる「信頼の連鎖」によって発行され、運転免許や銀行口座など後続のVCはそれらに基づいて発行される。この連鎖によって、新たなVCの正当性が暗号的に保証される。

* **属性情報のVC化:** 個人の氏名、住所、年齢、資格（例: 弁護士資格）、法人の名称や所在地など、DIDドキュメントに含まれない全ての変動的または機微な属性情報は、対応する発行者（自治体、法務省、日弁連など）によってVCとして発行される。法務省のDIDドキュメントも不変な最小情報のみを持ち、その公開されたDIDが信頼の起点となる。  
* **VCの再発行モデル:** DIDが新規作成されるたびに、その新しいDIDに紐づくVCは全て再発行される。これはAMATELUSの運用において重要な前提であり、再発行にかかるコストは行政（税金）や民間（手数料など）が負担することを許容する。このモデルは、鍵のセキュリティとプライバシー保護を最大化するための、意図的なトレードオフである。  
* **VC発行チェーン（カスケード型VC発行）:**  
  * 国民はマイナンバーカードや運転免許証といった既存の身分証明書と共にウォレットのDIDを自治体に提示し、「住民データVC」を発行してもらう。  
  * この「住民データVC」から生成されたZKP（後述）を提示することで、警察署や銀行窓口、あるいはオンラインサービスで運転免許や銀行口座のVCを、個別の個人情報開示なく発行してもらう。  
* **VCの失効管理:** VC発行者は、発行したVCの失効ステータスを管理する失効リスト（例: Merkle Treeのルートハッシュ）を自身のWebサーバーで管理し、そのURLをVCに記載する。VCの保有者は、ZKPを生成する際に失効リストの最新情報を組み込む（例: Merkle Proof）。検証者は、ZKPを受け取った際にオンラインで失効リストの最新性を確認することで、客側がオフラインでも失効確認が可能なシステムが成立する。個々のVCの失効は、そのVCの失効を証明するリストのルートハッシュを変更するが、他の住民のZKPを無効にするものではない。

### 2.3. ZKP（ゼロ知識証明）の活用

ZKPは、AMATELUSにおけるプライバシー保護の中核技術である。

* **究極のプライバシー保護された認証・証明:** 市民はウォレットに保管されたVCからZKPを生成し、サービス提供者（検証者）に提示する。この際、必要な属性情報（例: 20歳以上、弁護士資格の有無）を、その具体的な値や市民のDID、氏名といった個人情報を開示することなく証明する。  
* **年齢の範囲証明:** 「20歳以上である」といった年齢の範囲証明は、市民の生年月日（VCに含まれる秘密情報）と検証時の「現在の年月日」（公開情報）をZKP回路内で処理することで実現される。これにより、ZKPの事前生成が可能となり、提示時の高い計算負荷を回避し、UXを向上させる。  
* **複数の主張の統合証明:** 一つのZKPで「20歳以上であること」と「特定のDIDの保有者であること」を同時に証明するなど、複数の主張を統合して証明できる。  
* **PQC対応ZKP:** 設計段階から耐量子計算機暗号（PQC）をZKPの基盤に統合することを想定している。PQC ZKPの生成は計算負荷が高いが、事前生成とウォレットによる自動化により、実用性を担保する。

### 2.4. 行政サービスの提供モデル

AMATELUSは、ZKPとE2E-V（エンド・ツー・エンド検証可能性）を活用することで、行政サービスの提供方法に革新をもたらす。

* **「信頼できない」サービス提供者の活用:** 投票システム、確定申告、補助金申請、法人登記など、あらゆる行政サービスを、匿名性のあるエンジニアやベンダーが開発・提供することを可能とする。行政は、これらの「信頼できない」サービス提供者に対価を支払い、市民にサービスを提供する。  
* **サービス提供者への非依存性:** ZKPとE2E-Vにより、サービス提供者は市民の個人情報や処理内容を知ることなくサービスを遂行でき、行政や市民はサービスが正しく機能したことを暗号学的に検証できる。これにより、行政は特定のベンダーにロックインされることなく、多様なサービスプロバイダーを活用できる。

## 3. 信頼性・監査性・責任追及のメカニズム

高い匿名性と分散性を追求しつつも、システム全体の信頼性と説明責任を担保するためのメカニズムを設計する。

* **DIDの連続性証明:** 秘密鍵の紛失や漏洩によりDIDを新規作成した場合、市民は古いDIDの秘密鍵（保持している場合）や、事前に登録した保証人DIDからのVCを提示することで、新しいDIDへの連続性を証明するVCを自治体から発行してもらう。この「連続性証明VC」を利用し、警察署や銀行などから運転免許証や銀行口座のVCを再発行してもらう。  
* **市民活動の監査・追跡:** 普段の行政サービス利用時は匿名性の高いZKPを利用する。しかし、社会的な合意形成に基づき、監査や不正調査が必要な場合に限り、市民がウォレットから「監査に必要な識別可能な情報（例：その取引に紐づく監査用ID）を含む、別の種類のZKP」を自治体に提示する。これにより、「普段は匿名だが、監査時のみ追跡可能」なハイブリッドな匿名性を実現する。このモデルは、プライバシーと説明責任のバランスを取る革新的なアプローチである。  
* **サービス提供者の監査・責任追及:** サービス提供者は、法務省発行の法人VCや自治体発行の住民VCを事前に行政に提出する。これにより、サービス提供者の身元と責任が保証され、不正行為が発生した際には、そのVCに紐づくDIDを通じて責任を追及することが可能となる。

## 4. 既存技術との比較と設計上の優位性

AMATELUSは、既存の都市OSモデルやID管理システムと比較して、以下の設計上の優位性を持つ。

* **究極のプライバシー保護:** X-RoadやFIWAREがデータ交換時のセキュリティとアクセス制御を重視するのに対し、AMATELUSはZKPを核とすることで、データ内容そのものを開示せずに証明する、より深いレベルのプライバシー保護を実現する。これにより、プロファイリングや不要な情報漏洩のリスクを極限まで低減する。  
* **徹底した自己主権的DID運用:** DIDドキュメントの不変性、サービスごとのDID利用、鍵更新に伴うDID変更といった独自のDIDライフサイクルモデルは、市民が自身のIDを完全にコントロールする真の自己主権性を追求する。  
* **検証可能な「信頼できない」サービス活用:** ZKPとE2E-Vにより、信頼できない第三者（匿名エンジニア/ベンダー）が行政サービスを提供することを可能とし、その処理の正当性を暗号学的に検証可能にする。これは、行政の特定のベンダー依存を排除し、イノベーションを促進する。  
* **設計段階からの耐量子計算機暗号の統合:** 将来の量子コンピュータの脅威に対する先見的な防御策を、システム設計の核として組み込んでいる。

## 5. 未来の市民生活とAIエージェントの役割

AMATELUSが実現する未来の市民生活は、極めて高いプライバシーと利便性を両立する。

* **シームレスなデジタル体験:** 市民は、行政サービスから民間サービスまで、自身のDIDとVCsを基盤としたシームレスなデジタル体験を享受できる。  
* **AIエージェントによるUXの解決:**  
  * **ウォレット管理の自動化:** 個人や法人が所有するAIエージェントが、バックグラウンドでDIDの生成・選択・切り替え、VCの再発行要求、ZKPの事前生成・提示といった複雑なプロセスを自動的に処理する。これにより、市民はDID/VCsの管理やZKP生成の詳細を意識することなく、高いレベルのプライバシー保護と利便性を享受できる。  
  * **AIモデルとデバイスの自由:** 利用者は自身の責任において、任意のAIモデル、ウォレット、端末（スマートフォン、ARグラスなど）を選択・管理し、AMATELUSネットワークに参加できる。AMATELUS自体はAIエージェントに直接関与せず、中立的なプロトコルとして機能することで、オープンなエコシステムとイノベーションを促進する。

## 6. 結論と今後の展望

AMATELUSは、既存の都市OSモデルやID管理システムの課題に対し、DIDの不変性と寿命、VC再発行の許容、信頼できないサービス提供者の活用、そしてAIエージェントによるUXの解決という組み合わせは、未来のデジタルガバナンスにおける新たなパラダイムを示唆する。

しかし、この設計の実現には、以下のような継続的な研究と社会的な努力が不可欠である。

* **PQC ZKP技術のさらなる成熟と最適化:** モバイル環境での実用的なZKP生成時間と証明サイズの実現。  
* **VC再発行モデルの運用体制確立:** 行政、金融機関等におけるコストと業務プロセスの詳細設計、および法的な位置づけの明確化。  
* **ユーザー体験の徹底的な追求:** AIエージェントを活用したシームレスな体験設計と、ITリテラシー格差への対応。  
* **社会合意形成と法的・制度的枠組みの整備:** 高い匿名性と監査・追跡のバランスに対する市民の理解と同意、および既存の法規制との整合性。  
* **AMATELUSプロトコルの詳細な仕様策定と標準化:** 相互運用性を保証するための、厳格なプロトコル定義と参照実装の開発。

自己主権と暗号的検証性を設計の根幹に据えたAMATELUSは、分散的でレジリエントかつ市民主導のガバナンスを向上させる実装可能なプロトコルである。

## 参考文献

* [Decentralized Identifiers (DIDs) v1.0](https://www.w3.org/TR/did-core/)
* [Verifiable Credentials Data Model 1.1](https://www.w3.org/TR/vc-data-model/)
* A. Tobin and D. Reed, "The Inevitable Rise of Self-Sovereign Identity," Sovrin Foundation, 2017.
* [X-Road](https://x-road.global/)
* [FIWARE Open Source Platform](https://www.fiware.org/)
* D. J. Bernstein et al., "Post-Quantum Zero-Knowledge Proofs," PQCrypto 2020.
* D. J. Bernstein and T. Lange, "Post-Quantum Cryptography," Nature, 2017.
* Jens Groth, "On the Size of Pairing-based Non-interactive Arguments," EUROCRYPT 2016.
* S. Goldwasser et al., "The Knowledge Complexity of Interactive Proof Systems," SIAM J. on Computing, 1989.
