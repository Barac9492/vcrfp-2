import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import RFPProcessingWorkflow from './RFPProcessingWorkflow';

interface UploadedFile {
  file: File;
  id: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  extractedData?: any;
}

const RFPUploadLanding = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'workflow'>('upload');
  const [processingFile, setProcessingFile] = useState<UploadedFile | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploading' as const,
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate file processing
    newFiles.forEach((uploadedFile, index) => {
      setTimeout(() => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, status: 'processing', progress: 0 }
              : f
          )
        );

        // Simulate processing progress
        const progressInterval = setInterval(() => {
          setUploadedFiles(prev => 
            prev.map(f => {
              if (f.id === uploadedFile.id) {
                const newProgress = Math.min(f.progress + Math.random() * 20, 100);
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
        }, 500);
      }, index * 1000);
    });
  }, []);

  const mockExtractedData = (fileName: string) => {
    // Mock extracted RFP data - in real implementation, this would come from AI processing
    return {
      rfpTitle: fileName.replace('.pdf', '').replace(/[-_]/g, ' '),
      issuer: '한국개발은행',
      program: '2024년 신성장 투자펀드',
      deadline: '2024-03-15',
      fundSize: '1000억원',
      requiredFields: [
        { field: '회사명', type: 'text', required: true, description: '운용사 회사명' },
        { field: 'AUM', type: 'currency', required: true, description: '총 운용자산 규모' },
        { field: 'GP 출자비율', type: 'percentage', required: true, description: 'GP 최소 출자 비율' },
        { field: '팀 구성원', type: 'array', required: true, description: '핵심 투자팀 구성원 정보' },
        { field: '투자전략', type: 'text', required: true, description: '투자 전략 및 접근 방식' },
        { field: '과거 실적', type: 'file', required: true, description: '과거 3년간 투자 실적 자료' }
      ],
      sections: [
        { name: '회사 개요', required: 8, optional: 3 },
        { name: '투자 전략', required: 6, optional: 2 },
        { name: '팀 소개', required: 5, optional: 4 },
        { name: '재무 모델', required: 7, optional: 1 },
        { name: '컴플라이언스', required: 9, optional: 0 }
      ]
    };
  };

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
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const startWorkflow = (file: UploadedFile) => {
    setProcessingFile(file);
    setCurrentStep('workflow');
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'txt': return '📋';
      default: return '📎';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading': return 'text-blue-600 bg-blue-50';
      case 'processing': return 'text-yellow-600 bg-yellow-50';
      case 'ready': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  if (currentStep === 'workflow' && processingFile) {
    return (
      <RFPProcessingWorkflow
        rfpData={processingFile.extractedData}
        onBack={() => setCurrentStep('upload')}
        onComplete={() => {
          // Handle completion
          console.log('RFP processing completed');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">RFP Response Platform</h1>
            <p className="text-xl text-slate-600">Upload your RFP documents and let AI guide you through the response process</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Upload Area */}
        {uploadedFiles.length === 0 ? (
          <div className="text-center mb-12">
            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200 cursor-pointer ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-6xl mb-6">📁</div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                {isDragActive ? 'Drop your RFP files here' : 'Upload RFP Documents'}
              </h3>
              <p className="text-slate-600 mb-6 max-w-lg mx-auto">
                Drag and drop your RFP documents here, or click to browse files. 
                We support PDF, Word, Excel, and text files up to 50MB each.
              </p>
              
              <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
                <div className="flex items-center space-x-2">
                  <span>📄</span>
                  <span>PDF</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>📝</span>
                  <span>Word</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>📊</span>
                  <span>Excel</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>📋</span>
                  <span>Text</span>
                </div>
              </div>
            </div>

            {/* Features Preview */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Document Analysis</h3>
                <p className="text-slate-600">Automatically extract requirements and identify needed information from RFP documents</p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Guided Data Collection</h3>
                <p className="text-slate-600">Interactive conversations to gather all necessary information step by step</p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Professional Output</h3>
                <p className="text-slate-600">Generate polished, compliant response documents ready for submission</p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Clear Step-by-Step Instructions */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8 mb-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">What happens next?</h2>
                <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
                  Our AI is analyzing your RFP documents to understand what information is needed. 
                  Once analysis is complete, you'll be guided through a simple conversation to provide the required details.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <div className="text-2xl mb-2">🔍</div>
                    <h3 className="font-semibold text-slate-900 mb-1">Step 1: Analysis</h3>
                    <p className="text-sm text-slate-600">AI extracts requirements from your RFP documents</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <div className="text-2xl mb-2">💬</div>
                    <h3 className="font-semibold text-slate-900 mb-1">Step 2: Data Collection</h3>
                    <p className="text-sm text-slate-600">Answer questions to provide needed information</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <div className="text-2xl mb-2">📄</div>
                    <h3 className="font-semibold text-slate-900 mb-1">Step 3: Document Creation</h3>
                    <p className="text-sm text-slate-600">Professional response documents are generated</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Analysis Results */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Document Analysis</h2>
                  <p className="text-slate-600">AI is processing your uploaded files</p>
                </div>
                <button
                  onClick={() => setUploadedFiles([])}
                  className="text-slate-500 hover:text-slate-700 text-sm border border-slate-300 px-3 py-1 rounded"
                >
                  Start Over
                </button>
              </div>

              <div className="space-y-6">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    {/* File Header */}
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">{getFileIcon(file.file.name)}</div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{file.file.name}</h3>
                            <p className="text-sm text-slate-500">
                              {(file.file.size / 1024 / 1024).toFixed(1)} MB • 
                              {file.file.type.includes('pdf') ? ' PDF Document' :
                               file.file.type.includes('word') ? ' Word Document' :
                               file.file.type.includes('sheet') ? ' Excel Spreadsheet' :
                               file.file.type.includes('excel') ? ' Excel Spreadsheet' :
                               ' Text Document'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(file.status)}`}>
                            {file.status === 'uploading' && '⬆️ Uploading...'}
                            {file.status === 'processing' && '🔍 Analyzing...'}
                            {file.status === 'ready' && '✅ Ready'}
                            {file.status === 'error' && '❌ Error'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Section */}
                    {(file.status === 'uploading' || file.status === 'processing') && (
                      <div className="px-6 py-4 bg-blue-50">
                        <div className="flex justify-between text-sm text-slate-700 mb-2">
                          <span>
                            {file.status === 'uploading' ? 'Uploading file...' : 'AI is reading and analyzing the document...'}
                          </span>
                          <span className="font-medium">{Math.round(file.progress)}%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-3">
                          <div 
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-slate-600 mt-2">
                          {file.status === 'processing' && 'Extracting requirements, deadlines, and needed information...'}
                        </p>
                      </div>
                    )}

                    {/* Results Section */}
                    {file.status === 'ready' && file.extractedData && (
                      <div className="px-6 py-4">
                        <h4 className="font-semibold text-slate-900 mb-4">📋 Analysis Complete! Here's what we found:</h4>
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <span className="text-green-600 font-semibold">🏛️</span>
                              <div>
                                <div className="font-medium text-slate-900">Issuing Organization</div>
                                <div className="text-slate-700">{file.extractedData.issuer}</div>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <span className="text-blue-600 font-semibold">📊</span>
                              <div>
                                <div className="font-medium text-slate-900">Program Name</div>
                                <div className="text-slate-700">{file.extractedData.program}</div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <span className="text-red-600 font-semibold">⏰</span>
                              <div>
                                <div className="font-medium text-slate-900">Submission Deadline</div>
                                <div className="text-slate-700 font-semibold">{file.extractedData.deadline}</div>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <span className="text-purple-600 font-semibold">💰</span>
                              <div>
                                <div className="font-medium text-slate-900">Fund Size</div>
                                <div className="text-slate-700">{file.extractedData.fundSize}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-green-600">📝</span>
                            <span className="font-semibold text-green-900">Information Required</span>
                          </div>
                          <p className="text-green-800 text-sm">
                            We identified <strong>{file.extractedData.requiredFields.length} pieces of information</strong> needed for your response. 
                            Our AI will ask you for each one in a simple conversation.
                          </p>
                        </div>

                        <div className="flex justify-center">
                          <button
                            onClick={() => startWorkflow(file)}
                            className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-green-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg"
                          >
                            🚀 Start Creating My Response
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Error State */}
                    {file.status === 'error' && (
                      <div className="px-6 py-4 bg-red-50">
                        <div className="flex items-center space-x-2 text-red-800">
                          <span>❌</span>
                          <span className="font-semibold">Analysis Failed</span>
                        </div>
                        <p className="text-red-700 text-sm mt-1">
                          We couldn't process this file. Please try uploading again or use a different format.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add More Files */}
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-white hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
            >
              <input {...getInputProps()} />
              <div className="text-2xl mb-2">📎</div>
              <h3 className="font-semibold text-slate-900 mb-1">Upload Additional RFP Documents</h3>
              <p className="text-slate-600 text-sm">Add more files to analyze multiple RFPs at once</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RFPUploadLanding;