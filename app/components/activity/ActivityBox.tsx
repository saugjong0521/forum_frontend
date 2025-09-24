'use client'

import { useBringActivity } from '@/app/hooks/useBringActivity';
import { UserActivity } from '@/app/types/user';
import React, { useEffect } from 'react';

// 활동 타입에 따른 한국어 매핑 (activity_type 기준)
const getActivityTypeText = (activityType: string): string => {
  const typeMap: Record<string, string> = {
    'comment_create': '댓글 작성',
    'post_create': '게시글 작성',
    'recommendation_create': '게시글 좋아요',
    'comment_like': '댓글 좋아요',
  };
  
  return typeMap[activityType] || activityType;
};

// 게시글 제목 추출 함수
const getPostTitle = (target: UserActivity['target']): string => {
  return target?.title || target?.post?.title || '제목 없음';
};

// 시간 포맷팅 함수
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  
  return date.toLocaleDateString('ko-KR');
};

// 활동 아이템 컴포넌트
interface ActivityItemProps {
  activity: UserActivity;
  onPostClick: (url: string) => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onPostClick }) => {
  const postTitle = getPostTitle(activity.target);
  
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm font-medium text-gray-900">
        {getActivityTypeText(activity.activity_type)}
      </td>
      <td className="px-4 py-3 text-sm text-blue-600">
        <button
          onClick={() => onPostClick(activity.target.url)}
          className="hover:text-blue-800 hover:underline transition-colors max-w-md truncate text-left"
          title={postTitle}
        >
          {postTitle}
        </button>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">
        {formatDate(activity.created_at)}
      </td>
    </tr>
  );
};

// 로딩 스피너 컴포넌트
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

// 에러 컴포넌트
interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => (
  <div className="text-center text-red-500 py-8">
    <p className="mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
    >
      다시 시도
    </button>
  </div>
);

// 빈 상태 컴포넌트
const EmptyState: React.FC = () => (
  <div className="text-center text-gray-500 py-8">
    <p>최근 활동이 없습니다.</p>
  </div>
);

// 메인 ActivityBox 컴포넌트
const ActivityBox: React.FC = () => {
  const { 
    activities, 
    loading, 
    error, 
    hasMore, 
    fetchActivities, 
    loadMoreActivities, 
    reset 
  } = useBringActivity();

  // 현재 페이지 상태 (로컬)
  const [currentPage, setCurrentPage] = React.useState(0);
  const itemsPerPage = 20;
  
  // 현재 페이지에 표시할 활동들
  const currentActivities = activities.slice(
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage
  );
  
  // 전체 페이지 수
  const totalPages = Math.ceil(activities.length / itemsPerPage);

  // 컴포넌트 마운트 시 첫 페이지 로드
  useEffect(() => {
    fetchActivities();
    
    // 컴포넌트 언마운트 시 store 초기화
    return () => {
      reset();
    };
  }, [fetchActivities, reset]);

  const handlePostClick = (url: string): void => {
    // 상대 경로인 경우 현재 도메인에 맞게 이동
    if (url.startsWith('/')) {
      window.location.href = `${window.location.origin}${url}`;
    } else {
      window.location.href = url;
    }
  };

  const handleRefresh = (): void => {
    reset();
    setCurrentPage(0);
    fetchActivities();
  };

  // 이전 페이지
  const handlePrevPage = (): void => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 다음 페이지
  const handleNextPage = (): void => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else if (hasMore && !loading) {
      // 더 많은 데이터가 있고 현재 로딩 중이 아니면 추가 로드
      loadMoreActivities().then(() => {
        setCurrentPage(currentPage + 1);
      });
    }
  };

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === '<') {
        handlePrevPage();
      } else if (e.key === 'ArrowRight' || e.key === '>') {
        handleNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, totalPages, hasMore, loading]);

  // 첫 로딩 상태
  if (loading && activities.length === 0) {
    return (
      <div className="w-full h-full bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">최근 활동</h3>
        <LoadingSpinner />
      </div>
    );
  }

  // 에러 상태 (데이터가 없을 때만)
  if (error && activities.length === 0) {
    return (
      <div className="w-full h-full bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">최근 활동</h3>
        <ErrorDisplay error={error} onRetry={handleRefresh} />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-md p-6 flex flex-col">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">최근 활동</h3>
        <button
          onClick={handleRefresh}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          disabled={loading}
        >
          새로고침
        </button>
      </div>
      
      {/* 컨텐츠 */}
      {activities.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* 테이블 */}
          <div className="flex-1 overflow-hidden">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    활동 유형
                  </th>
                  <th className="w-1/2 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    게시글 제목
                  </th>
                  <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    시간
                  </th>
                </tr>
              </thead>
            </table>
            
            <div className="overflow-y-auto flex-1">
              <table className="w-full table-fixed">
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentActivities.map((activity) => (
                    <ActivityItem
                      key={`${activity.activity_id}-${activity.user_id}-${activity.created_at}`}
                      activity={activity}
                      onPostClick={handlePostClick}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* 페이지네이션 */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {currentPage * itemsPerPage + 1} - {Math.min((currentPage + 1) * itemsPerPage, activities.length)}개 
              (총 {activities.length}개)
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                &lt; 이전
              </button>
              
              <span className="text-sm text-gray-700">
                {currentPage + 1} / {Math.max(totalPages, 1)}
              </span>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1 && !hasMore}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                다음 &gt;
              </button>
            </div>
          </div>
          
          {/* 키보드 안내 */}
          <div className="mt-2 text-center text-xs text-gray-400">
            키보드 ← → 키로도 페이지 이동 가능
          </div>
          
          {/* 로딩 중 표시 */}
          {loading && (
            <div className="mt-2 text-center text-sm text-blue-600">
              데이터를 불러오는 중...
            </div>
          )}
          
          {/* 추가 로드 에러 */}
          {error && activities.length > 0 && (
            <div className="mt-2 text-center text-red-500 text-sm">
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ActivityBox;