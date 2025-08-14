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
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Drag and drop your RFP documents, or click to browse. 
                We support PDF, Word documents, and text files up to 50MB.
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
            {/* Upload Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Uploaded Documents</h2>
                <button
                  onClick={() => setUploadedFiles([])}
                  className="text-slate-500 hover:text-slate-700 text-sm"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getFileIcon(file.file.name)}</div>
                        <div>
                          <h3 className="font-medium text-slate-900">{file.file.name}</h3>
                          <p className="text-sm text-slate-500">
                            {(file.file.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(file.status)}`}>
                          {file.status === 'uploading' && 'Uploading...'}
                          {file.status === 'processing' && 'Processing...'}
                          {file.status === 'ready' && 'Ready'}
                          {file.status === 'error' && 'Error'}
                        </span>
                        
                        {file.status === 'ready' && (
                          <button
                            onClick={() => startWorkflow(file)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Start Response →
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {(file.status === 'uploading' || file.status === 'processing') && (
                      <div className="mt-3">
                        <div className="flex justify-between text-sm text-slate-600 mb-1">
                          <span>
                            {file.status === 'uploading' ? 'Uploading' : 'Analyzing document'}
                          </span>
                          <span>{Math.round(file.progress)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Extracted Info Preview */}
                    {file.status === 'ready' && file.extractedData && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                        <h4 className="font-medium text-slate-900 mb-2">Detected Information:</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600">Issuer:</span>
                            <span className="ml-2 font-medium">{file.extractedData.issuer}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Program:</span>
                            <span className="ml-2 font-medium">{file.extractedData.program}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Deadline:</span>
                            <span className="ml-2 font-medium">{file.extractedData.deadline}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Required Fields:</span>
                            <span className="ml-2 font-medium">{file.extractedData.requiredFields.length}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add More Files */}
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-white hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
            >
              <input {...getInputProps()} />
              <div className="text-3xl mb-3">➕</div>
              <p className="text-slate-600">Add more RFP documents</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RFPUploadLanding;