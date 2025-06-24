import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import QRScanner from './QRScanner';

const mockRender = vi.fn();
const mockClear = vi.fn().mockResolvedValue(undefined);

vi.mock('html5-qrcode', () => ({
  Html5QrcodeScanner: vi.fn(() => ({
    render: mockRender,
    clear: mockClear,
  })),
}));

const mockOnScan = vi.fn();
const mockOnError = vi.fn();
const mockOnClose = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockRender.mockClear();
  mockClear.mockClear();
});

it('QRスキャナーのタイトルが表示される', () => {
  render(<QRScanner onScan={mockOnScan} onClose={mockOnClose} />);

  expect(screen.getByText('QRコードをスキャン')).toBeInTheDocument();
});

it('スキャン指示メッセージが表示される', () => {
  render(<QRScanner onScan={mockOnScan} onClose={mockOnClose} />);

  expect(screen.getByText('カメラをQRコードに向けてください')).toBeInTheDocument();
});

it('QRリーダー要素が存在する', () => {
  render(<QRScanner onScan={mockOnScan} onClose={mockOnClose} />);

  const qrReaderElement = document.getElementById('qr-reader');
  expect(qrReaderElement).toBeInTheDocument();
});

it('閉じるボタンが表示される', () => {
  render(<QRScanner onScan={mockOnScan} onClose={mockOnClose} />);

  expect(screen.getByText('✕')).toBeInTheDocument();
});

it('閉じるボタンクリック時にonCloseが呼ばれる', () => {
  render(<QRScanner onScan={mockOnScan} onClose={mockOnClose} />);

  const closeButton = screen.getByText('✕');
  fireEvent.click(closeButton);

  expect(mockOnClose).toHaveBeenCalled();
});

it('閉じるボタンクリック時にスキャナーがクリアされる', () => {
  render(<QRScanner onScan={mockOnScan} onClose={mockOnClose} />);

  const closeButton = screen.getByText('✕');
  fireEvent.click(closeButton);

  expect(mockClear).toHaveBeenCalled();
});

it('QRコードスキャン成功時にonScanが呼ばれる', () => {
  render(<QRScanner onScan={mockOnScan} onClose={mockOnClose} />);

  expect(mockRender).toHaveBeenCalled();

  const [successCallback] = mockRender.mock.calls[0] as [
    (data: string) => void,
    (msg: string) => void,
  ];
  const testQRData = 'test-qr-data';

  successCallback(testQRData);

  expect(mockOnScan).toHaveBeenCalledWith(testQRData);
});

it('QRコードスキャン成功後にスキャナーが停止される', () => {
  render(<QRScanner onScan={mockOnScan} onClose={mockOnClose} />);

  const [successCallback] = mockRender.mock.calls[0] as [
    (data: string) => void,
    (msg: string) => void,
  ];

  successCallback('test-data');

  expect(mockClear).toHaveBeenCalled();
});

it('QRコードが見つからないエラーは無視される', () => {
  render(<QRScanner onScan={mockOnScan} onError={mockOnError} onClose={mockOnClose} />);

  const [, errorCallback] = mockRender.mock.calls[0] as [
    (data: string) => void,
    (msg: string) => void,
  ];

  errorCallback('No QR code found');

  expect(mockOnError).not.toHaveBeenCalled();
});

it('その他のエラー時にonErrorが呼ばれる', () => {
  render(<QRScanner onScan={mockOnScan} onError={mockOnError} onClose={mockOnClose} />);

  const [, errorCallback] = mockRender.mock.calls[0] as [
    (data: string) => void,
    (msg: string) => void,
  ];
  const testError = 'Camera permission denied';

  errorCallback(testError);

  expect(mockOnError).toHaveBeenCalledWith(testError);
});

it('onErrorプロパティが省略されてもエラーにならない', () => {
  render(<QRScanner onScan={mockOnScan} onClose={mockOnClose} />);

  const [, errorCallback] = mockRender.mock.calls[0] as [
    (data: string) => void,
    (msg: string) => void,
  ];

  expect(() => {
    errorCallback('Some error');
  }).not.toThrow();
});

it('コンポーネントアンマウント時にスキャナーがクリアされる', () => {
  const { unmount } = render(<QRScanner onScan={mockOnScan} onClose={mockOnClose} />);

  unmount();

  expect(mockClear).toHaveBeenCalled();
});
