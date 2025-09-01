'use client';
import { useEffect } from 'react';
import { useAdminCommentsStore } from '../../store/useAdminCommentsStore';
import useAdminDeleteComment from '@/app/hooks/useAdminDeleteComment';
import useAdminDeactivateComment from '@/app/hooks/useAdminDeactivateComment';
import useAdminActivateComment from '@/app/hooks/useAdminActivateComment';
import useAdminBringCommentsAll from '@/app/hooks/useAdminBringCommentsAll';

export default function AdminCommentsAllBox() {
  const { comments, bringAdminComments, loading, error } = useAdminBringCommentsAll();
  const { 
    currentSkip,
    currentLimit,
    isActiveFilter,
    currentPostId
  } = useAdminCommentsStore();
  
  const { deleteComment, loading: deleteLoading, error: deleteError, clearError: clearDeleteError } = useAdminDeleteComment();
  const { deactivateComment, loading: deactivateLoading, error: deactivateError, clearError: clearDeactivateError } = useAdminDeactivateComment();
  const { activateComment, loading: activateLoading, error: activateError, clearError: clearActivateError } = useAdminActivateComment();

  useEffect(() => {
    const params = { 
      skip: currentSkip,
      limit: currentLimit,
      ...(isActiveFilter !== null && { is_active: isActiveFilter }),
      ...(currentPostId && { post_id: currentPostId })
    };
    
    bringAdminComments(params);
  }, [currentSkip, currentLimit, isActiveFilter, currentPostId, bringAdminComments]);

  const handleActivate = async (commentId: number) => {
    const isConfirmed = window.confirm('이 댓글을 활성화하시겠습니까?');
    if (!isConfirmed) return;

    clearActivateError();
    const success = await activateComment(commentId);

    if (success) {
      alert('댓글이 활성화되었습니다.');
      refreshComments();
    } else if (activateError) {
      alert(activateError);
    }
  };

  const handleDeactivate = async (commentId: number) => {
    const isConfirmed = window.confirm('이 댓글을 비활성화하시겠습니까?');
    if (!isConfirmed) return;

    clearDeactivateError();
    const success = await deactivateComment(commentId);

    if (success) {
      alert('댓글이 비활성화되었습니다.');
      refreshComments();
    } else if (deactivateError) {
      alert(deactivateError);
    }
  };

  const handleDelete = async (commentId: number) => {
    const isConfirmed = window.confirm('이 댓글을 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (!isConfirmed) return;

    clearDeleteError();
    const success = await deleteComment(commentId);

    if (success) {
      alert('댓글이 삭제되었습니다.');
      refreshComments();
    } else if (deleteError) {
      alert(deleteError);
    }
  };

  const refreshComments = () => {
    const params = { 
      skip: currentSkip,
      limit: currentLimit,
      ...(isActiveFilter !== null && { is_active: isActiveFilter }),
      ...(currentPostId && { post_id: currentPostId })
    };
    bringAdminComments(params);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content: string, maxLength: number = 30) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // 댓글 행의 스타일을 결정하는 함수
  const getRowClassName = (comment: any) => {
    let baseClasses = 'h-10 cursor-pointer transition-colors';
    
    // 비활성 댓글 스타일 (is_active: false)
    if (!comment.is_active) {
      baseClasses += ' bg-gray-100 hover:bg-gray-150';
    }
    // 일반 댓글 스타일
    else {
      baseClasses += ' hover:bg-gray-50';
    }
    
    return baseClasses;
  };

  // 텍스트 스타일을 결정하는 함수
  const getTextClassName = (comment: any, baseClass: string) => {
    if (!comment.is_active) {
      // 비활성 댓글은 텍스트를 더 흐리게
      return baseClass.replace('text-gray-900', 'text-gray-500').replace('text-gray-600', 'text-gray-400');
    }
    return baseClass;
  };

  const isLoading = deactivateLoading || activateLoading || deleteLoading;

  if (loading) {
    return (
      <div className="flex-1 bg-white border border-gray-300 rounded p-4">
        <div className="text-center text-gray-500">댓글을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-white border border-gray-300 rounded p-4">
        <div className="text-center text-red-500">에러: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white border border-gray-300 rounded">
      {(deactivateError || activateError || deleteError) && (
        <div className="p-2 bg-red-50 text-red-600 text-sm text-center border-b">
          에러: {deactivateError || activateError || deleteError}
        </div>
      )}
      
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="h-10">
            <th className="px-2 text-left font-medium text-gray-700 border-b w-16">댓글ID</th>
            <th className="px-2 text-left font-medium text-gray-700 border-b">내용</th>
            <th className="px-2 text-center font-medium text-gray-700 border-b w-16">게시글ID</th>
            <th className="px-2 text-center font-medium text-gray-700 border-b w-20">작성자</th>
            <th className="px-2 text-center font-medium text-gray-700 border-b w-16">상태</th>
            <th className="px-2 text-center font-medium text-gray-700 border-b w-20">작성일</th>
            <th className="px-2 text-center font-medium text-gray-700 border-b w-20">관리</th>
          </tr>
        </thead>
        <tbody>
          {comments.map(comment => (
            <tr 
              key={comment.comment_id} 
              className={getRowClassName(comment)}
            >
              <td className={`px-2 border-b text-center align-middle ${getTextClassName(comment, 'text-gray-600')}`}>
                {comment.comment_id}
              </td>
              <td className={`px-2 border-b align-middle ${getTextClassName(comment, 'text-gray-900')}`}>
                <div className="truncate" title={comment.content}>
                  {truncateContent(comment.content)}
                </div>
              </td>
              <td className="px-2 text-gray-500 border-b text-center align-middle">
                {comment.post_id}
              </td>
              <td className="px-2 text-gray-500 border-b text-center align-middle">
                <div className="truncate max-w-[60px] mx-auto" title={comment.author?.nickname}>
                  {comment.author?.nickname || 'Unknown'}
                </div>
              </td>
              <td className="px-2 border-b text-center align-middle">
                {comment.is_active ? (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded">
                    활성
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
                    비활성
                  </span>
                )}
              </td>
              <td className="px-2 text-gray-500 border-b text-center align-middle">
                {formatDate(comment.created_at)}
              </td>
              <td className="px-1 text-center border-b align-middle">
                <div className="flex gap-1 justify-center">
                  {/* 활성화/비활성화 버튼 */}
                  {comment.is_active ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeactivate(comment.comment_id);
                      }}
                      disabled={isLoading}
                      className={`px-1 py-0.5 text-xs rounded transition-colors ${
                        isLoading 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      {deactivateLoading ? '처리중' : '비활성'}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivate(comment.comment_id);
                      }}
                      disabled={isLoading}
                      className={`px-1 py-0.5 text-xs rounded transition-colors ${
                        isLoading 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {activateLoading ? '처리중' : '활성'}
                    </button>
                  )}
                  
                  {/* 삭제 버튼 - 항상 표시 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(comment.comment_id);
                    }}
                    disabled={isLoading}
                    className={`px-1 py-0.5 text-xs rounded transition-colors ${
                      isLoading 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {deleteLoading ? '삭제중' : '삭제'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          
          {/* 빈 행들로 채우기 */}
          {Array.from({ length: Math.max(0, currentLimit - comments.length) }, (_, i) => (
            <tr key={`empty-${i}`} className="h-10">
              <td className="px-2 border-b">&nbsp;</td>
              <td className="px-2 border-b">&nbsp;</td>
              <td className="px-2 border-b">&nbsp;</td>
              <td className="px-2 border-b">&nbsp;</td>
              <td className="px-2 border-b">&nbsp;</td>
              <td className="px-2 border-b">&nbsp;</td>
              <td className="px-2 border-b">&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}