import { act, fireEvent, render, screen } from '@testing-library/react';
import { generateDID } from 'src/utils/did';
import { beforeEach, expect, it, vi } from 'vitest';
import VCDIDSelector from './VCDIDSelector';

const testDID1 = generateDID();
const testDID2 = generateDID();

const mockProps = {
  allDIDs: [testDID1, testDID2],
  selectedDID: null,
  onDIDSelect: vi.fn(),
  onError: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

it('DID選択ラベルが表示される', () => {
  render(<VCDIDSelector {...mockProps} />);

  expect(screen.getByText('DIDを選択:')).toBeInTheDocument();
});

it('セレクトボックスが表示される', () => {
  render(<VCDIDSelector {...mockProps} />);

  expect(screen.getByRole('combobox')).toBeInTheDocument();
});

it('利用可能なDIDがオプションとして表示される', () => {
  render(<VCDIDSelector {...mockProps} />);

  const options = screen.getAllByRole('option');
  expect(options).toHaveLength(2);

  expect(screen.getAllByText(/\.\.\./)).toHaveLength(2);
});

it('選択されたDIDが反映される', () => {
  const propsWithSelected = {
    ...mockProps,
    selectedDID: testDID1.doc.id,
  };

  render(<VCDIDSelector {...propsWithSelected} />);

  const select = screen.getByRole<HTMLSelectElement>('combobox');
  expect(select.value).toBe(testDID1.doc.id);
});

it('DIDを選択すると onDIDSelect が呼ばれる', () => {
  render(<VCDIDSelector {...mockProps} />);

  const select = screen.getByRole('combobox');

  act(() => {
    fireEvent.change(select, { target: { value: testDID1.doc.id } });
  });

  expect(mockProps.onDIDSelect).toHaveBeenCalledWith(testDID1.doc.id);
});

it('DID選択時に onError が空文字で呼ばれる', () => {
  render(<VCDIDSelector {...mockProps} />);

  const select = screen.getByRole('combobox');

  act(() => {
    fireEvent.change(select, { target: { value: testDID1.doc.id } });
  });

  expect(mockProps.onError).toHaveBeenCalledWith('');
});

it('利用可能なDIDがない場合にメッセージが表示される', () => {
  const propsWithNoDIDs = {
    ...mockProps,
    allDIDs: [],
  };

  render(<VCDIDSelector {...propsWithNoDIDs} />);

  expect(
    screen.getByText('利用可能なDIDがありません。DID管理画面でDIDを作成してください。'),
  ).toBeInTheDocument();
});

it('DIDが選択されていない場合に選択プロンプトが表示される', () => {
  render(<VCDIDSelector {...mockProps} />);

  expect(screen.getByText('VCを管理するDIDを選択してください。')).toBeInTheDocument();
});

it('DIDが選択されている場合に選択プロンプトが表示されない', () => {
  const propsWithSelected = {
    ...mockProps,
    selectedDID: testDID1.doc.id,
  };

  render(<VCDIDSelector {...propsWithSelected} />);

  expect(screen.queryByText('VCを管理するDIDを選択してください。')).not.toBeInTheDocument();
});

it('利用可能なDIDがない場合に選択プロンプトが表示されない', () => {
  const propsWithNoDIDs = {
    ...mockProps,
    allDIDs: [],
  };

  render(<VCDIDSelector {...propsWithNoDIDs} />);

  expect(screen.queryByText('VCを管理するDIDを選択してください。')).not.toBeInTheDocument();
});

it('フォーマットされたDIDが表示される', () => {
  render(<VCDIDSelector {...mockProps} />);

  const formattedDID1 = testDID1.doc.id.slice(-8);
  const formattedDID2 = testDID2.doc.id.slice(-8);

  expect(screen.getByText(new RegExp(formattedDID1))).toBeInTheDocument();
  expect(screen.getByText(new RegExp(formattedDID2))).toBeInTheDocument();
});

it('単一のDIDでも正しく動作する', () => {
  const propsWithSingleDID = {
    ...mockProps,
    allDIDs: [testDID1],
  };

  render(<VCDIDSelector {...propsWithSingleDID} />);

  const options = screen.getAllByRole('option');
  expect(options).toHaveLength(1);
});

it('selectedDIDがnullの場合でもセレクトボックスに最初のDIDが表示される', () => {
  render(<VCDIDSelector {...mockProps} />);

  const select = screen.getByRole<HTMLSelectElement>('combobox');
  expect(select.value).toBe(testDID1.doc.id);
});
