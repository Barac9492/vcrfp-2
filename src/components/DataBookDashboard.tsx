import { useState, useEffect } from 'react';
import { useRFP } from '../hooks/useRFP';
import DataBookEditor from './DataBookEditor';
import type { RFP } from '../types/rfp';

interface DataBookMetrics {
  totalDataBooks: number;
  documentsInProgress: number;
  readyForSubmission: number;
  requiresReview: number;
  totalFundValue: number;
  avgCompletionTime: number;
}

interface DocumentSection {
  id: string;
  title: string;
  status: 'complete' | 'in-progress' | 'pending' | 'requires-review';
  completionPercentage: number;
  lastUpdated: Date;
  requiredDocuments: number;
  completedDocuments: number;
  icon: string;
}

const DataBookDashboard = () => {
  const { rfps, loading } = useRFP();
  const [selectedDataBook, setSelectedDataBook] = useState<RFP | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const [editingSectionId, setEditingSectionId] = useState<string>('');
  const [metrics, setMetrics] = useState<DataBookMetrics>({
    totalDataBooks: 0,
    documentsInProgress: 0,
    readyForSubmission: 0,
    requiresReview: 0,
    totalFundValue: 0,
    avgCompletionTime: 0
  });

  const documentSections: DocumentSection[] = [
    {
      id: 'company-overview',
      title: 'Company Overview',
      status: 'complete',
      completionPercentage: 100,
      lastUpdated: new Date(),
      requiredDocuments: 8,
      completedDocuments: 8,
      icon: '🏢'
    },
    {
      id: 'fund-strategy',
      title: 'Fund Strategy & Investment Thesis',
      status: 'in-progress',
      completionPercentage: 75,
      lastUpdated: new Date(),
      requiredDocuments: 12,
      completedDocuments: 9,
      icon: '📊'
    },
    {
      id: 'team-credentials',
      title: 'Management Team & Key Personnel',
      status: 'complete',
      completionPercentage: 100,
      lastUpdated: new Date(),
      requiredDocuments: 15,
      completedDocuments: 15,
      icon: '👥'
    },
    {
      id: 'financial-models',
      title: 'Financial Projections & Models',
      status: 'requires-review',
      completionPercentage: 90,
      lastUpdated: new Date(),
      requiredDocuments: 10,
      completedDocuments: 9,
      icon: '💰'
    },
    {
      id: 'compliance',
      title: 'Regulatory & Compliance Documentation',
      status: 'in-progress',
      completionPercentage: 60,
      lastUpdated: new Date(),
      requiredDocuments: 25,
      completedDocuments: 15,
      icon: '📋'
    },
    {
      id: 'supporting-docs',
      title: 'Supporting Exhibits & Appendices',
      status: 'pending',
      completionPercentage: 20,
      lastUpdated: new Date(),
      requiredDocuments: 20,
      completedDocuments: 4,
      icon: '📎'
    }
  ];

  useEffect(() => {
    if (rfps.length > 0) {
      const inProgress = rfps.filter(rfp => rfp.version > 1 && rfp.version < 5).length;
      const ready = rfps.filter(rfp => rfp.version >= 5).length;
      const review = rfps.filter(rfp => rfp.version >= 3 && rfp.version < 5).length;

      setMetrics({
        totalDataBooks: rfps.length,
        documentsInProgress: inProgress,
        readyForSubmission: ready,
        requiresReview: review,
        totalFundValue: rfps.reduce((sum, rfp) => sum + rfp.requirements.펀드요구사항.최소결성액, 0),
        avgCompletionTime: 21 // days
      });

      if (rfps.length > 0) {
        setSelectedDataBook(rfps[0]);
      }
    }
  }, [rfps]);

  const formatCurrency = (amount: number) => {
    return `₩${(amount / 100000000).toFixed(0)}억`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'requires-review': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete': return 'Complete';
      case 'in-progress': return 'In Progress';
      case 'requires-review': return 'Needs Review';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading databook workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">RFP DataBook Studio</h1>
              <p className="text-slate-600 mt-1">Professional submission document preparation</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-slate-500">Total Fund Value</div>
                <div className="text-2xl font-bold text-slate-900">{formatCurrency(metrics.totalFundValue)}</div>
              </div>
              <div className="h-12 w-px bg-slate-200"></div>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                + New DataBook
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active DataBooks</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.totalDataBooks}</p>
                <p className="text-sm text-slate-500 mt-1">In development</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">
                📚
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Ready for Submission</p>
                <p className="text-3xl font-bold text-green-600">{metrics.readyForSubmission}</p>
                <p className="text-sm text-slate-500 mt-1">Validation complete</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center text-2xl">
                ✅
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Requires Review</p>
                <p className="text-3xl font-bold text-yellow-600">{metrics.requiresReview}</p>
                <p className="text-sm text-slate-500 mt-1">Pending approval</p>
              </div>
              <div className="h-12 w-12 bg-yellow-50 rounded-lg flex items-center justify-center text-2xl">
                ⚠️
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Completion</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.avgCompletionTime}</p>
                <p className="text-sm text-slate-500 mt-1">Days to submit</p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center text-2xl">
                ⏱️
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* DataBook List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Current DataBooks</h2>
              </div>
              <div className="p-6 space-y-4">
                {rfps.map((rfp) => (
                  <div
                    key={rfp.id}
                    onClick={() => setSelectedDataBook(rfp)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedDataBook?.id === rfp.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 text-sm">
                          {rfp.requirements.기본정보.기관명}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {rfp.requirements.기본정보.프로그램명}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Target: {formatCurrency(rfp.requirements.펀드요구사항.최소결성액)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">
                          Due: {new Date(rfp.requirements.기본정보.마감일).toLocaleDateString()}
                        </div>
                        <div className="mt-1">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            75% Complete
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {rfps.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📄</div>
                    <p className="text-slate-500 text-sm">No databooks yet</p>
                    <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                      Create First DataBook
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Document Sections */}
          <div className="lg:col-span-2">
            {selectedDataBook ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {selectedDataBook.requirements.기본정보.프로그램명}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {selectedDataBook.requirements.기본정보.기관명} • Document Status Overview
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                        🔍 Validate All
                      </button>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                        📄 Generate PDF
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid gap-4">
                    {documentSections.map((section) => (
                      <div key={section.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{section.icon}</div>
                            <div>
                              <h3 className="font-medium text-slate-900">{section.title}</h3>
                              <p className="text-sm text-slate-500">
                                {section.completedDocuments}/{section.requiredDocuments} documents completed
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-sm font-medium text-slate-900">{section.completionPercentage}%</div>
                              <div className="w-24 bg-slate-200 rounded-full h-2 mt-1">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${section.completionPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(section.status)}`}>
                              {getStatusText(section.status)}
                            </span>
                            <button 
                              onClick={() => {
                                setEditingSectionId(section.id);
                                setCurrentView('editor');
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Select a DataBook</h3>
                <p className="text-slate-500">Choose a databook from the left to view its document sections and completion status.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Handle view switching
  if (currentView === 'editor' && selectedDataBook && editingSectionId) {
    return (
      <DataBookEditor
        rfp={selectedDataBook}
        sectionId={editingSectionId}
        onSave={(data) => {
          // Handle save logic here
          console.log('Saving data:', data);
        }}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">RFP DataBook Studio</h1>
              <p className="text-slate-600 mt-1">Professional submission document preparation</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-slate-500">Total Fund Value</div>
                <div className="text-2xl font-bold text-slate-900">{formatCurrency(metrics.totalFundValue)}</div>
              </div>
              <div className="h-12 w-px bg-slate-200"></div>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                + New DataBook
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active DataBooks</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.totalDataBooks}</p>
                <p className="text-sm text-slate-500 mt-1">In development</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">
                📚
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Ready for Submission</p>
                <p className="text-3xl font-bold text-green-600">{metrics.readyForSubmission}</p>
                <p className="text-sm text-slate-500 mt-1">Validation complete</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center text-2xl">
                ✅
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Requires Review</p>
                <p className="text-3xl font-bold text-yellow-600">{metrics.requiresReview}</p>
                <p className="text-sm text-slate-500 mt-1">Pending approval</p>
              </div>
              <div className="h-12 w-12 bg-yellow-50 rounded-lg flex items-center justify-center text-2xl">
                ⚠️
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Completion</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.avgCompletionTime}</p>
                <p className="text-sm text-slate-500 mt-1">Days to submit</p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center text-2xl">
                ⏱️
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* DataBook List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Current DataBooks</h2>
              </div>
              <div className="p-6 space-y-4">
                {rfps.map((rfp) => (
                  <div
                    key={rfp.id}
                    onClick={() => setSelectedDataBook(rfp)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedDataBook?.id === rfp.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 text-sm">
                          {rfp.requirements.기본정보.기관명}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {rfp.requirements.기본정보.프로그램명}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Target: {formatCurrency(rfp.requirements.펀드요구사항.최소결성액)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">
                          Due: {new Date(rfp.requirements.기본정보.마감일).toLocaleDateString()}
                        </div>
                        <div className="mt-1">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            75% Complete
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {rfps.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📄</div>
                    <p className="text-slate-500 text-sm">No databooks yet</p>
                    <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                      Create First DataBook
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Document Sections */}
          <div className="lg:col-span-2">
            {selectedDataBook ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {selectedDataBook.requirements.기본정보.프로그램명}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {selectedDataBook.requirements.기본정보.기관명} • Document Status Overview
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                        🔍 Validate All
                      </button>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                        📄 Generate PDF
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid gap-4">
                    {documentSections.map((section) => (
                      <div key={section.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{section.icon}</div>
                            <div>
                              <h3 className="font-medium text-slate-900">{section.title}</h3>
                              <p className="text-sm text-slate-500">
                                {section.completedDocuments}/{section.requiredDocuments} documents completed
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-sm font-medium text-slate-900">{section.completionPercentage}%</div>
                              <div className="w-24 bg-slate-200 rounded-full h-2 mt-1">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${section.completionPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(section.status)}`}>
                              {getStatusText(section.status)}
                            </span>
                            <button 
                              onClick={() => {
                                setEditingSectionId(section.id);
                                setCurrentView('editor');
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Select a DataBook</h3>
                <p className="text-slate-500">Choose a databook from the left to view its document sections and completion status.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataBookDashboard;