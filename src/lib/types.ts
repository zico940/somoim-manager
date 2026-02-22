export enum Role {
    MANAGER = '모임장',
    ADMIN = '운영진',
    MEMBER = '일반',
}

export enum ActivityStatus {
    NEW = '신입',
    ACTIVE = '활성',
    NORMAL = '보통',
    INACTIVE = '비활성',
    LEFT = '탈퇴',
}

export enum MemberStatus {
    CURRENT = '현재회원',
    LEFT = '탈퇴회원',
}

export interface Member {
    id: string; // 고유 ID (UUID)
    nickname: string;
    realName: string;
    role: Role | string;
    status: MemberStatus | string;
    activityStatus: ActivityStatus | string;
    joinDate: string; // YYYY-MM-DD
    lastVisit: string; // YYYY-MM-DD
    leaveDate?: string;
    age?: string;
    gender?: string;
    location?: string;
    workplace?: string;
    studyArea?: string;
    studyContent?: string;
    studyDays?: string;
    articleCount: number;
    introText?: string;
    introDate?: string;
    memo?: string;
}

export interface ActivityLog {
    id: string;
    memberId: string;
    action: string;
    detail: string;
    timestamp: string; // ISO date string
    operatorId: string; // 처리한 운영진 ID 또는 'System'
}

export interface Statistics {
    date: string;
    totalMembers: number;
    activeMembers: number;
    leftMembers: number;
    newJoins: number;
    newLeaves: number;
    statsJson: string; // region_stats, study_stats, day_stats 등 포함 JSON 맵 문자열
}
