import { useState, useEffect } from 'react';
import { useRFP } from '../hooks/useRFP';
import type { RFP } from '../types/rfp';

interface ExecutiveMetrics {
  totalRFPs: number;
  activeDeadlines: number;
  submissionReady: number;
  totalFundSize: number;
  successRate: number;
  avgTimeToSubmission: number;
}

const ExecutiveDashboard = () => {
  const { rfps, loading } = useRFP();
  const [metrics, setMetrics] = useState<ExecutiveMetrics>({
    totalRFPs: 0,
    activeDeadlines: 0,
    submissionReady: 0,
    totalFundSize: 0,
    successRate: 0,
    avgTimeToSubmission: 0
  });

  useEffect(() => {
    if (rfps.length > 0) {
      const now = new Date();
      const activeRFPs = rfps.filter(rfp => new Date(rfp.requirements.기본정보.마감일) > now);
      // Note: urgentRFPs calculation available for future implementation if needed

      setMetrics({
        totalRFPs: rfps.length,
        activeDeadlines: activeRFPs.length,
        submissionReady: rfps.filter(rfp => rfp.version > 1).length,
        totalFundSize: rfps.reduce((sum, rfp) => sum + rfp.requirements.펀드요구사항.최소결성액, 0),
        successRate: 75, // This would come from historical data
        avgTimeToSubmission: 14 // This would be calculated from actual data
      });
    }
  }, [rfps]);

  const formatCurrency = (amount: number) => {
    return `₩${(amount / 100000000).toFixed(0)}억`;
  };

  const getDeadlineStatus = (rfp: RFP) => {
    const now = new Date();
    const deadline = new Date(rfp.requirements.기본정보.마감일);
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { status: 'expired', color: 'text-red-600 bg-red-50', text: `${Math.abs(daysLeft)}일 지남` };
    if (daysLeft <= 3) return { status: 'critical', color: 'text-red-600 bg-red-50', text: `${daysLeft}일 남음` };
    if (daysLeft <= 7) return { status: 'urgent', color: 'text-orange-600 bg-orange-50', text: `${daysLeft}일 남음` };
    return { status: 'normal', color: 'text-green-600 bg-green-50', text: `${daysLeft}일 남음` };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading portfolio dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Executive Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Portfolio Command Center</h1>
              <p className="text-slate-600 mt-1">Government Fund Application Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-slate-500">Total AUM Target</div>
                <div className="text-2xl font-bold text-slate-900">{formatCurrency(metrics.totalFundSize)}</div>
              </div>
              <div className="h-12 w-px bg-slate-200"></div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Success Rate</div>
                <div className="text-2xl font-bold text-green-600">{metrics.successRate}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Applications</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.activeDeadlines}</p>
                <p className="text-sm text-slate-500 mt-1">In pipeline</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Submission Ready</p>
                <p className="text-3xl font-bold text-green-600">{metrics.submissionReady}</p>
                <p className="text-sm text-slate-500 mt-1">Validated & complete</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Fund Target</p>
                <p className="text-3xl font-bold text-slate-900">{formatCurrency(metrics.totalFundSize)}</p>
                <p className="text-sm text-slate-500 mt-1">Aggregate AUM</p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Time to Submit</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.avgTimeToSubmission}</p>
                <p className="text-sm text-slate-500 mt-1">Days from start</p>
              </div>
              <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Active RFPs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Active Opportunities</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                + New Application
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Institution / Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Fund Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    GP Commitment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {rfps.map((rfp) => {
                  const deadlineStatus = getDeadlineStatus(rfp);
                  const gpCommitment = rfp.requirements.펀드요구사항.최소결성액 * (rfp.requirements.펀드요구사항.출자비율.GP최소 / 100);
                  
                  return (
                    <tr key={rfp.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {rfp.requirements.기본정보.기관명}
                          </div>
                          <div className="text-sm text-slate-500">
                            {rfp.requirements.기본정보.프로그램명}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {formatCurrency(rfp.requirements.펀드요구사항.최소결성액)}
                        </div>
                        <div className="text-sm text-slate-500">
                          Target minimum
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {formatCurrency(gpCommitment)}
                        </div>
                        <div className="text-sm text-slate-500">
                          {rfp.requirements.펀드요구사항.출자비율.GP최소}% of fund
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${deadlineStatus.color}`}>
                          {deadlineStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-2 w-2 bg-yellow-400 rounded-full mr-2"></div>
                          <span className="text-sm text-slate-600">In Progress</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-4">
                          Edit
                        </button>
                        <button className="text-green-600 hover:text-green-900 mr-4">
                          Validate
                        </button>
                        <button className="text-purple-600 hover:text-purple-900">
                          Export
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {rfps.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-slate-900">No applications in pipeline</h3>
              <p className="mt-1 text-sm text-slate-500">Get started by creating your first RFP application.</p>
              <div className="mt-6">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Create First Application
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;