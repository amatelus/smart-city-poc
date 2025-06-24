import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VCScanningSteps, { VCProgressDisplay } from './VCScanningSteps';

const mockProps = {
  step: 'initial' as const,
  progress: { current: 0, total: 0 },
  onStartReceive: vi.fn(),
  onResetAndRestart: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

it('初期状態でVC受信開始ボタンが表示される', () => {
  render(<VCScanningSteps {...mockProps} />);

  expect(screen.getByText('VC受信を開始')).toBeInTheDocument();
});

it('VC受信開始ボタンをクリックすると onStartReceive が呼ばれる', () => {
  render(<VCScanningSteps {...mockProps} />);

  const startButton = screen.getByText('VC受信を開始');

  act(() => {
    fireEvent.click(startButton);
  });

  expect(mockProps.onStartReceive).toHaveBeenCalled();
});

it('メタデータスキャン段階で適切な表示がされる', () => {
  const propsWithMetaStep = {
    ...mockProps,
    step: 'scanning-meta' as const,
  };

  render(<VCScanningSteps {...propsWithMetaStep} />);

  expect(screen.getByText('ステップ1: メタデータQRをスキャン')).toBeInTheDocument();
  expect(
    screen.getByText('VC全体のハッシュ値と分割数情報を含むQRコードをスキャンしてください。'),
  ).toBeInTheDocument();
});

it('パーツスキャン段階で適切な表示がされる', () => {
  const propsWithPartsStep = {
    ...mockProps,
    step: 'scanning-parts' as const,
  };

  render(<VCScanningSteps {...propsWithPartsStep} />);

  expect(screen.getByText('ステップ2: VCパーツQRをスキャン')).toBeInTheDocument();
});

it('完了段階で適切な表示がされる', () => {
  const propsWithCompletedStep = {
    ...mockProps,
    step: 'completed' as const,
  };

  render(<VCScanningSteps {...propsWithCompletedStep} />);

  expect(screen.getByText('✓ VC受信完了')).toBeInTheDocument();
  expect(
    screen.getByText('VCが正常に受信・検証されました。VC管理画面で確認できます。'),
  ).toBeInTheDocument();
  expect(screen.getByText('新しいVC受信を開始')).toBeInTheDocument();
});

it('完了段階で新しいVC受信開始ボタンをクリックすると onResetAndRestart が呼ばれる', () => {
  const propsWithCompletedStep = {
    ...mockProps,
    step: 'completed' as const,
  };

  render(<VCScanningSteps {...propsWithCompletedStep} />);

  const restartButton = screen.getByText('新しいVC受信を開始');

  act(() => {
    fireEvent.click(restartButton);
  });

  expect(mockProps.onResetAndRestart).toHaveBeenCalled();
});

it('各ステップで異なる表示内容が正しく切り替わる', () => {
  const { rerender } = render(<VCScanningSteps {...mockProps} />);

  expect(screen.getByText('VC受信を開始')).toBeInTheDocument();

  rerender(<VCScanningSteps {...mockProps} step="scanning-meta" />);
  expect(screen.getByText('ステップ1: メタデータQRをスキャン')).toBeInTheDocument();

  rerender(<VCScanningSteps {...mockProps} step="scanning-parts" />);
  expect(screen.getByText('ステップ2: VCパーツQRをスキャン')).toBeInTheDocument();

  rerender(<VCScanningSteps {...mockProps} step="completed" />);
  expect(screen.getByText('✓ VC受信完了')).toBeInTheDocument();
});

describe('VCProgressDisplay', () => {
  const progressProps = {
    progress: { current: 3, total: 5 },
    missingParts: [2, 4],
  };

  it('進捗情報が正しく表示される', () => {
    render(<VCProgressDisplay {...progressProps} />);

    expect(screen.getByText('3 / 5 パーツ受信完了')).toBeInTheDocument();
  });

  it('未受信パーツが表示される', () => {
    render(<VCProgressDisplay {...progressProps} />);

    expect(screen.getByText('未受信パーツ:')).toBeInTheDocument();
    expect(screen.getByText('2, 4')).toBeInTheDocument();
  });

  it('進捗バーが正しい幅で表示される', () => {
    render(<VCProgressDisplay {...progressProps} />);

    const progressFill = document.querySelector('[class*="progressFill"]');
    expect(progressFill).toHaveStyle('width: 60%');
  });

  it('未受信パーツがない場合は未受信パーツ情報が表示されない', () => {
    const propsWithoutMissing = {
      ...progressProps,
      missingParts: [],
    };

    render(<VCProgressDisplay {...propsWithoutMissing} />);

    expect(screen.queryByText('未受信パーツ:')).not.toBeInTheDocument();
  });

  it('完了時の進捗表示', () => {
    const completedProps = {
      progress: { current: 5, total: 5 },
      missingParts: [],
    };

    render(<VCProgressDisplay {...completedProps} />);

    expect(screen.getByText('5 / 5 パーツ受信完了')).toBeInTheDocument();

    const progressFill = document.querySelector('[class*="progressFill"]');
    expect(progressFill).toHaveStyle('width: 100%');
  });

  it('開始時の進捗表示', () => {
    const startProps = {
      progress: { current: 0, total: 3 },
      missingParts: [1, 2, 3],
    };

    render(<VCProgressDisplay {...startProps} />);

    expect(screen.getByText('0 / 3 パーツ受信完了')).toBeInTheDocument();
    expect(screen.getByText('1, 2, 3')).toBeInTheDocument();

    const progressFill = document.querySelector('[class*="progressFill"]');
    expect(progressFill).toHaveStyle('width: 0%');
  });
});
