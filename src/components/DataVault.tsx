import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DataVaultProps {
  onDataUpdate?: (sheetId: string, data: any) => void;
}

interface SheetStatus {
  id: string;
  name: string;
  status: 'complete' | 'partial' | 'missing';
  progress: number;
  lastUpdated?: Date;
  requiredFields: number;
  completedFields: number;
  description: string;
}

const DataVault = ({ onDataUpdate }: DataVaultProps) => {
  const [sheets, setSheets] = useState<SheetStatus[]>([]);
  const [_selectedSheet, setSelectedSheet] = useState<string | null>(null);
  
  // Use onDataUpdate callback when available
  const handleDataUpdate = (sheetId: string, data: any) => {
    onDataUpdate?.(sheetId, data);
  };

  useEffect(() => {
    // Initialize with mock data representing typical KIF RFP sheets
    const initialSheets: SheetStatus[] = [
      {
        id: '표지',
        name: '표지',
        status: 'complete',
        progress: 100,
        requiredFields: 5,
        completedFields: 5,
        description: '제안서 표지 정보 (회사명, 제안펀드명 등)',
        lastUpdated: new Date()
      },
      {
        id: '1-0',
        name: '1-0. 제안펀드 구성',
        status: 'partial',
        progress: 60,
        requiredFields: 8,
        completedFields: 5,
        description: '펀드 기본 구성 정보 (규모, 존속기간, 투자전략 개요)',
      },
      {
        id: '1-1',
        name: '1-1. 회사현황',
        status: 'complete',
        progress: 100,
        requiredFields: 12,
        completedFields: 12,
        description: '운용사 회사 개요 (설립일, 대표자, 주소 등)',
        lastUpdated: new Date(Date.now() - 86400000)
      },
      {
        id: '1-2',
        name: '1-2. 재무실적',
        status: 'partial',
        progress: 75,
        requiredFields: 15,
        completedFields: 11,
        description: '최근 3년간 회계감사보고서 기반 재무 데이터',
      },
      {
        id: '1-4',
        name: '1-4. 핵심운용인력 관리현황',
        status: 'missing',
        progress: 20,
        requiredFields: 18,
        completedFields: 4,
        description: '투자팀 핵심 구성원 정보 (경력, 학력, 투자실적)',
      },
      {
        id: '2-1',
        name: '2-1. 조합 결성실적',
        status: 'partial',
        progress: 40,
        requiredFields: 10,
        completedFields: 4,
        description: '과거 결성한 펀드 현황 및 실적',
      },
      {
        id: '2-2',
        name: '2-2. 조합 운용실적',
        status: 'missing',
        progress: 10,
        requiredFields: 14,
        completedFields: 1,
        description: '펀드별 운용 성과 및 투자 포트폴리오',
      },
      {
        id: '2-4',
        name: '2-4. 투자전략',
        status: 'missing',
        progress: 0,
        requiredFields: 20,
        completedFields: 0,
        description: 'AI·디지털 분야 투자전략 및 심사기준',
      }
    ];

    setSheets(initialSheets);
  }, []);

  const getStatusInfo = (status: SheetStatus['status']) => {
    switch (status) {
      case 'complete':
        return {
          color: 'from-green-500 to-emerald-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          icon: '✅',
          label: '완료',
          tooltip: '모든 필수 데이터가 입력되었습니다'
        };
      case 'partial':
        return {
          color: 'from-yellow-500 to-orange-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          icon: '⚠️',
          label: '부분완료',
          tooltip: '일부 데이터가 누락되었습니다'
        };
      case 'missing':
        return {
          color: 'from-red-500 to-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          icon: '❌',
          label: '미완료',
          tooltip: '필수 데이터 입력이 필요합니다'
        };
    }
  };

  const getOverallStatus = () => {
    const totalSheets = sheets.length;
    const completeSheets = sheets.filter(s => s.status === 'complete').length;
    const partialSheets = sheets.filter(s => s.status === 'partial').length;
    
    return {
      complete: completeSheets,
      partial: partialSheets,
      missing: totalSheets - completeSheets - partialSheets,
      percentage: Math.round((completeSheets / totalSheets) * 100)
    };
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">데이터 저장소</h1>
              <p className="text-sm text-slate-500">
                재사용 가능한 RFP 응답 데이터 관리
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-800">{overallStatus.percentage}%</div>
                <div className="text-xs text-slate-500">전체 완성도</div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Overview Cards */}
        <motion.div 
          className="grid md:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6">
            <div className="text-3xl font-bold">{sheets.length}</div>
            <div className="text-blue-100">총 시트 수</div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">✅</span>
              <span className="text-2xl font-bold text-green-800">{overallStatus.complete}</span>
            </div>
            <div className="text-green-600 text-sm font-medium">완료된 시트</div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">⚠️</span>
              <span className="text-2xl font-bold text-yellow-800">{overallStatus.partial}</span>
            </div>
            <div className="text-yellow-600 text-sm font-medium">부분 완료</div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">❌</span>
              <span className="text-2xl font-bold text-red-800">{overallStatus.missing}</span>
            </div>
            <div className="text-red-600 text-sm font-medium">미완료 시트</div>
          </div>
        </motion.div>

        {/* Sheets Grid */}
        <motion.div 
          className="grid lg:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {sheets.map((sheet, index) => {
            const statusInfo = getStatusInfo(sheet.status);
            
            return (
              <motion.div
                key={sheet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl border-2 ${statusInfo.borderColor} overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer`}
                whileHover={{ y: -2, scale: 1.02 }}
                onClick={() => setSelectedSheet(sheet.id)}
              >
                {/* Sheet Header */}
                <div className={`${statusInfo.bgColor} px-6 py-4 border-b ${statusInfo.borderColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`h-10 w-10 bg-gradient-to-r ${statusInfo.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                        {statusInfo.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{sheet.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-semibold ${statusInfo.textColor} px-2 py-1 rounded-full bg-white/50`}>
                            {statusInfo.label}
                          </span>
                          {sheet.lastUpdated && (
                            <span className="text-xs text-slate-500">
                              {sheet.lastUpdated.toLocaleDateString('ko-KR')} 업데이트
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-800">{sheet.progress}%</div>
                      <div className="text-xs text-slate-500">완성도</div>
                    </div>
                  </div>
                </div>

                {/* Sheet Content */}
                <div className="p-6">
                  <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                    {sheet.description}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                      <span>진행률</span>
                      <span>{sheet.completedFields} / {sheet.requiredFields} 필드 완료</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${statusInfo.color} transition-all duration-500`}
                        style={{ width: `${sheet.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button 
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle view action
                      }}
                    >
                      📋 데이터 보기
                    </button>
                    <button 
                      className={`flex-1 bg-gradient-to-r ${statusInfo.color} text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDataUpdate(sheet.id, {});
                      }}
                    >
                      ✏️ 편집하기
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="mt-12 bg-white rounded-xl border border-slate-200 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-bold text-slate-800 mb-6">빠른 작업</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
              <span className="text-2xl">📊</span>
              <div>
                <div className="font-medium text-slate-800">Excel 템플릿 가져오기</div>
                <div className="text-xs text-slate-500">기존 Excel 파일에서 데이터 추출</div>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
              <span className="text-2xl">🔄</span>
              <div>
                <div className="font-medium text-slate-800">이전 RFP 데이터 복사</div>
                <div className="text-xs text-slate-500">과거 제안서 데이터 재사용</div>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
              <span className="text-2xl">💾</span>
              <div>
                <div className="font-medium text-slate-800">데이터 백업</div>
                <div className="text-xs text-slate-500">현재 데이터를 안전하게 저장</div>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DataVault;