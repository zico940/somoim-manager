'use client';

import { useState, useEffect } from 'react';
import { PieChart, BarChart } from 'lucide-react';

export default function StatisticsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 text-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    const regionData = Object.entries(stats?.regionStats || {}).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10);
    const studyData = Object.entries(stats?.studyStats || {}).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10);
    const dayData = Object.entries(stats?.dayStats || {}).sort((a: any, b: any) => b[1] - a[1]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-500 dark:from-indigo-400 dark:to-indigo-200">
                    인사이트 및 통계
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">회원 분포와 관심도를 분석한 결과입니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 거주지역 분포 */}
                <div className="glass-panel p-6">
                    <div className="flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-100">
                        <BarChart size={20} className="text-indigo-500" />
                        <h2 className="text-lg font-bold">인기 거주구역 Top 10</h2>
                    </div>
                    <div className="space-y-3">
                        {regionData.map(([name, count]: any, i) => {
                            const maxCount = regionData[0]?.[1] || 1;
                            const width = Math.max((Number(count) / Number(maxCount)) * 100, 5);
                            return (
                                <div key={name} className="flex items-center gap-2 sm:gap-4 text-sm w-full">
                                    <span className="w-14 sm:w-16 font-medium text-slate-600 dark:text-slate-300 truncate">{name}</span>
                                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-5 overflow-hidden flex items-center shadow-inner min-w-0">
                                        <div
                                            className="bg-indigo-500 h-full rounded-r-full flex items-center px-2 text-[10px] text-white font-bold"
                                            style={{ width: `${width}%` }}
                                        ></div>
                                    </div>
                                    <span className="w-8 text-right font-medium text-indigo-600 dark:text-indigo-400">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 선호 요일 */}
                <div className="glass-panel p-6">
                    <div className="flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-100">
                        <PieChart size={20} className="text-pink-500" />
                        <h2 className="text-lg font-bold">선호 요일 랭킹</h2>
                    </div>
                    <div className="space-y-3">
                        {dayData.map(([day, count]: any, i) => {
                            const maxCount = dayData[0]?.[1] || 1;
                            const width = Math.max((Number(count) / Number(maxCount)) * 100, 5);
                            return (
                                <div key={day} className="flex items-center gap-2 sm:gap-4 text-sm w-full">
                                    <span className="w-10 sm:w-12 font-medium text-slate-600 dark:text-slate-300 truncate">{day}</span>
                                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-5 overflow-hidden flex items-center shadow-inner min-w-0">
                                        <div
                                            className="bg-pink-500 h-full rounded-r-full"
                                            style={{ width: `${width}%` }}
                                        ></div>
                                    </div>
                                    <span className="w-8 text-right font-medium text-pink-600 dark:text-pink-400">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 관심 공부 분야 */}
                <div className="glass-panel p-6 md:col-span-2">
                    <div className="flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-100">
                        <BarChart size={20} className="text-blue-500" />
                        <h2 className="text-lg font-bold">인기 스터디 및 관심 분야</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {studyData.map(([subject, count]: any) => (
                            <div key={subject} className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 truncate">{subject}</div>
                                <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{count}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
