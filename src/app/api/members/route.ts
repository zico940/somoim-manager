import { NextResponse } from 'next/server';
import { getGoogleSheet, appendRow } from '@/lib/sheets';
import { Member } from '@/lib/types';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const activityStatus = searchParams.get('activityStatus');
        const role = searchParams.get('role');
        const status = searchParams.get('status');

        // 요청 상태가 탈퇴회원인 경우 탈퇴회원 시트에서 조회, 아니면 회원목록 시트에서 조회
        const sheetName = status === '탈퇴회원' ? '탈퇴회원' : '회원목록';
        const rows = await getGoogleSheet(sheetName, 'A:T');

        if (!rows || rows.length <= 1) {
            return NextResponse.json({ members: [] });
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
        })).filter(member => member.id !== ''); // ID가 있는 유효한 행만

        // 필터링 적용
        let filteredMembers = members;
        if (activityStatus) {
            filteredMembers = filteredMembers.filter(m => m.activityStatus === activityStatus);
        }
        if (role) {
            filteredMembers = filteredMembers.filter(m => m.role === role);
        }
        if (status) {
            filteredMembers = filteredMembers.filter(m => m.status === status);
        }

        return NextResponse.json({ members: filteredMembers });
    } catch (error) {
        console.error('Failed to fetch members:', error);
        return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body: Partial<Member> = await request.json();

        const id = crypto.randomUUID();
        const newRow = [
            id,
            body.nickname || '',
            body.realName || '',
            body.role || '일반',
            body.status || '현재회원',
            body.activityStatus || '신입',
            body.joinDate || new Date().toISOString().split('T')[0],
            body.lastVisit || new Date().toISOString().split('T')[0],
            body.leaveDate || '',
            body.age || '',
            body.gender || '',
            body.location || '',
            body.workplace || '',
            body.studyArea || '',
            body.studyContent || '',
            body.studyDays || '',
            body.articleCount?.toString() || '0',
            body.introText || '',
            body.introDate || '',
            body.memo || ''
        ];

        await appendRow('회원목록', 'A:T', newRow);

        // 활동 로그 남기기
        const logId = crypto.randomUUID();
        const logRow = [
            logId,
            id,
            '가입',
            `신규 회원 ${body.nickname} 등록`,
            new Date().toISOString(),
            'System'
        ];
        await appendRow('활동로그', 'A:F', logRow);

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Failed to create member:', error);
        return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
    }
}
