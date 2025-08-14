import { useState } from 'react';
import type { RFP } from '../types/rfp';
import QualityControlPanel from './QualityControlPanel';

interface DataBookEditorProps {
  rfp: RFP;
  sectionId: string;
  onBack: () => void;
}

// DocumentTemplate interface removed - using inline types instead

const DataBookEditor = ({ rfp, sectionId, onBack }: DataBookEditorProps) => {
  const [activeTab, setActiveTab] = useState('documents');
  const [showQualityControl, setShowQualityControl] = useState(false);

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
      },
      'financial-models': {
        title: 'Financial Projections & Models',
        description: 'Comprehensive financial analysis and projection models',
        icon: '💰',
        templates: [
          { id: 'fund-economics', title: 'Fund Economics Model', description: 'Cash flow projections and return analysis', required: true, status: 'complete' as const, lastModified: new Date(), fileSize: '8.2 MB' },
          { id: 'investment-pipeline', title: 'Investment Pipeline Analysis', description: 'Deal flow and deployment schedule projections', required: true, status: 'draft' as const, lastModified: new Date(), fileSize: '4.7 MB' },
          { id: 'sensitivity-analysis', title: 'Sensitivity & Scenario Analysis', description: 'Stress testing and scenario modeling', required: true, status: 'draft' as const, lastModified: new Date(), fileSize: '3.9 MB' },
          { id: 'fee-structure', title: 'Fee Structure & Economics', description: 'Management fee and carried interest projections', required: true, status: 'complete' as const, lastModified: new Date(), fileSize: '2.1 MB' },
          { id: 'portfolio-valuation', title: 'Portfolio Valuation Methods', description: 'Valuation methodology and mark-to-market approach', required: true, status: 'pending' as const },
          { id: 'liquidity-analysis', title: 'Liquidity & Distribution Analysis', description: 'Exit timing and distribution waterfall', required: true, status: 'draft' as const, lastModified: new Date(), fileSize: '2.8 MB' },
          { id: 'benchmarking', title: 'Performance Benchmarking', description: 'Industry benchmark analysis and peer comparison', required: false, status: 'pending' as const }
        ]
      },
      'compliance': {
        title: 'Regulatory & Compliance Documentation',
        description: 'Legal, regulatory, and compliance framework documentation',
        icon: '📋',
        templates: [
          { id: 'regulatory-structure', title: 'Regulatory Structure', description: 'Fund domicile and regulatory framework', required: true, status: 'complete' as const, lastModified: new Date(), fileSize: '3.4 MB' },
          { id: 'legal-opinions', title: 'Legal Opinions & Memoranda', description: 'Legal counsel opinions and regulatory analysis', required: true, status: 'draft' as const, lastModified: new Date(), fileSize: '6.8 MB' },
          { id: 'compliance-policies', title: 'Compliance Policies & Procedures', description: 'Internal compliance framework and monitoring', required: true, status: 'draft' as const, lastModified: new Date(), fileSize: '4.2 MB' },
          { id: 'kyc-aml', title: 'KYC/AML Procedures', description: 'Know Your Customer and Anti-Money Laundering protocols', required: true, status: 'complete' as const, lastModified: new Date(), fileSize: '2.9 MB' },
          { id: 'tax-structure', title: 'Tax Structure & Optimization', description: 'Tax efficiency analysis and structural optimization', required: true, status: 'draft' as const, lastModified: new Date(), fileSize: '5.1 MB' },
          { id: 'data-protection', title: 'Data Protection & Privacy', description: 'GDPR compliance and data security measures', required: true, status: 'pending' as const },
          { id: 'audit-reports', title: 'Audit Reports & Reviews', description: 'Independent audit findings and management responses', required: true, status: 'complete' as const, lastModified: new Date(), fileSize: '3.7 MB' },
          { id: 'regulatory-filings', title: 'Regulatory Filings History', description: 'Track record of regulatory submissions and approvals', required: false, status: 'draft' as const, lastModified: new Date(), fileSize: '2.3 MB' }
        ]
      },
      'supporting-docs': {
        title: 'Supporting Exhibits & Appendices',
        description: 'Additional documentation and supporting materials',
        icon: '📎',
        templates: [
          { id: 'market-research', title: 'Market Research & Analysis', description: 'Third-party market studies and industry reports', required: false, status: 'pending' as const },
          { id: 'reference-letters', title: 'Reference Letters', description: 'LP testimonials and professional references', required: false, status: 'draft' as const, lastModified: new Date(), fileSize: '1.8 MB' },
          { id: 'case-studies', title: 'Investment Case Studies', description: 'Detailed portfolio company case studies', required: false, status: 'pending' as const },
          { id: 'technology-systems', title: 'Technology & Systems Overview', description: 'IT infrastructure and systems documentation', required: false, status: 'draft' as const, lastModified: new Date(), fileSize: '2.4 MB' },
          { id: 'insurance-coverage', title: 'Insurance Coverage Details', description: 'Professional liability and D&O insurance documentation', required: true, status: 'complete' as const, lastModified: new Date(), fileSize: '1.6 MB' },
          { id: 'service-providers', title: 'Service Provider Network', description: 'Key service providers and professional relationships', required: false, status: 'draft' as const, lastModified: new Date(), fileSize: '1.2 MB' },
          { id: 'media-coverage', title: 'Media Coverage & PR', description: 'Press releases, media mentions, and thought leadership', required: false, status: 'pending' as const },
          { id: 'appendices', title: 'Technical Appendices', description: 'Detailed technical documentation and specifications', required: false, status: 'draft' as const, lastModified: new Date(), fileSize: '4.5 MB' }
        ]
      }
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
              <button 
                onClick={() => setShowQualityControl(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors mr-3"
              >
                🔍 Quality Check
              </button>
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
          <div className="space-y-6">
            {/* Template Categories */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    🏛️
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Government Fund Templates</h3>
                    <p className="text-sm text-slate-600">Korea Development Bank, KIC, etc.</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Available Templates</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Recently Updated</span>
                    <span className="font-medium">6</span>
                  </div>
                </div>
                <button className="w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                  Browse Templates
                </button>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                    📊
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Financial Models</h3>
                    <p className="text-sm text-slate-600">IRR, cash flow, sensitivity analysis</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Excel Templates</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">PowerBI Dashboards</span>
                    <span className="font-medium">4</span>
                  </div>
                </div>
                <button className="w-full bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors">
                  View Models
                </button>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    📋
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Compliance Forms</h3>
                    <p className="text-sm text-slate-600">Legal, regulatory, KYC documentation</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Standard Forms</span>
                    <span className="font-medium">18</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Custom Forms</span>
                    <span className="font-medium">7</span>
                  </div>
                </div>
                <button className="w-full bg-purple-50 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors">
                  Access Forms
                </button>
              </div>
            </div>

            {/* Template Library */}
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Template Library</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    + Upload Template
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid gap-4">
                  {[
                    { name: 'KDB Fund Application Template', category: 'Government', size: '4.2 MB', updated: '2 days ago', downloads: 156 },
                    { name: 'KIC Private Equity Proposal', category: 'Government', size: '3.8 MB', updated: '1 week ago', downloads: 89 },
                    { name: 'SBA Investment Fund Template', category: 'Government', size: '5.1 MB', updated: '3 days ago', downloads: 203 },
                    { name: 'GP Commitment Analysis Model', category: 'Financial', size: '8.7 MB', updated: '5 days ago', downloads: 124 },
                    { name: 'IRR Sensitivity Calculator', category: 'Financial', size: '6.3 MB', updated: '1 week ago', downloads: 178 },
                    { name: 'Regulatory Compliance Checklist', category: 'Compliance', size: '2.1 MB', updated: '4 days ago', downloads: 267 }
                  ].map((template, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          📄
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">{template.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <span>{template.category}</span>
                            <span>•</span>
                            <span>{template.size}</span>
                            <span>•</span>
                            <span>Updated {template.updated}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-500">{template.downloads} downloads</span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Use Template
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Sources Tab */}
        {activeTab === 'data-sources' && (
          <div className="space-y-6">
            {/* Connected Systems Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Portfolio Management System</h3>
                    <p className="text-sm text-slate-600">Real-time fund performance data</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Last Sync</span>
                    <span className="font-medium">2 min ago</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Data Points</span>
                    <span className="font-medium">1,247</span>
                  </div>
                </div>
                <button className="w-full bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors">
                  Connected
                </button>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">CRM & LP Database</h3>
                    <p className="text-sm text-slate-600">Investor relationships and commitments</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Last Sync</span>
                    <span className="font-medium">1 hour ago</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Records</span>
                    <span className="font-medium">856</span>
                  </div>
                </div>
                <button className="w-full bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-100 transition-colors">
                  Pending Sync
                </button>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center">
                    <div className="h-3 w-3 bg-slate-400 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Financial Systems</h3>
                    <p className="text-sm text-slate-600">Accounting and financial reporting</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Status</span>
                    <span className="font-medium">Not Connected</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Available APIs</span>
                    <span className="font-medium">4</span>
                  </div>
                </div>
                <button className="w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                  Connect Now
                </button>
              </div>
            </div>

            {/* Data Mapping Configuration */}
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Data Mapping Configuration</h3>
                <p className="text-sm text-slate-600 mt-1">Configure how data from your systems maps to RFP document fields</p>
              </div>
              
              <div className="p-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Source Data */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-4">Source Data Fields</h4>
                    <div className="space-y-3">
                      {[
                        { field: 'fund_aum_total', source: 'Portfolio System', type: 'Currency', updated: 'Live' },
                        { field: 'gp_commitment_pct', source: 'Legal Database', type: 'Percentage', updated: '1 day ago' },
                        { field: 'team_member_count', source: 'HR System', type: 'Number', updated: 'Live' },
                        { field: 'investment_count', source: 'Portfolio System', type: 'Number', updated: 'Live' },
                        { field: 'compliance_status', source: 'Compliance DB', type: 'Status', updated: '2 hours ago' }
                      ].map((field, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                          <div>
                            <div className="font-medium text-slate-900">{field.field}</div>
                            <div className="text-sm text-slate-500">{field.source} • {field.type}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-slate-600">{field.updated}</div>
                            <button className="text-blue-600 hover:text-blue-800 text-sm">Map →</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Target RFP Fields */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-4">RFP Document Fields</h4>
                    <div className="space-y-3">
                      {[
                        { field: 'Total Fund Size', section: 'Fund Strategy', required: true, mapped: true },
                        { field: 'GP Commitment Percentage', section: 'Financial Models', required: true, mapped: true },
                        { field: 'Investment Team Size', section: 'Team Credentials', required: true, mapped: true },
                        { field: 'Portfolio Companies', section: 'Company Overview', required: false, mapped: true },
                        { field: 'Regulatory Compliance', section: 'Compliance', required: true, mapped: false }
                      ].map((field, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                          <div>
                            <div className="font-medium text-slate-900">{field.field}</div>
                            <div className="text-sm text-slate-500">{field.section} • {field.required ? 'Required' : 'Optional'}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`h-2 w-2 rounded-full ${field.mapped ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm text-slate-600">{field.mapped ? 'Mapped' : 'Unmapped'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Save Mapping Configuration
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Test Data Sync
                  </button>
                  <button className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                    Import Sample Data
                  </button>
                </div>
              </div>
            </div>

            {/* API Integrations */}
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Available Integrations</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    + Add Integration
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { name: 'Excel/Spreadsheet Import', description: 'Import data from Excel files and Google Sheets', icon: '📊', status: 'Available' },
                    { name: 'Database Connections', description: 'Connect to SQL databases and data warehouses', icon: '🗄️', status: 'Available' },
                    { name: 'API Webhooks', description: 'Real-time data sync via webhook endpoints', icon: '🔗', status: 'Available' },
                    { name: 'Document Scanner', description: 'OCR and document parsing capabilities', icon: '📄', status: 'Beta' }
                  ].map((integration, index) => (
                    <div key={index} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{integration.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{integration.name}</h4>
                          <p className="text-sm text-slate-600 mt-1">{integration.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {integration.status}
                            </span>
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              Configure
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Tab */}
        {activeTab === 'review' && (
          <div className="space-y-6">
            {/* Review Status Overview */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                    ✅
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Review Complete</h3>
                    <p className="text-sm text-slate-600">Documents ready for submission</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-600">23</div>
                <p className="text-sm text-slate-500">of 35 documents</p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                    ⚠️
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Requires Attention</h3>
                    <p className="text-sm text-slate-600">Issues found during review</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-yellow-600">8</div>
                <p className="text-sm text-slate-500">critical issues</p>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    👁️
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Under Review</h3>
                    <p className="text-sm text-slate-600">Currently being reviewed</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-600">4</div>
                <p className="text-sm text-slate-500">in review queue</p>
              </div>
            </div>

            {/* Quality Control Checklist */}
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Quality Control Checklist</h3>
                <p className="text-sm text-slate-600 mt-1">Automated and manual verification steps for government fund applications</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {/* Content Validation */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">📝 Content Validation</h4>
                    <div className="space-y-3">
                      {[
                        { check: 'All required fields completed', status: 'pass', details: '35/35 fields populated' },
                        { check: 'Financial data consistency', status: 'warning', details: '2 minor discrepancies found' },
                        { check: 'Team member credentials verified', status: 'pass', details: 'All CVs and references validated' },
                        { check: 'Investment thesis coherence', status: 'pending', details: 'Awaiting senior review' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`h-2 w-2 rounded-full ${
                              item.status === 'pass' ? 'bg-green-500' : 
                              item.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}></div>
                            <div>
                              <div className="font-medium text-slate-900">{item.check}</div>
                              <div className="text-sm text-slate-500">{item.details}</div>
                            </div>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.status === 'pass' ? 'bg-green-100 text-green-800' :
                            item.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.status === 'pass' ? 'Pass' : item.status === 'warning' ? 'Warning' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Compliance Validation */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">📋 Compliance Validation</h4>
                    <div className="space-y-3">
                      {[
                        { check: 'Government fund requirements met', status: 'pass', details: 'All KDB requirements satisfied' },
                        { check: 'GP commitment ratio compliance', status: 'pass', details: '15% meets minimum 10% requirement' },
                        { check: 'Regulatory framework adherence', status: 'pass', details: 'All regulations confirmed' },
                        { check: 'Document format standards', status: 'warning', details: '3 documents need formatting fixes' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`h-2 w-2 rounded-full ${
                              item.status === 'pass' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></div>
                            <div>
                              <div className="font-medium text-slate-900">{item.check}</div>
                              <div className="text-sm text-slate-500">{item.details}</div>
                            </div>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status === 'pass' ? 'Pass' : 'Warning'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    🔍 Run Full Validation
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    📊 Generate Review Report
                  </button>
                  <button className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                    📧 Request Peer Review
                  </button>
                </div>
              </div>
            </div>

            {/* Review Workflow */}
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Review Workflow</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    + Assign Reviewer
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { 
                      stage: 'Content Review', 
                      reviewer: 'Sarah Kim - Investment Director', 
                      status: 'completed', 
                      date: '2024-01-15',
                      comments: 'Investment thesis and financial projections approved. Minor formatting suggestions provided.'
                    },
                    { 
                      stage: 'Compliance Review', 
                      reviewer: 'Michael Park - Compliance Officer', 
                      status: 'in-progress', 
                      date: '2024-01-16',
                      comments: 'Currently reviewing regulatory documentation and KYC materials.'
                    },
                    { 
                      stage: 'Senior Partner Review', 
                      reviewer: 'Jennifer Lee - Managing Partner', 
                      status: 'pending', 
                      date: 'TBD',
                      comments: 'Pending completion of compliance review.'
                    },
                    { 
                      stage: 'Final Approval', 
                      reviewer: 'Board of Directors', 
                      status: 'pending', 
                      date: 'TBD',
                      comments: 'Awaiting all prior reviews to be completed.'
                    }
                  ].map((workflow, index) => (
                    <div key={index} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`h-3 w-3 rounded-full ${
                            workflow.status === 'completed' ? 'bg-green-500' :
                            workflow.status === 'in-progress' ? 'bg-blue-500' : 'bg-slate-300'
                          }`}></div>
                          <h4 className="font-medium text-slate-900">{workflow.stage}</h4>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          workflow.status === 'completed' ? 'bg-green-100 text-green-800' :
                          workflow.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {workflow.status === 'completed' ? 'Completed' :
                           workflow.status === 'in-progress' ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 mb-2">{workflow.reviewer}</div>
                      <div className="text-sm text-slate-500">{workflow.comments}</div>
                      {workflow.date !== 'TBD' && (
                        <div className="text-xs text-slate-400 mt-2">{workflow.date}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quality Control Modal */}
        {showQualityControl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Quality Control Assessment</h2>
                <button
                  onClick={() => setShowQualityControl(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <QualityControlPanel 
                  rfp={rfp}
                  onValidationComplete={(report) => {
                    console.log('Validation completed:', report);
                    // You can add additional logic here when validation completes
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataBookEditor;