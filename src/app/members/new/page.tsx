'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';

export default function NewMemberPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<any>({
        role: '일반',
        status: '현재회원',
        activityStatus: '신입',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formData.nickname || !formData.realName) {
            alert('닉네임과 실제이름은 필수 항목입니다.');
            return;
        }

        try {
            setSaving(true);
            const res = await fetch('/api/members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert('신규 회원이 성공적으로 등록되었습니다.');
                router.push('/members');
                router.refresh();
            } else {
                alert('등록에 실패했습니다.');
            }
        } catch (error) {
            console.error(error);
            alert('오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft size={16} /> 회원 목록으로 돌아가기
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50"
                >
                    <Save size={16} /> {saving ? '등록하는 중...' : '신규 회원 등록'}
                </button>
            </div>

            <div className="glass-panel p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/40 flex flex-shrink-0 items-center justify-center text-blue-500 dark:text-blue-400">
                        <UserPlus size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">신규 회원 등록</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">소모임에 새로 가입한 회원의 정보를 입력합니다.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">필수 정보</h3>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">닉네임 <span className="text-red-500">*</span></label>
                            <input name="nickname" value={formData.nickname || ''} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" placeholder="예: 무지개" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">실제 이름 <span className="text-red-500">*</span></label>
                            <input name="realName" value={formData.realName || ''} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" placeholder="예: 홍길동" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">역할 설정</label>
                            <select name="role" value={formData.role || '일반'} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                                <option value="모임장">모임장</option>
                                <option value="운영진">운영진</option>
                                <option value="일반">일반</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">초기 활동 상태</label>
                            <select name="activityStatus" value={formData.activityStatus || '신입'} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                                <option value="신입">신입 (기본값)</option>
                                <option value="활성">활성</option>
                                <option value="비활성">비활성</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">선택 정보 (가입인사)</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">사는 곳</label>
                                <input name="location" value={formData.location || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" placeholder="예: 서초구" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">나이</label>
                                <input name="age" value={formData.age || ''} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" placeholder="예: 95년생" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">관심/공부 내용</label>
                                <input name="studyContent" value={formData.studyContent || ''} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" placeholder="예: 자격증, 토익" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">가능 요일</label>
                                <input name="studyDays" value={formData.studyDays || ''} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm placeholder:text-slate-400" placeholder="예: 수, 일" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
