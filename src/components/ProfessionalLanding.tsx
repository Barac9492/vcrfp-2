import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import RFPProcessingWorkflow from './RFPProcessingWorkflow';
import ProfessionalDashboard from './ProfessionalDashboard';

interface UploadedFile {
  file: File;
  id: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  extractedData?: any;
}

const ProfessionalLanding = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentStep, setCurrentStep] = useState<'onboarding' | 'upload' | 'processing' | 'workflow'>('onboarding');
  const [processingFile, setProcessingFile] = useState<UploadedFile | null>(null);
  const [_isFirstTime, setIsFirstTime] = useState(true);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (currentStep === 'onboarding') {
      setCurrentStep('upload');
    }

    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploading' as const,
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Enhanced processing simulation
    newFiles.forEach((uploadedFile, index) => {
      setTimeout(() => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, status: 'processing', progress: 0 }
              : f
          )
        );

        const progressInterval = setInterval(() => {
          setUploadedFiles(prev => 
            prev.map(f => {
              if (f.id === uploadedFile.id) {
                const newProgress = Math.min(f.progress + Math.random() * 15 + 5, 100);
                if (newProgress >= 100) {
                  clearInterval(progressInterval);
                  return { 
                    ...f, 
                    status: 'ready', 
                    progress: 100,
                    extractedData: mockExtractedData(f.file.name)
                  };
                }
                return { ...f, progress: newProgress };
              }
              return f;
            })
          );
        }, 400);
      }, index * 800);
    });
  }, [currentStep]);

  const mockExtractedData = (fileName: string) => ({
    rfpTitle: fileName.replace(/\.(pdf|docx?|xlsx?|txt)$/i, '').replace(/[-_]/g, ' '),
    issuer: '한국정보통신진흥기금 (KIF)',
    program: '2025년 AI·디지털 혁신 전문투자조합 GP 선정사업',
    deadline: '2025-08-28',
    fundSize: '1,500억원 (3개 조합, 각 500억원)',
    confidence: Math.floor(Math.random() * 10) + 90,
    requiredFields: [
      { field: '운용사명', type: 'text', required: true, description: '법인 등록 정식 회사명' },
      { field: '설립일자', type: 'date', required: true, description: '회사 설립일 (YYYY.MM.DD)' },
      { field: '대표자명', type: 'text', required: true, description: '법정 대표자 성명' },
      { field: '총운용자산(AUM)', type: 'currency', required: true, description: '총 운용자산 규모 (백만원 단위)' },
      { field: 'GP 출자비율', type: 'percentage', required: true, description: 'GP 최소 출자 비율 (1% 이상)' },
      { field: '핵심운용인력', type: 'array', required: true, description: '투자팀 핵심 구성원 (최소 3명)' },
      { field: '투자전략', type: 'text', required: true, description: 'AI·디지털 분야 투자 전략' },
      { field: '과거투자실적', type: 'file', required: true, description: '최근 5년간 투자 포트폴리오' },
      { field: '재무실적', type: 'file', required: true, description: '최근 3년간 회계감사보고서' },
      { field: '의무투자계획', type: 'text', required: true, description: 'AI·디지털 분야 60% 의무투자 계획' }
    ],
    sections: [
      { name: '표지', required: 5, optional: 0, completion: 0 },
      { name: '1-0.제안펀드 구성', required: 8, optional: 2, completion: 0 },
      { name: '1-1.회사현황', required: 12, optional: 3, completion: 0 },
      { name: '1-2.재무실적', required: 15, optional: 1, completion: 0 },
      { name: '1-4.핵심운용인력 관리현황', required: 18, optional: 4, completion: 0 },
      { name: '2-1.조합 결성실적', required: 10, optional: 2, completion: 0 },
      { name: '2-2.조합 운용실적', required: 14, optional: 3, completion: 0 },
      { name: '2-4.투자전략', required: 20, optional: 5, completion: 0 }
    ]
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt']
    },
    maxSize: 100 * 1024 * 1024,
    multiple: true
  });

  const resetToOnboarding = () => {
    setUploadedFiles([]);
    setCurrentStep('onboarding');
    setProcessingFile(null);
    setIsFirstTime(false);
  };

  const startWorkflow = (file: UploadedFile) => {
    setProcessingFile(file);
    setCurrentStep('workflow');
  };

  if (currentStep === 'workflow' && processingFile) {
    return (
      <RFPProcessingWorkflow
        rfpData={processingFile.extractedData}
        onBack={() => setCurrentStep('upload')}
        onComplete={() => {
          console.log('RFP processing completed');
        }}
      />
    );
  }

  // Show professional dashboard when files are ready
  if ((currentStep === 'upload' || currentStep === 'processing') && 
      uploadedFiles.length > 0 && 
      uploadedFiles.some(f => f.status === 'ready')) {
    return (
      <ProfessionalDashboard
        uploadedFiles={uploadedFiles}
        onFileSelect={startWorkflow}
        onStartOver={resetToOnboarding}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Professional Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  KIF RFP 자동화 플랫폼
                </h1>
                <p className="text-xs text-slate-500">정부 출자사업 RFP 대응 전문 솔루션</p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <motion.div 
                className="hidden md:flex items-center space-x-6 text-sm text-slate-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="flex items-center space-x-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>AI Ready</span>
                </span>
                <span>|</span>
                <span>Enterprise Grade</span>
              </motion.div>
              
              {uploadedFiles.length > 0 && (
                <motion.button
                  onClick={resetToOnboarding}
                  className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  New Project
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {currentStep === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              {/* Hero Section */}
              <motion.div 
                className="mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <motion.h1 
                  className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  정부 출자사업 RFP를
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    완벽한 제안서로 전환
                  </span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  RFP 문서를 업로드하면 AI가 요구사항을 분석하고, 데이터 수집을 가이드하며, 
                  전문적이고 규정을 준수하는 제안서 패키지를 몇 분 안에 생성합니다.
                </motion.p>

                <motion.div
                  className="flex items-center justify-center space-x-8 text-sm text-slate-500 mb-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>99.2% 정확도</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>평균 15분 소요</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>엔터프라이즈 보안</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Upload Zone */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                <div
                  {...getRootProps()}
                  className={`relative group cursor-pointer transition-all duration-300 ${
                    isDragActive
                      ? 'scale-105'
                      : 'hover:scale-[1.02]'
                  }`}
                >
                  <input {...getInputProps()} />
                  
                  {/* Main Upload Area */}
                  <div className={`
                    relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300
                    ${isDragActive 
                      ? 'border-blue-400 bg-blue-50/50 shadow-lg shadow-blue-500/25' 
                      : 'border-slate-300 bg-white/50 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-xl'
                    }
                  `}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      }} />
                    </div>

                    <div className="relative p-16">
                      <motion.div
                        animate={isDragActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="text-6xl mb-6"
                      >
                        {isDragActive ? '🎯' : '📄'}
                      </motion.div>

                      <h3 className="text-2xl font-bold text-slate-800 mb-3">
                        {isDragActive ? 'RFP 파일을 여기에 드롭하세요' : 'RFP 문서 업로드'}
                      </h3>
                      
                      <p className="text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                        RFP 문서를 드래그 앤 드롭하거나 클릭하여 파일을 선택하세요. 
                        PDF, Word, Excel, 텍스트 파일을 최대 100MB까지 지원합니다.
                      </p>

                      {/* File Type Indicators */}
                      <div className="flex items-center justify-center space-x-8 mb-8">
                        {[
                          { icon: '📄', label: 'PDF', color: 'text-red-500' },
                          { icon: '📝', label: 'Word', color: 'text-blue-500' },
                          { icon: '📊', label: 'Excel', color: 'text-green-500' },
                          { icon: '📋', label: 'Text', color: 'text-slate-500' }
                        ].map((type, index) => (
                          <motion.div
                            key={type.label}
                            className="flex flex-col items-center space-y-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            whileHover={{ scale: 1.1 }}
                          >
                            <div className="text-2xl">{type.icon}</div>
                            <span className={`text-sm font-medium ${type.color}`}>{type.label}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <motion.button
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        업로드할 파일 선택
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Features Section */}
              <motion.div 
                className="grid md:grid-cols-3 gap-8 mt-20"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {[
                  {
                    icon: '🤖',
                    title: 'AI 기반 분석',
                    description: '고급 문서 처리 기술로 99% 이상의 정확도로 요구사항 추출',
                    color: 'from-blue-500 to-cyan-500'
                  },
                  {
                    icon: '💬',
                    title: '지능형 가이드',
                    description: '대화형 인터페이스로 데이터 수집 과정을 단계별로 안내',
                    color: 'from-green-500 to-emerald-500'
                  },
                  {
                    icon: '📊',
                    title: '전문 문서 생성',
                    description: '완벽한 포맷과 규정 준수로 제출 준비된 문서 자동 생성',
                    color: 'from-purple-500 to-pink-500'
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <div className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 group-hover:bg-white/80">
                      <div className={`h-16 w-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl group-hover:scale-110 transition-transform duration-300`}>
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {(currentStep === 'upload' || currentStep === 'processing') && uploadedFiles.length > 0 && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Processing Header */}
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-4xl font-bold text-slate-800 mb-4">문서 분석 진행 중</h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  AI가 RFP 문서를 신중하게 분석하여 요구사항을 추출하고 응답에 필요한 정보를 식별하고 있습니다.
                </p>
              </motion.div>

              {/* Processing Steps */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {[
                  { step: 1, title: '문서 처리', description: '내용 읽기 및 파싱 중', active: true },
                  { step: 2, title: '요구사항 추출', description: '핵심 요구사항 식별 중', active: uploadedFiles.some(f => f.progress > 30) },
                  { step: 3, title: '분석 완료', description: '데이터 수집 준비 완료', active: uploadedFiles.some(f => f.status === 'ready') }
                ].map((step, index) => (
                  <motion.div
                    key={step.step}
                    className={`bg-white rounded-xl border-2 p-6 transition-all duration-500 ${
                      step.active ? 'border-blue-300 bg-blue-50' : 'border-slate-200'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 mx-auto font-bold ${
                      step.active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {step.step}
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* File Processing Cards */}
              <div className="space-y-6">
                {uploadedFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Continue with enhanced file processing UI... */}
                    {/* This would be much longer with proper micro-interactions, progress indicators, etc. */}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfessionalLanding;