import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadedFile {
  file: File;
  id: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  extractedData?: any;
}

const ModernLanding = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentStep, setCurrentStep] = useState<'welcome' | 'upload' | 'processing'>('welcome');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (currentStep === 'welcome') {
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
                const newProgress = Math.min(f.progress + Math.random() * 12 + 3, 100);
                if (newProgress >= 100) {
                  clearInterval(progressInterval);
                  setCurrentStep('processing');
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
        }, 200);
      }, index * 500);
    });
  }, [currentStep]);

  const mockExtractedData = (fileName: string) => ({
    rfpTitle: fileName.replace(/\.(pdf|docx?|xlsx?|txt)$/i, '').replace(/[-_]/g, ' '),
    issuer: '한국정보통신진흥기금 (KIF)',
    program: '2025년 AI·디지털 혁신 전문투자조합 GP 선정사업',
    deadline: '2025-08-28',
    fundSize: '1,500억원',
    confidence: Math.floor(Math.random() * 8) + 92,
    requiredFields: 12,
    completionRate: 0,
    estimatedTime: '15-20분'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 bg-gradient-to-br from-yellow-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 h-80 w-80 bg-gradient-to-br from-green-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {currentStep === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex items-center justify-center"
            >
              <div className="max-w-4xl mx-auto px-6 text-center">
                {/* Hero Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="mb-8">
                    <motion.div
                      className="h-20 w-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="text-white font-bold text-3xl">K</span>
                    </motion.div>
                    
                    <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6 leading-tight">
                      KIF RFP
                      <br />
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        자동화 플랫폼
                      </span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
                      AI 기반 정부 출자사업 RFP 대응 솔루션으로
                      <br />
                      <span className="font-semibold text-slate-800">복잡한 제안서 작성을 15분 만에</span>
                    </p>
                  </div>

                  {/* Features Grid */}
                  <motion.div 
                    className="grid md:grid-cols-3 gap-6 mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {[
                      {
                        icon: '🤖',
                        title: 'AI 문서 분석',
                        description: '99.5% 정확도로 RFP 요구사항 자동 추출',
                        color: 'from-blue-500 to-cyan-500'
                      },
                      {
                        icon: '⚡',
                        title: '초고속 처리',
                        description: '평균 15분 만에 완성도 높은 제안서 생성',
                        color: 'from-yellow-500 to-orange-500'
                      },
                      {
                        icon: '🎯',
                        title: '규정 완벽 준수',
                        description: 'KIF 가이드라인 100% 준수하는 전문 문서',
                        color: 'from-purple-500 to-pink-500'
                      }
                    ].map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        className="group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ y: -5 }}
                      >
                        <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6 h-full hover:bg-white/80 transition-all duration-300 hover:shadow-xl group-hover:shadow-lg">
                          <div className={`h-16 w-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-content mx-auto mb-4 text-3xl group-hover:scale-110 transition-transform duration-300`}>
                            <span className="mx-auto">{feature.icon}</span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 mb-2">{feature.title}</h3>
                          <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* CTA Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div
                      {...getRootProps()}
                      className={`relative group cursor-pointer transition-all duration-500 ${
                        isDragActive ? 'scale-105' : 'hover:scale-102'
                      }`}
                    >
                      <input {...getInputProps()} />
                      
                      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 md:p-12 transition-all duration-300 ${
                        isDragActive ? 'shadow-2xl shadow-blue-500/50' : 'hover:shadow-xl hover:shadow-blue-500/25'
                      }`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="relative z-10 text-center text-white">
                          <motion.div
                            className="text-6xl mb-6"
                            animate={isDragActive ? { scale: [1, 1.2, 1], rotate: [0, 10, 0] } : {}}
                            transition={{ duration: 0.5 }}
                          >
                            {isDragActive ? '🎯' : '📄'}
                          </motion.div>
                          
                          <h3 className="text-2xl md:text-3xl font-bold mb-4">
                            {isDragActive ? 'RFP 파일을 여기에 드롭하세요!' : 'RFP 문서 업로드하기'}
                          </h3>
                          
                          <p className="text-blue-100 mb-6 text-lg max-w-2xl mx-auto">
                            드래그 앤 드롭하거나 클릭하여 RFP 문서를 업로드하세요
                          </p>
                          
                          <div className="flex items-center justify-center space-x-8 text-sm text-blue-200 mb-8">
                            {['PDF', 'Word', 'Excel', 'Text'].map((type) => (
                              <div key={type} className="flex items-center space-x-2">
                                <div className="h-2 w-2 bg-blue-200 rounded-full"></div>
                                <span>{type}</span>
                              </div>
                            ))}
                          </div>
                          
                          <motion.button
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            파일 선택하기
                          </motion.button>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-slate-500 text-sm mt-6">
                      최대 100MB • 여러 파일 동시 업로드 가능 • 완전한 데이터 보안
                    </p>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {(currentStep === 'upload' || currentStep === 'processing') && uploadedFiles.length > 0 && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-screen py-12"
            >
              <div className="max-w-4xl mx-auto px-6">
                {/* Processing Header */}
                <div className="text-center mb-12">
                  <motion.div
                    className="h-16 w-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <span className="text-white text-2xl">🔍</span>
                  </motion.div>
                  
                  <h2 className="text-4xl font-bold text-slate-800 mb-4">AI가 문서를 분석하고 있습니다</h2>
                  <p className="text-xl text-slate-600">
                    곧 완료됩니다... 잠시만 기다려주세요
                  </p>
                </div>

                {/* File Processing Cards */}
                <div className="space-y-6">
                  {uploadedFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden shadow-lg"
                      layout
                    >
                      <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
                              📄
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800 text-lg">{file.file.name}</h3>
                              <p className="text-slate-500 text-sm">
                                {(file.file.size / 1024 / 1024).toFixed(1)} MB
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-slate-800">{Math.round(file.progress)}%</div>
                            <div className="text-xs text-slate-500">완료</div>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-6">
                          <div className="flex justify-between text-sm text-slate-600 mb-2">
                            <span>
                              {file.status === 'uploading' && '파일 업로드 중...'}
                              {file.status === 'processing' && 'AI 분석 중...'}
                              {file.status === 'ready' && '분석 완료!'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${file.progress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>

                        {/* Results */}
                        {file.status === 'ready' && file.extractedData && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200"
                          >
                            <div className="flex items-center space-x-2 mb-4">
                              <span className="text-2xl">✅</span>
                              <span className="font-bold text-green-800 text-lg">분석 완료!</span>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-blue-600">🏛️</span>
                                  <span className="text-sm font-medium text-slate-600">발주기관</span>
                                </div>
                                <div className="font-semibold text-slate-800">{file.extractedData.issuer}</div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-purple-600">⏰</span>
                                  <span className="text-sm font-medium text-slate-600">제출마감</span>
                                </div>
                                <div className="font-semibold text-slate-800">{file.extractedData.deadline}</div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-green-600">💰</span>
                                  <span className="text-sm font-medium text-slate-600">펀드규모</span>
                                </div>
                                <div className="font-semibold text-slate-800">{file.extractedData.fundSize}</div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-orange-600">📊</span>
                                  <span className="text-sm font-medium text-slate-600">분석 신뢰도</span>
                                </div>
                                <div className="font-semibold text-slate-800">{file.extractedData.confidence}%</div>
                              </div>
                            </div>
                            
                            <motion.button
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              🚀 제안서 작성 시작하기
                            </motion.button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ModernLanding;