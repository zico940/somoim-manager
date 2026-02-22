import { NextResponse } from 'next/server';
import { getGoogleSheet } from '@/lib/sheets';
import { ActivityLog } from '@/lib/types';

export async function GET(request: Request) {
    try {
        const rows = await getGoogleSheet('활동로그', 'A:F');

        if (!rows || rows.length <= 1) {
            return NextResponse.json({ logs: [] });
        }

        const logs: ActivityLog[] = rows.slice(1).map((row) => ({
            id: row[0] || '',
            memberId: row[1] || '',
            action: row[2] || '',
            detail: row[3] || '',
            timestamp: row[4] || '',
            operatorId: row[5] || '',
        })).filter(log => log.id !== '');

        // 최신순 (내림차순) 정렬
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return NextResponse.json({ logs });
    } catch (error) {
        console.error('Failed to fetch logs:', error);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}
