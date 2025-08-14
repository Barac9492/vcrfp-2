import { useState, useEffect } from 'react';

interface DocumentGenerationProps {
  rfpData: any;
  collectedData: Record<string, any>;
  onComplete: () => void;
}

interface DocumentSection {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  progress: number;
  estimatedTime: number;
  icon: string;
}

const DocumentGeneration = ({ rfpData: _rfpData, collectedData, onComplete }: DocumentGenerationProps) => {
  const [sections, setSections] = useState<DocumentSection[]>([
    {
      id: 'executive-summary',
      name: '사업계획서 요약',
      description: '2페이지 경영진 요약 문서',
      status: 'pending',
      progress: 0,
      estimatedTime: 30,
      icon: '📊'
    },
    {
      id: 'company-overview',
      name: '회사 개요',
      description: '회사 소개, 연혁, 조직도',
      status: 'pending',
      progress: 0,
      estimatedTime: 45,
      icon: '🏢'
    },
    {
      id: 'investment-strategy',
      name: '투자 전략',
      description: '투자 철학, 전략, 프로세스',
      status: 'pending',
      progress: 0,
      estimatedTime: 60,
      icon: '📈'
    },
    {
      id: 'team-credentials',
      name: '팀 소개',
      description: '핵심 인력 이력서, 조직 구성',
      status: 'pending',
      progress: 0,
      estimatedTime: 40,
      icon: '👥'
    },
    {
      id: 'financial-projections',
      name: '재무 모델',
      description: 'Excel 기반 재무 계획 및 수익 모델',
      status: 'pending',
      progress: 0,
      estimatedTime: 90,
      icon: '💰'
    },
    {
      id: 'compliance-docs',
      name: '컴플라이언스',
      description: '법무, 세무, 규정 준수 문서',
      status: 'pending',
      progress: 0,
      estimatedTime: 50,
      icon: '📋'
    }
  ]);

  const [_currentGenerating, setCurrentGenerating] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    // Start generation process
    const timer = setTimeout(() => {
      startGeneration();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const startGeneration = () => {
    generateNextSection();
  };

  const generateNextSection = () => {
    const nextSection = sections.find(s => s.status === 'pending');
    if (!nextSection) {
      // All sections complete
      setOverallProgress(100);
      setTimeout(() => {
        onComplete();
      }, 2000);
      return;
    }

    setCurrentGenerating(nextSection.id);
    setSections(prev => 
      prev.map(s => 
        s.id === nextSection.id 
          ? { ...s, status: 'generating' as const }
          : s
      )
    );

    // Simulate generation progress
    const progressInterval = setInterval(() => {
      setSections(prev => 
        prev.map(s => {
          if (s.id === nextSection.id && s.status === 'generating') {
            const newProgress = Math.min(s.progress + Math.random() * 15 + 5, 100);
            if (newProgress >= 100) {
              clearInterval(progressInterval);
              // Mark as complete and start next section
              setTimeout(() => {
                setSections(prev => 
                  prev.map(section => 
                    section.id === nextSection.id 
                      ? { ...section, status: 'complete' as const, progress: 100 }
                      : section
                  )
                );
                setCurrentGenerating(null);
                
                // Calculate overall progress
                const completedSections = sections.filter(s => s.status === 'complete').length + 1;
                const newOverallProgress = (completedSections / sections.length) * 100;
                setOverallProgress(newOverallProgress);
                
                // Generate next section
                setTimeout(() => {
                  generateNextSection();
                }, 1000);
              }, 500);
              
              return { ...s, progress: 100 };
            }
            return { ...s, progress: newProgress };
          }
          return s;
        })
      );
    }, 200);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-green-600 bg-green-50 border-green-200';
      case 'generating': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete': return '완료';
      case 'generating': return '생성 중';
      case 'error': return '오류';
      default: return '대기 중';
    }
  };

  const completedSections = sections.filter(s => s.status === 'complete').length;
  const isAllComplete = completedSections === sections.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">문서 생성 중</h2>
          <p className="text-slate-600 mb-6">수집된 정보를 바탕으로 RFP 응답 문서를 자동 생성하고 있습니다</p>
          
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>전체 진행률</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
            <div className="text-sm text-slate-500 mt-2">
              {completedSections}/{sections.length} 섹션 완료
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="grid gap-6">
        {sections.map((section) => (
          <div key={section.id} className={`bg-white rounded-xl border-2 p-6 transition-all duration-300 ${
            getStatusColor(section.status)
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{section.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{section.name}</h3>
                  <p className="text-sm text-slate-600">{section.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {section.status === 'generating' && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-sm">생성 중...</span>
                  </div>
                )}
                
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  section.status === 'complete' ? 'bg-green-100 text-green-800' :
                  section.status === 'generating' ? 'bg-blue-100 text-blue-800' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {getStatusText(section.status)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            {(section.status === 'generating' || section.status === 'complete') && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-slate-600 mb-1">
                  <span>문서 생성 진행률</span>
                  <span>{Math.round(section.progress)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      section.status === 'complete' ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${section.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Generated Content Preview */}
            {section.status === 'complete' && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">생성된 내용 미리보기:</h4>
                <div className="text-sm text-slate-600 space-y-1">
                  {section.id === 'executive-summary' && (
                    <>
                      <p>• 회사 개요: {collectedData['회사명']} 소개</p>
                      <p>• 투자 전략: {collectedData['투자전략']?.substring(0, 50)}...</p>
                      <p>• 재무 계획: {collectedData['AUM']} 기준 수익 모델</p>
                    </>
                  )}
                  {section.id === 'company-overview' && (
                    <>
                      <p>• 회사명: {collectedData['회사명']}</p>
                      <p>• 운용 규모: {collectedData['AUM']}</p>
                      <p>• 팀 구성: {collectedData['팀 구성원']?.split('\n').length || 0}명</p>
                    </>
                  )}
                  {section.id === 'financial-projections' && (
                    <>
                      <p>• GP 출자비율: {collectedData['GP 출자비율']}</p>
                      <p>• 수익률 예측 모델 생성됨</p>
                      <p>• 현금흐름 분석표 완성</p>
                    </>
                  )}
                  {/* Add previews for other sections */}
                </div>
                
                <div className="flex space-x-2 mt-3">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    미리보기
                  </button>
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                    다운로드
                  </button>
                </div>
              </div>
            )}

            {/* Estimated Time */}
            {section.status === 'pending' && (
              <div className="text-sm text-slate-500">
                예상 소요 시간: {section.estimatedTime}초
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {isAllComplete && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-8 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">문서 생성 완료!</h3>
          <p className="text-slate-600 mb-6">
            모든 RFP 응답 문서가 성공적으로 생성되었습니다. 
            이제 최종 검토 및 제출 단계로 진행하겠습니다.
          </p>
          
          <div className="bg-white rounded-lg p-4 inline-block">
            <div className="text-sm text-slate-600 mb-2">생성된 문서 패키지</div>
            <div className="text-2xl font-bold text-slate-900">
              {sections.length}개 섹션 • {Math.round(Math.random() * 20 + 15)}페이지
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentGeneration;