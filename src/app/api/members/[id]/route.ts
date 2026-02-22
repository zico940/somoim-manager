import { NextResponse } from 'next/server';
import { getGoogleSheet, updateRow, appendRow, deleteRow, getSheetId } from '@/lib/sheets';
import { Member } from '@/lib/types';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const rows = await getGoogleSheet('회원목록', 'A:T');

        if (!rows || rows.length <= 1) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const { id } = await params;
        const rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === id);
        if (rowIndex === -1) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        const row = rows[rowIndex];
        const member: Member = {
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
        };

        return NextResponse.json({ member });
    } catch (error) {
        console.error('Failed to fetch member:', error);
        return NextResponse.json({ error: 'Failed to fetch member' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body: Partial<Member> = await request.json();

        const rows = await getGoogleSheet('회원목록', 'A:T');
        const rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === id);

        if (rowIndex === -1) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        const oldRow = rows[rowIndex];

        const newRow = [
            id,
            body.nickname ?? oldRow[1],
            body.realName ?? oldRow[2],
            body.role ?? oldRow[3],
            body.status ?? oldRow[4],
            body.activityStatus ?? oldRow[5],
            body.joinDate ?? oldRow[6],
            body.lastVisit ?? oldRow[7],
            body.leaveDate ?? oldRow[8] ?? '',
            body.age ?? oldRow[9] ?? '',
            body.gender ?? oldRow[10] ?? '',
            body.location ?? oldRow[11] ?? '',
            body.workplace ?? oldRow[12] ?? '',
            body.studyArea ?? oldRow[13] ?? '',
            body.studyContent ?? oldRow[14] ?? '',
            body.studyDays ?? oldRow[15] ?? '',
            body.articleCount?.toString() ?? oldRow[16] ?? '0',
            body.introText ?? oldRow[17] ?? '',
            body.introDate ?? oldRow[18] ?? '',
            body.memo ?? oldRow[19] ?? ''
        ];

        await updateRow('회원목록', `A${rowIndex + 1}:T${rowIndex + 1}`, newRow);

        // 로그 남기기
        const logId = crypto.randomUUID();
        const action = '정보 수정';
        const detail = Object.keys(body).filter(k => k !== 'id').join(', ') + ' 변경됨';
        const logRow = [
            logId,
            id,
            action,
            detail,
            new Date().toISOString(),
            'System'
        ];
        await appendRow('활동로그', 'A:F', logRow);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update member:', error);
        return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const rows = await getGoogleSheet('회원목록', 'A:T');
        const rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === id);

        if (rowIndex === -1) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        // "탈퇴회원" 시트로 완전히 이동 처리
        const oldRow = rows[rowIndex];
        const newRow = [...oldRow];
        newRow[4] = '탈퇴회원'; // status
        newRow[5] = '탈퇴'; // activityStatus
        newRow[8] = new Date().toISOString().split('T')[0]; // leaveDate

        // 1. 탈퇴회원 시트에 추가
        await appendRow('탈퇴회원', 'A:T', newRow);

        // 2. 회원목록 시트에서 원본 완전히 삭제
        const sheetId = await getSheetId('회원목록');
        if (sheetId !== undefined) {
            await deleteRow(sheetId, rowIndex);
        }

        // 활동 로그 남기기
        const logId = crypto.randomUUID();
        const logRow = [
            logId,
            id,
            '탈퇴',
            '회원 탈퇴 처리',
            new Date().toISOString(),
            'System'
        ];
        await appendRow('활동로그', 'A:F', logRow);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete member:', error);
        return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
    }
}
