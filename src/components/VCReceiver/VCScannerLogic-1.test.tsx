import { beforeEach, expect, it, vi } from 'vitest';
import { useVCScannerLogic } from './VCScannerLogic';

vi.mock('src/utils/vc', () => ({
  saveVCToStorage: vi.fn(),
}));

const mockMetadata = {
  hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  totalParts: 3,
};

const mockValidVC = {
  '@context': ['https://www.w3.org/2018/credentials/v1'],
  id: 'urn:uuid:test-123',
  type: ['VerifiableCredential'],
  issuer: 'did:example:issuer',
  issuanceDate: '2023-01-01T00:00:00Z',
  credentialSubject: {
    id: 'did:example:subject',
    name: 'Test Subject',
  },
};

const mockProps = {
  vcMetadata: null,
  vcParts: new Map<number, string>(),
  onMetadataSet: vi.fn(),
  onPartAdded: vi.fn(),
  onProgressUpdate: vi.fn(),
  onError: vi.fn(),
  onCompleted: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

it('初期状態で適切な関数が返される', () => {
  const logic = useVCScannerLogic(mockProps);

  expect(logic.handleMetadataScan).toBeInstanceOf(Function);
  expect(logic.handlePartScan).toBeInstanceOf(Function);
  expect(logic.getMissingParts).toBeInstanceOf(Function);
});

it('有効なメタデータをスキャンすると適切に処理される', () => {
  const logic = useVCScannerLogic(mockProps);

  const metadataJson = JSON.stringify(mockMetadata);
  logic.handleMetadataScan(metadataJson);

  expect(mockProps.onMetadataSet).toHaveBeenCalledWith(mockMetadata);
  expect(mockProps.onProgressUpdate).toHaveBeenCalledWith(0, 3);
});

it('無効なメタデータをスキャンするとエラーが発生する', () => {
  const logic = useVCScannerLogic(mockProps);

  logic.handleMetadataScan('invalid json');

  expect(mockProps.onError).toHaveBeenCalledWith('無効なVC メタデータです。');
});

it('メタデータなしでパーツをスキャンするとエラーが発生する', () => {
  const logic = useVCScannerLogic(mockProps);

  const partJson = JSON.stringify([0, 'part-data']);
  logic.handlePartScan(partJson);

  expect(mockProps.onError).toHaveBeenCalledWith('VC メタデータが読み取られていません。');
});

it('有効なパーツをスキャンすると適切に処理される', () => {
  const propsWithMetadata = {
    ...mockProps,
    vcMetadata: mockMetadata,
  };

  const logic = useVCScannerLogic(propsWithMetadata);

  const partJson = JSON.stringify([0, 'part-data']);
  logic.handlePartScan(partJson);

  expect(mockProps.onPartAdded).toHaveBeenCalled();
  expect(mockProps.onProgressUpdate).toHaveBeenCalledWith(1, 3);
});

it('無効なパーツフォーマットでエラーが発生する', () => {
  const propsWithMetadata = {
    ...mockProps,
    vcMetadata: mockMetadata,
  };

  const logic = useVCScannerLogic(propsWithMetadata);

  logic.handlePartScan('invalid json');

  expect(mockProps.onError).toHaveBeenCalledWith(
    '無効なVCパーツデータです。形式は [index, data] である必要があります。',
  );
});

it('範囲外のパーツインデックスでエラーが発生する', () => {
  const propsWithMetadata = {
    ...mockProps,
    vcMetadata: mockMetadata,
  };

  const logic = useVCScannerLogic(propsWithMetadata);

  const partJson = JSON.stringify([5, 'part-data']);
  logic.handlePartScan(partJson);

  expect(mockProps.onError).toHaveBeenCalledWith('無効なパーツインデックスです。有効範囲: 0-2');
});

it('getMissingPartsがメタデータなしで空配列を返す', () => {
  const logic = useVCScannerLogic(mockProps);

  const missingParts = logic.getMissingParts();

  expect(missingParts).toEqual([]);
});

it('getMissingPartsが未受信パーツを正しく返す', () => {
  const partsWithData = new Map([
    [0, 'part0'],
    [2, 'part2'],
  ]);
  const propsWithData = {
    ...mockProps,
    vcMetadata: mockMetadata,
    vcParts: partsWithData,
  };

  const logic = useVCScannerLogic(propsWithData);

  const missingParts = logic.getMissingParts();

  expect(missingParts).toEqual([1]);
});

it('全パーツ受信完了時にVC再構築が実行される', () => {
  const vcString = JSON.stringify(mockValidVC);
  const parts = new Map([
    [0, vcString.slice(0, 10)],
    [1, vcString.slice(10, 20)],
    [2, vcString.slice(20)],
  ]);

  vi.doMock('js-sha3', () => {
    const fn = (): string => mockMetadata.hash;

    return { sha3_256: vi.fn(fn) };
  });

  const propsWithAllParts = {
    ...mockProps,
    vcMetadata: mockMetadata,
    vcParts: parts,
  };

  const logic = useVCScannerLogic(propsWithAllParts);

  const partJson = JSON.stringify([1, 'test']);
  logic.handlePartScan(partJson);

  expect(mockProps.onProgressUpdate).toHaveBeenCalled();
});

it('パーツが不足している場合にエラーが発生する', () => {
  const incompleteMetadata = { ...mockMetadata, totalParts: 3 };
  const corruptedParts = new Map([
    [0, 'part0'],
    [1, 'part1'],
    [2, undefined as unknown as string],
  ]);

  const propsWithCorrupted = {
    ...mockProps,
    vcMetadata: incompleteMetadata,
    vcParts: corruptedParts,
  };

  const logic = useVCScannerLogic(propsWithCorrupted);

  const partJson = JSON.stringify([1, 'updated-part1']);
  logic.handlePartScan(partJson);

  expect(mockProps.onError).toHaveBeenCalledWith('パーツ 2 が見つかりません。');
});
