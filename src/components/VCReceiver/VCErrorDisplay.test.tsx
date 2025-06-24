import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import VCErrorDisplay from './VCErrorDisplay';

const mockProps = {
  error: 'テストエラーメッセージ',
  onReset: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

it('エラーメッセージが表示される', () => {
  render(<VCErrorDisplay {...mockProps} />);

  expect(screen.getByText('エラー:')).toBeInTheDocument();
  expect(screen.getByText('テストエラーメッセージ')).toBeInTheDocument();
});

it('やり直しボタンが表示される', () => {
  render(<VCErrorDisplay {...mockProps} />);

  expect(screen.getByText('最初からやり直し')).toBeInTheDocument();
});

it('やり直しボタンをクリックすると onReset が呼ばれる', () => {
  render(<VCErrorDisplay {...mockProps} />);

  const resetButton = screen.getByText('最初からやり直し');

  act(() => {
    fireEvent.click(resetButton);
  });

  expect(mockProps.onReset).toHaveBeenCalled();
});

it('異なるエラーメッセージが正しく表示される', () => {
  const customProps = {
    ...mockProps,
    error: 'カスタムエラー',
  };

  render(<VCErrorDisplay {...customProps} />);

  expect(screen.getByText('カスタムエラー')).toBeInTheDocument();
  expect(screen.queryByText('テストエラーメッセージ')).not.toBeInTheDocument();
});

it('空のエラーメッセージでも正しく表示される', () => {
  const propsWithEmptyError = {
    ...mockProps,
    error: '',
  };

  render(<VCErrorDisplay {...propsWithEmptyError} />);

  expect(screen.getByText('エラー:')).toBeInTheDocument();
  expect(screen.getByText('最初からやり直し')).toBeInTheDocument();
});

it('長いエラーメッセージが正しく表示される', () => {
  const longError =
    'これは非常に長いエラーメッセージです。このメッセージは複数行にわたって表示される可能性があります。';
  const propsWithLongError = {
    ...mockProps,
    error: longError,
  };

  render(<VCErrorDisplay {...propsWithLongError} />);

  expect(screen.getByText(longError)).toBeInTheDocument();
});

it('特殊文字を含むエラーメッセージが正しく表示される', () => {
  const specialCharError =
    'エラー: <script>alert("test")</script> & 特殊文字 "引用符" \'シングル\'';
  const propsWithSpecialChar = {
    ...mockProps,
    error: specialCharError,
  };

  render(<VCErrorDisplay {...propsWithSpecialChar} />);

  expect(screen.getByText(specialCharError)).toBeInTheDocument();
});

it('onReset関数が複数回呼び出される', () => {
  render(<VCErrorDisplay {...mockProps} />);

  const resetButton = screen.getByText('最初からやり直し');

  act(() => {
    fireEvent.click(resetButton);
    fireEvent.click(resetButton);
    fireEvent.click(resetButton);
  });

  expect(mockProps.onReset).toHaveBeenCalledTimes(3);
});
