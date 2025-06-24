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
const testDID2 = generateDID();

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

it('本人確認用QRコードのタイトルが表示される', () => {
  saveDIDToStorage(testDID1);

  render(<PublicKeyQRCode />);

  expect(screen.getByText('本人確認用QRコード')).toBeInTheDocument();
});

it('説明文が表示される', () => {
  saveDIDToStorage(testDID1);

  render(<PublicKeyQRCode />);

  expect(
    screen.getByText(/自治体窓口での本人確認時に使用するQRコードを生成します/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/このQRコードには、バージョン番号と公開鍵が含まれます/),
  ).toBeInTheDocument();
});

it('DID選択ラベルとセレクトボックスが表示される', () => {
  saveDIDToStorage(testDID1);

  render(<PublicKeyQRCode />);

  expect(screen.getByText('DIDを選択:')).toBeInTheDocument();
  expect(screen.getByRole('combobox')).toBeInTheDocument();
  expect(screen.getByText('-- DIDを選択してください --')).toBeInTheDocument();
});

it('利用可能なDIDがセレクトボックスに表示される', () => {
  saveDIDToStorage(testDID1);
  saveDIDToStorage(testDID2);

  render(<PublicKeyQRCode />);

  const selectElement = screen.getByRole('combobox');
  expect(selectElement).toBeInTheDocument();

  const options = screen.getAllByRole('option');
  expect(options).toHaveLength(3);
});

it('DIDが存在しない場合にメッセージが表示される', () => {
  render(<PublicKeyQRCode />);

  expect(
    screen.getByText('利用可能なDIDがありません。DID管理画面でDIDを作成してください。'),
  ).toBeInTheDocument();
});

it('QRコード表示ボタンが表示される', () => {
  saveDIDToStorage(testDID1);

  render(<PublicKeyQRCode />);

  expect(screen.getByText('本人確認用QRコードを表示')).toBeInTheDocument();
});

it('DIDが選択されていない場合にQRコード表示ボタンが無効になる', () => {
  saveDIDToStorage(testDID1);

  render(<PublicKeyQRCode />);

  const button = screen.getByText('本人確認用QRコードを表示');
  expect(button).toBeDisabled();
});

it('DIDを選択するとQRコード表示ボタンが有効になる', () => {
  saveDIDToStorage(testDID1);

  render(<PublicKeyQRCode />);

  const selectElement = screen.getByRole('combobox');

  act(() => {
    fireEvent.change(selectElement, { target: { value: testDID1.doc.id } });
  });

  const button = screen.getByText('本人確認用QRコードを表示');
  expect(button).not.toBeDisabled();
});

it('正常にQRコードが生成され表示される', () => {
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

  expect(screen.getAllByText('本人確認用QRコード')).toHaveLength(2);
  expect(screen.getByTestId('qr-code')).toBeInTheDocument();
});

it('QRコードに正しいデータが含まれている', () => {
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

  const qrCode = screen.getByTestId('qr-code');
  const qrValue = qrCode.getAttribute('data-value');

  expect(qrValue).toBeTruthy();

  const qrData = JSON.parse(qrValue!) as [number, string];
  expect(qrData).toHaveLength(2);
  expect(qrData[0]).toBe(1);
  expect(qrData[1]).toBe(testDID1.publicKey);
});
