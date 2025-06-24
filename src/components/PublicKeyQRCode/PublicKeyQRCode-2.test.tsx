import { act, fireEvent, render, screen } from '@testing-library/react';
import { generateDID, saveDIDToStorage } from 'src/utils/did';
import { beforeEach, expect, it, vi } from 'vitest';
import PublicKeyQRCode from './PublicKeyQRCode';

vi.mock('qrcode.react', () => ({
  QRCodeSVG: vi.fn(({ value, size, level }: { value: string; size: number; level: number }) => (
    <div data-testid="qr-code" data-value={value} data-size={size} data-level={level}>
      QRコード: {value}
    </div>
  )),
}));

const testDID1 = generateDID();

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

it('QRコードモーダルに説明文とデータプレビューが表示される', () => {
  saveDIDToStorage(testDID1);

  render(<PublicKeyQRCode />);

  const selectElement = screen.getByRole('combobox');

  act(() => {
    fireEvent.change(selectElement, { target: { value: testDID1.doc.id } });
  });

  const button = screen.getByText('本人確認用QRコードを表示');

  act(() => {
    fireEvent.click(button);
  });

  expect(screen.getByText('データ構造:')).toBeInTheDocument();
  expect(screen.getByText('[バージョン, 公開鍵]')).toBeInTheDocument();
  expect(screen.getByText('使用方法:')).toBeInTheDocument();
  expect(
    screen.getByText(/自治体の担当者にこのQRコードをスキャンしてもらってください/),
  ).toBeInTheDocument();
  expect(screen.getByText('QRコードデータ:')).toBeInTheDocument();
  expect(screen.getByText(/^\[1,/)).toBeInTheDocument();
});

it('閉じるボタンをクリックするとQRコードモーダルが閉じる', () => {
  saveDIDToStorage(testDID1);

  render(<PublicKeyQRCode />);

  const selectElement = screen.getByRole('combobox');

  act(() => {
    fireEvent.change(selectElement, { target: { value: testDID1.doc.id } });
  });

  const button = screen.getByText('本人確認用QRコードを表示');

  act(() => {
    fireEvent.click(button);
  });

  expect(screen.getByTestId('qr-code')).toBeInTheDocument();

  const closeButton = screen.getByText('✕');

  act(() => {
    fireEvent.click(closeButton);
  });

  expect(screen.queryByTestId('qr-code')).not.toBeInTheDocument();
});
