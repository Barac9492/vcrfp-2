import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ValidationRule {
  id: string;
  category: '기본정보' | '재무데이터' | '인력정보' | '투자전략' | '컴플라이언스';
  rule: string;
  status: 'pass' | 'warning' | 'error';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  suggestion?: string;
}

interface QualityMetrics {
  completeness: number;
  accuracy: number;
  compliance: number;
  readiness: number;
}

const QualityControlDashboard = () => {
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Mock validation rules for KIF RFP
    const rules: ValidationRule[] = [
      {
        id: '1',
        category: '기본정보',
        rule: '회사명 일치성 검증',
        status: 'pass',
        severity: 'critical',
        message: '모든 문서의 회사명이 일치합니다.',
      },
      {
        id: '2',
        category: '기본정보',
        rule: 'GP 출자비율 최소 요구사항',
        status: 'error',
        severity: 'critical',
        message: 'GP 출자비율이 1% 미만입니다.',
        suggestion: 'GP 출자비율을 최소 1% 이상으로 조정해주세요.'
      },
      {
        id: '3',
        category: '재무데이터',
        rule: '감사보고서 최신성',
        status: 'warning',
        severity: 'high',
        message: '가장 최근 감사보고서가 6개월 이상 경과했습니다.',
        suggestion: '최신 감사보고서로 업데이트를 권장합니다.'
      },
      {
        id: '4',
        category: '재무데이터',
        rule: '재무비율 적정성',
        status: 'pass',
        severity: 'medium',
        message: '유동비율 및 부채비율이 적정 수준입니다.',
      },
      {
        id: '5',
        category: '인력정보',
        rule: '핵심인력 최소 요구사항',
        status: 'error',
        severity: 'critical',
        message: '핵심운용인력이 최소 3명 미만입니다.',
        suggestion: '투자팀 핵심 구성원을 최소 3명 이상 등록해주세요.'
      },
      {
        id: '6',
        category: '인력정보',
        rule: '대표PM 경력 요구사항',
        status: 'warning',
        severity: 'high',
        message: '대표PM의 투자 경력이 5년 미만입니다.',
        suggestion: '대표PM의 상세 경력 사항을 추가로 기재해주세요.'
      },
      {
        id: '7',
        category: '투자전략',
        rule: 'AI·디지털 분야 투자비율',
        status: 'pass',
        severity: 'critical',
        message: 'AI·디지털 분야 60% 의무투자 계획이 명확합니다.',
      },
      {
        id: '8',
        category: '투자전략',
        rule: '투자전략 구체성',
        status: 'warning',
        severity: 'medium',
        message: '투자전략이 다소 추상적입니다.',
        suggestion: '구체적인 투자 기준과 심사 프로세스를 추가해주세요.'
      },
      {
        id: '9',
        category: '컴플라이언스',
        rule: '이해상충 방지 정책',
        status: 'pass',
        severity: 'high',
        message: '이해상충 방지 정책이 명확히 수립되어 있습니다.',
      },
      {
        id: '10',
        category: '컴플라이언스',
        rule: '내부통제시스템',
        status: 'warning',
        severity: 'medium',
        message: '내부통제시스템 문서가 불완전합니다.',
        suggestion: '내부통제시스템 운영 규정을 보완해주세요.'
      }
    ];

    setValidationRules(rules);

    // Calculate metrics
    const totalRules = rules.length;
    const passedRules = rules.filter(r => r.status === 'pass').length;
    const warningRules = rules.filter(r => r.status === 'warning').length;

    setMetrics({
      completeness: Math.round((passedRules / totalRules) * 100),
      accuracy: Math.round(((passedRules + warningRules * 0.5) / totalRules) * 100),
      compliance: Math.round((passedRules / totalRules) * 100),
      readiness: Math.round(((passedRules + warningRules * 0.7) / totalRules) * 100)
    });
  }, []);

  const getStatusInfo = (status: ValidationRule['status']) => {
    switch (status) {
      case 'pass':
        return {
          icon: '✅',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: '통과'
        };
      case 'warning':
        return {
          icon: '⚠️',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: '주의'
        };
      case 'error':
        return {
          icon: '❌',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: '오류'
        };
    }
  };

  const getSeverityInfo = (severity: ValidationRule['severity']) => {
    switch (severity) {
      case 'critical':
        return { label: '치명적', color: 'bg-red-600 text-white' };
      case 'high':
        return { label: '높음', color: 'bg-orange-500 text-white' };
      case 'medium':
        return { label: '보통', color: 'bg-yellow-500 text-white' };
      case 'low':
        return { label: '낮음', color: 'bg-blue-500 text-white' };
    }
  };

  const filteredRules = selectedCategory === 'all' 
    ? validationRules 
    : validationRules.filter(rule => rule.category === selectedCategory);

  const categories = ['기본정보', '재무데이터', '인력정보', '투자전략', '컴플라이언스'];

  const getMetricColor = (value: number) => {
    if (value >= 90) return 'from-green-500 to-emerald-500';
    if (value >= 70) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">품질 관리 대시보드</h1>
              <p className="text-sm text-slate-500">
                RFP 응답 데이터 검증 및 품질 점검
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔍 전체 검증 실행
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Metrics Overview */}
        {metrics && (
          <motion.div 
            className="grid md:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {[
              { label: '완성도', value: metrics.completeness, description: '필수 항목 완료율' },
              { label: '정확성', value: metrics.accuracy, description: '데이터 정확성 점수' },
              { label: '규정준수', value: metrics.compliance, description: 'RFP 요구사항 준수율' },
              { label: '제출준비도', value: metrics.readiness, description: '전체 제출 준비 상태' }
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-slate-600">{metric.label}</div>
                  <div className={`text-2xl font-bold bg-gradient-to-r ${getMetricColor(metric.value)} bg-clip-text text-transparent`}>
                    {metric.value}%
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${getMetricColor(metric.value)} transition-all duration-1000`}
                    style={{ width: `${metric.value}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-500">{metric.description}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Category Filter */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              전체 ({validationRules.length})
            </button>
            {categories.map(category => {
              const count = validationRules.filter(rule => rule.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Validation Rules */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {filteredRules.map((rule, index) => {
            const statusInfo = getStatusInfo(rule.status);
            const severityInfo = getSeverityInfo(rule.severity);
            
            return (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl border-l-4 ${statusInfo.borderColor} overflow-hidden hover:shadow-lg transition-all duration-300`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className={`${statusInfo.bgColor} rounded-lg p-2`}>
                        <span className="text-xl">{statusInfo.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-slate-800">{rule.rule}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${severityInfo.color}`}>
                            {severityInfo.label}
                          </span>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {rule.category}
                          </span>
                        </div>
                        <p className={`text-sm mb-2 ${statusInfo.color}`}>
                          {rule.message}
                        </p>
                        {rule.suggestion && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                            <div className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-0.5">💡</span>
                              <div>
                                <div className="text-xs font-medium text-blue-800 mb-1">개선 제안</div>
                                <div className="text-sm text-blue-700">{rule.suggestion}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      {rule.status !== 'pass' && (
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          수정하기
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Action Panel */}
        <motion.div 
          className="mt-12 bg-white rounded-xl border border-slate-200 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-xl font-bold text-slate-800 mb-6">제출 전 최종 점검</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-slate-700">필수 확인 사항</h4>
              {[
                { text: '모든 치명적 오류 해결', status: 'error' },
                { text: '필수 첨부 서류 완비', status: 'warning' },
                { text: '데이터 일관성 검증', status: 'pass' },
                { text: '최종 검토 완료', status: 'error' }
              ].map((item, i) => {
                const statusInfo = getStatusInfo(item.status as any);
                return (
                  <div key={i} className="flex items-center space-x-3">
                    <span className="text-lg">{statusInfo.icon}</span>
                    <span className="text-sm text-slate-600">{item.text}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex flex-col justify-center">
              <button 
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={validationRules.some(rule => rule.status === 'error')}
              >
                📋 최종 제출 패키지 생성
              </button>
              <p className="text-xs text-slate-500 mt-2 text-center">
                모든 오류를 해결한 후 제출 가능합니다
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QualityControlDashboard;