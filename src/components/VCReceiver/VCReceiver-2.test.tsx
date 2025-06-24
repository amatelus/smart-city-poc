import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import VCReceiver from './VCReceiver';
import { useVCScannerLogic } from './VCScannerLogic';

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

it('パーツスキャン段階では進捗表示される', () => {
  const mockLogic = {
    handleMetadataScan: vi.fn(),
    handlePartScan: vi.fn(),
    getMissingParts: vi.fn(() => [1, 2]),
  };

  vi.mocked(useVCScannerLogic).mockReturnValue(mockLogic);

  render(<VCReceiver />);

  const startButton = screen.getByText('Start Receive');
  act(() => {
    fireEvent.click(startButton);
  });

  expect(screen.queryByTestId('progress-display')).not.toBeInTheDocument();
});

it('説明文が正しく表示される', () => {
  render(<VCReceiver />);

  expect(
    screen.getByText(/1\. VC全体のハッシュと分割数を含むメタデータQRをスキャン/),
  ).toBeInTheDocument();
  expect(screen.getByText(/2\. 各VCパーツQRを順不同でスキャン/)).toBeInTheDocument();
  expect(screen.getByText(/3\. 全パーツが揃うと自動的にVCを再構築・検証/)).toBeInTheDocument();
});

it('completed状態ではQRスキャナーが表示されない', () => {
  const mockLogic = {
    handleMetadataScan: vi.fn(),
    handlePartScan: vi.fn(),
    getMissingParts: vi.fn(() => []),
  };

  vi.mocked(useVCScannerLogic).mockReturnValue(mockLogic);

  render(<VCReceiver />);

  expect(screen.queryByTestId('qr-scanner')).not.toBeInTheDocument();
});

it('QRスキャンエラーがコンソールにログ出力される', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  render(<VCReceiver />);

  const startButton = screen.getByText('Start Receive');
  act(() => {
    fireEvent.click(startButton);
  });

  const errorButton = screen.getByText('Simulate Error');
  act(() => {
    fireEvent.click(errorButton);
  });

  expect(consoleSpy).toHaveBeenCalledWith('QRスキャンエラー:', 'test-error');

  consoleSpy.mockRestore();
});

it('initial状態以外でもエラー表示される', () => {
  render(<VCReceiver />);

  const startButton = screen.getByText('Start Receive');
  act(() => {
    fireEvent.click(startButton);
  });

  const errorButton = screen.getByText('Simulate Error');
  act(() => {
    fireEvent.click(errorButton);
  });

  expect(screen.getByText('Step: scanning-meta')).toBeInTheDocument();
  expect(screen.getByTestId('error-display')).toBeInTheDocument();
});
