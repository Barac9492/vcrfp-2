import { useRFP } from '../hooks/useRFP';
import type { RFP } from '../types/rfp';

interface RFPListProps {
  onSelectRFP: (rfp: RFP) => void;
  onCreateNew: () => void;
}

const RFPList = ({ onSelectRFP, onCreateNew }: RFPListProps) => {
  const { rfps, loading, error, deleteRFP } = useRFP();

  const handleDelete = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('이 RFP를 삭제하시겠습니까?')) {
      await deleteRFP(id);
    }
  };

  const getStatusColor = (rfp: RFP) => {
    const deadline = new Date(rfp.requirements.기본정보.마감일);
    const today = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return 'bg-red-100 text-red-800';
    if (daysLeft <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getDaysLeft = (deadline: Date) => {
    const today = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return `${Math.abs(daysLeft)}일 지남`;
    if (daysLeft === 0) return '오늘 마감';
    return `${daysLeft}일 남음`;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">RFP 목록을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">❌ 오류가 발생했습니다</div>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">RFP 관리</h2>
        <button
          onClick={onCreateNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ 새 RFP 생성
        </button>
      </div>

      {rfps.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">RFP가 없습니다</h3>
          <p className="text-gray-600 mb-4">새로운 RFP를 생성하여 시작하세요.</p>
          <button
            onClick={onCreateNew}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            첫 번째 RFP 생성하기
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rfps.map((rfp) => (
            <div
              key={rfp.id}
              onClick={() => onSelectRFP(rfp)}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {rfp.requirements.기본정보.기관명}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {rfp.requirements.기본정보.프로그램명}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(rfp.id, e)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="삭제"
                >
                  🗑️
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">공고일:</span>
                  <span>{rfp.requirements.기본정보.공고일.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">마감일:</span>
                  <span>{rfp.requirements.기본정보.마감일.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">최소결성액:</span>
                  <span>{(rfp.requirements.펀드요구사항.최소결성액 / 100000000).toFixed(0)}억원</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rfp)}`}
                >
                  {getDaysLeft(rfp.requirements.기본정보.마감일)}
                </span>
                <span className="text-xs text-gray-500">
                  v{rfp.version}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>생성: {rfp.createdAt.toLocaleDateString()}</span>
                  <span>수정: {rfp.updatedAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {rfps.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">💡 빠른 팁</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• RFP 카드를 클릭하여 편집할 수 있습니다</li>
            <li>• 마감일이 가까운 RFP는 노란색 또는 빨간색으로 표시됩니다</li>
            <li>• 기존 RFP를 템플릿으로 사용하여 새 RFP를 빠르게 생성할 수 있습니다</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default RFPList;