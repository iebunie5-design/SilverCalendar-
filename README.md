# 👵 실버 캘린더 (SilverCalendar)

**"복잡한 단계 제거, 음성이 우선, 결과는 큰 글씨로"**  
시니어를 위한 AI 기반 구글 캘린더 음성 등록 및 관리 비서 프로젝트입니다.

---

## 🌟 프로젝트 비전 (Design Philosophy)
- **왕눈이 원칙**: 모든 텍스트는 최소 22px 이상, 버튼은 최소 70px 높이를 유지합니다.
- **제로 타이핑**: 키보드 입력 없이 오직 목소리와 클릭만으로 일정을 관리합니다.
- **심리적 안정**: 모든 처리 과정(듣기, 분석, 저장)을 거대한 화면 오버레이로 투명하게 보여주어 사용자가 불안해하지 않도록 합니다.

---

## 🛠 기술 스택
- **Framework**: Next.js 14 (App Router)
- **Auth**: NextAuth.js (Google OAuth 2.0)
- **AI/LLM**: OpenAI GPT-4o-mini (일정 추출 및 분석)
- **API**: Google Calendar API v3
- **State**: React Hooks (useState, useEffect, useCallback)
- **Icons**: Lucide-React

---

## 🚀 상세 개발 순서 (Development Sequence)

### 1단계: 시니어 전용 디자인 시스템 구축
- **Global CSS 설정**: 시각이 흐릿한 사용자를 위해 고대비 색상과 거대한 텍스트 시스템(Base: 22px)을 구축했습니다.
- **레이아웃 설계**: 복잡한 메뉴를 제거하고 화면 중앙에 큰 액션 버튼(음성, 사진) 위주로 배치했습니다.

### 2단계: 구글 인증 및 권한 시스템 통합
- **NextAuth 연동**: 구글 아이디로 원클릭 로그인을 구현했습니다.
- **캘린더 스코프(Scopes) 설정**: 단순히 로그인만 하는 것이 아니라, 캘린더에 일정을 쓰고 읽을 수 있는 권한(`calendar.events`)을 포함하도록 설계했습니다.

### 3단계: 한국어 음성 인식(STT) 엔진 탑재
- **Web Speech API 활용**: 별도의 설치 없이 브라우저에서 즉시 작동하는 한국어 음성 인식 훅(`useVoice`)을 개발했습니다.
- **시각적 비드백**: 마이크 버튼을 누르면 화면 전체가 어두워지며 "듣고 있어요"라는 메시지와 애니메이션을 보여줍니다.

### 4단계: AI 일정 지능형 분석 시스템 개발
- **OpenAI API 연동**: 사용자가 "내일 아침 9시에 안과 가야 해"라고 말하면, AI가 현재 시간을 기준으로 정확한 날짜(`YYYY-MM-DD`)와 시간(`HH:mm`)을 뽑아내도록 프롬프트를 설계했습니다.
- **데이터 구조화**: 분석된 내용은 제목, 날짜, 시간, 장소로 나누어 시니어에게 카드로 다시 보여주어 확인 절차를 거칩니다.

### 5단계: 구글 캘린더 양방향 연동
- **일정 등록(Post)**: 확인 카드의 "네, 맞아요!"를 누르면 구글 캘린더 API를 통해 실제 일정이 본인의 캘린더에 저장됩니다.
- **일정 조회(Get)**: 메인 화면 하단에 **"오늘의 일정"** 기능을 추가하여, 오늘 해야 할 일들을 캘린더에서 실시간으로 불러와 큰 글씨로 나열해 줍니다.

### 6단계: 환경 구축 및 배포 준비
- **GitHub 저장소 연결**: `iebunie5-design/SilverCalendar-` 저장소에 모든 소스코드를 백업하고 버전 관리를 시작했습니다.
- **Firebase/Vercel 설정**: 배포 환경을 구축하고 환경 변수(`OPENAI_API_KEY` 등) 보안을 강화했습니다.

---

## ⚙️ 실행 방법

1. **저장소 복제**
   ```bash
   git clone https://github.com/iebunie5-design/SilverCalendar-.git
   ```

2. **환경 변수(`env.local`) 설정**
   - OpenAI, Google Client ID/Secret, NextAuth Secret 필수 입력

3. **패키지 설치 및 실행**
   ```bash
   npm install
   npm run dev
   ```

---
Created with ❤️ by ideacube AI / Team SilverTech
