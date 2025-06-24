import { act, fireEvent, render, screen } from '@testing-library/react';
import { generateDID } from 'src/utils/did';
import { createSampleResidentVC } from 'src/utils/vc';
import { beforeEach, expect, it, vi } from 'vitest';
import VCAddModal from './VCAddModal';

const testDID = generateDID();
const sampleVC = createSampleResidentVC(testDID.doc.id);

const mockProps = {
  selectedDID: testDID.doc.id,
  vcJsonInput: '',
  error: '',
  onVcJsonInputChange: vi.fn(),
  onError: vi.fn(),
  onVCsUpdate: vi.fn(),
  onClose: vi.fn(),
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

it('VC追加モーダルのタイトルが表示される', () => {
  render(<VCAddModal {...mockProps} />);

  expect(screen.getByText('VC追加')).toBeInTheDocument();
});

it('閉じるボタンが表示される', () => {
  render(<VCAddModal {...mockProps} />);

  expect(screen.getByText('✕')).toBeInTheDocument();
});

it('VC JSON入力フィールドが表示される', () => {
  render(<VCAddModal {...mockProps} />);

  expect(screen.getByText('VC JSON:')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('VCのJSON形式データを貼り付けてください')).toBeInTheDocument();
});

it('追加ボタンとキャンセルボタンが表示される', () => {
  render(<VCAddModal {...mockProps} />);

  expect(screen.getByText('追加')).toBeInTheDocument();
  expect(screen.getByText('キャンセル')).toBeInTheDocument();
});

it('入力値が空の場合に追加ボタンが無効になる', () => {
  render(<VCAddModal {...mockProps} />);

  const addButton = screen.getByText('追加');
  expect(addButton).toBeDisabled();
});

it('入力値がある場合に追加ボタンが有効になる', () => {
  const propsWithInput = {
    ...mockProps,
    vcJsonInput: 'test input',
  };

  render(<VCAddModal {...propsWithInput} />);

  const addButton = screen.getByText('追加');
  expect(addButton).not.toBeDisabled();
});

it('テキストエリアに入力すると onVcJsonInputChange が呼ばれる', () => {
  render(<VCAddModal {...mockProps} />);

  const textarea = screen.getByPlaceholderText('VCのJSON形式データを貼り付けてください');

  act(() => {
    fireEvent.change(textarea, { target: { value: 'test input' } });
  });

  expect(mockProps.onVcJsonInputChange).toHaveBeenCalledWith('test input');
});

it('閉じるボタンをクリックすると onClose が呼ばれる', () => {
  render(<VCAddModal {...mockProps} />);

  const closeButton = screen.getByText('✕');

  act(() => {
    fireEvent.click(closeButton);
  });

  expect(mockProps.onVcJsonInputChange).toHaveBeenCalledWith('');
  expect(mockProps.onError).toHaveBeenCalledWith('');
  expect(mockProps.onClose).toHaveBeenCalled();
});

it('キャンセルボタンをクリックすると onClose が呼ばれる', () => {
  render(<VCAddModal {...mockProps} />);

  const cancelButton = screen.getByText('キャンセル');

  act(() => {
    fireEvent.click(cancelButton);
  });

  expect(mockProps.onVcJsonInputChange).toHaveBeenCalledWith('');
  expect(mockProps.onError).toHaveBeenCalledWith('');
  expect(mockProps.onClose).toHaveBeenCalled();
});

it('DIDが選択されていない場合にエラーが表示される', () => {
  const propsWithoutDID = {
    ...mockProps,
    selectedDID: null,
    vcJsonInput: JSON.stringify(sampleVC),
  };

  render(<VCAddModal {...propsWithoutDID} />);

  const addButton = screen.getByText('追加');

  act(() => {
    fireEvent.click(addButton);
  });

  expect(mockProps.onError).toHaveBeenCalledWith('DIDを選択してください。');
});

it('無効なJSON形式の場合にエラーが表示される', () => {
  const propsWithInvalidJson = {
    ...mockProps,
    vcJsonInput: 'invalid json',
  };

  render(<VCAddModal {...propsWithInvalidJson} />);

  const addButton = screen.getByText('追加');

  act(() => {
    fireEvent.click(addButton);
  });

  expect(mockProps.onError).toHaveBeenCalledWith('無効なVCフォーマットです。');
});

it('有効なVCデータで追加が成功する', () => {
  const propsWithValidVC = {
    ...mockProps,
    vcJsonInput: JSON.stringify(sampleVC),
  };

  render(<VCAddModal {...propsWithValidVC} />);

  const addButton = screen.getByText('追加');

  act(() => {
    fireEvent.click(addButton);
  });

  expect(mockProps.onError).toHaveBeenCalledWith('');
  expect(mockProps.onVCsUpdate).toHaveBeenCalled();
  expect(mockProps.onVcJsonInputChange).toHaveBeenCalledWith('');
  expect(mockProps.onClose).toHaveBeenCalled();
});

it('エラーメッセージが表示される', () => {
  const propsWithError = {
    ...mockProps,
    error: 'テストエラーメッセージ',
  };

  render(<VCAddModal {...propsWithError} />);

  expect(screen.getByText('テストエラーメッセージ')).toBeInTheDocument();
});

it('エラーがない場合はエラーメッセージが表示されない', () => {
  render(<VCAddModal {...mockProps} />);

  const errorElements = screen.queryAllByText(/エラー/);
  expect(errorElements).toHaveLength(0);
});

it('vcJsonInputの値がテキストエリアに表示される', () => {
  const propsWithInput = {
    ...mockProps,
    vcJsonInput: 'test vc data',
  };

  render(<VCAddModal {...propsWithInput} />);

  const textarea = screen.getByDisplayValue('test vc data');
  expect(textarea).toBeInTheDocument();
});
