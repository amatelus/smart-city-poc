import { act, fireEvent, render, screen } from '@testing-library/react';
import { generateDID } from 'src/utils/did';
import { createSampleResidentVC } from 'src/utils/vc';
import { beforeEach, expect, it, vi } from 'vitest';
import VCDetailModal from './VCDetailModal';

const testDID = generateDID();
const sampleVC = createSampleResidentVC(testDID.doc.id);

const mockVCStorage = {
  title: 'テストVC',
  data: sampleVC,
};

const mockProps = {
  selectedVC: mockVCStorage,
  onClose: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

it('VC詳細モーダルのタイトルが表示される', () => {
  render(<VCDetailModal {...mockProps} />);

  expect(screen.getByText('VC詳細: テストVC')).toBeInTheDocument();
});

it('閉じるボタンが表示される', () => {
  render(<VCDetailModal {...mockProps} />);

  expect(screen.getByText('✕')).toBeInTheDocument();
});

it('発行者情報が表示される', () => {
  render(<VCDetailModal {...mockProps} />);

  expect(screen.getByText('発行者:')).toBeInTheDocument();
  expect(screen.getByText(sampleVC.issuer)).toBeInTheDocument();
});

it('発行日が表示される', () => {
  render(<VCDetailModal {...mockProps} />);

  expect(screen.getByText('発行日:')).toBeInTheDocument();

  const expectedDate = new Date(sampleVC.issuanceDate).toLocaleString('ja-JP');
  expect(screen.getByText(expectedDate)).toBeInTheDocument();
});

it('対象DIDが表示される', () => {
  render(<VCDetailModal {...mockProps} />);

  expect(screen.getByText('対象DID:')).toBeInTheDocument();
  expect(screen.getByText(sampleVC.credentialSubject.id)).toBeInTheDocument();
});

it('VC JSONセクションが表示される', () => {
  render(<VCDetailModal {...mockProps} />);

  expect(screen.getByText('VC JSON:')).toBeInTheDocument();
});

it('VC JSONデータが正しく表示される', () => {
  render(<VCDetailModal {...mockProps} />);

  expect(screen.getByText(/"@context":/)).toBeInTheDocument();
  expect(screen.getByText(/"issuer":/)).toBeInTheDocument();
  expect(screen.getByText(/"credentialSubject":/)).toBeInTheDocument();
});

it('閉じるボタンをクリックすると onClose が呼ばれる', () => {
  render(<VCDetailModal {...mockProps} />);

  const closeButton = screen.getByText('✕');

  act(() => {
    fireEvent.click(closeButton);
  });

  expect(mockProps.onClose).toHaveBeenCalled();
});

it('selectedVCのタイトルがヘッダーに表示される', () => {
  const customProps = {
    ...mockProps,
    selectedVC: {
      ...mockVCStorage,
      title: 'カスタムVCタイトル',
    },
  };

  render(<VCDetailModal {...customProps} />);

  expect(screen.getByText('VC詳細: カスタムVCタイトル')).toBeInTheDocument();
});

it('発行日が正しい日本語フォーマットで表示される', () => {
  const testDate = '2023-12-25T10:30:00Z';
  const customVC = {
    ...sampleVC,
    issuanceDate: testDate,
  };

  const customProps = {
    ...mockProps,
    selectedVC: {
      ...mockVCStorage,
      data: customVC,
    },
  };

  render(<VCDetailModal {...customProps} />);

  const expectedDate = new Date(testDate).toLocaleString('ja-JP');
  expect(screen.getByText(expectedDate)).toBeInTheDocument();
});

it('credentialSubjectのIDが表示される', () => {
  render(<VCDetailModal {...mockProps} />);

  expect(screen.getByText(mockVCStorage.data.credentialSubject.id)).toBeInTheDocument();
});

it('JSON表示エリアが存在する', () => {
  render(<VCDetailModal {...mockProps} />);

  const preElement = document.querySelector('pre');
  expect(preElement).toBeInTheDocument();
  expect(preElement?.textContent).toContain('"@context"');
});
