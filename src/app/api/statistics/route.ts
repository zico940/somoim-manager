import { NextResponse } from 'next/server';
import { getGoogleSheet } from '@/lib/sheets';
import { Member } from '@/lib/types';

export async function GET(request: Request) {
    try {
        const rows = await getGoogleSheet('회원목록', 'A:T');

        if (!rows || rows.length <= 1) {
            return NextResponse.json({ error: 'No data' }, { status: 404 });
        }

        const members: Member[] = rows.slice(1).map((row) => ({
            id: row[0] || '',
            nickname: row[1] || '',
            realName: row[2] || '',
            role: row[3] || '',
            status: row[4] || '',
            activityStatus: row[5] || '',
            joinDate: row[6] || '',
            lastVisit: row[7] || '',
            leaveDate: row[8] || '',
            age: row[9] || '',
            gender: row[10] || '',
            location: row[11] || '',
            workplace: row[12] || '',
            studyArea: row[13] || '',
            studyContent: row[14] || '',
            studyDays: row[15] || '',
            articleCount: Number(row[16]) || 0,
            introText: row[17] || '',
            introDate: row[18] || '',
            memo: row[19] || '',
        })).filter(member => member.id !== '');

        const activeMembers = members.filter(m => m.status === '현재회원');
        const leftMembers = members.filter(m => m.status === '탈퇴회원');

        const activityStats = {
            '신입': 0, '활성': 0, '보통': 0, '비활성': 0, '탈퇴': 0
        };
        const regionStats: Record<string, number> = {};
        const studyStats: Record<string, number> = {};
        const monthlyJoins: Record<string, number> = {};
        const dayStats = { "월": 0, "화": 0, "수": 0, "목": 0, "금": 0, "토": 0, "일": 0, "매일": 0, "기타": 0 };

        for (const m of activeMembers) {
            if (activityStats[m.activityStatus as keyof typeof activityStats] !== undefined) {
                activityStats[m.activityStatus as keyof typeof activityStats]++;
            }

            // Region
            if (m.location) {
                const locKey = m.location.split(' ')[0];
                regionStats[locKey] = (regionStats[locKey] || 0) + 1;
            }

            // Study
            if (m.studyContent) {
                const studies = m.studyContent.split(/[,/&]/);
                for (let s of studies) {
                    s = s.trim();
                    if (s) {
                        studyStats[s] = (studyStats[s] || 0) + 1;
                    }
                }
            }

            // Monthly joins
            if (m.joinDate && m.joinDate.length >= 7) {
                const monthKey = m.joinDate.substring(0, 7);
                monthlyJoins[monthKey] = (monthlyJoins[monthKey] || 0) + 1;
            }

            // Days
            const daysStr = m.studyDays || '';
            let matched = false;
            const week = ['월', '화', '수', '목', '금', '토', '일'];
            for (const d of week) {
                if (daysStr.includes(d)) {
                    dayStats[d as keyof typeof dayStats]++;
                    matched = true;
                }
            }
            if (daysStr.includes('매일') || daysStr.includes('매')) {
                dayStats['매일']++;
                matched = true;
            }
            if (daysStr.includes('평일')) {
                ['월', '화', '수', '목', '금'].forEach(d => dayStats[d as keyof typeof dayStats]++);
                matched = true;
            }
            if (daysStr.includes('주말')) {
                ['토', '일'].forEach(d => dayStats[d as keyof typeof dayStats]++);
                matched = true;
            }
            if (!matched && daysStr) {
                dayStats['기타']++;
            }
        }

        const stats = {
            total: members.length,
            current: activeMembers.length,
            left: leftMembers.length,
            activityStats,
            regionStats,
            studyStats,
            monthlyJoins,
            dayStats,
        };

        return NextResponse.json({ stats });
    } catch (error) {
        console.error('Failed to fetch statistics:', error);
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
}
