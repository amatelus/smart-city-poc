import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import VCReceiver from './VCReceiver';

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
        <button onClick={() => onScan('test-scan-result')}>Simulate Scan</button>
        <button onClick={() => onError('test-error')}>Simulate Error</button>
        <button onClick={() => onClose()}>Close Scanner</button>
      </div>
    ),
  ),
}));

vi.mock('./VCErrorDisplay', () => ({
  default: vi.fn(({ error, onReset }: { error: string; onReset: () => void }) => (
    <div data-testid="error-display">
      <span>Error: {error}</span>
      <button onClick={onReset}>Reset</button>
    </div>
  )),
}));

vi.mock('./VCScanningSteps', () => ({
  default: vi.fn(
    ({
      step,
      onStartReceive,
      onResetAndRestart,
    }: {
      step: number;
      onStartReceive: () => void;
      onResetAndRestart: () => void;
    }) => (
      <div data-testid="scanning-steps">
        <span>Step: {step}</span>
        <button onClick={onStartReceive}>Start Receive</button>
        <button onClick={onResetAndRestart}>Reset And Restart</button>
      </div>
    ),
  ),
  VCProgressDisplay: vi.fn(
    ({
      progress,
      missingParts,
    }: {
      progress: { current: number; total: number };
      missingParts: string[];
    }) => (
      <div data-testid="progress-display">
        <span>
          Progress: {progress.current}/{progress.total}
        </span>
        <span>Missing: {missingParts.join(', ')}</span>
      </div>
    ),
  ),
}));

vi.mock('./VCScannerLogic', () => ({
  useVCScannerLogic: vi.fn(() => ({
    handleMetadataScan: vi.fn(),
    handlePartScan: vi.fn(),
    getMissingParts: vi.fn(() => []),
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

it('初期状態で適切に表示される', () => {
  render(<VCReceiver />);

  expect(screen.getByText('大容量VC受信')).toBeInTheDocument();
  expect(screen.getByText(/自治体から大容量VCを分割QRコードで受け取ります/)).toBeInTheDocument();
  expect(screen.getByTestId('scanning-steps')).toBeInTheDocument();
  expect(screen.getByText('Step: initial')).toBeInTheDocument();
});

it('VC受信開始ボタンをクリックするとスキャニング状態に変わる', () => {
  render(<VCReceiver />);

  const startButton = screen.getByText('Start Receive');

  act(() => {
    fireEvent.click(startButton);
  });

  expect(screen.getByText('Step: scanning-meta')).toBeInTheDocument();
  expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
});

it('QRスキャナーでエラーが発生するとエラー表示される', () => {
  render(<VCReceiver />);

  const startButton = screen.getByText('Start Receive');
  act(() => {
    fireEvent.click(startButton);
  });

  const errorButton = screen.getByText('Simulate Error');
  act(() => {
    fireEvent.click(errorButton);
  });

  expect(screen.getByTestId('error-display')).toBeInTheDocument();
  expect(screen.getByText('Error: QRコードの読み取りに失敗しました。')).toBeInTheDocument();
});

it('QRスキャナーを閉じると初期状態に戻る', () => {
  render(<VCReceiver />);

  const startButton = screen.getByText('Start Receive');
  act(() => {
    fireEvent.click(startButton);
  });

  expect(screen.getByText('Step: scanning-meta')).toBeInTheDocument();

  const closeButton = screen.getByText('Close Scanner');
  act(() => {
    fireEvent.click(closeButton);
  });

  expect(screen.getByText('Step: initial')).toBeInTheDocument();
  expect(screen.queryByTestId('qr-scanner')).not.toBeInTheDocument();
});

it('エラーリセットボタンをクリックすると初期状態に戻る', () => {
  render(<VCReceiver />);

  const startButton = screen.getByText('Start Receive');
  act(() => {
    fireEvent.click(startButton);
  });

  const errorButton = screen.getByText('Simulate Error');
  act(() => {
    fireEvent.click(errorButton);
  });

  expect(screen.getByTestId('error-display')).toBeInTheDocument();

  const resetButton = screen.getByText('Reset');
  act(() => {
    fireEvent.click(resetButton);
  });

  expect(screen.getByText('Step: initial')).toBeInTheDocument();
  expect(screen.queryByTestId('error-display')).not.toBeInTheDocument();
});

it('リセットアンドリスタートボタンが機能する', () => {
  render(<VCReceiver />);

  const resetRestartButton = screen.getByText('Reset And Restart');
  act(() => {
    fireEvent.click(resetRestartButton);
  });

  expect(screen.getByText('Step: initial')).toBeInTheDocument();
});

it('メタデータスキャン段階では進捗表示されない', () => {
  render(<VCReceiver />);

  const startButton = screen.getByText('Start Receive');
  act(() => {
    fireEvent.click(startButton);
  });

  expect(screen.getByText('Step: scanning-meta')).toBeInTheDocument();
  expect(screen.queryByTestId('progress-display')).not.toBeInTheDocument();
});
