import { beforeEach, expect, it, vi } from 'vitest';
import { useVCScannerLogic } from './VCScannerLogic';

vi.mock('src/utils/vc', () => ({
  saveVCToStorage: vi.fn(),
}));

const mockMetadata = {
  hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  totalParts: 3,
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

it('重複するパーツインデックスを処理できる', () => {
  const propsWithMetadata = {
    ...mockProps,
    vcMetadata: mockMetadata,
    vcParts: new Map([[0, 'original-part']]),
  };

  const logic = useVCScannerLogic(propsWithMetadata);

  const partJson = JSON.stringify([0, 'new-part']);
  logic.handlePartScan(partJson);

  expect(mockProps.onPartAdded).toHaveBeenCalled();
  expect(mockProps.onProgressUpdate).toHaveBeenCalledWith(1, 3);
});

it('メタデータの形式が正しくない場合にエラーが発生する', () => {
  const logic = useVCScannerLogic(mockProps);

  const invalidMetadata = JSON.stringify({ invalid: 'format' });
  logic.handleMetadataScan(invalidMetadata);

  expect(mockProps.onError).toHaveBeenCalledWith('無効なVC メタデータです。');
});

it('パーツデータの形式が配列でない場合にエラーが発生する', () => {
  const propsWithMetadata = {
    ...mockProps,
    vcMetadata: mockMetadata,
  };

  const logic = useVCScannerLogic(propsWithMetadata);

  const invalidPart = JSON.stringify({ index: 0, data: 'test' });
  logic.handlePartScan(invalidPart);

  expect(mockProps.onError).toHaveBeenCalledWith(
    '無効なVCパーツデータです。形式は [index, data] である必要があります。',
  );
});
