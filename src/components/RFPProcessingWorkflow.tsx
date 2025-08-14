import { useState } from 'react';
import DataCollectionChat from './DataCollectionChat';
import DocumentGeneration from './DocumentGeneration';

interface RFPData {
  rfpTitle: string;
  issuer: string;
  program: string;
  deadline: string;
  fundSize: string;
  requiredFields: Array<{
    field: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  sections: Array<{
    name: string;
    required: number;
    optional: number;
  }>;
}

interface RFPProcessingWorkflowProps {
  rfpData: RFPData;
  onBack: () => void;
  onComplete: () => void;
}

const RFPProcessingWorkflow = ({ rfpData, onBack, onComplete }: RFPProcessingWorkflowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [collectedData, setCollectedData] = useState<Record<string, any>>({});

  const steps = [
    { id: 1, title: 'RFP Analysis', description: 'Review extracted requirements' },
    { id: 2, title: 'Data Collection', description: 'Provide required information' },
    { id: 3, title: 'Document Generation', description: 'Generate response documents' },
    { id: 4, title: 'Review & Submit', description: 'Final review and submission' }
  ];

  const handleDataCollection = (data: Record<string, any>) => {
    setCollectedData(prev => ({ ...prev, ...data }));
  };

  const proceedToNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Upload
              </button>
              <div className="h-6 w-px bg-slate-200"></div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{rfpData.rfpTitle}</h1>
                <p className="text-sm text-slate-600">{rfpData.issuer} • {rfpData.program}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Deadline</div>
              <div className="font-medium text-slate-900">{rfpData.deadline}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center space-x-3 ${
                  step.id === currentStep ? 'text-blue-600' : 
                  step.id < currentStep ? 'text-green-600' : 'text-slate-400'
                }`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id === currentStep ? 'bg-blue-100' :
                    step.id < currentStep ? 'bg-green-100' : 'bg-slate-100'
                  }`}>
                    {step.id < currentStep ? '✓' : step.id}
                  </div>
                  <div>
                    <div className="font-medium">{step.title}</div>
                    <div className="text-xs text-slate-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-16 mx-4 ${
                    step.id < currentStep ? 'bg-green-300' : 'bg-slate-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">RFP Analysis Results</h2>
            
            {/* RFP Summary */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Document Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Issuing Organization:</span>
                    <span className="font-medium">{rfpData.issuer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Program Name:</span>
                    <span className="font-medium">{rfpData.program}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Target Fund Size:</span>
                    <span className="font-medium">{rfpData.fundSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Submission Deadline:</span>
                    <span className="font-medium text-red-600">{rfpData.deadline}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Required Sections</h3>
                <div className="space-y-2">
                  {rfpData.sections.map((section, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium">{section.name}</span>
                      <div className="text-sm text-slate-600">
                        {section.required} required, {section.optional} optional
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Required Fields */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Information Needed</h3>
              <div className="grid gap-4">
                {rfpData.requiredFields.map((field, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-slate-900">{field.field}</span>
                        {field.required && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{field.description}</p>
                    </div>
                    <div className="text-sm text-slate-500 capitalize">{field.type}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={proceedToNextStep}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Start Data Collection →
              </button>
              <button
                onClick={onBack}
                className="border border-slate-300 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Upload Different RFP
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <DataCollectionChat
            requiredFields={rfpData.requiredFields}
            onDataCollected={handleDataCollection}
            onComplete={proceedToNextStep}
          />
        )}

        {currentStep === 3 && (
          <DocumentGeneration
            rfpData={rfpData}
            collectedData={collectedData}
            onComplete={proceedToNextStep}
          />
        )}

        {currentStep === 4 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Response Package Ready!</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Your RFP response documents have been generated and are ready for final review and submission.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 border border-slate-200 rounded-lg">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-semibold text-slate-900 mb-2">Executive Summary</h3>
                <p className="text-sm text-slate-600">2-page overview document</p>
                <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Download PDF
                </button>
              </div>
              
              <div className="p-6 border border-slate-200 rounded-lg">
                <div className="text-3xl mb-3">📋</div>
                <h3 className="font-semibold text-slate-900 mb-2">Complete Proposal</h3>
                <p className="text-sm text-slate-600">Full response package</p>
                <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Download ZIP
                </button>
              </div>
              
              <div className="p-6 border border-slate-200 rounded-lg">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="font-semibold text-slate-900 mb-2">Financial Models</h3>
                <p className="text-sm text-slate-600">Excel spreadsheets</p>
                <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Download XLSX
                </button>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={onComplete}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                ✓ Complete Process
              </button>
              <button
                onClick={() => setCurrentStep(1)}
                className="border border-slate-300 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Start New RFP
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RFPProcessingWorkflow;