import { NextResponse } from 'next/server';
import { getGoogleSheet, appendRows, batchUpdateValues, deleteRow, getSheetId } from '@/lib/sheets';
import crypto from 'crypto';

const BASE_URL = "https://www.somoim.co.kr";
const GROUP_ID = "8dff15ba-068f-11ed-bc18-0a783e9b60271";

const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": `${BASE_URL}/`,
};

function tsToDateStr(ts: number) {
    if (!ts) return "";
    const realTs = ts < 1000000000 ? ts + 1000000000 : ts;
    return new Date(realTs * 1000).toISOString().split('T')[0];
}

function getActivityStatus(joinTs: number, visitTs: number) {
    const SEVEN_DAYS = 7 * 86400;
    const THIRTY_DAYS = 30 * 86400;
    const nowTs = Math.floor(Date.now() / 1000);

    const lJoin = joinTs ? (joinTs < 1000000000 ? joinTs + 1000000000 : joinTs) : 0;
    const lVisit = visitTs ? (visitTs < 1000000000 ? visitTs + 1000000000 : visitTs) : 0;

    const joinAge = lJoin ? nowTs - lJoin : Infinity;
    const lastActive = lVisit ? nowTs - lVisit : Infinity;

    if (joinAge <= SEVEN_DAYS) return "신입";
    if (lastActive <= SEVEN_DAYS) return "활성";
    if (lastActive <= THIRTY_DAYS) return "보통";
    return "비활성";
}

function tryParseIntro(text: string) {
    if (!text) return {};
    const info: any = {};
    const FIELD_KEYWORDS = ["이름", "나이", "성별", "사는", "근무지", "공부", "요일"];
    const patterns: Record<string, RegExp> = {
        "실제이름": /이름\s*[:：][^\S\n]*([^\n]+)/,
        "나이": /나이\s*[:：][^\S\n]*([^\n]+)/,
        "성별": /성별\s*[:：][^\S\n]*([^\n]+)/,
        "사는곳": /사는\s*곳\s*[:：][^\S\n]*([^\n]+)/,
        "근무지": /근무지\s*[:：=][^\S\n]*([^\n]+)/,
        "공부지역": /공부.*지역\s*[:：][^\S\n]*([^\n]+)/,
        "공부내용": /공부\s*내용\s*[:：][^\S\n]*([^\n]+)/,
    };

    for (const [key, pat] of Object.entries(patterns)) {
        const m = text.match(pat);
        if (m && m[1]) {
            let val = m[1].trim();
            if (val) {
                let isInvalid = false;
                for (const kw of FIELD_KEYWORDS) {
                    if (val.includes(kw) && !pat.source.includes(kw)) {
                        isInvalid = true; break;
                    }
                }
                if (!isInvalid) info[key] = val;
            }
        }
    }

    const lines = text.split('\n');
    let studyDays = '';
    for (let i = 0; i < lines.length; i++) {
        if (/공부\s*(?:가능)?\s*요일/i.test(lines[i])) {
            const m = lines[i].match(/[:：]\s*(.+)/);
            if (m && m[1]) {
                const val = m[1].trim();
                if (val && !/\(?\s*ex\s*:/.test(val) && !val.includes("해당 요일")) {
                    studyDays = val;
                    break;
                }
            }
            if (i + 1 < lines.length) {
                const nl = lines[i + 1].trim();
                if (nl && !nl.startsWith("ㅡ") && !nl.startsWith("-") && nl.length < 50) {
                    studyDays = nl;
                    break;
                }
            }
        }
    }
    if (studyDays) info["공부가능요일"] = studyDays;

    return info;
}

function extractMembersFromHtml(html: string) {
    try {
        const marker = '\\"members\\"';
        let membersPos = html.indexOf(marker);
        if (membersPos === -1) {
            const marker2 = '"members":';
            membersPos = html.indexOf(marker2);
            if (membersPos === -1) return null;

            const ndMarker = '<script id="__NEXT_DATA__" type="application/json">';
            const ndStart = html.indexOf(ndMarker);
            if (ndStart !== -1) {
                const ndEnd = html.indexOf('</script>', ndStart);
                const jsonStr = html.substring(ndStart + ndMarker.length, ndEnd);
                return JSON.parse(jsonStr);
            }
            return null;
        }

        const pushMarker = 'self.__next_f.push([1,"';
        const blockStart = html.lastIndexOf(pushMarker, membersPos);
        if (blockStart === -1) return null;

        const strStart = blockStart + pushMarker.length;
        let idx = strStart;
        while (idx < html.length) {
            const c = html[idx];
            if (c === '\\') idx += 2;
            else if (c === '"') break;
            else idx += 1;
        }

        const extractedStr = '"' + html.substring(strStart, idx) + '"';
        const parsedStr = JSON.parse(extractedStr);

        const mIdx = parsedStr.indexOf('"members":');
        if (mIdx === -1) return null;

        const bracketStart = parsedStr.indexOf('[', mIdx);
        const membersMatch = parsedStr.substring(bracketStart).match(/\[\{.*?\}\]/);
        if (membersMatch) return JSON.parse(membersMatch[0]);

        return null;
    } catch (error) {
        return null;
    }
}

async function fetchSomoimLive() {
    const urls = [
        `${BASE_URL}/${GROUP_ID}`,
        `${BASE_URL}/group/${GROUP_ID}`,
    ];

    for (const url of urls) {
        try {
            const res = await fetch(url, { headers: HEADERS });
            if (res.ok) {
                const html = await res.text();
                const data = extractMembersFromHtml(html);
                if (data && Array.isArray(data)) return data;

                if (data && data.props) {
                    let foundMembers: any[] | null = null;
                    JSON.stringify(data, (key, value) => {
                        if (key === 'members' && Array.isArray(value)) foundMembers = value;
                        return value;
                    });
                    if (foundMembers) return foundMembers;
                }
            }
        } catch (e) {
            console.warn(`[API] Failed HTML fetch for ${url}:`, e);
        }
    }

    const apiUrls = [
        { url: `${BASE_URL}/api/groups/${GROUP_ID}`, method: "GET" },
    ];

    for (const api of apiUrls) {
        try {
            const res = await fetch(api.url, {
                method: api.method,
                headers: { ...HEADERS, "Content-Type": "application/json" },
            });
            if (res.ok) {
                const data = await res.json();
                if (data && data.members) return data.members;
                if (Array.isArray(data)) return data;
            }
        } catch (e) { }
    }

    return null;
}

async function fetchAllArticles() {
    const allArticles: any[] = [];
    let s_t = null;

    // 최대 30페이지 한계 (약 1500개 게시글) - 구글 시트 쓰기 및 서버 Timeout 고려
    for (let page = 0; page < 30; page++) {
        const payload: any = { gid: GROUP_ID, wql: 50 };
        if (s_t) payload.s_t = s_t;

        try {
            const res = await fetch(`${BASE_URL}/api/articles`, {
                method: "POST",
                headers: { ...HEADERS, "Content-Type": "application/json", "Origin": BASE_URL },
                body: JSON.stringify(payload)
            });
            if (!res.ok) break;

            const data = await res.json();
            const cs = data.cs || [];
            if (cs.length === 0) break;

            allArticles.push(...cs);

            if (data.eof === "Y") break;
            const new_s_t = data.s_t || (cs[cs.length - 1]?.ot);
            if (!new_s_t || new_s_t === s_t) break;
            s_t = new_s_t;
        } catch (e) {
            break;
        }
    }
    return allArticles;
}

export async function POST(request: Request) {
    try {
        // 1. 소모임 데이터 확보
        const membersRaw = await fetchSomoimLive();
        if (!membersRaw || !Array.isArray(membersRaw)) {
            return NextResponse.json({ success: false, error: '소모임 서버에서 데이터를 가져올 수 없습니다.' }, { status: 500 });
        }

        const articlesRaw = await fetchAllArticles();

        // 2. 가입인사 파싱 및 게시물 수 집계
        const introsByWid: Record<string, any> = {};
        const articleCountByWid: Record<string, number> = {};
        const TITLE_KEYS = ["가입", "인사", "안녕", "반가", "소개"];

        for (const art of articlesRaw) {
            const wid = art.wid;
            if (wid) articleCountByWid[wid] = (articleCountByWid[wid] || 0) + 1;

            if (!wid || introsByWid[wid]) continue;

            const text = `${art.at || ''}\n${art.c || ''}`;
            let count = 0;
            const INTRO_KEYS = [/이름\s*[:：]/, /나이\s*[:：]/, /성별\s*[:：]/, /사는\s*곳\s*[:：]/, /근무지\s*[:：=]/, /공부.*지역\s*[:：]/, /공부\s*내용\s*[:：]/];
            for (const re of INTRO_KEYS) {
                if (re.test(text)) count++;
            }

            const titleOk = TITLE_KEYS.some(k => art.at && String(art.at).includes(k));
            if (count >= 1 || titleOk || art.cat === "J") {
                const parsed = tryParseIntro(text);
                parsed["원문"] = text.slice(0, 500);
                parsed["작성일"] = art.ot ? tsToDateStr(Number(art.ot)) : "";
                introsByWid[wid] = parsed;
            }
        }

        // 3. 구글 시트 기존 데이터 로드 (매칭용)
        const sheetRows = await getGoogleSheet('회원목록', 'A:T');
        const withdrawSheetRows = await getGoogleSheet('탈퇴회원', 'A:T');

        // Nickname 기준 Index 저장
        const existIdxByNick: Record<string, number> = {};
        for (let i = 1; i < sheetRows.length; i++) {
            const nickname = sheetRows[i][1]; // B열
            if (nickname) existIdxByNick[nickname] = i + 1; // 1-based Header -> 2-based row
        }

        const existWithdrawIdxByNick: Record<string, boolean> = {};
        for (let i = 1; i < withdrawSheetRows.length; i++) {
            const nickname = withdrawSheetRows[i][1]; // B열
            if (nickname) existWithdrawIdxByNick[nickname] = true;
        }

        // 4. 추출된 데이터를 바탕으로 회원 정보 구성
        const newMemberRows: any[][] = [];
        const newLogRows: any[][] = [];
        const updateDataTasks: { range: string, values: any[][] }[] = [];
        let withdrawDataTasks: any[][] = [];
        let deleteRowTasks: number[] = [];

        const addedMembersDetail: string[] = [];
        let updatedCount = 0;

        for (const m of membersRaw) {
            if (!m.mn) continue;

            const mid = m.mid || "";
            const isBanned = (m.ban === 'Y');

            const nickname = m.mn;
            const role = m.i_m === 'Y' ? '운영진' : '일반';

            const intro = introsByWid[mid] || {};
            const realName = intro["실제이름"] || nickname;

            const jt = parseInt(m.j_t || 0);
            const vt = parseInt(m.v_t || 0);

            const status = isBanned ? '탈퇴회원' : '현재회원';
            const activityStatus = isBanned ? '탈퇴' : getActivityStatus(jt, vt);

            const rowData = [
                crypto.randomUUID(), // 나중에 갱신될 수 있으니 id는 그대로 두거나 새로 생성
                nickname,                 // B
                realName,                 // C
                role,                     // D
                status,                   // E
                activityStatus,           // F
                tsToDateStr(jt),          // G 가입일
                tsToDateStr(vt),          // H 최근접속
                isBanned ? new Date().toISOString().split('T')[0] : "", // I 탈퇴일
                intro["나이"] || "",        // J
                intro["성별"] || "",        // K
                intro["사는곳"] || "",      // L
                intro["근무지"] || "",      // M
                intro["공부지역"] || "",    // N
                intro["공부내용"] || "",    // O
                intro["공부가능요일"] || "",// P
                String(articleCountByWid[mid] || 0), // Q
                intro["원문"] || "",        // R
                intro["작성일"] || "",      // S
                ""                        // T 메모 (기존 유지용)
            ];

            const existRowIdx = existIdxByNick[nickname];
            const existWithdraw = existWithdrawIdxByNick[nickname];

            if (existRowIdx) {
                if (isBanned) {
                    // 강제 동기화 중 기존 회원이 밴 처리(탈퇴)된 것을 발견한 경우
                    // 1. 추가될 데이터 기록
                    const oldRow = sheetRows[existRowIdx - 1];
                    rowData[0] = oldRow[0]; // 기존 ID 복구
                    rowData[19] = oldRow[19] || ""; // 메모 복구

                    // 탈퇴회원 시트에 추가하기 위해 모아둠
                    if (!withdrawDataTasks) withdrawDataTasks = [];
                    withdrawDataTasks.push(rowData);

                    // 삭제 대상 index 기록 (추후 정렬해서 삭제해야 인덱스 꼬임 방지)
                    if (!deleteRowTasks) deleteRowTasks = [];
                    deleteRowTasks.push(existRowIdx - 1);
                    updatedCount++;

                    newLogRows.push([
                        crypto.randomUUID(),
                        rowData[0],
                        '탈퇴(동기화)',
                        `동기화 중 탈퇴 감지: [${nickname}] 탈퇴 처리 및 데이터 이동`,
                        new Date().toISOString(),
                        'System'
                    ]);
                } else {
                    // 이미 시트에 존재하면 업데이트 (메모, ID 등 유지해야 하므로 부분 갱신)
                    const origId = sheetRows[existRowIdx - 1][0];
                    const origMemo = sheetRows[existRowIdx - 1][19] || "";
                    rowData[0] = origId;
                    rowData[19] = origMemo;

                    // 갱신 여부를 판별 (모든 값을 씌우기)
                    updateDataTasks.push({
                        range: `회원목록!A${existRowIdx}:T${existRowIdx}`,
                        values: [rowData]
                    });
                    updatedCount++;
                }
            } else {
                if (isBanned) {
                    // 새로 들어온 데이터 중 밴 처리된 사람인데, 회원목록에 없던 사람일 경우
                    if (!existWithdraw) {
                        // 기존 탈퇴회원 시트에도 없는 사람이라면 신규 탈퇴 등록
                        if (!withdrawDataTasks) withdrawDataTasks = [];
                        withdrawDataTasks.push(rowData);
                        addedMembersDetail.push(`${nickname} (탈퇴)`);

                        newLogRows.push([
                            crypto.randomUUID(),
                            rowData[0],
                            '탈퇴회원연동',
                            `소모임 앱 연동: [${nickname}] 동기화 시 신규 탈퇴회원으로 정보 수집`,
                            new Date().toISOString(),
                            'System'
                        ]);
                    }
                    continue; // 일반 신규회원(현재회원) 등록에서는 제외
                }

                // 신규 회원 (현재 회원)
                newMemberRows.push(rowData);
                addedMembersDetail.push(nickname);

                newLogRows.push([
                    crypto.randomUUID(),
                    rowData[0],
                    '초기동기화',
                    `소모임 앱 연동: [${nickname}] 신규/데이터 동기화`,
                    new Date().toISOString(),
                    'System'
                ]);
            }
        }

        // 5. 구글 시트 적용 (Batch Update & Append)
        if (updateDataTasks.length > 0) {
            // 구글 시트 batchUpdate 최대 제한을 피하기 위해 청크단위 요청 진행 (혹시 너무 많을 시)
            const CHUNK_SIZE = 100;
            for (let i = 0; i < updateDataTasks.length; i += CHUNK_SIZE) {
                const chunk = updateDataTasks.slice(i, i + CHUNK_SIZE);
                await batchUpdateValues(chunk).catch(e => console.error("Batch update error:", e));
            }
        }

        if (withdrawDataTasks.length > 0) {
            // 탈퇴 시트에 데이터 추가
            await appendRows('탈퇴회원', 'A:T', withdrawDataTasks);

            // 회원목록 시트에서 원본 삭제
            const sheetId = await getSheetId('회원목록');
            if (sheetId !== undefined) {
                // 삭제는 역순으로 진행해야 인덱스가 꼬이지 않음
                const sortedDeleteTasks = [...deleteRowTasks].sort((a, b) => b - a);
                for (const rowIndex of sortedDeleteTasks) {
                    await deleteRow(sheetId, rowIndex);
                }
            }
        }

        if (newMemberRows.length > 0) {
            await appendRows('회원목록', 'A:T', newMemberRows);
            await appendRows('활동로그', 'A:F', newLogRows);
        }

        return NextResponse.json({
            success: true,
            addedCount: newMemberRows.length,
            updatedCount: updatedCount,
            addedMembers: addedMembersDetail,
            totalSomoimMembers: membersRaw.length
        });

    } catch (error) {
        console.error('Sync Error:', error);
        return NextResponse.json({ success: false, error: '동기화 중 서버 오류 발생' }, { status: 500 });
    }
}
