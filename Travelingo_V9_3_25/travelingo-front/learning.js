// ============================================================
// Travelingo - 학습 페이지 메인 JavaScript
// ============================================================
// 이 파일은 learning.html과 연동되어 단어/표현/AI대화 학습을 처리합니다.
// 백엔드 API(Spring Boot :8080)에서 콘텐츠를 불러오고,
// AI 서버(Python FastAPI :8000)와의 대화는 백엔드를 경유합니다.
//
// 흐름: 프론트(5500) → 백엔드(8080) → AI서버(8000)
// ============================================================

// ── 백엔드 API 기본 URL ──
const API_BASE = 'http://localhost:8080/api';

// ── 전역 상태 변수 ──
let currentChapterId = parseInt(localStorage.getItem('currentChapterId')) || 1;   // 현재 챕터 ID
let currentSession = parseInt(localStorage.getItem('currentSession')) || 1;       // 현재 세션 번호
let currentSessionData = null;    // API에서 불러온 세션 데이터 {vocabulary, expressions, qna, cultureTip}
let currentMode = 'auto';         // 현재 학습 모드 (auto/vocabulary/expressions/ai-conversation)
let vocabIndex = 0;               // 단어 학습 현재 인덱스
let exprIndex = 0;                // 표현 학습 현재 인덱스
let convSessionId = null;         // AI 대화 세션 ID (백엔드에서 발급)
let sessionStartTime = Date.now(); // 세션 시작 시간 (학습 시간 계산용)
let mediaRecorder = null;         // 음성 녹음용 MediaRecorder 객체
let audioChunks = [];             // 녹음된 오디오 데이터 청크
let userRecordingBlob = null;     // 사용자 녹음 Blob 객체

// ── 챕터 목록 데이터 (사이드바 네비게이션용) ──
// ★ 핵심 변경: 하드코딩 제거!
// 이 배열은 페이지 로드 시 백엔드 API(GET /api/chapters)에서 동적으로 채워짐
// 백엔드가 응답하지 않으면 빈 배열로 유지됨 (에러 메시지 표시)
let allChapters = [];

// ── 챕터 아이콘 매핑 (카테고리별 아이콘) ──
// 백엔드 chapter 테이블의 category 필드 → 프론트 아이콘
const categoryIconMap = {
    '인사 & 기본': '👋', '인사': '👋', '기본': '👋',
    '공항에서': '✈️', '공항': '✈️',
    '음식 & 식사': '🍽️', '음식': '🍽️', '식사': '🍽️',
    '숙박시설': '🏨', '숙박': '🏨', '호텔': '🏨',
    '쇼핑하기': '🛍️', '쇼핑': '🛍️',
    '교통 & 길찾기': '🚕', '교통': '🚕', '길찾기': '🚕',
    '긴급 상황': '🆘', '긴급': '🆘',
    '문화 & 여가': '🎭', '문화': '🎭', '여가': '🎭',
    '일상 대화': '💬', '일상': '💬',
    '고급 표현': '⭐', '고급': '⭐'
};

/**
 * 백엔드 API에서 챕터 목록을 불러오는 함수
 * GET /api/chapters?language=english → Chapter 엔티티 배열 반환
 *
 * 백엔드 Chapter 엔티티 필드:
 *   id          → 챕터 PK (DB 기준)
 *   chapterNo   → 챕터 번호 (1, 2, 3...)
 *   title       → 챕터 제목 ("인사 & 기본" 등)
 *   category    → 카테고리 (아이콘 매핑에 사용)
 *   totalSessions → 총 세션 수
 *
 * @returns {Array} 챕터 목록 [{number, title, icon, sessions}, ...]
 */
async function loadChaptersFromApi() {
    const language = localStorage.getItem('language') || 'english';
    try {
        const response = await fetch(`${API_BASE}/chapters?language=${language}`);
        if (!response.ok) throw new Error(`챕터 로드 실패: ${response.status}`);

        const chapters = await response.json();

        // 백엔드 응답 → 프론트 내부 형식으로 매핑
        return chapters.map(ch => ({
            number: ch.chapterNo || ch.id,          // 챕터 번호
            title: ch.title || `챕터 ${ch.chapterNo}`,  // 챕터 제목
            icon: categoryIconMap[ch.category] || categoryIconMap[ch.title] || '📖',  // 아이콘
            sessions: ch.totalSessions || 4          // 세션 수
        }));
    } catch (error) {
        console.error('챕터 목록 API 로드 실패:', error);
        return [];  // API 실패 시 빈 배열 반환
    }
}


// ============================================================
// 페이지 초기화 (DOMContentLoaded)
// ============================================================
/**
 * 페이지 로드 시 실행되는 초기화 함수
 * 1. 로그인 확인
 * 2. 백엔드에서 챕터 목록 로드 (하드코딩 대체)
 * 3. 헤더 정보 업데이트
 * 4. 사이드바 챕터 목록 렌더링
 * 5. API에서 현재 세션의 학습 콘텐츠 로드
 * 6. D-Day 카운트다운 표시
 */
document.addEventListener('DOMContentLoaded', async function() {
    // userId 체크 — 로그인하지 않았으면 로그인 페이지로 리다이렉트
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }

    // ★ 핵심: 백엔드 API에서 챕터 목록을 동적으로 로드
    // MySQL chapter 테이블 → Spring Boot GET /api/chapters → 이 배열
    allChapters = await loadChaptersFromApi();

    // API에서 챕터를 불러오지 못한 경우 안내
    if (allChapters.length === 0) {
        console.warn('백엔드에서 챕터 목록을 불러올 수 없습니다. DB에 chapter 데이터가 있는지 확인해주세요.');
    }

    // localStorage에서 여행 설정 정보 가져오기
    const dDay = localStorage.getItem('dDay');
    const destination = localStorage.getItem('destination');

    // 헤더에 챕터/세션 정보 표시
    updateHeaderInfo();

    // 사이드바에 챕터/세션 네비게이션 렌더링
    renderChapterList();

    // 현재 세션의 학습 콘텐츠를 백엔드 API에서 로드
    await loadSessionData(currentChapterId, currentSession);

    // D-Day 카운트다운 표시
    if (dDay) {
        const today = new Date();
        const travelDate = new Date(dDay);
        const daysLeft = Math.ceil((travelDate - today) / (1000 * 60 * 60 * 24));
        const countdownDays = document.querySelector('.countdown-days');
        const countdownDate = document.querySelector('.countdown-date');
        if (countdownDays) countdownDays.textContent = `${Math.max(0, daysLeft)}일 남음`;
        if (countdownDate) countdownDate.textContent = `${travelDate.toLocaleDateString('ko-KR')} 출발`;

        // 헤더 인라인 D-Day 표시
        const daysLeftInline = document.getElementById('daysLeftInline');
        if (daysLeftInline) daysLeftInline.textContent = `(${Math.max(0, daysLeft)}일 남음)`;
    }
});


// ============================================================
// 헤더 정보 업데이트
// ============================================================
/**
 * 헤더에 현재 챕터 제목과 세션 정보를 표시
 */
function updateHeaderInfo() {
    const chapter = allChapters.find(ch => ch.number === currentChapterId);
    const courseTitle = document.getElementById('courseTitle');
    const sessionTitle = document.getElementById('sessionTitle');

    if (courseTitle && chapter) {
        // localStorage의 언어 설정에 따라 표시 (하드코딩 제거)
        const langMap = { english: '영어', japanese: '일본어', chinese: '중국어', spanish: '스페인어', french: '프랑스어' };
        const language = localStorage.getItem('language') || 'english';
        const langLabel = langMap[language] || language;
        courseTitle.textContent = `${chapter.icon} ${langLabel} - Ch ${chapter.number}: ${chapter.title}`;
    }
    if (sessionTitle) {
        sessionTitle.textContent = `Session ${currentSession}`;
    }

    // 세션 인트로 화면 제목도 업데이트
    const introTitle = document.getElementById('sessionIntroTitle');
    const introDesc = document.getElementById('sessionIntroDesc');
    if (introTitle) introTitle.textContent = `Session ${currentSession}`;
    if (introDesc && chapter) introDesc.textContent = `${chapter.title} 관련 필수 표현을 배워봅시다`;
}


// ============================================================
// 사이드바 챕터/세션 목록 렌더링
// ============================================================
/**
 * 사이드바에 모든 챕터와 세션을 클릭 가능한 리스트로 렌더링
 * 현재 선택된 챕터/세션은 active 클래스가 붙음
 */
function renderChapterList() {
    const chapterListEl = document.getElementById('chapterList');
    if (!chapterListEl) return;

    chapterListEl.innerHTML = '';

    allChapters.forEach(chapter => {
        // 챕터 컨테이너 생성
        const chapterDiv = document.createElement('div');
        chapterDiv.className = 'chapter-item' + (chapter.number === currentChapterId ? ' active' : '');

        // 챕터 헤더 (아이콘 + 제목)
        const headerDiv = document.createElement('div');
        headerDiv.className = 'chapter-header';
        headerDiv.innerHTML = `<span>${chapter.icon}</span> Ch${chapter.number}: ${chapter.title}`;
        headerDiv.onclick = () => {
            // 챕터 클릭 시 세션 목록 토글
            chapterDiv.classList.toggle('active');
        };
        chapterDiv.appendChild(headerDiv);

        // 세션 리스트
        const sessionList = document.createElement('div');
        sessionList.className = 'session-list';

        for (let s = 1; s <= chapter.sessions; s++) {
            const sessionItem = document.createElement('div');
            sessionItem.className = 'session-item';
            // 현재 활성 세션 표시
            if (chapter.number === currentChapterId && s === currentSession) {
                sessionItem.classList.add('active');
            }
            sessionItem.textContent = `세션 ${s}`;
            // 클로저로 세션 번호 캡처
            const sessionNo = s;
            const chapterId = chapter.number;
            sessionItem.onclick = (e) => {
                e.stopPropagation();
                goToSession(chapterId, sessionNo);
            };
            sessionList.appendChild(sessionItem);
        }

        chapterDiv.appendChild(sessionList);
        chapterListEl.appendChild(chapterDiv);
    });
}


// ============================================================
// 세션 이동
// ============================================================
/**
 * 특정 챕터/세션으로 이동하는 함수
 * 상태를 초기화하고 새로운 세션의 콘텐츠를 로드
 *
 * @param {number} chapterId - 이동할 챕터 ID (1~10)
 * @param {number} sessionNo - 이동할 세션 번호
 */
function goToSession(chapterId, sessionNo) {
    // 상태 초기화
    currentChapterId = chapterId;
    currentSession = sessionNo;
    vocabIndex = 0;
    exprIndex = 0;
    convSessionId = null;          // 대화 세션 리셋
    sessionStartTime = Date.now(); // 학습 시간 리셋

    // localStorage에 현재 위치 저장 (새로고침 시 유지)
    localStorage.setItem('currentChapterId', currentChapterId);
    localStorage.setItem('currentSession', currentSession);

    // UI 업데이트
    updateHeaderInfo();
    renderChapterList();

    // 초기 화면(영상 섹션)으로 돌아가기
    hideAllModes();
    document.getElementById('initialScreen').style.display = '';

    // 새 세션의 콘텐츠 로드
    loadSessionData(chapterId, sessionNo);
}


// ============================================================
// API에서 세션 데이터 로드
// ============================================================
/**
 * 백엔드 API에서 학습 콘텐츠를 불러오는 비동기 함수
 *
 * 호출하는 API:
 *   GET /api/contents?chapterId=X&sessionNo=Y  → 단어/표현/QNA 콘텐츠
 *   GET /api/culture-tips?chapterId=X&sessionNo=Y → 문화 팁
 *
 * 백엔드 응답 필드 → 프론트 내부 필드 매핑:
 *   contentEn → english      (영어 단어/표현)
 *   contentKo → korean       (한글 뜻)
 *   exampleEn → example_en   (영어 예문)
 *   exampleKo → example_ko   (한글 예문)
 *   qnaQEn   → question      (영어 질문)
 *   qnaAEn   → answer        (영어 답변)
 *   qnaQKo   → question_ko   (한글 질문)
 *   qnaAKo   → answer_ko     (한글 답변)
 *
 * @param {number} chapterId - 챕터 ID
 * @param {number} sessionNo - 세션 번호
 */
async function loadSessionData(chapterId, sessionNo) {
    try {
        // ── 학습 콘텐츠 로드 (GET /api/contents) ──
        const response = await fetch(
            `${API_BASE}/contents?chapterId=${chapterId}&sessionNo=${sessionNo}`
        );

        if (!response.ok) {
            throw new Error(`콘텐츠 로드 실패: ${response.status}`);
        }

        const contents = await response.json();

        // ── 콘텐츠를 타입별로 분류 ──
        // 백엔드에서 type 필드로 구분: WORD, EXPRESSION, QNA
        const vocabulary = [];
        const expressions = [];
        const qna = [];

        contents.forEach(item => {
            // 백엔드 DTO 필드명 → 프론트엔드 내부 필드명 매핑
            const mapped = {
                id: item.id,
                english: item.contentEn || '',       // 영어 단어/표현
                korean: item.contentKo || '',         // 한글 뜻
                example_en: item.exampleEn || '',     // 영어 예문
                example_ko: item.exampleKo || '',     // 한글 예문
                question: item.qnaQEn || '',          // Q&A 영어 질문
                answer: item.qnaAEn || '',            // Q&A 영어 답변
                question_ko: item.qnaQKo || '',       // Q&A 한글 질문
                answer_ko: item.qnaAKo || ''          // Q&A 한글 답변
            };

            // type에 따라 적절한 배열에 추가
            if (item.type === 'WORD') {
                vocabulary.push(mapped);
            } else if (item.type === 'EXPRESSION') {
                expressions.push(mapped);
            } else if (item.type === 'QNA') {
                qna.push(mapped);
            }
        });

        // ── 문화 팁 로드 (GET /api/culture-tips) ──
        let cultureTip = '';
        try {
            console.log("chapterId:", chapterId, "sessionNo:", sessionNo);
            const tipRes = await fetch(
                `${API_BASE}/culture-tips?chapterId=${chapterId}&sessionNo=${sessionNo}`
            );
            if (tipRes.ok) {
                const tipData = await tipRes.json();
                // 배열이면 첫 번째 요소, 단일 객체면 그대로 사용
                if (Array.isArray(tipData) && tipData.length > 0) {
                    cultureTip = tipData[0].tipKo || '';
                } else if (tipData && tipData.tipKo) {
                    cultureTip = tipData.tipKo;
                }
            }
        } catch (tipError) {
            console.log('문화 팁 로드 실패 (무시):', tipError);
        }

        // ── 세션 데이터 저장 ──
        currentSessionData = {
            vocabulary: vocabulary,
            expressions: expressions,
            qna: qna,
            cultureTip: cultureTip
        };

        // ── 문화 팁 표시 ──
        const cultureTipSection = document.getElementById('cultureTipSection');
        const cultureTipText = document.getElementById('cultureTipText');
        if (cultureTip && cultureTipSection && cultureTipText) {
            cultureTipText.textContent = cultureTip;
            cultureTipSection.style.display = 'flex';
        }

        // ── 세션 인트로 학습 목록 업데이트 ──
        const learningList = document.getElementById('sessionLearningList');
        if (learningList) {
            learningList.innerHTML = `
                <li>✓ 필수 단어 ${vocabulary.length}개</li>
                <li>✓ 핵심 표현 ${expressions.length}개</li>
                <li>✓ 실전 AI 대화 연습</li>
            `;
        }

        // 진행도 숫자 업데이트
        const vocabTotal = document.getElementById('vocabTotal');
        const exprTotal = document.getElementById('exprTotal');
        if (vocabTotal) vocabTotal.textContent = vocabulary.length;
        if (exprTotal) exprTotal.textContent = expressions.length;

        console.log(`세션 데이터 로드 완료: 단어 ${vocabulary.length}개, 표현 ${expressions.length}개, QNA ${qna.length}개`);

    } catch (error) {
        console.error('세션 데이터 로드 오류:', error);
        // API 실패 시 빈 데이터로 초기화
        currentSessionData = {
            vocabulary: [],
            expressions: [],
            qna: [],
            cultureTip: ''
        };
        alert('학습 콘텐츠를 불러올 수 없습니다. 백엔드 서버 연결을 확인해주세요.');
    }
}


// ============================================================
// 학습 모드 전환
// ============================================================
/**
 * 모든 학습 모드 화면을 숨기는 헬퍼 함수
 */
function hideAllModes() {
    // ★ CSS는 .learning-mode { display:none } + .learning-mode.active { display:block } 방식
    // 따라서 active 클래스를 제거하여 숨김 처리
    document.getElementById('initialScreen').style.display = 'none';
    document.getElementById('vocabulary-mode').classList.remove('active');
    document.getElementById('expressions-mode').classList.remove('active');
    document.getElementById('ai-conversation-mode').classList.remove('active');
    document.getElementById('sessionCompletion').style.display = 'none';
}

/**
 * 학습 모드를 설정하고 해당 섹션을 표시하는 함수
 *
 * @param {string} mode - 학습 모드
 *   'auto': 자동 학습 (단어 → 표현 → AI 순서)
 *   'vocabulary': 단어 학습만
 *   'expressions': 표현 & 문답 학습만
 *   'ai-conversation': AI 대화 연습만
 */
function setLearningMode(mode) {
    currentMode = mode;

    // 사이드바 모드 버튼 active 상태 업데이트
    document.querySelectorAll('.mode-select-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        }
    });

    // auto 모드면 단어 학습부터 시작
    if (mode === 'auto' || mode === 'vocabulary') {
        showVocabularyMode();
    } else if (mode === 'expressions') {
        showExpressionsMode();
    } else if (mode === 'ai-conversation') {
        showAiConversationMode();
    }

    // 모바일에서 사이드바 닫기
    closeSidebar();
}

/**
 * 초기 화면의 "학습 시작하기" 버튼 클릭 시 호출
 * 자동 모드로 단어 학습부터 시작
 */
function startLearning() {
    setLearningMode(currentMode || 'auto');
}


// ============================================================
// A. 단어 학습 모드
// ============================================================

/**
 * 단어 학습 모드 화면을 표시
 */
function showVocabularyMode() {
    hideAllModes();
    document.getElementById('vocabulary-mode').classList.add('active');
    vocabIndex = 0;
    displayVocabularyCard(0);
}

/**
 * 지정된 인덱스의 단어를 플래시카드에 표시
 *
 * @param {number} index - 표시할 단어 인덱스
 */
function displayVocabularyCard(index) {
    if (!currentSessionData || !currentSessionData.vocabulary.length) {
        console.log('단어 데이터 없음');
        return;
    }

    const vocab = currentSessionData.vocabulary;
    if (index < 0 || index >= vocab.length) return;

    vocabIndex = index;
    const word = vocab[index];

    // 카드 앞면: 한글 뜻 (클릭하면 뒤집어서 영어 표시)
    const wordKorean = document.getElementById('wordKorean');
    const wordEnglish = document.getElementById('wordEnglish');
    const exampleEn = document.getElementById('exampleEn');
    const exampleKo = document.getElementById('exampleKo');

    if (wordKorean) wordKorean.textContent = word.korean;
    if (wordEnglish) wordEnglish.textContent = word.english;
    if (exampleEn) {
        // 예문 영어 + TTS 버튼
        exampleEn.innerHTML = `
            ${word.example_en}
            <button class="tts-inline" onclick="event.stopPropagation(); speakCurrentExample()">🔊</button>
        `;
    }
    if (exampleKo) exampleKo.textContent = word.example_ko;

    // 이미지 숨기기 (이미지 URL 없으므로)
    const vocabImage = document.getElementById('vocabImage');
    if (vocabImage) vocabImage.style.display = 'none';

    // 카드를 앞면으로 리셋
    const flashcard = document.getElementById('flashcard1');
    if (flashcard) flashcard.classList.remove('flipped');

    // 진행 상황 업데이트 (1/3 단어)
    const vocabProgress = document.getElementById('vocabProgress');
    if (vocabProgress) vocabProgress.textContent = index + 1;

    // 이전/다음 버튼 활성화 상태
    const btnPrev = document.getElementById('btnPrevVocab');
    const btnNext = document.getElementById('btnNextVocab');
    if (btnPrev) btnPrev.disabled = (index === 0);
    if (btnNext) {
        // 마지막 카드면 "다음 →" 대신 "표현 학습 →"
        if (index >= vocab.length - 1) {
            btnNext.textContent = (currentMode === 'auto') ? '표현 학습 →' : '완료 ✓';
            btnNext.onclick = () => {
                completeVocabulary();
            };
        } else {
            btnNext.textContent = '다음 →';
            btnNext.onclick = () => nextVocab();
        }
    }
}

/**
 * 플래시카드 뒤집기 (앞면 ↔ 뒷면)
 */
function flipCard() {
    const flashcard = document.getElementById('flashcard1');
    if (flashcard) flashcard.classList.toggle('flipped');
}

/** 이전 단어로 이동 */
function prevVocab() {
    if (vocabIndex > 0) {
        displayVocabularyCard(vocabIndex - 1);
    }
}

/** 다음 단어로 이동 */
function nextVocab() {
    const vocab = currentSessionData ? currentSessionData.vocabulary : [];
    if (vocabIndex < vocab.length - 1) {
        displayVocabularyCard(vocabIndex + 1);
    }
}

/**
 * 단어 학습 완료 처리
 * 백엔드에 진행도 저장 후 표현 학습으로 이동 (auto 모드)
 */
async function completeVocabulary() {
    const userId = localStorage.getItem('userId');

    // 백엔드에 진행도 저장 (POST /api/progress)
    try {
        await fetch(`${API_BASE}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                chapterId: currentChapterId,
                sessionNo: currentSession,
                stepWord: true,
                stepExpr: false,
                stepAi: false,
                studyDuration: Math.round((Date.now() - sessionStartTime) / 1000)
            })
        });
    } catch (e) {
        console.error('단어 진행도 저장 실패:', e);
    }

    // auto 모드면 표현 학습으로 자동 이동
    if (currentMode === 'auto') {
        showExpressionsMode();
    } else {
        showCompletionScreen();
    }
}


// ============================================================
// B. 표현 & 문답 학습 모드
// ============================================================

/**
 * 표현 학습 모드 화면을 표시
 */
function showExpressionsMode() {
    hideAllModes();
    document.getElementById('expressions-mode').classList.add('active');
    exprIndex = 0;

    // 표현 + QNA를 합쳐서 하나의 배열로 사용
    const allExpressions = getExpressionsList();
    if (allExpressions.length > 0) {
        displayExpressionCard(0);
    }
}

/**
 * 표현 + QNA 데이터를 합친 배열을 반환
 * @returns {Array} 표현/QNA 통합 배열
 */
function getExpressionsList() {
    if (!currentSessionData) return [];
    // 표현 데이터 + QNA 데이터를 순서대로 합침
    return [...currentSessionData.expressions, ...currentSessionData.qna];
}

/**
 * 지정된 인덱스의 표현을 카드에 표시
 *
 * @param {number} index - 표시할 표현 인덱스
 */
function displayExpressionCard(index) {
    const allExpr = getExpressionsList();
    if (!allExpr.length || index < 0 || index >= allExpr.length) return;

    exprIndex = index;
    const expr = allExpr[index];

    // 한글 표현 / 영어 표현 표시
    const sentenceKo = document.getElementById('sentenceKo');
    const sentenceEn = document.getElementById('sentenceEn');

    // QNA 타입이면 질문/답변 형식으로 표시, 아니면 일반 표현
    if (expr.question) {
        // QNA 형식: 질문 → 답변
        if (sentenceKo) sentenceKo.textContent = `"${expr.question_ko}"`;
        if (sentenceEn) {
            sentenceEn.innerHTML = `
                Q: ${expr.question}<br>
                A: ${expr.answer}
                <button class="tts-inline" onclick="speakCurrentExpression()">🔊</button>
            `;
        }
    } else {
        // 일반 표현
        if (sentenceKo) sentenceKo.textContent = `"${expr.korean}"`;
        if (sentenceEn) {
            sentenceEn.innerHTML = `
                ${expr.english}
                <button class="tts-inline" onclick="speakCurrentExpression()">🔊</button>
            `;
        }
    }

    // 진행 상황 업데이트
    const exprProgress = document.getElementById('exprProgress');
    const exprTotal = document.getElementById('exprTotal');
    if (exprProgress) exprProgress.textContent = index + 1;
    if (exprTotal) exprTotal.textContent = allExpr.length;

    // 이전/다음 버튼 상태
    const btnPrev = document.getElementById('btnPrevExpr');
    const btnNext = document.getElementById('btnNextExpr');
    if (btnPrev) btnPrev.disabled = (index === 0);
    if (btnNext) {
        if (index >= allExpr.length - 1) {
            btnNext.textContent = (currentMode === 'auto') ? 'AI 대화 →' : '완료 ✓';
            btnNext.onclick = () => {
                completeExpressions();
            };
        } else {
            btnNext.textContent = '다음 →';
            btnNext.onclick = () => nextExpr();
        }
    }
}

/** 이전 표현으로 이동 */
function prevExpr() {
    if (exprIndex > 0) {
        displayExpressionCard(exprIndex - 1);
    }
}

/** 다음 표현으로 이동 */
function nextExpr() {
    const allExpr = getExpressionsList();
    if (exprIndex < allExpr.length - 1) {
        displayExpressionCard(exprIndex + 1);
    }
}

/**
 * 표현 학습 완료 처리
 * 백엔드에 진행도 저장 후 AI 대화로 이동 (auto 모드)
 */
async function completeExpressions() {
    const userId = localStorage.getItem('userId');

    try {
        await fetch(`${API_BASE}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                chapterId: currentChapterId,
                sessionNo: currentSession,
                stepWord: false,
                stepExpr: true,
                stepAi: false,
                studyDuration: Math.round((Date.now() - sessionStartTime) / 1000)
            })
        });
    } catch (e) {
        console.error('표현 진행도 저장 실패:', e);
    }

    if (currentMode === 'auto') {
        showAiConversationMode();
    } else {
        showCompletionScreen();
    }
}


// ============================================================
// C. AI 대화 연습 모드
// ============================================================

/**
 * AI 대화 모드 화면을 표시
 * 대화 메시지 영역 초기화, 시나리오 텍스트 설정
 */
function showAiConversationMode() {
    hideAllModes();
    document.getElementById('ai-conversation-mode').classList.add('active');

    // 대화 초기화
    convSessionId = null;
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        const chapter = allChapters.find(ch => ch.number === currentChapterId);
        const chapterTitle = chapter ? chapter.title : '여행';

        chatMessages.innerHTML = `
            <div class="message ai-message">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <p>
                        Hello! Let's practice some travel English together.
                        <button class="tts-inline" onclick="speakSentence('Hello! Let\\'s practice some travel English together.')">🔊</button>
                    </p>
                    <p class="message-translation">안녕하세요! 함께 여행 영어를 연습해봅시다.</p>
                </div>
            </div>
        `;
    }

    // 시나리오 텍스트 업데이트
    const aiScenario = document.getElementById('aiScenario');
    if (aiScenario) {
        const chapter = allChapters.find(ch => ch.number === currentChapterId);
        if (chapter) {
            aiScenario.innerHTML = `
                <h4>🎭 상황: ${chapter.title}</h4>
                <p>AI 튜터와 ${chapter.title} 관련 영어 대화를 연습해보세요.</p>
            `;
        }
    }

    // 추천 답변 업데이트
    updateSuggestedResponses();

    // 피드백 영역 숨기기
    const userFeedback = document.getElementById('userFeedback');
    if (userFeedback) userFeedback.style.display = 'none';
}

/**
 * 추천 답변 버튼을 학습 콘텐츠 기반으로 업데이트
 */
function updateSuggestedResponses() {
    const suggestedDiv = document.getElementById('suggestedResponses');
    if (!suggestedDiv) return;

    // 현재 세션의 표현에서 추천 답변 생성
    let suggestions = [];
    if (currentSessionData && currentSessionData.expressions.length > 0) {
        suggestions = currentSessionData.expressions
            .slice(0, 3)  // 최대 3개
            .map(expr => expr.english);
    }

    // 기본 추천 답변
    if (suggestions.length === 0) {
        suggestions = ['Hello, how are you?', 'I need help, please.', 'Thank you very much!'];
    }

    suggestedDiv.innerHTML = `
        <p class="suggest-label">💡 추천 답변:</p>
        ${suggestions.map(s => `<button class="suggest-btn" onclick="useSuggestion(this)">${s}</button>`).join('')}
    `;
}

/**
 * 추천 답변 버튼 클릭 시 입력창에 텍스트 삽입
 * @param {HTMLElement} btn - 클릭된 버튼 요소
 */
function useSuggestion(btn) {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.value = btn.textContent;
        chatInput.focus();
    }
}

/**
 * AI와의 대화 메시지 전송 함수 (핵심!)
 *
 * 동작 흐름:
 *   1. 사용자 입력을 채팅 화면에 표시
 *   2. POST /api/conv 요청으로 백엔드에 전송
 *   3. 백엔드가 Python AI 서버를 호출하고 응답 반환
 *   4. AI 응답(aiMessage)을 채팅 화면에 표시
 *   5. 피드백(feedback)과 개선 표현(betterExpression)을 피드백 영역에 표시
 */
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const userText = chatInput ? chatInput.value.trim() : '';

    if (!userText) return;

    const userId = localStorage.getItem('userId');
    const chatMessages = document.getElementById('chatMessages');

    // ── 사용자 메시지를 채팅 화면에 표시 (XSS 방지: textContent 사용) ──
    if (chatMessages) {
        const userMsgDiv = document.createElement('div');
        userMsgDiv.className = 'message user-message';
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        const p = document.createElement('p');
        p.textContent = userText;
        contentDiv.appendChild(p);
        userMsgDiv.appendChild(contentDiv);
        chatMessages.appendChild(userMsgDiv);
    }

    // 입력창 초기화
    if (chatInput) chatInput.value = '';

    // ── "생각 중..." 표시 ──
    let thinkingDiv = null;
    if (chatMessages) {
        thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'message ai-message thinking';
        thinkingDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content"><p>생각 중...</p></div>
        `;
        chatMessages.appendChild(thinkingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    try {
        // ── POST /api/conv 요청 ──
        // 백엔드가 AI 서버를 호출하여 응답 생성
        const response = await fetch(`${API_BASE}/conv`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                chapterId: currentChapterId,
                sessionNo: currentSession,
                message: userText,
                convSessionId: convSessionId,   // null이면 새 세션 생성
                userLevel: parseInt(localStorage.getItem('userLevel')) || 2
            })
        });

        if (!response.ok) {
            throw new Error(`API 응답 오류: ${response.status}`);
        }

        // 백엔드 응답 파싱 (ConvResponseDto)
        const data = await response.json();

        // 대화 세션 ID 저장 (다음 요청에서 이어하기)
        if (data.convSessionId) {
            convSessionId = data.convSessionId;
        }

        // "생각 중..." 제거
        if (thinkingDiv) thinkingDiv.remove();

        // ── AI 응답을 채팅 화면에 표시 (XSS 방지: DOM API 사용) ──
        if (chatMessages) {
            const aiMsgDiv = document.createElement('div');
            aiMsgDiv.className = 'message ai-message';

            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'message-avatar';
            avatarDiv.textContent = '🤖';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';

            const msgP = document.createElement('p');
            const aiText = data.aiMessage || 'Sorry, I could not generate a response.';
            msgP.textContent = aiText;

            // TTS 버튼을 DOM으로 생성
            const ttsBtn = document.createElement('button');
            ttsBtn.className = 'tts-inline';
            ttsBtn.textContent = '🔊';
            ttsBtn.addEventListener('click', () => speakSentence(aiText));
            msgP.appendChild(document.createTextNode(' '));
            msgP.appendChild(ttsBtn);

            contentDiv.appendChild(msgP);

            // 번역이 있으면 표시
            if (data.translation) {
                const transP = document.createElement('p');
                transP.className = 'message-translation';
                transP.textContent = data.translation;
                contentDiv.appendChild(transP);
            }

            aiMsgDiv.appendChild(avatarDiv);
            aiMsgDiv.appendChild(contentDiv);
            chatMessages.appendChild(aiMsgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // ── 피드백 영역 업데이트 ──
        const userFeedback = document.getElementById('userFeedback');
        const feedbackText = document.getElementById('feedbackText');
        const betterExprText = document.getElementById('betterExprText');

        if (data.feedback || data.betterExpression) {
            if (feedbackText) feedbackText.textContent = data.feedback || '';
            if (betterExprText) betterExprText.textContent = data.betterExpression || '';
            if (userFeedback) userFeedback.style.display = 'block';
        }

    } catch (error) {
        console.error('AI 대화 오류:', error);
        // "생각 중..." 제거
        if (thinkingDiv) thinkingDiv.remove();

        // 에러 메시지 표시
        if (chatMessages) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'message ai-message';
            errorDiv.innerHTML = `
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <p style="color: #e53e3e;">죄송합니다. 서버 연결에 문제가 있습니다. 다시 시도해주세요.</p>
                </div>
            `;
            chatMessages.appendChild(errorDiv);
        }
    }
}


// ============================================================
// 세션 완료
// ============================================================

/**
 * 세션 완료 처리
 * 백엔드에 최종 진행도 저장 후 완료 화면 표시
 */
async function completeSession() {
    const userId = localStorage.getItem('userId');
    const studyDuration = Math.round((Date.now() - sessionStartTime) / 1000);

    try {
        const response = await fetch(`${API_BASE}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                chapterId: currentChapterId,
                sessionNo: currentSession,
                stepWord: true,
                stepExpr: true,
                stepAi: true,
                studyDuration: studyDuration
            })
        });

        if (response.ok) {
            const data = await response.json();
            // 진행도 퍼센트 업데이트
            const level1 = document.getElementById('level1Progress');
            if (level1 && data.progressPct) {
                level1.textContent = data.progressPct;
            }
        }
    } catch (e) {
        console.error('최종 진행도 저장 실패:', e);
    }

    showCompletionScreen();
}

/**
 * 완료 화면 표시
 */
function showCompletionScreen() {
    hideAllModes();
    document.getElementById('sessionCompletion').style.display = 'block';

    // 완료 통계 업데이트
    const chapter = allChapters.find(ch => ch.number === currentChapterId);
    const completionTitle = document.getElementById('completionTitle');
    const completionSubtitle = document.getElementById('completionSubtitle');
    const statWords = document.getElementById('statWords');
    const statExpressions = document.getElementById('statExpressions');

    if (completionTitle) completionTitle.textContent = `Session ${currentSession} 완료!`;
    if (completionSubtitle && chapter) {
        completionSubtitle.textContent = `${chapter.title} 학습을 완료했습니다`;
    }
    if (statWords && currentSessionData) {
        statWords.textContent = `${currentSessionData.vocabulary.length}개`;
    }
    if (statExpressions && currentSessionData) {
        statExpressions.textContent = `${currentSessionData.expressions.length + currentSessionData.qna.length}개`;
    }

    // 다음 세션 미리보기 업데이트
    updateNextSessionPreview();
}

/**
 * 완료 화면의 "다음 세션" 미리보기 업데이트
 */
function updateNextSessionPreview() {
    const chapter = allChapters.find(ch => ch.number === currentChapterId);
    const totalSessions = chapter ? chapter.sessions : 0;

    const nextTitle = document.getElementById('nextSessionTitle');
    const nextDesc = document.getElementById('nextSessionDesc');

    if (currentSession < totalSessions) {
        // 다음 세션이 같은 챕터에 있음
        if (nextTitle) nextTitle.textContent = `Session ${currentSession + 1}`;
        if (nextDesc && chapter) nextDesc.textContent = `${chapter.title} 심화 학습`;
    } else if (currentChapterId < allChapters.length) {
        // 다음 챕터로 넘어감
        const nextChapter = allChapters.find(ch => ch.number === currentChapterId + 1);
        if (nextTitle && nextChapter) {
            nextTitle.textContent = `Ch ${nextChapter.number}: ${nextChapter.title} - Session 1`;
        }
        if (nextDesc && nextChapter) {
            nextDesc.textContent = `${nextChapter.title} 기초 학습`;
        }
    } else {
        // 모든 학습 완료
        if (nextTitle) nextTitle.textContent = '모든 학습 완료!';
        if (nextDesc) nextDesc.textContent = '축하합니다!';
    }
}

/**
 * 복습하기 버튼 — 현재 세션을 처음부터 다시 시작
 */
function reviewSession() {
    goToSession(currentChapterId, currentSession);
}

/**
 * 다음 세션으로 이동
 */
function goToNextSession() {
    const chapter = allChapters.find(ch => ch.number === currentChapterId);
    const totalSessions = chapter ? chapter.sessions : 0;

    if (currentSession < totalSessions) {
        goToSession(currentChapterId, currentSession + 1);
    } else if (currentChapterId < allChapters.length) {
        goToSession(currentChapterId + 1, 1);
    } else {
        alert('모든 학습을 완료했습니다! 축하합니다! 🎉');
        window.location.href = 'index.html';
    }
}


// ============================================================
// TTS (Text-to-Speech) — Web Speech API 사용
// ============================================================

/**
 * 텍스트를 음성으로 읽어주는 함수
 * 브라우저 내장 Web Speech API 사용 (별도 서버 불필요)
 *
 * @param {string} text - 읽을 텍스트
 * @param {string} lang - 언어 코드 (기본: en-US)
 */
function speak(text, lang = 'en-US') {
    if (!text || !window.speechSynthesis) return;
    // 기존 음성 출력 중지
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;  // 학습용이므로 약간 느리게
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
}

/**
 * 특정 문장을 영어로 읽기 (AI 대화 말풍선의 TTS 버튼용)
 * @param {string} text - 읽을 영어 문장
 */
function speakSentence(text) {
    speak(text, 'en-US');
}

/** 현재 단어의 영어를 음성 출력 */
function speakCurrentWord() {
    const wordEnglish = document.getElementById('wordEnglish');
    if (wordEnglish) speak(wordEnglish.textContent, 'en-US');
}

/** 현재 단어의 예문을 음성 출력 */
function speakCurrentExample() {
    if (!currentSessionData || !currentSessionData.vocabulary[vocabIndex]) return;
    const word = currentSessionData.vocabulary[vocabIndex];
    speak(word.example_en, 'en-US');
}

/** 현재 표현의 영어를 음성 출력 */
function speakCurrentExpression() {
    const allExpr = getExpressionsList();
    if (!allExpr[exprIndex]) return;
    const expr = allExpr[exprIndex];
    // QNA면 질문+답변, 아니면 영어 표현 읽기
    if (expr.question) {
        speak(expr.question + '. ' + expr.answer, 'en-US');
    } else {
        speak(expr.english, 'en-US');
    }
}


// ============================================================
// 음성 녹음 (MediaRecorder API)
// ============================================================

/**
 * 음성 녹음 시작/중지 토글
 * 브라우저 마이크 권한 필요
 */
async function toggleRecording() {
    const btnRecord = document.getElementById('btnRecord');

    if (mediaRecorder && mediaRecorder.state === 'recording') {
        // 녹음 중지
        mediaRecorder.stop();
        if (btnRecord) {
            btnRecord.querySelector('.record-text').textContent = '내 발음 녹음하기';
            btnRecord.querySelector('.record-icon').textContent = '🎤';
        }
        return;
    }

    try {
        // 마이크 권한 요청 및 스트림 획득
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        // 녹음 데이터 수집
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        // 녹음 종료 시 Blob 생성
        mediaRecorder.onstop = () => {
            userRecordingBlob = new Blob(audioChunks, { type: 'audio/webm' });
            // 재생 버튼 표시
            const btnPlay = document.getElementById('btnPlayRecording');
            const compButtons = document.getElementById('comparisonButtons');
            if (btnPlay) btnPlay.style.display = '';
            if (compButtons) compButtons.style.display = '';
            // 마이크 스트림 해제
            stream.getTracks().forEach(track => track.stop());
        };

        // 녹음 시작
        mediaRecorder.start();
        if (btnRecord) {
            btnRecord.querySelector('.record-text').textContent = '녹음 중지';
            btnRecord.querySelector('.record-icon').textContent = '⏹️';
        }

    } catch (err) {
        console.error('마이크 접근 오류:', err);
        alert('마이크 권한을 허용해주세요.');
    }
}

/**
 * 사용자 녹음 재생
 */
function playUserRecording() {
    if (!userRecordingBlob) return;
    const audio = new Audio(URL.createObjectURL(userRecordingBlob));
    audio.play();
}

/**
 * 원어민 발음과 비교 (순차 재생: TTS → 사용자 녹음)
 */
function compareVoices() {
    // 먼저 원어민(TTS) 재생
    speakCurrentWord();
    // 2초 후 사용자 녹음 재생
    setTimeout(() => {
        playUserRecording();
    }, 2000);
}


// ============================================================
// 사이드바 토글 (모바일 대응)
// ============================================================

/** 사이드바 열기/닫기 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

/** 사이드바 닫기 */
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

/** 학습 방법 선택 영역 토글 (모바일 메뉴용) */
function toggleModeSelection() {
    const modeSelection = document.getElementById('modeSelection');
    if (modeSelection) {
        modeSelection.style.display = modeSelection.style.display === 'none' ? '' : 'none';
    }
}


// ============================================================
// 영상 재생 (플레이스홀더)
// ============================================================
/**
 * 학습 영상 재생 함수
 * 실제 영상 파일이 없으면 안내 메시지 표시
 */
/**
 * 이전 단계로 돌아가기 (여행 설정 페이지로 이동)
 * learning.html의 "이전" 버튼에서 호출됨
 */
function prevStep() {
    window.location.href = 'travel-setup.html';
}

function playVideo() {
    const video = document.getElementById('sessionVideo');
    const placeholder = document.getElementById('videoPlaceholder');

    if (video && video.src && !video.src.endsWith('#')) {
        // 실제 영상이 있으면 재생
        if (placeholder) placeholder.style.display = 'none';
        video.style.display = 'block';
        video.play();
    } else {
        // 영상 파일 없음 — 바로 학습 시작
        alert('학습 영상이 준비 중입니다. 바로 학습을 시작합니다!');
        startLearning();
    }
}
