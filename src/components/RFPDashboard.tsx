import { useState } from 'react';
import { useRFP } from '../hooks/useRFP';
import RFPList from './RFPList';
import RFPEditor from './RFPEditor';
import RFPAnalysis from './RFPAnalysis';
import MappingEditor from './MappingEditor';
import ValidationPanel from './ValidationPanel';
import ExcelGenerator from './ExcelGenerator';
import { RFP } from '../types/rfp';

type ViewMode = 'list' | 'editor' | 'analysis' | 'mapping' | 'validation' | 'excel';

const RFPDashboard = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [selectedRFP, setSelectedRFP] = useState<RFP | null>(null);
  const { createNewRFP } = useRFP();

  const handleCreateNew = () => {
    const newRFP = createNewRFP();
    setSelectedRFP(newRFP);
    setCurrentView('editor');
  };

  const handleSelectRFP = (rfp: RFP) => {
    setSelectedRFP(rfp);
    setCurrentView('editor');
  };

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
  };

  const renderNavigation = () => (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleViewChange('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              currentView === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📋 RFP 목록
          </button>
          {selectedRFP && (
            <>
              <button
                onClick={() => handleViewChange('editor')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'editor'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ✏️ RFP 편집
              </button>
              <button
                onClick={() => handleViewChange('analysis')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'analysis'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 분석 및 비교
              </button>
              <button
                onClick={() => handleViewChange('mapping')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'mapping'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🔗 데이터 매핑
              </button>
              <button
                onClick={() => handleViewChange('validation')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'validation'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ✅ 검증
              </button>
              <button
                onClick={() => handleViewChange('excel')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'excel'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Excel 생성
              </button>
            </>
          )}
        </nav>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'list':
        return (
          <RFPList
            onSelectRFP={handleSelectRFP}
            onCreateNew={handleCreateNew}
          />
        );
      case 'editor':
        return selectedRFP ? (
          <RFPEditor
            rfp={selectedRFP}
            onSave={(updatedRFP) => {
              setSelectedRFP(updatedRFP);
            }}
          />
        ) : null;
      case 'analysis':
        return selectedRFP ? (
          <RFPAnalysis rfp={selectedRFP} />
        ) : null;
      case 'mapping':
        return selectedRFP ? (
          <MappingEditor rfpId={selectedRFP.id} />
        ) : null;
      case 'validation':
        return selectedRFP ? (
          <ValidationPanel rfp={selectedRFP} />
        ) : null;
      case 'excel':
        return selectedRFP ? (
          <ExcelGenerator rfp={selectedRFP} />
        ) : null;
      default:
        return <RFPList onSelectRFP={handleSelectRFP} onCreateNew={handleCreateNew} />;
    }
  };

  return (
    <div className="space-y-6">
      {renderNavigation()}
      
      {selectedRFP && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-blue-900">
            현재 작업 중인 RFP
          </h3>
          <p className="text-blue-700 mt-1">
            {selectedRFP.requirements.기본정보.기관명} - {selectedRFP.requirements.기본정보.프로그램명}
          </p>
          <div className="flex items-center mt-2 text-sm text-blue-600">
            <span>마감일: {selectedRFP.requirements.기본정보.마감일.toLocaleDateString()}</span>
            <span className="mx-2">•</span>
            <span>버전: v{selectedRFP.version}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default RFPDashboard;