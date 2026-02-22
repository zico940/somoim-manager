import { NextResponse } from 'next/server';
import { getGoogleSheet } from '@/lib/sheets';

export async function GET() {
    try {
        const rows = await getGoogleSheet('회원목록', 'A:T');

        if (!rows || rows.length <= 1) {
            return new NextResponse('데이터가 없습니다', { status: 404 });
        }

        // Convert rows to CSV
        const csvContent = rows.map((row: any[]) =>
            row.map((cell: any) => {
                const str = String(cell || '').replace(/"/g, '""');
                return `"${str}"`;
            }).join(',')
        ).join('\n');

        const encoder = new TextEncoder();
        // Excel에서 한글 깨짐 방지를 위한 UTF-8 BOM 추가
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);

        return new NextResponse(
            new Blob([bom, encoder.encode(csvContent)], { type: 'text/csv;charset=utf-8;' }),
            {
                headers: {
                    'Content-Disposition': `attachment; filename="somoim_members_${new Date().toISOString().slice(0, 10)}.csv"`,
                    'Content-Type': 'text/csv; charset=utf-8',
                }
            }
        );
    } catch (error) {
        console.error('CSV Export Error:', error);
        return new NextResponse('파일 생성 실패', { status: 500 });
    }
}
