import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DashboardProps {
  uploadedFiles: any[];
  onFileSelect: (file: any) => void;
  onStartOver: () => void;
}

const ProfessionalDashboard = ({ uploadedFiles, onFileSelect, onStartOver }: DashboardProps) => {
  const [_selectedFile, _setSelectedFile] = useState<any>(null);
  const [_isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    // Simulate analysis completion
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const getFileTypeInfo = (file: any) => {
    const ext = file.file.name.split('.').pop()?.toLowerCase();
    const fileType = file.file.type;
    
    if (ext === 'pdf' || fileType.includes('pdf')) {
      return { icon: '📄', type: 'PDF Document', color: 'from-red-500 to-red-600' };
    } else if (ext === 'docx' || ext === 'doc' || fileType.includes('word')) {
      return { icon: '📝', type: 'Word Document', color: 'from-blue-500 to-blue-600' };
    } else if (ext === 'xlsx' || ext === 'xls' || fileType.includes('sheet') || fileType.includes('excel')) {
      return { icon: '📊', type: 'Excel Spreadsheet', color: 'from-green-500 to-green-600' };
    } else {
      return { icon: '📋', type: 'Text Document', color: 'from-slate-500 to-slate-600' };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Professional Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={onStartOver}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors group"
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">New Project</span>
              </motion.button>
              
              <div className="h-6 w-px bg-slate-300"></div>
              
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Document Analysis Results
                </h1>
                <p className="text-sm text-slate-500">
                  {uploadedFiles.length} document{uploadedFiles.length !== 1 ? 's' : ''} processed • 
                  <span className="text-green-600 ml-1">Analysis Complete</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">AI Ready</span>
                </div>
                <div className="text-slate-500">•</div>
                <div className="text-slate-600">
                  Confidence: <span className="font-semibold text-slate-800">96%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Analysis Overview */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Analysis Complete! 🎉</h2>
                <p className="text-blue-100 text-lg">
                  Our AI has successfully analyzed your RFP documents and extracted key requirements.
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {uploadedFiles.reduce((sum, file) => sum + (file.extractedData?.requiredFields?.length || 0), 0)}
                </div>
                <div className="text-blue-200">Fields Identified</div>
              </div>
            </div>
          </div>

          {/* Process Steps */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { 
                step: '01', 
                title: 'Next: Data Collection', 
                description: 'Answer guided questions to provide required information',
                action: 'Start Now',
                status: 'ready',
                icon: '💬'
              },
              { 
                step: '02', 
                title: 'Document Generation', 
                description: 'AI creates professional response documents',
                action: 'Pending',
                status: 'pending',
                icon: '📄'
              },
              { 
                step: '03', 
                title: 'Final Review', 
                description: 'Quality check and download submission package',
                action: 'Pending',
                status: 'pending',
                icon: '✅'
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                className={`bg-white rounded-xl border-2 p-6 transition-all duration-300 ${
                  step.status === 'ready' 
                    ? 'border-blue-300 bg-blue-50/50 shadow-lg shadow-blue-500/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2, scale: 1.02 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`text-2xl ${step.status === 'ready' ? 'animate-bounce' : ''}`}>
                    {step.icon}
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                    step.status === 'ready' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {step.step}
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{step.description}</p>
                <div className={`text-sm font-medium ${
                  step.status === 'ready' ? 'text-blue-600' : 'text-slate-400'
                }`}>
                  {step.action}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Document Results */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {uploadedFiles.map((file) => {
            const fileInfo = getFileTypeInfo(file);
            const data = file.extractedData;
            
            return (
              <motion.div
                key={file.id}
                variants={itemVariants}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -4 }}
              >
                {/* File Header */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`h-14 w-14 bg-gradient-to-br ${fileInfo.color} rounded-xl flex items-center justify-center text-2xl text-white`}>
                        {fileInfo.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{file.file.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <span>{fileInfo.type}</span>
                          <span>•</span>
                          <span>{(file.file.size / 1024 / 1024).toFixed(1)} MB</span>
                          <span>•</span>
                          <span className="text-green-600 font-medium">✓ Analyzed</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm text-slate-500">Confidence:</span>
                        <span className="text-lg font-bold text-green-600">{data?.confidence || 95}%</span>
                      </div>
                      <div className="text-xs text-slate-400">Analysis Quality</div>
                    </div>
                  </div>
                </div>

                {/* Analysis Results */}
                <div className="p-8">
                  {/* Key Information Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                      { label: 'Issuing Organization', value: data?.issuer, icon: '🏛️', color: 'text-blue-600' },
                      { label: 'Program Name', value: data?.program, icon: '📊', color: 'text-green-600' },
                      { label: 'Submission Deadline', value: data?.deadline, icon: '⏰', color: 'text-red-600' },
                      { label: 'Target Fund Size', value: data?.fundSize, icon: '💰', color: 'text-purple-600' }
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            {item.label}
                          </span>
                        </div>
                        <div className={`font-bold text-slate-800 ${item.color}`}>
                          {item.value || 'Not specified'}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Requirements Summary */}
                  <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* Required Information */}
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
                        <span>📋</span>
                        <span>Required Information ({data?.requiredFields?.length || 0})</span>
                      </h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {data?.requiredFields?.slice(0, 6).map((field: any, i: number) => (
                          <motion.div
                            key={i}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <div>
                              <div className="font-medium text-slate-800">{field.field}</div>
                              <div className="text-xs text-slate-500">{field.description}</div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {field.required && (
                                <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                                  Required
                                </span>
                              )}
                              <span className="text-xs text-slate-400 capitalize">{field.type}</span>
                            </div>
                          </motion.div>
                        ))}
                        {(data?.requiredFields?.length || 0) > 6 && (
                          <div className="text-center text-sm text-slate-500 py-2">
                            +{(data?.requiredFields?.length || 0) - 6} more fields
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Document Sections */}
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
                        <span>📑</span>
                        <span>Document Sections ({data?.sections?.length || 0})</span>
                      </h4>
                      <div className="space-y-3">
                        {data?.sections?.map((section: any, i: number) => (
                          <motion.div
                            key={i}
                            className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-slate-800">{section.name}</div>
                              <div className="text-xs text-slate-500">
                                {section.required} req • {section.optional} opt
                              </div>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${section.completion || 0}%` }}
                              ></div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-center">
                    <motion.button
                      onClick={() => onFileSelect(file)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>🚀</span>
                      <span>Start Creating Response</span>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;