import { useState, useEffect } from 'react';
import type { RFP } from '../types/rfp';
import { qualityControlService, type ValidationReport, type QualityCheckResult } from '../services/qualityControlService';

interface QualityControlPanelProps {
  rfp: RFP;
  onValidationComplete?: (report: ValidationReport) => void;
}

const QualityControlPanel = ({ rfp, onValidationComplete }: QualityControlPanelProps) => {
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'sections'>('overview');
  const [autoFixResults, setAutoFixResults] = useState<{
    appliedFixes: string[];
    remainingIssues: QualityCheckResult[];
  } | null>(null);

  useEffect(() => {
    // Auto-run validation when component mounts
    runValidation();
  }, [rfp.id]);

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const report = await qualityControlService.validateRFPDocument(rfp);
      setValidationReport(report);
      onValidationComplete?.(report);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const runAutomaticFixes = async () => {
    if (!validationReport) return;
    
    try {
      const results = await qualityControlService.runAutomaticFixes(validationReport.qualityChecks);
      setAutoFixResults(results);
      
      // Re-run validation after fixes
      setTimeout(() => {
        runValidation();
      }, 1000);
    } catch (error) {
      console.error('Auto-fix failed:', error);
    }
  };

  const downloadReport = async () => {
    if (!validationReport) return;
    
    try {
      const reportBlob = await qualityControlService.generateQualityReport(rfp);
      const url = URL.createObjectURL(reportBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quality-report-${rfp.id}-${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Report download failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'fail': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-blue-500';
      default: return 'border-l-slate-500';
    }
  };

  if (isValidating) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">Running Quality Validation</h3>
        <p className="text-slate-600">Analyzing document completeness and compliance...</p>
      </div>
    );
  }

  if (!validationReport) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">Quality Control</h3>
        <p className="text-slate-600 mb-6">Run comprehensive validation checks on your databook</p>
        <button 
          onClick={runValidation}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Validation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Quality Control Report</h2>
            <p className="text-slate-600 mt-1">Generated {validationReport.generatedAt.toLocaleDateString()} at {validationReport.generatedAt.toLocaleTimeString()}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-slate-900">{validationReport.overallScore}%</div>
            <div className={`text-sm font-medium ${validationReport.readyForSubmission ? 'text-green-600' : 'text-yellow-600'}`}>
              {validationReport.readyForSubmission ? '✅ Ready for Submission' : '⚠️ Needs Attention'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{validationReport.passedChecks}</div>
            <div className="text-sm text-green-700">Passed</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{validationReport.warningChecks}</div>
            <div className="text-sm text-yellow-700">Warnings</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{validationReport.failedChecks}</div>
            <div className="text-sm text-red-700">Failed</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-600">{validationReport.totalChecks}</div>
            <div className="text-sm text-slate-700">Total</div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button 
            onClick={runValidation}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Re-run Validation
          </button>
          <button 
            onClick={runAutomaticFixes}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            disabled={!validationReport.qualityChecks.some(check => check.autoFixAvailable)}
          >
            🔧 Auto-fix Issues
          </button>
          <button 
            onClick={downloadReport}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            📄 Download Report
          </button>
        </div>
      </div>

      {/* Auto-fix Results */}
      {autoFixResults && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">Auto-fix Results</h3>
          <div className="space-y-2">
            {autoFixResults.appliedFixes.map((fix, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-green-800">{fix}</span>
              </div>
            ))}
          </div>
          {autoFixResults.remainingIssues.length > 0 && (
            <p className="text-green-700 mt-3">
              {autoFixResults.remainingIssues.length} issues require manual attention
            </p>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            🔍 Detailed Checks
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sections'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            📋 Section Status
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Critical Issues */}
          {validationReport.failedChecks > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-4">🚨 Critical Issues</h3>
              <div className="space-y-3">
                {validationReport.qualityChecks
                  .filter(check => check.status === 'fail' && check.severity === 'critical')
                  .map((check, index) => (
                    <div key={index} className="p-3 bg-white rounded border-l-4 border-l-red-500">
                      <h4 className="font-medium text-red-900">{check.checkName}</h4>
                      <p className="text-red-700 text-sm mt-1">{check.details}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {validationReport.recommendations.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">💡 Recommendations</h3>
              <ul className="space-y-2">
                {validationReport.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === 'details' && (
        <div className="space-y-4">
          {validationReport.qualityChecks.map((check, index) => (
            <div key={index} className={`bg-white rounded-lg border border-slate-200 p-6 border-l-4 ${getSeverityColor(check.severity)}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900">{check.checkName}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(check.status)}`}>
                    {check.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {check.severity.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <p className="text-slate-600 mb-2">{check.description}</p>
              <p className="text-sm text-slate-500 mb-3">{check.details}</p>
              
              {check.recommendations && check.recommendations.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-medium text-slate-900 mb-2">Recommendations:</h4>
                  <ul className="space-y-1">
                    {check.recommendations.map((rec, recIndex) => (
                      <li key={recIndex} className="text-sm text-slate-600 flex items-start space-x-2">
                        <span className="text-blue-500">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {check.autoFixAvailable && (
                <div className="mt-3 p-2 bg-blue-50 rounded flex items-center space-x-2">
                  <div className="text-blue-600">🔧</div>
                  <span className="text-sm text-blue-800">Auto-fix available</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'sections' && (
        <div className="space-y-4">
          {validationReport.sectionStatuses.map((section, index) => (
            <div key={index} className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">{section.sectionName}</h3>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900">{section.completionPercentage}%</div>
                    <div className="w-24 bg-slate-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${section.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    section.readyForSubmission ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {section.readyForSubmission ? 'Ready' : 'Incomplete'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Total Documents:</span>
                  <span className="font-medium ml-2">{section.completedDocuments}/{section.totalDocuments}</span>
                </div>
                <div>
                  <span className="text-slate-600">Required Documents:</span>
                  <span className="font-medium ml-2">{section.completedRequired}/{section.requiredDocuments}</span>
                </div>
              </div>
              
              {section.criticalIssues.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded">
                  <h4 className="font-medium text-red-900 mb-2">Critical Issues:</h4>
                  <ul className="space-y-1">
                    {section.criticalIssues.map((issue, issueIndex) => (
                      <li key={issueIndex} className="text-sm text-red-800">• {issue.checkName}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QualityControlPanel;