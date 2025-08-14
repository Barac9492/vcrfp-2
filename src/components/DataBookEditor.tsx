import { useState } from 'react';
import type { RFP } from '../types/rfp';

interface DataBookEditorProps {
  rfp: RFP;
  sectionId: string;
  onSave: (data: any) => void;
  onBack: () => void;
}

interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  required: boolean;
  status: 'pending' | 'draft' | 'complete' | 'approved';
  lastModified?: Date;
  fileSize?: string;
}

const DataBookEditor = ({ rfp, sectionId, onSave, onBack }: DataBookEditorProps) => {
  const [activeTab, setActiveTab] = useState('documents');

  const getSectionDetails = (sectionId: string) => {
    const sections = {
      'company-overview': {
        title: 'Company Overview',
        description: 'Comprehensive firm profile and organizational structure',
        icon: '🏢',
        templates: [
          { id: 'company-profile', title: 'Company Profile & History', description: 'Detailed company background, founding story, and evolution', required: true, status: 'complete' as const, lastModified: new Date(), fileSize: '2.3 MB' },
          { id: 'organizational-chart', title: 'Organizational Structure', description: 'Corporate structure, subsidiaries, and ownership details', required: true, status: 'complete' as const, lastModified: new Date(), fileSize: '1.8 MB' },
          { id: 'aum-breakdown', title: 'Assets Under Management', description: 'Current AUM breakdown by strategy and vintage', required: true, status: 'complete' as const, lastModified: new Date(), fileSize: '1.2 MB' },
          { id: 'track-record', title: 'Historical Performance', description: 'Fund performance history and key metrics', required: true, status: 'complete' as const, lastModified: new Date(), fileSize: '3.1 MB' },
          { id: 'client-references', title: 'Client References', description: 'LP testimonials and reference letters', required: false, status: 'draft' as const, lastModified: new Date(), fileSize: '0.8 MB' },
          { id: 'awards-recognition', title: 'Awards & Recognition', description: 'Industry awards and media coverage', required: false, status: 'pending' as const },
          { id: 'esg-policy', title: 'ESG Policy & Approach', description: 'Environmental, social, governance framework', required: true, status: 'draft' as const, lastModified: new Date(), fileSize: '1.5 MB' },
          { id: 'operational-infrastructure', title: 'Operational Infrastructure', description: 'Back office, technology, and operational capabilities', required: true, status: 'complete' as const, lastModified: new Date(), fileSize: '2.0 MB' }
        ]
      },
      'fund-strategy': {
        title: 'Fund Strategy & Investment Thesis',
        description: 'Investment approach, market analysis, and strategic positioning',
        icon: '📊',
        templates: [
          { id: 'investment-thesis', title: 'Investment Thesis', description: 'Core investment philosophy and market opportunity', required: true, status: 'complete' as const, lastModified: new Date(), fileSize: '4.2 MB' },
          { id: 'market-analysis', title: 'Market Analysis', description: 'Sector analysis and competitive landscape', required: true, status: 'draft' as const, lastModified: new Date(), fileSize: '3.8 MB' },
          { id: 'sourcing-strategy', title: 'Deal Sourcing Strategy', description: 'Pipeline development and origination approach', required: true, status: 'draft' as const, lastModified: new Date(), fileSize: '2.1 MB' },
          { id: 'due-diligence', title: 'Due Diligence Process', description: 'Investment evaluation methodology and framework', required: true, status: 'complete' as const, lastModified: new Date(), fileSize: '2.9 MB' },
          { id: 'portfolio-management', title: 'Portfolio Management', description: 'Value creation and portfolio monitoring approach', required: true, status: 'draft' as const, lastModified: new Date(), fileSize: '2.3 MB' },
          { id: 'exit-strategy', title: 'Exit Strategy', description: 'Realization approach and exit planning', required: true, status: 'pending' as const },
          { id: 'risk-management', title: 'Risk Management Framework', description: 'Risk assessment and mitigation strategies', required: true, status: 'complete' as const, lastModified: new Date(), fileSize: '1.7 MB' },
          { id: 'sector-expertise', title: 'Sector Expertise', description: 'Industry knowledge and specialized capabilities', required: true, status: 'draft' as const, lastModified: new Date(), fileSize: '3.3 MB' }
        ]
      },
      'team-credentials': {
        title: 'Management Team & Key Personnel',
        description: 'Team biographies, experience, and organizational capabilities',
        icon: '👥',
        templates: [
          { id: 'leadership-bios', title: 'Leadership Team Biographies', description: 'Detailed profiles of senior management', required: true, status: 'complete' as const, lastModified: new Date(), fileSize: '5.1 MB' },
          { id: 'investment-team', title: 'Investment Team Profiles', description: 'Investment professionals and analysts', required: true, status: 'complete' as const, lastModified: new Date(), fileSize: '4.3 MB' },
          { id: 'advisory-board', title: 'Advisory Board', description: 'External advisors and board members', required: false, status: 'complete' as const, lastModified: new Date(), fileSize: '1.9 MB' },
          { id: 'compensation-structure', title: 'Compensation & Incentives', description: 'Team compensation and alignment mechanisms', required: true, status: 'draft' as const, lastModified: new Date(), fileSize: '1.2 MB' },
          { id: 'succession-planning', title: 'Succession Planning', description: 'Leadership continuity and development', required: false, status: 'pending' as const },
          { id: 'professional-development', title: 'Training & Development', description: 'Team development and continuing education', required: false, status: 'draft' as const, lastModified: new Date(), fileSize: '0.9 MB' }
        ]
      }
      // Add more sections as needed
    };
    
    return sections[sectionId as keyof typeof sections] || sections['company-overview'];
  };

  const sectionDetails = getSectionDetails(sectionId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return '✅';
      case 'approved': return '👍';
      case 'draft': return '📝';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-slate-200"></div>
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{sectionDetails.icon}</div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{sectionDetails.title}</h1>
                  <p className="text-sm text-slate-600">{sectionDetails.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm text-slate-500">RFP: {rfp.requirements.기본정보.기관명}</div>
                <div className="text-sm font-medium text-slate-900">{rfp.requirements.기본정보.프로그램명}</div>
              </div>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Generate Section
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'documents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                📄 Documents
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'templates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                📋 Templates
              </button>
              <button
                onClick={() => setActiveTab('data-sources')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'data-sources'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                🔗 Data Sources
              </button>
              <button
                onClick={() => setActiveTab('review')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'review'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                👁️ Review & QC
              </button>
            </nav>
          </div>
        </div>

        {/* Document Grid */}
        {activeTab === 'documents' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sectionDetails.templates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-slate-900">{template.title}</h3>
                        {template.required && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(template.status)}`}>
                          {getStatusIcon(template.status)} {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                        </span>
                        {template.fileSize && (
                          <span className="text-xs text-slate-500">{template.fileSize}</span>
                        )}
                      </div>
                      
                      {template.lastModified && (
                        <p className="text-xs text-slate-500 mt-2">
                          Last modified: {template.lastModified.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {template.status === 'pending' ? (
                      <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                        Create Document
                      </button>
                    ) : (
                      <>
                        <button className="flex-1 bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-sm hover:bg-slate-200 transition-colors">
                          Edit
                        </button>
                        <button className="px-3 py-2 text-slate-600 hover:text-slate-900 text-sm">
                          Preview
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Document Templates</h3>
            <p className="text-slate-600 mb-6">Pre-configured templates for common RFP document requirements</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Browse Template Library
            </button>
          </div>
        )}

        {/* Data Sources Tab */}
        {activeTab === 'data-sources' && (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Data Source Connections</h3>
            <p className="text-slate-600 mb-6">Connect to internal systems and databases for automatic data population</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Configure Data Sources
            </button>
          </div>
        )}

        {/* Review Tab */}
        {activeTab === 'review' && (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <div className="text-6xl mb-4">👁️</div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Quality Control & Review</h3>
            <p className="text-slate-600 mb-6">Document review workflow and approval process management</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Start Review Process
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataBookEditor;