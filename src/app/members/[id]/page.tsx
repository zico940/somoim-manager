'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Trash2, UserCircle } from 'lucide-react';

export default function MemberDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [member, setMember] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        async function fetchMember() {
            try {
                const res = await fetch(`/api/members/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setMember(data.member);
                    setFormData(data.member);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchMember();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await fetch(`/api/members/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                alert('저장되었습니다.');
                router.refresh();
            } else {
                alert('저장에 실패했습니다.');
            }
        } catch (error) {
            console.error(error);
            alert('오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('정말 이 회원을 탈퇴 처리하시겠습니까?')) return;
        try {
            const res = await fetch(`/api/members/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                alert('탈퇴 처리되었습니다.');
                router.push('/members');
            }
        } catch (error) {
            console.error(error);
            alert('오류가 발생했습니다.');
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-slate-500">데이터를 불러오는 중입니다...</div>;
    }

    if (!member) {
        return <div className="text-center py-20">회원을 찾을 수 없습니다.</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft size={16} /> 회원 목록으로 돌아가기
                </button>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleDelete}
                        className="btn-danger w-full sm:w-auto flex items-center justify-center gap-2 text-sm bg-red-500 hover:bg-red-600 shadow-sm"
                    >
                        <Trash2 size={16} /> 탈퇴 처리
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50"
                    >
                        <Save size={16} /> {saving ? '저장 중...' : '변경사항 저장'}
                    </button>
                </div>
            </div>

            <div className="glass-panel p-6 sm:p-8">
                <div className="flex items-start gap-6 mb-8 border-b border-slate-100 dark:border-slate-800 pb-8">
                    <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex flex-shrink-0 items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <UserCircle size={48} />
                    </div>
                    <div className="flex-1 mt-1">
                        <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
                            {member.nickname}
                            <span className="text-lg font-normal text-slate-500 dark:text-slate-400">({member.realName})</span>
                        </h1>
                        <div className="flex flex-wrap gap-2 mt-3 text-sm">
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
                                가입일: {member.joinDate || '-'}
                            </span>
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
                                작성 게시글 수: <strong className="ml-1 text-blue-600 dark:text-blue-400">{member.articleCount || 0}</strong>개
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">기본 상태 설정</h3>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">역할 설정</label>
                            <select name="role" value={formData.role || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200">
                                <option value="모임장">👑 모임장</option>
                                <option value="운영진">🛡️ 운영진</option>
                                <option value="일반">👤 일반 회원</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">회원 상태</label>
                            <select name="status" value={formData.status || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200">
                                <option value="현재회원">✅ 현재 회원</option>
                                <option value="탈퇴회원">❌ 탈퇴 회원</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">참여/활동 상태</label>
                            <select name="activityStatus" value={formData.activityStatus || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200">
                                <option value="신입">🌱 신입</option>
                                <option value="활성">🔥 활성</option>
                                <option value="보통">☀️ 보통</option>
                                <option value="비활성">💤 비활성</option>
                                <option value="탈퇴">💀 탈퇴</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">가입인사 추출 정보</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">나이</label>
                                <input name="age" value={formData.age || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">성별</label>
                                <input name="gender" value={formData.gender || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">지역 / 사는 곳</label>
                                <input name="location" value={formData.location || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">스터디/공부 내용</label>
                                <input name="studyContent" value={formData.studyContent || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">참여 가능 요일</label>
                                <input name="studyDays" value={formData.studyDays || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm placeholder:text-slate-300" placeholder="예: 평일, 주말, 수/금" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">운영진 비공개 메모</label>
                    <textarea
                        name="memo"
                        value={formData.memo || ''}
                        onChange={handleChange}
                        rows={4}
                        placeholder="회원 관리에 필요한 특이사항이나 오프라인 참석 내역 등을 자유롭게 작성하세요. (회원에겐 보이지 않습니다)"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-indigo-900/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 resize-none"
                    ></textarea>
                </div>
            </div>
        </div>
    );
}
