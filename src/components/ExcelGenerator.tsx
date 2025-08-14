import { useState, useEffect } from 'react';
import { useExcel } from '../hooks/useExcel';
import { useMapping } from '../hooks/useMapping';
import type { RFP, MasterData } from '../types/rfp';

interface ExcelGeneratorProps {
  rfp: RFP;
}

const ExcelGenerator = ({ rfp }: ExcelGeneratorProps) => {
  const { generateExcelFromRFP, previewExcelData, loading, error } = useExcel();
  const { loadMappingRule, applyMapping, mappingRule } = useMapping();
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  // 샘플 마스터 데이터
  const [sampleMasterData] = useState<MasterData>({
    회사정보: {
      회사명: '샘플 벤처캐피털',
      설립일: new Date('2020-01-01'),
      대표자: '홍길동',
      사업자등록번호: '123-45-67890',
      주소: '서울시 강남구 테헤란로 123',
      연락처: '02-1234-5678',
      AUM: 50000000000
    },
    펀드실적: [
      {
        펀드명: '샘플펀드 1호',
        결성일: new Date('2021-01-01'),
        결성액: 20000000000,
        상태: '운용중',
        수익률: 15.5
      },
      {
        펀드명: '샘플펀드 2호',
        결성일: new Date('2022-06-01'),
        결성액: 30000000000,
        상태: '결성중',
        수익률: 0
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
      },
      {
        이름: '박부장',
        직책: '운용부장',
        경력년수: 6,
        학력: '연세대학교 경제학과',
        주요경험: ['포트폴리오 관리', '기업가치 평가']
      }
    ],
    투자실적: [
      {
        포트폴리오명: '스타트업 A',
        투자일: new Date('2022-06-01'),
        투자액: 2000000000,
        분야: 'AI',
        현재상태: '운영중'
      },
      {
        포트폴리오명: '스타트업 B',
        투자일: new Date('2023-03-15'),
        투자액: 1500000000,
        분야: '바이오',
        현재상태: '운영중'
      }
    ]
  });

  useEffect(() => {
    loadMappingRule(rfp.id);
  }, [rfp.id, loadMappingRule]);

  const handleGenerateExcel = async () => {
    try {
      // 매핑 적용
      const mappedData = mappingRule ? 
        await applyMapping(sampleMasterData, mappingRule) : {};
      
      // Excel 생성 및 다운로드
      const success = await generateExcelFromRFP(rfp, sampleMasterData, mappedData);
      
      if (success) {
        alert('Excel 파일이 성공적으로 생성되었습니다!');
      }
    } catch (err) {
      console.error('Excel 생성 중 오류:', err);
    }
  };

  const handlePreview = async () => {
    try {
      // 템플릿 생성
      const template = {
        rfpId: rfp.id,
        sheets: [
          {
            name: '회사개요',
            required: true,
            columns: [
              { header: '회사명', dataField: '회사명', width: 20 },
              { header: '설립일', dataField: '설립일', width: 12, format: 'date' as const },
              { header: '대표자', dataField: '대표자', width: 15 },
              { header: 'AUM', dataField: 'AUM', width: 15, format: 'currency' as const },
              { header: '주소', dataField: '주소', width: 30 }
            ]
          },
          {
            name: '펀드실적',
            required: true,
            columns: [
              { header: '펀드명', dataField: '펀드명', width: 25 },
              { header: '결성일', dataField: '결성일', width: 12, format: 'date' as const },
              { header: '결성액', dataField: '결성액', width: 15, format: 'currency' as const },
              { header: '상태', dataField: '상태', width: 12 },
              { header: '수익률(%)', dataField: '수익률', width: 12, format: 'percent' as const }
            ]
          },
          {
            name: '핵심인력',
            required: true,
            columns: [
              { header: '이름', dataField: '이름', width: 15 },
              { header: '직책', dataField: '직책', width: 20 },
              { header: '경력년수', dataField: '경력년수', width: 12, format: 'number' as const },
              { header: '학력', dataField: '학력', width: 25 },
              { header: '주요경험', dataField: '주요경험', width: 40 }
            ]
          }
        ]
      };

      const mappedData = mappingRule ? 
        await applyMapping(sampleMasterData, mappingRule) : {};

      const preview = await previewExcelData(template, sampleMasterData, mappedData);
      setPreviewData(preview);
      setShowPreview(true);
    } catch (err) {
      console.error('미리보기 생성 중 오류:', err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Excel 파일 생성</h2>
        <div className="space-x-3">
          <button
            onClick={handlePreview}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '처리 중...' : '📊 미리보기'}
          </button>
          <button
            onClick={handleGenerateExcel}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '생성 중...' : '📥 Excel 다운로드'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* 현재 RFP 정보 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">생성될 Excel 파일 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-blue-700 font-medium">기관:</span>
            <span className="ml-2">{rfp.requirements.기본정보.기관명}</span>
          </div>
          <div>
            <span className="text-blue-700 font-medium">프로그램:</span>
            <span className="ml-2">{rfp.requirements.기본정보.프로그램명}</span>
          </div>
          <div>
            <span className="text-blue-700 font-medium">파일명:</span>
            <span className="ml-2 text-sm text-gray-600">
              {rfp.requirements.기본정보.기관명}_{rfp.requirements.기본정보.프로그램명}_{new Date().toISOString().split('T')[0]}.xlsx
            </span>
          </div>
          <div>
            <span className="text-blue-700 font-medium">포함 시트:</span>
            <span className="ml-2 text-sm text-gray-600">
              회사개요, 펀드실적, 핵심인력, 투자실적
            </span>
          </div>
        </div>
      </div>

      {/* 샘플 데이터 정보 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">📋 포함될 데이터 요약</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">1</div>
            <div className="text-sm text-gray-600">회사 정보</div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{sampleMasterData.펀드실적.length}</div>
            <div className="text-sm text-gray-600">펀드 실적</div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{sampleMasterData.핵심인력.length}</div>
            <div className="text-sm text-gray-600">핵심 인력</div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{sampleMasterData.투자실적.length}</div>
            <div className="text-sm text-gray-600">투자 실적</div>
          </div>
        </div>
      </div>

      {/* 미리보기 */}
      {showPreview && previewData && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">📊 Excel 파일 미리보기</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="p-6">
            {Object.entries(previewData).map(([sheetName, sheetData]: [string, any]) => (
              <div key={sheetName} className="mb-8">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  📄 {sheetName}
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        {sheetData.headers.map((header: string, index: number) => (
                          <th
                            key={index}
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sheetData.rows.map((row: any[], rowIndex: number) => (
                        <tr key={rowIndex}>
                          {row.map((cell: any, cellIndex: number) => (
                            <td
                              key={cellIndex}
                              className="px-4 py-2 text-sm text-gray-900 border-r border-gray-300"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 사용 가이드 */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h4 className="font-medium text-yellow-900 mb-2">💡 Excel 생성 가이드</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 현재는 샘플 데이터로 Excel 파일이 생성됩니다</li>
          <li>• 실제 사용 시에는 마스터 데이터를 업로드하거나 직접 입력하세요</li>
          <li>• 매핑 설정이 완료된 경우 자동으로 데이터가 적절한 위치에 배치됩니다</li>
          <li>• 생성된 Excel 파일은 RFP 요구사항에 맞는 양식으로 구성됩니다</li>
          <li>• 미리보기를 통해 데이터가 올바르게 배치되었는지 확인할 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
};

export default ExcelGenerator;