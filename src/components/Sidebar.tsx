'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, BarChart2, FileText, Settings } from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    const links = [
        { name: '대시보드', href: '/', icon: Home },
        { name: '회원 관리', href: '/members', icon: Users },
        { name: '통계', href: '/statistics', icon: BarChart2 },
        { name: '활동 로그', href: '/logs', icon: FileText },
    ];

    return (
        <div className="hidden md:flex w-64 h-screen glass-panel rounded-none border-t-0 border-l-0 border-b-0 flex-col pt-6 fixed left-0 top-0 z-40">
            <div className="px-6 pb-8">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
                    소모임 관리자
                </h1>
                <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">데이터 통합 시스템 v3.1</p>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            <Icon size={18} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 mt-auto">
                <div className="p-4 glass-panel bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs">
                    <p className="font-semibold mb-1 text-slate-700 dark:text-slate-300">Google Sheets 연동</p>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Connected
                    </div>
                </div>
            </div>
        </div>
    );
}
