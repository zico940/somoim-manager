# System_DOCUMENTATION.md

## 프로젝트 개요
Vercel 배포 테스트 및 게임 광고 랜딩 페이지 구현 프로젝트입니다.

## 기술 스택
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Deployment**: Vercel

## 구현 기능
1. **프리미엄 게임 광고 랜딩 페이지**: "Crystal Nebula: Rebirth"라는 가상의 SF 판타지 게임을 테마로 한 화려한 페이지.
2. **시네마틱 배경**: 네뷸라 그라데이션, 스캔라인 그리드 효과, 부드러운 애니메이션 적용.
3. **인터랙티브 요소**: 버튼 호버 애니메이션, 글래스모피즘(Glassmorphism) 네비게이션 및 카드 레이아웃.
4. **반응형 디자인**: 모바일 및 데스크탑 환경에 최적화된 레이아웃.

## 프로젝트 구조
- `src/app/page.tsx`: 게임 광고 랜딩 페이지 컴포넌트
- `src/app/globals.css`: 전역 스타일 및 프리미엄 애니메이션 정의
- `public/`: 정적 애셋

## 배포 및 실행 방법
- **로컬 실행**: `npm run dev` 후 [http://localhost:3000](http://localhost:3000) 접속.
- **빌드**: `npm run build`를 통해 프로덕션 빌드 생성.
- **배포**: Vercel CLI (`npx vercel`) 또는 GitHub 연동.

## 수정 내역 (2026-02-22)
- [Add] `npx create-next-app`을 통한 프로젝트 초기화
- [Modify] `src/app/page.tsx`: Vercel 기본 페이지에서 게임 광고 랜딩 페이지로 테마 변경
- [Modify] `src/app/globals.css`: Tailwind 4 설정 및 사용자 정의 애니메이션/변수 추가
- [Update] `System_DOCUMENTATION.md`: 게임 광고 페이지 테마에 맞춰 문서 업데이트
