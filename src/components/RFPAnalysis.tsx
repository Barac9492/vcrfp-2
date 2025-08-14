import { useState, useEffect } from 'react';
import { useRFP } from '../hooks/useRFP';
import { RFP } from '../types/rfp';

interface RFPAnalysisProps {
  rfp: RFP;
}

const RFPAnalysis = ({ rfp }: RFPAnalysisProps) => {
  const { rfps, compareRFPs, loading } = useRFP();
  const [comparisonRFP, setComparisonRFP] = useState<string>('');
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  const handleCompare = async () => {
    if (!comparisonRFP) return;
    
    const result = await compareRFPs(comparisonRFP, rfp.id);
    setComparisonResult(result);
  };

  const otherRFPs = rfps.filter(r => r.id !== rfp.id);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">RFP 분석 및 비교</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 현재 RFP 정보 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">현재 RFP</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-700">기관:</span>
              <span className="font-medium">{rfp.requirements.기본정보.기관명}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">프로그램:</span>
              <span className="font-medium">{rfp.requirements.기본정보.프로그램명}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">GP 출자:</span>
              <span className="font-medium">{rfp.requirements.펀드요구사항.출자비율.GP최소}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">의무투자:</span>
              <span className="font-medium">{rfp.requirements.펀드요구사항.의무투자.비율}%</span>
            </div>
          </div>
        </div>

        {/* 비교 대상 선택 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">비교 대상 선택</h3>
          {otherRFPs.length > 0 ? (
            <div className="space-y-3">
              <select
                value={comparisonRFP}
                onChange={(e) => setComparisonRFP(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">비교할 RFP 선택</option>
                {otherRFPs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.requirements.기본정보.기관명} - {r.requirements.기본정보.프로그램명}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCompare}
                disabled={!comparisonRFP || loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '비교 중...' : '비교 분석'}
              </button>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">
              비교할 다른 RFP가 없습니다.
            </p>
          )}
        </div>
      </div>

      {/* 비교 결과 */}
      {comparisonResult && (
        <div className="mt-8 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">📊 비교 결과</h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      항목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이전 RFP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      현재 RFP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      변경사항
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(comparisonResult.펀드요구사항 || {}).map(([key, value]: [string, any]) => (
                    <tr key={key}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {key}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {String(value.old)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {String(value.new)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {value.changed ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ↗️ 변경됨
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            - 동일
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 분석 요약 */}
      <div className="mt-8 bg-white border border-gray-200 rounded-lg">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">💡 분석 요약</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {rfp.requirements.펀드요구사항.출자비율.GP최소}%
              </div>
              <div className="text-sm text-gray-600">GP 최소 출자비율</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {rfp.requirements.펀드요구사항.의무투자.비율}%
              </div>
              <div className="text-sm text-gray-600">의무투자 비율</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {rfp.requirements.펀드요구사항.존속기간.기본}년
              </div>
              <div className="text-sm text-gray-600">펀드 존속기간</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFPAnalysis;