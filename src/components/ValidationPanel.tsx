import { useState } from 'react';
import { ValidationService } from '../services/validationService';
import type { RFP, ValidationResult, MasterData } from '../types/rfp';

interface ValidationPanelProps {
  rfp: RFP;
}

const ValidationPanel = ({ rfp }: ValidationPanelProps) => {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const validationService = new ValidationService();
  const [sampleMasterData] = useState<MasterData>({
    회사정보: {
      회사명: '샘플 벤처캐피털',
      설립일: new Date('2020-01-01'),
      대표자: '홍길동',
      사업자등록번호: '123-45-67890',
      주소: '서울시 강남구',
      연락처: '02-1234-5678',
      AUM: 50000000000 // 500억원
    },
    펀드실적: [
      {
        펀드명: '샘플펀드 1호',
        결성일: new Date('2021-01-01'),
        결성액: 20000000000,
        상태: '운용중',
        수익률: 15.5
      }
    ],
    핵심인력: [
      {
        이름: '김대표',
        직책: '대표이사',
        경력년수: 8,
        학력: '서울대학교 경영학과',
        주요경험: ['벤처투자 10년', 'IPO 3건 성공']
      },
      {
        이름: '이팀장',
        직책: '투자팀장',
        경력년수: 5,
        학력: 'KAIST 공학박사',
        주요경험: ['기술 투자 전문', '스타트업 멘토링']
      }
    ],
    투자실적: [
      {
        포트폴리오명: '스타트업 A',
        투자일: new Date('2022-06-01'),
        투자액: 2000000000,
        분야: 'AI',
        현재상태: '운영중'
      }
    ]
  });

  const runValidation = async () => {
    setLoading(true);
    try {
      const result = validationService.validateRequirements(rfp.requirements, sampleMasterData);
      setValidationResult(result);
    } catch (error) {
      console.error('검증 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '✅';
    }
  };

  const getStatusColor = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  const getErrorCount = () => {
    if (!validationResult) return { errors: 0, warnings: 0, total: 0 };
    
    let errors = 0;
    let warnings = 0;
    
    validationResult.기본정보.forEach(item => {
      if (item.severity === 'error') errors++;
      if (item.severity === 'warning') warnings++;
    });
    
    validationResult.특수요구사항.forEach(item => {
      if (item.severity === 'error') errors++;
      if (item.severity === 'warning') warnings++;
    });
    
    validationResult.경고.forEach(item => {
      if (item.severity === 'error') errors++;
      if (item.severity === 'warning') warnings++;
    });
    
    return { errors, warnings, total: errors + warnings };
  };

  const errorCounts = getErrorCount();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">RFP 요구사항 검증</h2>
        <button
          onClick={runValidation}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '검증 중...' : '🔍 검증 실행'}
        </button>
      </div>

      {/* 검증 요약 */}
      {validationResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl">❌</span>
              <div className="ml-3">
                <p className="text-red-800 font-medium">치명적 오류</p>
                <p className="text-red-600 text-sm">{errorCounts.errors}개</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl">⚠️</span>
              <div className="ml-3">
                <p className="text-yellow-800 font-medium">경고 사항</p>
                <p className="text-yellow-600 text-sm">{errorCounts.warnings}개</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl">✅</span>
              <div className="ml-3">
                <p className="text-green-800 font-medium">검증 상태</p>
                <p className="text-green-600 text-sm">
                  {errorCounts.errors === 0 ? '제출 가능' : '수정 필요'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!validationResult && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">검증을 시작하세요</h3>
          <p className="text-gray-600 mb-4">
            현재 RFP 요구사항에 대한 데이터 검증을 실행하여<br />
            제출 전 필수 항목과 조건을 확인할 수 있습니다.
          </p>
          <button
            onClick={runValidation}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            검증 시작하기
          </button>
        </div>
      )}

      {/* 검증 결과 상세 */}
      {validationResult && (
        <div className="space-y-6">
          {/* 기본 정보 검증 */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">📋 기본 정보 검증</h3>
            </div>
            <div className="p-6">
              {validationResult.기본정보.length === 0 ? (
                <p className="text-green-600">✅ 모든 기본 정보가 올바릅니다.</p>
              ) : (
                <div className="space-y-3">
                  {validationResult.기본정보.map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getStatusColor(item.severity)}`}
                    >
                      <div className="flex items-start">
                        <span className="text-lg mr-3">{getStatusIcon(item.severity)}</span>
                        <div>
                          <p className="font-medium">{item.항목}</p>
                          <p className="text-sm mt-1">{item.메시지}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 특수 요구사항 검증 */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">⚙️ 특수 요구사항 검증</h3>
            </div>
            <div className="p-6">
              {validationResult.특수요구사항.length === 0 ? (
                <p className="text-green-600">✅ 모든 특수 요구사항을 충족합니다.</p>
              ) : (
                <div className="space-y-3">
                  {validationResult.특수요구사항.map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getStatusColor(item.severity)}`}
                    >
                      <div className="flex items-start">
                        <span className="text-lg mr-3">{getStatusIcon(item.severity)}</span>
                        <div>
                          <p className="font-medium">{item.항목}</p>
                          <p className="text-sm mt-1">{item.메시지}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 경고 사항 */}
          {validationResult.경고.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">⚠️ 추가 검토 사항</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {validationResult.경고.map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getStatusColor(item.severity)}`}
                    >
                      <div className="flex items-start">
                        <span className="text-lg mr-3">{getStatusIcon(item.severity)}</span>
                        <div>
                          <p className="font-medium">{item.항목}</p>
                          <p className="text-sm mt-1">{item.메시지}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 제출 전 체크리스트 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-medium text-blue-900 mb-4">📝 제출 전 체크리스트</h4>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked={errorCounts.errors === 0} />
                <span>모든 치명적 오류가 해결되었습니다</span>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>제출 서류가 모두 준비되었습니다</span>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>Excel 파일이 생성되고 검토되었습니다</span>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>최종 검토가 완료되었습니다</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationPanel;