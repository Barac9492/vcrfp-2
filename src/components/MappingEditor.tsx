import { useState, useEffect } from 'react';
import { useMapping } from '../hooks/useMapping';
import { DataMappingRule } from '../types/rfp';

interface MappingEditorProps {
  rfpId: string;
}

const MappingEditor = ({ rfpId }: MappingEditorProps) => {
  const {
    mappingRule,
    loading,
    error,
    loadMappingRule,
    saveMappingRule,
    addMappingRule,
    removeMappingRule,
    updateMappingRule,
    addCustomField,
    removeCustomField
  } = useMapping();

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadMappingRule(rfpId);
  }, [rfpId, loadMappingRule]);

  const handleSave = async () => {
    if (mappingRule) {
      const success = await saveMappingRule(mappingRule);
      if (success) {
        setIsEditing(false);
      }
    }
  };

  const sampleMasterDataFields = [
    '회사정보.회사명',
    '회사정보.설립일',
    '회사정보.AUM',
    '핵심인력.대표PM.경력년수',
    '펀드실적.총개수',
    '펀드실적.평균수익률'
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">매핑 규칙을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">데이터 매핑 설정</h2>
        <div className="space-x-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              편집
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                저장
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* 매핑 규칙 테이블 */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">🔗 필드 매핑</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  마스터 데이터 필드
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RFP 양식 필드
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  변환 규칙
                </th>
                {isEditing && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mappingRule?.mappings.map((mapping, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <select
                        value={mapping.sourceField}
                        onChange={(e) => updateMappingRule(index, { sourceField: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">선택하세요</option>
                        {sampleMasterDataFields.map(field => (
                          <option key={field} value={field}>{field}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-900">{mapping.sourceField}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="text"
                        value={mapping.targetField}
                        onChange={(e) => updateMappingRule(index, { targetField: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="RFP 양식 필드명"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{mapping.targetField}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {mapping.transformation ? '변환 함수 적용' : '직접 매핑'}
                    </span>
                  </td>
                  {isEditing && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => removeMappingRule(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        삭제
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {(!mappingRule?.mappings || mappingRule.mappings.length === 0) && (
                <tr>
                  <td colSpan={isEditing ? 4 : 3} className="px-6 py-8 text-center text-gray-500">
                    매핑 규칙이 없습니다. {isEditing && '새 매핑을 추가해보세요.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 새 매핑 추가 */}
      {isEditing && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">➕ 새 매핑 추가</h4>
          <button
            onClick={() => addMappingRule('', '')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            매핑 규칙 추가
          </button>
        </div>
      )}

      {/* 커스텀 필드 */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">⚙️ 커스텀 필드</h3>
        </div>
        <div className="p-6">
          {mappingRule?.customFields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              커스텀 필드가 없습니다.
              {isEditing && (
                <>
                  <br />
                  <button
                    onClick={() => addCustomField({
                      fieldName: '',
                      fieldType: 'text',
                      required: false
                    })}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    커스텀 필드 추가
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {mappingRule?.customFields.map((field, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium">{field.fieldName}</span>
                    <span className="text-sm text-gray-500 ml-2">({field.fieldType})</span>
                    {field.required && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded ml-2">
                        필수
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => removeCustomField(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 도움말 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 mb-2">💡 매핑 설정 가이드</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 마스터 데이터의 필드를 RFP 양식의 해당 필드에 매핑합니다</li>
          <li>• 변환 규칙을 적용하여 데이터 형식을 조정할 수 있습니다</li>
          <li>• 커스텀 필드는 RFP별로 고유한 추가 정보를 관리할 때 사용합니다</li>
          <li>• 매핑이 완료되면 자동으로 Excel 양식이 생성됩니다</li>
        </ul>
      </div>
    </div>
  );
};

export default MappingEditor;