import { act, fireEvent, render, screen } from '@testing-library/react';
import type { DtoId } from 'src/schemas/brandedId';
import type { ZKPProof } from 'src/schemas/zkp';
import { beforeEach, expect, it, vi } from 'vitest';
import ZKPGeneratorResult from './ZKPGeneratorResult';

const mockZKPProof: ZKPProof = {
  baseProof: {
    version: 1,
    proofType: 'age_over_20',
    nullifierSecret: 'test-nullifier-secret-123',
    merkleProof: 'test-merkle-proof-987654321fedcba',
    proof: 'test-zkp-proof-data',
    publicInputs: {
      ageThreshold: 20,
      currentTimestamp: Date.now(),
    },
    metadata: {
      generatedAt: '2024-01-01T12:00:00.000Z',
      proverDID: 'did:amatelus:test123456789abcdef' as DtoId['did'],
      expiresAt: '2024-01-01T12:05:00.000Z',
    },
  },
  challenge: 'test-challenge-12345',
  nullifierHash: 'test-nullifier-hash-123456789abcdef',
  verifierInfo: {
    verifierDID: 'did:amatelus:test-verifier' as DtoId['did'],
    challengeTimestamp: Date.now(),
  },
};

const mockZKPResult = { proof: mockZKPProof, generationTime: 1234.56 };

const mockProps = { zkpResult: mockZKPResult, onShowQR: vi.fn(), onReset: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
});

it('ZKP生成完了タイトルが表示される', () => {
  render(<ZKPGeneratorResult {...mockProps} />);

  expect(screen.getByText('✓ ZKP生成完了')).toBeInTheDocument();
});

it('生成時間が正しく表示される', () => {
  render(<ZKPGeneratorResult {...mockProps} />);

  expect(screen.getByText('生成時間:')).toBeInTheDocument();
  expect(screen.getByText('1234.56ms')).toBeInTheDocument();
});

it('証明タイプが表示される', () => {
  render(<ZKPGeneratorResult {...mockProps} />);

  expect(screen.getByText('証明タイプ:')).toBeInTheDocument();
  expect(screen.getByText('20歳以上であることの証明')).toBeInTheDocument();
});

it('Challengeが表示される', () => {
  render(<ZKPGeneratorResult {...mockProps} />);

  expect(screen.getByText('Challenge:')).toBeInTheDocument();
  expect(screen.getByText('test-challenge-12345')).toBeInTheDocument();
});

it('Nullifier Hashが表示される', () => {
  render(<ZKPGeneratorResult {...mockProps} />);

  expect(screen.getByText('Nullifier Hash:')).toBeInTheDocument();
  expect(screen.getByText('test-nullifier-h...')).toBeInTheDocument();
});

it('生成日時が日本語形式で表示される', () => {
  render(<ZKPGeneratorResult {...mockProps} />);

  expect(screen.getByText('生成日時:')).toBeInTheDocument();
  expect(screen.getByText('2024/1/1 21:00:00')).toBeInTheDocument();
});

it('ZKP証明データがJSON形式で表示される', () => {
  render(<ZKPGeneratorResult {...mockProps} />);

  expect(screen.getByText('ZKP証明データ:')).toBeInTheDocument();
  const jsonDisplay = screen.getByText(/"version": 1/);
  expect(jsonDisplay).toBeInTheDocument();
});

it('QRコード提示ボタンが表示される', () => {
  render(<ZKPGeneratorResult {...mockProps} />);

  expect(screen.getByText('QRコードで提示')).toBeInTheDocument();
});

it('新しいZKP生成ボタンが表示される', () => {
  render(<ZKPGeneratorResult {...mockProps} />);

  expect(screen.getByText('新しいZKPを生成')).toBeInTheDocument();
});

it('QRコード提示ボタンをクリックするとonShowQRが呼ばれる', () => {
  render(<ZKPGeneratorResult {...mockProps} />);

  const showQRButton = screen.getByText('QRコードで提示');

  act(() => {
    fireEvent.click(showQRButton);
  });

  expect(mockProps.onShowQR).toHaveBeenCalledTimes(1);
});

it('新しいZKP生成ボタンをクリックするとonResetが呼ばれる', () => {
  render(<ZKPGeneratorResult {...mockProps} />);

  const resetButton = screen.getByText('新しいZKPを生成');

  act(() => {
    fireEvent.click(resetButton);
  });

  expect(mockProps.onReset).toHaveBeenCalledTimes(1);
});

it('異なる生成時間で正しく表示される', () => {
  const differentResult = { ...mockZKPResult, generationTime: 567.89 };

  render(<ZKPGeneratorResult {...mockProps} zkpResult={differentResult} />);

  expect(screen.getByText('567.89ms')).toBeInTheDocument();
});

it('異なるChallengeで正しく表示される', () => {
  const differentProof: ZKPProof = { ...mockZKPProof, challenge: 'different-challenge-987654321' };
  const differentResult = { ...mockZKPResult, proof: differentProof };

  render(<ZKPGeneratorResult {...mockProps} zkpResult={differentResult} />);

  expect(screen.getByText('different-challenge-987654321')).toBeInTheDocument();
});

it('JSON表示にすべての必要な情報が含まれる', () => {
  render(<ZKPGeneratorResult {...mockProps} />);

  expect(screen.getByText(/"baseProof"/)).toBeInTheDocument();
  expect(screen.getByText(/"challenge": "test-challenge-12345"/)).toBeInTheDocument();
  expect(screen.getByText(/"nullifierHash"/)).toBeInTheDocument();
  expect(screen.getByText(/"verifierInfo"/)).toBeInTheDocument();
});

it('ボタンが複数回クリックされても正しく動作する', () => {
  render(<ZKPGeneratorResult {...mockProps} />);

  const showQRButton = screen.getByText('QRコードで提示');
  const resetButton = screen.getByText('新しいZKPを生成');

  act(() => {
    fireEvent.click(showQRButton);
    fireEvent.click(resetButton);
    fireEvent.click(showQRButton);
  });

  expect(mockProps.onShowQR).toHaveBeenCalledTimes(2);
  expect(mockProps.onReset).toHaveBeenCalledTimes(1);
});

it('コンポーネントの構造が正しく表示される', () => {
  const { container } = render(<ZKPGeneratorResult {...mockProps} />);

  const resultSection = container.querySelector('[class*="resultSection"]');
  const zkpInfo = container.querySelector('[class*="zkpInfo"]');
  const proofData = container.querySelector('[class*="proofData"]');
  const buttonGroup = container.querySelector('[class*="buttonGroup"]');

  expect(resultSection).toBeInTheDocument();
  expect(zkpInfo).toBeInTheDocument();
  expect(proofData).toBeInTheDocument();
  expect(buttonGroup).toBeInTheDocument();
});

it('各情報項目が正しいCSSクラスで表示される', () => {
  const { container } = render(<ZKPGeneratorResult {...mockProps} />);

  const infoItems = container.querySelectorAll('[class*="infoItem"]');
  expect(infoItems).toHaveLength(5); // 生成時間、証明タイプ、Challenge、Nullifier Hash、生成日時
});

it('プロポーショナルな小数点表示が正しく動作する', () => {
  const exactTimeResult = {
    ...mockZKPResult,
    generationTime: 1000,
  };

  render(<ZKPGeneratorResult {...mockProps} zkpResult={exactTimeResult} />);

  expect(screen.getByText('1000.00ms')).toBeInTheDocument();
});
