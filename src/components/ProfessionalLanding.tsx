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
    issuer: '한국개발은행 (KDB)',
    program: '2024년 AI·디지털 전문투자조합 결성 지원사업',
    deadline: '2024-03-25',
    fundSize: '1,500억원',
    confidence: Math.floor(Math.random() * 15) + 85,
    requiredFields: [
      { field: '회사명', type: 'text', required: true, description: '법인 등록명' },
      { field: '설립일', type: 'date', required: true, description: '회사 설립일자' },
      { field: '대표이사', type: 'text', required: true, description: '대표이사 성명' },
      { field: 'AUM', type: 'currency', required: true, description: '총 운용자산 규모' },
      { field: 'GP 출자비율', type: 'percentage', required: true, description: 'GP 최소 출자 비율 (10% 이상)' },
      { field: '핵심 인력', type: 'array', required: true, description: '투자심의위원회 구성원' },
      { field: '투자전략', type: 'text', required: true, description: '투자 전략 및 차별화 포인트' },
      { field: '과거 실적', type: 'file', required: true, description: '최근 5년간 투자 실적' },
      { field: '재무제표', type: 'file', required: true, description: '최근 3년간 감사보고서' }
    ],
    sections: [
      { name: '사업자 개요', required: 12, optional: 3, completion: 0 },
      { name: '투자 전략', required: 8, optional: 2, completion: 0 },
      { name: '조직 및 인력', required: 10, optional: 4, completion: 0 },
      { name: '운용 계획', required: 15, optional: 2, completion: 0 },
      { name: '재무 계획', required: 9, optional: 1, completion: 0 },
      { name: '리스크 관리', required: 6, optional: 3, completion: 0 }
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
                  RFP Response Studio
                </h1>
                <p className="text-xs text-slate-500">AI-Powered Proposal Generation</p>
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
                  Transform RFPs into
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Winning Proposals
                  </span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Upload your RFP documents and let our AI analyze requirements, guide you through data collection, 
                  and generate professional, compliant response packages in minutes.
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
                    <span>99.2% Accuracy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>15min Average</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Enterprise Security</span>
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
                        {isDragActive ? 'Drop your RFP files here' : 'Upload RFP Documents'}
                      </h3>
                      
                      <p className="text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Drag and drop your RFP documents, or click to browse. 
                        Supports PDF, Word, Excel, and text files up to 100MB each.
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
                        Select Files to Upload
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
                    title: 'AI-Powered Analysis',
                    description: 'Advanced document processing extracts requirements with 99%+ accuracy',
                    color: 'from-blue-500 to-cyan-500'
                  },
                  {
                    icon: '💬',
                    title: 'Intelligent Guidance',
                    description: 'Conversational interface guides you through data collection step-by-step',
                    color: 'from-green-500 to-emerald-500'
                  },
                  {
                    icon: '📊',
                    title: 'Professional Output',
                    description: 'Generate submission-ready documents with perfect formatting and compliance',
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
                <h2 className="text-4xl font-bold text-slate-800 mb-4">Document Analysis in Progress</h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Our AI is carefully analyzing your RFP documents to extract requirements and identify the information needed for your response.
                </p>
              </motion.div>

              {/* Processing Steps */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {[
                  { step: 1, title: 'Document Processing', description: 'Reading and parsing content', active: true },
                  { step: 2, title: 'Requirement Extraction', description: 'Identifying key requirements', active: uploadedFiles.some(f => f.progress > 30) },
                  { step: 3, title: 'Analysis Complete', description: 'Ready for data collection', active: uploadedFiles.some(f => f.status === 'ready') }
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