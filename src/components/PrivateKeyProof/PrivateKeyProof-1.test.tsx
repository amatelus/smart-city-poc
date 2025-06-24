import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { generateDID, saveDIDToStorage } from 'src/utils/did';
import { beforeEach, expect, it, vi } from 'vitest';
import PrivateKeyProof from './PrivateKeyProof';

vi.mock('qrcode.react', () => ({
  QRCodeSVG: vi.fn(({ value, size, level }: { value: string; size: number; level: number }) => (
    <div data-testid="qr-code" data-value={value} data-size={size} data-level={level}>
      QRコード: {value}
    </div>
  )),
}));

vi.mock('../QRScanner/QRScanner', () => ({
  default: vi.fn(
    ({
      onScan,
      onError,
      onClose,
    }: {
      onScan: (data: string) => void;
      onError: (msg: string) => void;
      onClose: () => void;
    }) => (
      <div data-testid="qr-scanner">
        <button
          data-testid="scan-button"
          onClick={() => {
            setTimeout(() => onScan('test-nonce'), 0);
          }}
        >
          スキャン
        </button>
        <button data-testid="error-button" onClick={() => onError('スキャンエラー')}>
          エラー
        </button>
        <button data-testid="close-button" onClick={onClose}>
          閉じる
        </button>
      </div>
    ),
  ),
}));

const testDID1 = generateDID();
const testDID2 = generateDID();

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

it('秘密鍵所有権確認のタイトルが表示される', () => {
  saveDIDToStorage(testDID1);

  render(<PrivateKeyProof />);

  expect(screen.getByText('秘密鍵所有権確認')).toBeInTheDocument();
});

it('説明文が表示される', () => {
  saveDIDToStorage(testDID1);

  render(<PrivateKeyProof />);

  expect(screen.getByText(/2段階QRスキャンによる本人認証を行います/)).toBeInTheDocument();
  expect(screen.getByText(/1\. 自治体のNonce QRコードをスキャン/)).toBeInTheDocument();
  expect(screen.getByText(/2\. 署名済みQRコードを提示/)).toBeInTheDocument();
});

it('DID選択ラベルとセレクトボックスが表示される', () => {
  saveDIDToStorage(testDID1);

  render(<PrivateKeyProof />);

  expect(screen.getByText('DIDを選択:')).toBeInTheDocument();
  expect(screen.getByRole('combobox')).toBeInTheDocument();
  expect(screen.getByText('-- DIDを選択してください --')).toBeInTheDocument();
});

it('利用可能なDIDがセレクトボックスに表示される', () => {
  saveDIDToStorage(testDID1);
  saveDIDToStorage(testDID2);

  render(<PrivateKeyProof />);

  const selectElement = screen.getByRole('combobox');
  expect(selectElement).toBeInTheDocument();

  const options = screen.getAllByRole('option');
  expect(options).toHaveLength(3);
});

it('DIDが存在しない場合にメッセージが表示される', () => {
  render(<PrivateKeyProof />);

  expect(
    screen.getByText('利用可能なDIDがありません。DID管理画面でDIDを作成してください。'),
  ).toBeInTheDocument();
});

it('本人認証開始ボタンが表示される', () => {
  saveDIDToStorage(testDID1);

  render(<PrivateKeyProof />);

  expect(screen.getByText('本人認証を開始')).toBeInTheDocument();
});

it('DIDが選択されていない場合に本人認証開始ボタンが無効になる', () => {
  saveDIDToStorage(testDID1);

  render(<PrivateKeyProof />);

  const button = screen.getByText('本人認証を開始');
  expect(button).toBeDisabled();
});

it('DIDを選択すると本人認証開始ボタンが有効になる', () => {
  saveDIDToStorage(testDID1);

  render(<PrivateKeyProof />);

  const selectElement = screen.getByRole('combobox');

  act(() => {
    fireEvent.change(selectElement, { target: { value: testDID1.doc.id } });
  });

  const button = screen.getByText('本人認証を開始');
  expect(button).not.toBeDisabled();
});

it('本人認証開始でQRスキャナーが表示される', () => {
  saveDIDToStorage(testDID1);

  render(<PrivateKeyProof />);

  const selectElement = screen.getByRole('combobox');

  act(() => {
    fireEvent.change(selectElement, { target: { value: testDID1.doc.id } });
  });

  const button = screen.getByText('本人認証を開始');

  act(() => {
    fireEvent.click(button);
  });

  expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
});

it('QRスキャンでNonceを受信完了状態が表示される', async () => {
  saveDIDToStorage(testDID1);

  render(<PrivateKeyProof />);

  const selectElement = screen.getByRole('combobox');

  act(() => {
    fireEvent.change(selectElement, { target: { value: testDID1.doc.id } });
  });

  const startButton = screen.getByText('本人認証を開始');

  act(() => {
    fireEvent.click(startButton);
  });

  const scanButton = screen.getByTestId('scan-button');

  act(() => {
    fireEvent.click(scanButton);
  });

  await waitFor(() => {
    expect(screen.getByText('Nonce受信完了')).toBeInTheDocument();
  });

  expect(screen.getByText('test-nonce')).toBeInTheDocument();
  expect(screen.getByText('署名を生成中...')).toBeInTheDocument();
});
