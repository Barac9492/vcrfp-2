import { useState, useEffect } from 'react';
import { useRFP } from '../hooks/useRFP';
import { RFP, RFPRequirements } from '../types/rfp';

interface RFPEditorProps {
  rfp: RFP;
  onSave: (rfp: RFP) => void;
}

const RFPEditor = ({ rfp, onSave }: RFPEditorProps) => {
  const [requirements, setRequirements] = useState<RFPRequirements>(rfp.requirements);
  const [activeTab, setActiveTab] = useState<string>('기본정보');
  const [hasChanges, setHasChanges] = useState(false);
  const { saveRFP, loading, error } = useRFP();

  useEffect(() => {
    setRequirements(rfp.requirements);
    setHasChanges(false);
  }, [rfp]);

  const handleSave = async () => {
    const updatedRFP: RFP = {
      ...rfp,
      requirements,
      version: rfp.version + 1,
      updatedAt: new Date()
    };

    const success = await saveRFP(updatedRFP);
    if (success) {
      onSave(updatedRFP);
      setHasChanges(false);
    }
  };

  const updateRequirements = (section: keyof RFPRequirements, data: any) => {
    setRequirements(prev => ({
      ...prev,
      [section]: data
    }));
    setHasChanges(true);
  };

  const tabs = [
    { id: '기본정보', label: '기본 정보', icon: '📋' },
    { id: '펀드요구사항', label: '펀드 요구사항', icon: '💰' },
    { id: '평가기준', label: '평가 기준', icon: '📊' },
    { id: '제출서류', label: '제출 서류', icon: '📄' },
    { id: '특수조건', label: '특수 조건', icon: '⚙️' }
  ];

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기관명 *
          </label>
          <input
            type="text"
            value={requirements.기본정보.기관명}
            onChange={(e) => updateRequirements('기본정보', {
              ...requirements.기본정보,
              기관명: e.target.value
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 한국벤처투자"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            프로그램명 *
          </label>
          <input
            type="text"
            value={requirements.기본정보.프로그램명}
            onChange={(e) => updateRequirements('기본정보', {
              ...requirements.기본정보,
              프로그램명: e.target.value
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 2025년 AI·AX 혁신펀드"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            공고일 *
          </label>
          <input
            type="date"
            value={requirements.기본정보.공고일.toISOString().split('T')[0]}
            onChange={(e) => updateRequirements('기본정보', {
              ...requirements.기본정보,
              공고일: new Date(e.target.value)
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            마감일 *
          </label>
          <input
            type="date"
            value={requirements.기본정보.마감일.toISOString().split('T')[0]}
            onChange={(e) => updateRequirements('기본정보', {
              ...requirements.기본정보,
              마감일: new Date(e.target.value)
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          공고문 URL
        </label>
        <input
          type="url"
          value={requirements.기본정보.공고문URL || ''}
          onChange={(e) => updateRequirements('기본정보', {
            ...requirements.기본정보,
            공고문URL: e.target.value
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/rfp-document"
        />
      </div>
    </div>
  );

  const renderFundRequirements = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            최소결성액 (원) *
          </label>
          <input
            type="number"
            value={requirements.펀드요구사항.최소결성액}
            onChange={(e) => updateRequirements('펀드요구사항', {
              ...requirements.펀드요구사항,
              최소결성액: parseInt(e.target.value) || 0
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 50000000000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            최대결성액 (원)
          </label>
          <input
            type="number"
            value={requirements.펀드요구사항.최대결성액 || ''}
            onChange={(e) => updateRequirements('펀드요구사항', {
              ...requirements.펀드요구사항,
              최대결성액: parseInt(e.target.value) || undefined
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 200000000000"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-4">출자 비율</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GP 최소 출자비율 (%) *
            </label>
            <input
              type="number"
              step="0.1"
              value={requirements.펀드요구사항.출자비율.GP최소}
              onChange={(e) => updateRequirements('펀드요구사항', {
                ...requirements.펀드요구사항,
                출자비율: {
                  ...requirements.펀드요구사항.출자비율,
                  GP최소: parseFloat(e.target.value) || 0
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              정부 출자비율 (%) *
            </label>
            <input
              type="number"
              step="0.1"
              value={requirements.펀드요구사항.출자비율.정부출자}
              onChange={(e) => updateRequirements('펀드요구사항', {
                ...requirements.펀드요구사항,
                출자비율: {
                  ...requirements.펀드요구사항.출자비율,
                  정부출자: parseFloat(e.target.value) || 0
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-4">의무 투자</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              의무투자 비율 (%) *
            </label>
            <input
              type="number"
              step="0.1"
              value={requirements.펀드요구사항.의무투자.비율}
              onChange={(e) => updateRequirements('펀드요구사항', {
                ...requirements.펀드요구사항,
                의무투자: {
                  ...requirements.펀드요구사항.의무투자,
                  비율: parseFloat(e.target.value) || 0
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              투자 대상 *
            </label>
            <input
              type="text"
              value={requirements.펀드요구사항.의무투자.대상}
              onChange={(e) => updateRequirements('펀드요구사항', {
                ...requirements.펀드요구사항,
                의무투자: {
                  ...requirements.펀드요구사항.의무투자,
                  대상: e.target.value
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: AI·AX 분야 기업"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentTab = () => {
    switch (activeTab) {
      case '기본정보':
        return renderBasicInfo();
      case '펀드요구사항':
        return renderFundRequirements();
      default:
        return (
          <div className="text-center py-12 text-gray-500">
            "{activeTab}" 섹션은 준비 중입니다.
          </div>
        );
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">RFP 편집</h2>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded">
              저장되지 않은 변경사항
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={loading || !hasChanges}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white">
        {renderCurrentTab()}
      </div>
    </div>
  );
};

export default RFPEditor;