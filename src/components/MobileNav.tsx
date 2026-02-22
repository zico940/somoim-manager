'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, BarChart2, FileText } from 'lucide-react';

export default function MobileNav() {
    const pathname = usePathname();

    const links = [
        { name: '대시보드', href: '/', icon: Home },
        { name: '회원관리', href: '/members', icon: Users },
        { name: '통계', href: '/statistics', icon: BarChart2 },
        { name: '로그', href: '/logs', icon: FileText },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]">
            <nav className="flex items-center justify-around px-2 py-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex flex-col items-center justify-center w-16 h-12 gap-1 rounded-xl transition-all ${isActive
                                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                        >
                            <div className={`${isActive ? 'bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-full' : 'p-1.5'}`}>
                                <Icon size={20} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'} />
                            </div>
                            <span className="text-[10px] leading-none">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
