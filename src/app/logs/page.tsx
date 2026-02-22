'use client';

import { useState, useEffect } from 'react';
import { FileText, Clock, User } from 'lucide-react';

export default function LogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLogs() {
            try {
                const res = await fetch('/api/logs');
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data.logs || []);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchLogs();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                        시스템 활동 로그
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">소모임 회원의 변경 이력을 확인합니다.</p>
                </div>
            </div>

            <div className="glass-panel overflow-hidden">
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="py-20 text-center text-slate-500">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p>기록된 활동 로그가 없습니다.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full whitespace-nowrap">
                            <thead>
                                <tr>
                                    <th className="table-header w-48">시간 (KST)</th>
                                    <th className="table-header w-32">활동 유형</th>
                                    <th className="table-header">상세 내용</th>
                                    <th className="table-header w-32">처리자</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log: any, i) => (
                                    <tr key={i} className="table-row-hover text-sm">
                                        <td className="table-cell">
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                                <Clock size={14} />
                                                {new Date(log.timestamp).toLocaleString('ko-KR')}
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${log.action === '가입' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    log.action === '탈퇴' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="table-cell">
                                            <span className="text-slate-700 dark:text-slate-300">{log.detail}</span>
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                <User size={14} />
                                                {log.operatorId}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
