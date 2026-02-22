'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, UserCircle, Briefcase, MapPin } from 'lucide-react';

export default function MembersPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('현재회원');
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    useEffect(() => {
        async function fetchMembers() {
            try {
                setLoading(true);
                const res = await fetch(`/api/members?status=${filterStatus}`);
                if (res.ok) {
                    const data = await res.json();
                    setMembers(data.members || []);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchMembers();
    }, [filterStatus]);

    const filteredMembers = members.filter(m => {
        const matchesSearch = m.nickname.includes(searchTerm) || m.realName.includes(searchTerm);
        const matchesRole = filterRole ? m.role === filterRole : true;
        return matchesSearch && matchesRole;
    });

    const sortedMembers = [...filteredMembers].sort((a, b) => {
        if (!sortConfig) return 0;

        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'articleCount') {
            valA = Number(valA);
            valB = Number(valB);
        } else {
            valA = String(valA || '');
            valB = String(valB || '');
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold">회원 관리</h1>
                <div className="flex items-center gap-3">
                    <a href="/api/export" download className="btn-secondary flex items-center gap-2 text-sm shadow-sm bg-white dark:bg-slate-800">
                        CSV 내보내기
                    </a>
                    <Link href="/members/new" className="btn-primary flex items-center gap-2 text-sm shadow-md">
                        <Plus size={16} /> 신규 등록
                    </Link>
                </div>
            </div>

            <div className="glass-panel p-4 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="닉네임 또는 이름 검색"
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm appearance-none cursor-pointer"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                >
                    <option value="">모든 역할</option>
                    <option value="모임장">모임장</option>
                    <option value="운영진">운영진</option>
                    <option value="일반">일반</option>
                </select>

                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button
                        onClick={() => setFilterStatus('현재회원')}
                        className={`px-4 py-1.5 text-sm rounded ${filterStatus === '현재회원' ? 'bg-white dark:bg-slate-700 shadow-sm font-medium' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        현재 회원
                    </button>
                    <button
                        onClick={() => setFilterStatus('탈퇴회원')}
                        className={`px-4 py-1.5 text-sm rounded ${filterStatus === '탈퇴회원' ? 'bg-white dark:bg-slate-700 shadow-sm font-medium' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        탈퇴 회원
                    </button>
                </div>
            </div>

            <div className="glass-panel overflow-hidden">
                {/* 모바일 화면용 카드 뷰 */}
                <div className="block md:hidden">
                    {loading ? (
                        <div className="py-12 text-center text-slate-500">
                            <div className="flex justify-center mb-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 text-blue-500 border-t-transparent"></div>
                            </div>
                            데이터를 불러오는 중입니다...
                        </div>
                    ) : sortedMembers.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                            검색 결과가 없습니다.
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {sortedMembers.map((m: any, i) => (
                                <div key={i} className="p-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex flex-shrink-0 items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <UserCircle size={24} />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                                    {m.nickname}
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${m.role === '모임장' ? 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-900/30' :
                                                        m.role === '운영진' ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30' :
                                                            'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800'
                                                        }`}>
                                                        {m.role}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-500">{m.realName}</div>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${m.activityStatus === '신입' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                            m.activityStatus === '활성' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                m.activityStatus === '비활성' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                    m.activityStatus === '탈퇴' ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                                                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>
                                            {m.activityStatus}
                                        </span>
                                    </div>
                                    <div className="pl-12 space-y-1.5 mb-3 text-xs text-slate-600 dark:text-slate-400">
                                        {m.location && <div className="flex items-center gap-1.5"><MapPin size={12} /> <span className="truncate">{m.location}</span></div>}
                                        {m.studyContent && <div className="flex items-center gap-1.5"><Briefcase size={12} /> <span className="truncate">{m.studyContent}</span></div>}
                                        <div className="text-slate-400 mt-1">가입일: {m.joinDate?.substring(0, 10) || '-'}</div>
                                    </div>
                                    <div className="pl-12 flex items-center justify-between">
                                        <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                            게시글 <strong className="text-slate-700 dark:text-slate-300 ml-1">{m.articleCount || 0}</strong>
                                        </span>
                                        <Link href={`/members/${m.id}`} className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                                            상세보기
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* PC 화면용 테이블 뷰 */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead>
                            <tr>
                                <th className="table-header cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('nickname')}>닉네임 (실명) {sortConfig?.key === 'nickname' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                <th className="table-header cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('role')}>역할 {sortConfig?.key === 'role' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                <th className="table-header cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('activityStatus')}>활동상태 {sortConfig?.key === 'activityStatus' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                <th className="table-header w-48">기본 정보</th>
                                <th className="table-header cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('joinDate')}>가입일 / 최근접속 {sortConfig?.key === 'joinDate' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                <th className="table-header cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('articleCount')}>게시글 {sortConfig?.key === 'articleCount' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                <th className="table-header text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-500">
                                        <div className="flex justify-center mb-2">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 text-blue-500 border-t-transparent"></div>
                                        </div>
                                        데이터를 불러오는 중입니다...
                                    </td>
                                </tr>
                            ) : sortedMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-500">
                                        검색 결과가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                sortedMembers.map((m: any, i) => (
                                    <tr key={i} className="table-row-hover">
                                        <td className="table-cell">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex flex-shrink-0 items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                    <UserCircle size={22} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 dark:text-slate-100">{m.nickname}</div>
                                                    <div className="text-xs text-slate-500">{m.realName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${m.role === '모임장' ? 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-900/30' :
                                                m.role === '운영진' ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30' :
                                                    'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800'
                                                }`}>
                                                {m.role}
                                            </span>
                                        </td>
                                        <td className="table-cell">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.activityStatus === '신입' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                m.activityStatus === '활성' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                    m.activityStatus === '비활성' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                        m.activityStatus === '탈퇴' ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                                                            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                {m.activityStatus}
                                            </span>
                                        </td>
                                        <td className="table-cell text-xs text-slate-600 dark:text-slate-400">
                                            <div className="flex flex-col gap-1.5 max-w-[200px] truncate">
                                                {m.gender && <div className="flex items-center gap-1.5"><UserCircle size={12} /> {m.gender.substring(0, 15)}</div>}
                                                {m.location && <div className="flex items-center gap-1.5"><MapPin size={12} /> {m.location.substring(0, 15)}</div>}
                                                {m.studyContent && <div className="flex items-center gap-1.5"><Briefcase size={12} /> {m.studyContent.substring(0, 15)}</div>}
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="text-sm">{m.joinDate?.substring(0, 10) || '-'}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{m.lastVisit?.substring(0, 10) || '-'}</div>
                                        </td>
                                        <td className="table-cell text-center font-medium">
                                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{m.articleCount || 0}</span>
                                        </td>
                                        <td className="table-cell text-right">
                                            <Link href={`/members/${m.id}`} className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                                                상세보기
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
