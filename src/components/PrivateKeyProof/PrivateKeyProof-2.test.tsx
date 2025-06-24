import { act, fireEvent, render, screen } from '@testing-library/react';
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

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

it('QRスキャナーの閉じるボタンで初期状態に戻る', () => {
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

  expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();

  const closeButton = screen.getByTestId('close-button');

  act(() => {
    fireEvent.click(closeButton);
  });

  expect(screen.queryByTestId('qr-scanner')).not.toBeInTheDocument();
  expect(screen.getByText('本人認証を開始')).toBeInTheDocument();
});

it('QRスキャンエラー時にアラートが表示される', () => {
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

  const errorButton = screen.getByTestId('error-button');

  act(() => {
    fireEvent.click(errorButton);
  });

  expect(window.alert).toHaveBeenCalledWith('QRコードの読み取りに失敗しました。');
});
