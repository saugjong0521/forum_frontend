'use client';
import { useEffect } from 'react';
import { useAdminUserStore, User } from '../../store/useAdminUserStore';
import useAdminBringUsers from '@/app/hooks/useAdminBringUsers';

export default function AdminUserBox() {
  const { users, bringAdminUsers, loading, error } = useAdminBringUsers();
  const { 
    currentSkip,
    currentLimit,
    isActiveFilter
  } = useAdminUserStore();

  useEffect(() => {
    const params = { 
      skip: currentSkip,
      limit: currentLimit,
      ...(isActiveFilter !== null && { is_active: isActiveFilter })
    };
    
    bringAdminUsers(params);
  }, [currentSkip, currentLimit, isActiveFilter, bringAdminUsers]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(/\. /g, '/').replace('.', '');
  };

  const getRowClassName = (user: User) => {
    let baseClasses = 'cursor-pointer transition-colors h-8';

    if (!user.is_active) {
      baseClasses += ' bg-gray-100 hover:bg-gray-150';
    } else {
      baseClasses += ' hover:bg-gray-50';
    }

    return baseClasses;
  };

  const getTextClassName = (user: User, baseClass: string) => {
    if (!user.is_active) {
      return baseClass.replace('text-gray-900', 'text-gray-500').replace('text-gray-600', 'text-gray-400');
    }
    return baseClass;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-white border border-gray-300 rounded p-4">
        <div className="text-center text-gray-500">사용자를 불러오는 중...</div>
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
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="h-8">
            <th className="px-2 text-left font-medium text-gray-700 border-b w-16">ID</th>
            <th className="px-2 text-left font-medium text-gray-700 border-b w-32">사용자명</th>
            <th className="px-2 text-left font-medium text-gray-700 border-b">이메일</th>
            <th className="px-2 text-left font-medium text-gray-700 border-b w-24">닉네임</th>
            <th className="px-2 text-center font-medium text-gray-700 border-b w-16">상태</th>
            <th className="px-2 text-center font-medium text-gray-700 border-b w-16">권한</th>
            <th className="px-2 text-center font-medium text-gray-700 border-b w-20">가입일</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr 
              key={user.user_id} 
              className={getRowClassName(user)}
            >
              <td className={`px-2 border-b text-center align-middle ${getTextClassName(user, 'text-gray-600')}`}>
                {user.user_id}
              </td>
              <td className={`px-2 border-b align-middle ${getTextClassName(user, 'text-gray-900')}`}>
                <div className="truncate" title={user.username}>
                  {user.username}
                </div>
              </td>
              <td className={`px-2 border-b align-middle ${getTextClassName(user, 'text-gray-900')}`}>
                <div className="truncate" title={user.email}>
                  {user.email}
                </div>
              </td>
              <td className={`px-2 border-b align-middle ${getTextClassName(user, 'text-gray-900')}`}>
                <div className="truncate" title={user.nickname}>
                  {user.nickname}
                </div>
              </td>
              <td className="px-2 border-b text-center align-middle">
                {user.is_active ? (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded">
                    활성
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
                    비활성
                  </span>
                )}
              </td>
              <td className="px-2 border-b text-center align-middle">
                {user.is_admin ? (
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded">
                    관리자
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
                    일반
                  </span>
                )}
              </td>
              <td className="px-2 text-gray-500 border-b text-center align-middle">
                {formatDate(user.created_at)}
              </td>
            </tr>
          ))}
          
          {/* 빈 행들로 채우기 */}
          {Array.from({ length: Math.max(0, currentLimit - users.length) }, (_, i) => (
            <tr key={`empty-${i}`} className="h-8">
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