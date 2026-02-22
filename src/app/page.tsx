'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, UserMinus, Activity } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ message: string, type: 'success' | 'error' | '' } | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/statistics');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 text-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus({ message: '소모임 앱과 동기화 중입니다...', type: '' });

      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.success) {
        if (data.addedCount > 0) {
          setSyncStatus({
            message: `성공! 신규 회원 ${data.addedCount}명이 추가되었습니다. (${data.addedMembers.join(', ')})`,
            type: 'success'
          });
          // 데이터를 새로고침
          setTimeout(() => window.location.reload(), 3000);
        } else {
          setSyncStatus({ message: '모든 데이터가 최신 상태입니다. (추가된 회원 없음)', type: 'success' });
          setTimeout(() => setSyncStatus(null), 3000);
        }
      } else {
        setSyncStatus({ message: `동기화 실패: ${data.error || '알 수 없는 오류'}`, type: 'error' });
      }
    } catch (error) {
      setSyncStatus({ message: '동기화 중 네트워크 오류가 발생했습니다.', type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  const statCards = [
    { title: '총 회원', value: stats?.total || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { title: '현재 회원', value: stats?.current || 0, icon: Activity, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10' },
    { title: '탈퇴 회원', value: stats?.left || 0, icon: UserMinus, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
    { title: '이번 달 신규가입', value: stats?.monthlyJoins?.[new Date().toISOString().substring(0, 7)] || 0, icon: UserPlus, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            대시보드 오버뷰
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">소모임 회원 현황을 한눈에 파악하세요.</p>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 text-sm shadow-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 transition-all font-semibold"
        >
          {isSyncing ? (
            <div className="animate-spin w-4 h-4 border-2 border-white rounded-full border-t-transparent"></div>
          ) : (
            <Activity size={16} />
          )}
          {isSyncing ? '동기화 진행 중...' : '소모임 강제 갱신'}
        </button>
      </div>

      {syncStatus && (
        <div className={`p-4 rounded-lg shadow-sm font-medium flex items-center gap-3 ${syncStatus.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
          syncStatus.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
            'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
          }`}>
          {syncStatus.type === 'success' ? '✅' : syncStatus.type === 'error' ? '❌' : '🔄'}
          {syncStatus.message}
        </div>
      )}

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="glass-panel p-6 flex flex-row items-center justify-between group cursor-default hover:-translate-y-1 transition-transform">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{card.title}</p>
              <p className="text-3xl font-bold">{card.value}</p>
            </div>
            <div className={`p-4 rounded-xl ${card.bg} group-hover:scale-110 transition-transform ml-4`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 오른쪽 2/3: 활동 상태 */}
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">회원 활동 상태</h2>
            <Link href="/statistics" className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">통계 더보기 →</Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(stats?.activityStats || {}).map(([key, value]: any) => {
              if (key === '탈퇴') return null;
              return (
                <div key={key} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 text-center flex flex-col items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{key}</div>
                  <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{value}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 왼쪽 1/3: 최근 상태 */}
        <div className="glass-panel p-6 border-t-4 border-t-indigo-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">주요 지표</h2>
          </div>
          <div className="space-y-5">
            <div>
              <div className="text-xs tracking-wider text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">가장 많은 거주지역</div>
              <div className="font-semibold text-lg flex items-end gap-2">
                {String(Object.entries(stats?.regionStats || {}).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '데이터 없음')}
                <span className="text-sm text-slate-400 font-normal">
                  ({Number(Object.entries(stats?.regionStats || {}).sort((a: any, b: any) => b[1] - a[1])[0]?.[1] || 0)}명)
                </span>
              </div>
            </div>
            <div className="h-px w-full bg-slate-100 dark:bg-slate-800"></div>
            <div>
              <div className="text-xs tracking-wider text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">참여가 가장 높은 요일</div>
              <div className="font-semibold text-lg">
                {String(Object.entries(stats?.dayStats || {}).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '-')}
                <span className="text-sm text-slate-400 font-normal ml-2">
                  ({Number(Object.entries(stats?.dayStats || {}).sort((a: any, b: any) => b[1] - a[1])[0]?.[1] || 0)}명)
                </span>
              </div>
            </div>
            <div className="h-px w-full bg-slate-100 dark:bg-slate-800"></div>
            <div>
              <div className="text-xs tracking-wider text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">선호 스터디 주제</div>
              <div className="font-semibold text-lg">
                {String(Object.entries(stats?.studyStats || {}).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '-')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
