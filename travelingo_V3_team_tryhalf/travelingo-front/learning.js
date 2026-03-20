// ── API 서버 주소 (백엔드 Spring Boot) ──
const API_BASE = 'http://localhost:8080/api';

// Learning State
let learningMode = 'auto';
let currentSection = null;
let currentSession = 1;
let totalSessions = 10;
let currentVocabIndex = 0;
let currentExprIndex = 0;
let userRecording = null;
let mediaRecorder = null;
let currentVocab = null;
let currentExpr = null;

// Level Progress (각 레벨별 진행률)
let levelProgress = {
    level1: 0,  // 단어 학습
    level2: 0,  // 표현 & 문답
    level3: 0   // AI 대화
};

// Session Progress (세션별 완료 상태)
let sessionCompleted = {};

// All Chapters Structure
const allChapters = {
    ch1: {
        title: '출국 및 기내',
        icon: '✈️',
        sessions: ['예약 확인', '체크인', '수하물', '보안검색', '면세점', '탑승', '기내식', '좌석 조절', '기내 면세', '입국 서류']
    },
    ch2: {
        title: '공항 도착',
        icon: '🛬',
        sessions: ['입국 심사', '환전', '유심/로밍', '수하물 찾기', '세관 신고', '분실물 센터', '안내데스크', '공항 픽업', '라운지 이용', '렌터카 예약']
    },
    ch3: {
        title: '교통 이용',
        icon: '🚕',
        sessions: ['택시 타기', '우버/리프트 호출', '지하철 티켓', '버스 노선 묻기', '기차 예매', '길 묻기', '도보 이동', '자전거 대여', '주유소', '주차하기']
    },
    ch4: {
        title: '호텔 숙박',
        icon: '🏨',
        sessions: ['체크인', '예약 변경', '룸 서비스', '시설 문의', '비품 요청', '청소 요청', '컴플레인', '체크아웃', '짐 보관', '세탁 서비스']
    },
    ch5: {
        title: '식당 - 기본',
        icon: '🍽️',
        sessions: ['맛집 찾기', '예약하기', '입장 대기', '주문하기', '스테이크 굽기', '음료 주문', '추가 주문', '계산서 요청', '팁 계산', '포장하기']
    },
    ch6: {
        title: '식당 - 심화',
        icon: '🍴',
        sessions: ['알레르기 안내', '추천 메뉴', '맛 평가', '식기 교체', '채식 메뉴', '계산 실수 정정', '더치 페이', '화장실 위치', '패스트푸드', '카페']
    },
    ch7: {
        title: '관광 및 액티비티',
        icon: '🎭',
        sessions: ['티켓 구매', '입장 시간 확인', '사진 부탁', '가이드 투어', '박물관 에티켓', '지도 보기', '공연 예매', '야경 명소', '휴식처 찾기', '기념품']
    },
    ch8: {
        title: '쇼핑',
        icon: '🛍️',
        sessions: ['옷 사이즈 찾기', '시착(Fitting)', '가격 흥정', '할인 확인', '색상 교환', '결제 수단', '면세 혜택', '환불/교환', '포장 요청', '배송']
    },
    ch9: {
        title: '긴급 상황',
        icon: '🚨',
        sessions: ['길 잃음', '물건 분실', '도난 신고', '병원 찾기', '증상 설명', '약국 이용', '경찰 도움', '영사관 연락', '카드 분실', '사고 발생']
    },
    ch10: {
        title: '귀국 및 소셜',
        icon: '🤝',
        sessions: ['친구 사귀기', '연락처 교환', '작별 인사', '공항 샌딩', 'VAT 환급', '출국 심사', '라운지 휴식', '여행 소감', '사진 공유', '재회 약속']
    }
};

// TODO [백엔드 연동] ─────────────────────────────────
// 백엔드 완성 후, 아래 하드코딩 데이터 대신 API에서 가져오세요
// 예시:
// async function loadSessionData(chapterId, sessionNo) {
//     try {
//         const res = await fetch(`${API_BASE}/contents?chapterId=${chapterId}&sessionNo=${sessionNo}`);
//         const data = await res.json();
//         // data 배열에서 type별로 분리
//         const vocabulary = data.filter(d => d.type === 'WORD');
//         const expressions = data.filter(d => d.type === 'EXPRESSION');
//         const qa = data.filter(d => d.type === 'QNA');
//         return { vocabulary, expressions, qa };
//     } catch (e) {
//         console.error('학습 데이터 로드 실패:', e);
//         return null;
//     }
// }
// ──────────────────────────────────────────────────

// Chapter 1 Data - Session 1: 예약 확인
const chapter1Data = {
    session1: {
        title: '예약 확인',
        cultureTip: '예약 확인 시 PNR(예약번호)을 항상 준비하세요. 미국·유럽 항공사는 전화보다 앱·웹 셀프 체크인을 선호합니다.',
        vocabulary: [
            {
                korean: '예약',
                english: 'reservation',
                example_en: 'I made a reservation for two.',
                example_ko: '두 명으로 예약했습니다.',
                question: "What does 'reservation' mean?",
                answer: "It means a booking made in advance.",
                question_ko: "'Reservation'이 무슨 뜻인가요?",
                answer_ko: '사전에 미리 해두는 예약을 뜻합니다.',
                image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80'
            },
            {
                korean: '확인(서)',
                english: 'confirmation',
                example_en: 'I received my booking confirmation by email.',
                example_ko: '이메일로 예약 확인서를 받았습니다.',
                question: 'What is a confirmation number?',
                answer: "It's a unique code to verify your booking.",
                question_ko: '확인 번호(confirmation number)란 무엇인가요?',
                answer_ko: '예약을 증명하는 고유 코드입니다.',
                image: 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=400&q=80'
            },
            {
                korean: '여행 일정표',
                english: 'itinerary',
                example_en: 'Please check your travel itinerary before departure.',
                example_ko: '출발 전 여행 일정표를 확인하세요.',
                question: 'What is an itinerary?',
                answer: "It's a detailed plan of your trip including flights and hotels.",
                question_ko: 'Itinerary란 무엇인가요?',
                answer_ko: '항공편·호텔 등 여행 계획을 상세히 적은 문서입니다.',
                image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80'
            }
        ],
        expressions: [
            {
                korean: '확인 이메일을 받을 수 있을까요?',
                english: 'Can I get a confirmation email?',
                example_en: 'Could you send me a confirmation email for my booking?',
                example_ko: '예약 확인 이메일을 보내주실 수 있나요?',
                question: "I didn't receive a confirmation email. What should I ask?",
                answer: "Ask 'Can I get a confirmation email?'",
                question_ko: '확인 이메일을 못 받았어요. 뭐라고 물어보나요?',
                answer_ko: "'확인 이메일을 받을 수 있을까요?'라고 물어보세요."
            },
            {
                korean: '예약 참조 번호는 ___입니다.',
                english: 'My booking reference number is ___.',
                example_en: 'My booking reference number is ABC123.',
                example_ko: '제 예약 참조 번호는 ABC123입니다.',
                question: 'What should I say when calling the airline?',
                answer: "Say 'My booking reference number is ___.'",
                question_ko: '항공사에 전화할 때 뭐라고 하나요?',
                answer_ko: "'저의 예약 참조 번호는 ___입니다.'라고 말하세요."
            },
            {
                korean: '예약을 확인하고 싶습니다.',
                english: "I'd like to confirm my reservation.",
                example_en: "I'd like to confirm my reservation for flight KE081.",
                example_ko: 'KE081편 예약을 확인하고 싶습니다.',
                question: 'How do you confirm a reservation by phone?',
                answer: "Say 'I'd like to confirm my reservation.' then give your booking number.",
                question_ko: '전화로 예약 확인은 어떻게 하나요?',
                answer_ko: "'예약을 확인하고 싶습니다'라고 하고 예약번호를 알려주세요."
            }
        ],
        qa: [
            {
                question: 'What is the check-in deadline?',
                question_ko: '체크인 마감 시간이 언제인가요?',
                example_en: 'What is the check-in deadline for my flight?',
                example_ko: '제 비행편의 체크인 마감 시간이 언제인가요?',
                answer: 'The check-in deadline is usually 1 hour before departure.',
                answer_ko: '보통 출발 1시간 전까지 체크인해야 합니다.'
            },
            {
                question: 'Can I change my flight date?',
                question_ko: '비행 날짜를 변경할 수 있나요?',
                example_en: 'I need to travel earlier. Can I change my flight date?',
                example_ko: '더 일찍 가야 해요. 비행 날짜를 바꿀 수 있나요?',
                answer: 'Yes, but a change fee may apply depending on your ticket type.',
                answer_ko: '네, 하지만 티켓 종류에 따라 변경 수수료가 발생할 수 있습니다.'
            },
            {
                question: 'Is my booking confirmed?',
                question_ko: '예약이 확정되었나요?',
                example_en: "Excuse me, is my booking confirmed for tomorrow's flight?",
                example_ko: '실례합니다, 내일 비행편 예약이 확정되었나요?',
                answer: 'Yes, your booking is confirmed. Your seat is 24A.',
                answer_ko: '네, 예약이 확정되었습니다. 좌석은 24A입니다.'
            }
        ]
    },
    session2: {
        title: '체크인',
        cultureTip: '온라인 체크인은 출발 24~48시간 전부터 가능합니다. 미리 해두면 공항에서 긴 줄을 서지 않아도 됩니다.',
        vocabulary: [
            {
                korean: '체크인',
                english: 'check-in',
                example_en: 'The check-in counter opens at 6 AM.',
                example_ko: '체크인 카운터는 오전 6시에 열립니다.',
                question: 'Where do I check in?',
                answer: 'You can check in at the counter or online.',
                question_ko: '어디서 체크인하나요?',
                answer_ko: '카운터나 온라인으로 체크인할 수 있습니다.',
                image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80'
            },
            {
                korean: '탑승권',
                english: 'boarding pass',
                example_en: 'Please show your boarding pass at the gate.',
                example_ko: '탑승구에서 탑승권을 제시하세요.',
                question: 'What is a boarding pass?',
                answer: "It's the document that allows you to board the plane.",
                question_ko: '탑승권이란 무엇인가요?',
                answer_ko: '비행기에 탑승할 수 있게 해주는 서류입니다.',
                image: 'https://images.unsplash.com/photo-1559268950-2d7ceb2efa49?w=400&q=80'
            },
            {
                korean: '마일리지 회원',
                english: 'frequent flyer',
                example_en: "I'd like to add my frequent flyer number.",
                example_ko: '마일리지 회원 번호를 추가하고 싶습니다.',
                question: 'What is a frequent flyer program?',
                answer: "It's a loyalty program where you earn points for flying.",
                question_ko: '마일리지 프로그램이란 무엇인가요?',
                answer_ko: '비행 시 포인트를 적립하는 항공사 멤버십 프로그램입니다.',
                image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=400&q=80'
            }
        ],
        expressions: [
            {
                korean: '수하물을 몇 개까지 부칠 수 있나요?',
                english: 'How many bags can I check in?',
                example_en: 'How many bags can I check in with this ticket?',
                example_ko: '이 티켓으로 수하물을 몇 개까지 부칠 수 있나요?',
                question: 'I have two suitcases. What should I ask?',
                answer: "Ask 'How many bags can I check in?'",
                question_ko: '큰 가방이 두 개인데 뭐라고 물어보나요?',
                answer_ko: "'수하물을 몇 개까지 부칠 수 있나요?'라고 물어보세요."
            },
            {
                korean: '제 비행편 체크인을 하고 싶습니다.',
                english: "I'd like to check in for my flight.",
                example_en: "Hello, I'd like to check in for my flight to New York.",
                example_ko: '안녕하세요, 뉴욕행 비행편 체크인을 하고 싶습니다.',
                question: 'What do you say at the check-in counter?',
                answer: "Say 'I'd like to check in for my flight.'",
                question_ko: '체크인 카운터에서 뭐라고 하나요?',
                answer_ko: "'제 비행편 체크인을 하고 싶습니다.'라고 말하세요."
            },
            {
                korean: '창가 좌석으로 주세요.',
                english: 'Window seat, please.',
                example_en: "If possible, I'd like a window seat, please.",
                example_ko: '가능하다면 창가 좌석으로 부탁드립니다.',
                question: 'How do you request a window seat?',
                answer: "Say 'Window seat, please.' or 'Aisle seat, please.'",
                question_ko: '창가 좌석을 어떻게 요청하나요?',
                answer_ko: "'창가 좌석으로 주세요.' 또는 '통로 좌석으로 주세요.'라고 하면 됩니다."
            }
        ],
        qa: [
            {
                question: 'Is my flight on time?',
                question_ko: '제 비행편이 정시 출발인가요?',
                example_en: 'Excuse me, is my flight to London on time?',
                example_ko: '실례합니다, 런던행 비행편이 정시 출발인가요?',
                answer: "Yes, your flight is on time. / No, it's delayed by 30 minutes.",
                answer_ko: '네, 정시 출발 예정입니다. / 아니요, 30분 지연됩니다.'
            },
            {
                question: 'Can I add my frequent flyer number?',
                question_ko: '마일리지 번호를 추가할 수 있나요?',
                example_en: 'Can I add my frequent flyer number to this booking?',
                example_ko: '이 예약에 마일리지 번호를 추가할 수 있나요?',
                answer: 'Yes, please provide your frequent flyer number.',
                answer_ko: '네, 마일리지 회원 번호를 알려주세요.'
            },
            {
                question: 'Can I upgrade to business class?',
                question_ko: '비즈니스 클래스로 업그레이드할 수 있나요?',
                example_en: 'Is it possible to upgrade to business class at check-in?',
                example_ko: '체크인 시 비즈니스 클래스로 업그레이드가 가능한가요?',
                answer: 'Sometimes upgrades are available at the counter for an extra fee.',
                answer_ko: '때때로 추가 요금을 내면 카운터에서 업그레이드가 가능합니다.'
            }
        ]
    }
};

// Toggle Sidebar (Mobile)
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');

    // Add/remove overlay
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.onclick = toggleSidebar;
        document.body.appendChild(overlay);
    }
    overlay.classList.toggle('active');
}

// Toggle Mode Selection (Mobile)
function toggleModeSelection() {
    toggleSidebar();
    // Scroll to mode selection
    setTimeout(() => {
        document.getElementById('modeSelection').scrollIntoView({ behavior: 'smooth' });
    }, 300);
}

// Set Learning Mode
function setLearningMode(mode) {
    learningMode = mode;

    document.querySelectorAll('.mode-select-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

    // Close sidebar on mobile after selection
    if (window.innerWidth <= 1024) {
        toggleSidebar();
    }

    if (mode !== 'auto') {
        startLearning();
        showSection(mode);
    }
}

// Start Learning
function startLearning() {
    document.getElementById('initialScreen').style.display = 'none';

    if (learningMode === 'auto') {
        showSection('vocabulary');
    } else {
        showSection(learningMode);
    }
}

// Play Video
function playVideo() {
    const videoPlayer = document.getElementById('sessionVideo');
    const placeholder = document.getElementById('videoPlaceholder');

    placeholder.style.display = 'none';
    videoPlayer.style.display = 'block';
    videoPlayer.play();

    // When video ends, enable start button
    videoPlayer.onended = function() {
        document.querySelector('.btn-start-learning').style.display = 'block';
        document.querySelector('.btn-skip-video').style.display = 'none';
    };
}

// Skip Video
function skipVideo() {
    startLearning();
}

// Show Section
function showSection(section) {
    currentSection = section;

    document.querySelectorAll('.learning-mode').forEach(mode => {
        mode.style.display = 'none';
    });

    const sectionMap = {
        'vocabulary': 'vocabulary-mode',
        'expressions': 'expressions-mode',
        'ai-conversation': 'ai-conversation-mode'
    };

    document.getElementById(sectionMap[section]).style.display = 'block';

    // Load content based on section
    if (section === 'vocabulary') {
        loadVocabulary();
    } else if (section === 'expressions') {
        loadExpressions();
    }

    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Load Vocabulary
function loadVocabulary() {
    const sessionKey = `session${currentSession}`;
    const sessionData = chapter1Data[sessionKey];

    if (!sessionData) return;

    currentVocabIndex = 0;
    const vocab = sessionData.vocabulary[currentVocabIndex];
    currentVocab = vocab;

    document.getElementById('vocabTotal').textContent = sessionData.vocabulary.length;
    displayVocabulary(vocab);
}

// Display Vocabulary
function displayVocabulary(vocab) {
    document.getElementById('wordKorean').textContent = vocab.korean;
    document.getElementById('wordEnglish').textContent = vocab.english;
    document.getElementById('exampleEn').innerHTML = `
        ${vocab.example_en}
        <button class="tts-inline" onclick="event.stopPropagation(); speakCurrentExample()">🔊</button>
    `;
    document.getElementById('exampleKo').textContent = vocab.example_ko;

    // Show image
    const imgElement = document.getElementById('vocabImage');
    if (vocab.image) {
        imgElement.src = vocab.image;
        imgElement.style.display = 'block';
    } else {
        imgElement.style.display = 'none';
    }

    // Update progress
    document.getElementById('vocabProgress').textContent = currentVocabIndex + 1;

    // Update navigation buttons
    const sessionKey = `session${currentSession}`;
    const sessionData = chapter1Data[sessionKey];
    const isLastVocab = currentVocabIndex >= sessionData.vocabulary.length - 1;

    document.getElementById('btnPrevVocab').disabled = currentVocabIndex === 0;
    document.getElementById('btnNextVocab').disabled = false; // Always enabled

    // Change button text for last vocabulary
    if (isLastVocab) {
        document.getElementById('btnNextVocab').textContent = '완료 →';
    } else {
        document.getElementById('btnNextVocab').textContent = '다음 →';
    }

    // Reset card flip
    document.getElementById('flashcard1').classList.remove('flipped');

    // Reset recording
    userRecording = null;
    document.getElementById('btnPlayRecording').style.display = 'none';
    document.getElementById('comparisonButtons').style.display = 'none';
    document.getElementById('btnRecord').classList.remove('recording');
}

// Next Vocabulary
function nextVocab() {
    const sessionKey = `session${currentSession}`;
    const sessionData = chapter1Data[sessionKey];

    if (!sessionData) return;

    if (currentVocabIndex < sessionData.vocabulary.length - 1) {
        currentVocabIndex++;
        currentVocab = sessionData.vocabulary[currentVocabIndex];
        displayVocabulary(currentVocab);
    } else {
        // All vocabulary completed - move to expressions
        completeVocabulary();
    }
}

// Previous Vocabulary
function prevVocab() {
    if (currentVocabIndex > 0) {
        currentVocabIndex--;
        const sessionKey = `session${currentSession}`;
        currentVocab = chapter1Data[sessionKey].vocabulary[currentVocabIndex];
        displayVocabulary(currentVocab);
    }
}

// Toggle Recording
async function toggleRecording() {
    const btnRecord = document.getElementById('btnRecord');

    if (mediaRecorder && mediaRecorder.state === 'recording') {
        // Stop recording
        mediaRecorder.stop();
        btnRecord.classList.remove('recording');
        btnRecord.querySelector('.record-text').textContent = '내 발음 녹음하기';
    } else {
        // Start recording
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            const audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                userRecording = URL.createObjectURL(audioBlob);

                // Show playback button
                document.getElementById('btnPlayRecording').style.display = 'inline-block';
                document.getElementById('comparisonButtons').style.display = 'flex';

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            btnRecord.classList.add('recording');
            btnRecord.querySelector('.record-text').textContent = '녹음 중... (클릭하여 정지)';
        } catch (error) {
            alert('마이크 접근 권한이 필요합니다.');
            console.error('Recording error:', error);
        }
    }
}

// Play User Recording
function playUserRecording() {
    if (userRecording) {
        const audio = new Audio(userRecording);
        audio.play();
    }
}

// Compare Voices
function compareVoices() {
    if (!currentVocab) return;

    // Play native speaker first
    speakWord(currentVocab.english);

    // Then play user recording after 2 seconds
    setTimeout(() => {
        if (userRecording) {
            playUserRecording();
        }
    }, 2000);
}

// Load Expressions
function loadExpressions() {
    const sessionKey = `session${currentSession}`;
    const sessionData = chapter1Data[sessionKey];

    if (!sessionData) return;

    currentExprIndex = 0;
    const expr = sessionData.expressions[currentExprIndex];
    currentExpr = expr;

    document.getElementById('exprTotal').textContent = sessionData.expressions.length;
    displayExpression(expr);
}

// Display Expression
function displayExpression(expr) {
    // Show both Korean and English at once (no TTS on Korean)
    document.getElementById('sentenceKo').textContent = `"${expr.korean}"`;

    document.getElementById('sentenceEn').innerHTML = `
        ${expr.english}
        <button class="tts-inline" onclick="speakCurrentExpression()">🔊</button>
    `;

    // Update progress
    document.getElementById('exprProgress').textContent = currentExprIndex + 1;

    // Update navigation buttons
    const sessionKey = `session${currentSession}`;
    const sessionData = chapter1Data[sessionKey];
    const isLastExpr = currentExprIndex >= sessionData.expressions.length - 1;

    document.getElementById('btnPrevExpr').disabled = currentExprIndex === 0;
    document.getElementById('btnNextExpr').disabled = false; // Always enabled

    // Change button text for last expression
    if (isLastExpr) {
        document.getElementById('btnNextExpr').textContent = '완료 →';
    } else {
        document.getElementById('btnNextExpr').textContent = '다음 →';
    }
}

// Next Expression
function nextExpr() {
    const sessionKey = `session${currentSession}`;
    const sessionData = chapter1Data[sessionKey];

    if (!sessionData) return;

    if (currentExprIndex < sessionData.expressions.length - 1) {
        currentExprIndex++;
        currentExpr = sessionData.expressions[currentExprIndex];
        displayExpression(currentExpr);
    } else {
        // All expressions completed - move to AI conversation
        completeExpressions();
    }
}

// Previous Expression
function prevExpr() {
    if (currentExprIndex > 0) {
        currentExprIndex--;
        const sessionKey = `session${currentSession}`;
        currentExpr = chapter1Data[sessionKey].expressions[currentExprIndex];
        displayExpression(currentExpr);
    }
}

// Update Progress
function updateProgress() {
    let sessionProgress = 0;

    // Calculate overall session progress based on level progress
    sessionProgress = (levelProgress.level1 + levelProgress.level2 + levelProgress.level3) / 3;

    document.getElementById('sessionProgress').style.width = sessionProgress + '%';

    // Update level progress display
    document.getElementById('level1Progress').textContent = Math.round(levelProgress.level1);
    document.getElementById('level2Progress').textContent = Math.round(levelProgress.level2);
    document.getElementById('level3Progress').textContent = Math.round(levelProgress.level3);
}

// Complete Vocabulary
function completeVocabulary() {
    levelProgress.level1 = 100;
    updateProgress();

    // TODO [백엔드 연동] 진행률 저장
    // const userId = localStorage.getItem('userId');
    // const chapterId = 1; // 현재 챕터 ID
    // fetch(`${API_BASE}/progress`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ userId: parseInt(userId), chapterId, sessionNo: currentSession, stepWord: true })
    // });

    if (learningMode === 'auto') {
        // Hide vocabulary mode
        document.getElementById('vocabulary-mode').style.display = 'none';

        // Show expressions mode after short delay
        setTimeout(() => {
            showSection('expressions');
        }, 300);
    } else {
        alert('단어 학습을 완료했습니다! 🎉');
    }
}

// Complete Expressions
function completeExpressions() {
    levelProgress.level2 = 100;
    updateProgress();

    // TODO [백엔드 연동] 진행률 저장
    // const userId = localStorage.getItem('userId');
    // const chapterId = 1;
    // fetch(`${API_BASE}/progress`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ userId: parseInt(userId), chapterId, sessionNo: currentSession, stepExpr: true })
    // });

    if (learningMode === 'auto') {
        // Hide expressions mode
        document.getElementById('expressions-mode').style.display = 'none';

        // Show AI conversation after short delay
        setTimeout(() => {
            showSection('ai-conversation');
        }, 300);
    } else {
        alert('표현 & 문답 학습을 완료했습니다! 🎉');
    }
}

// Complete Session
function completeSession() {
    levelProgress.level3 = 100;
    sessionCompleted[currentSession] = true;

    // Mark current session as completed
    const currentSessionItem = document.querySelector(`.session-item[data-session="${currentSession}"]`);
    if (currentSessionItem) {
        currentSessionItem.classList.remove('active');
        currentSessionItem.classList.add('completed');
        currentSessionItem.querySelector('.check').textContent = '✓';
    }

    // Hide AI conversation mode
    document.getElementById('ai-conversation-mode').style.display = 'none';

    // Show completion screen
    document.getElementById('sessionCompletion').style.display = 'block';

    // TODO [백엔드 연동] 진행률 저장
    // const userId = localStorage.getItem('userId');
    // const chapterId = 1;
    // fetch(`${API_BASE}/progress`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ userId: parseInt(userId), chapterId, sessionNo: currentSession, stepAi: true })
    // });

    // Update progress
    updateProgress();
}

// Review Session
function reviewSession() {
    // Hide completion screen
    document.getElementById('sessionCompletion').style.display = 'none';

    // Reset progress for review
    levelProgress = { level1: 0, level2: 0, level3: 0 };

    // Show initial screen
    document.getElementById('initialScreen').style.display = 'block';

    updateProgress();
}

// Go to Next Session
function goToNextSession() {
    // Hide completion screen
    document.getElementById('sessionCompletion').style.display = 'none';

    // Move to next session
    currentSession++;

    if (currentSession <= totalSessions) {
        // Update active session in sidebar
        document.querySelectorAll('.session-item').forEach(item => {
            item.classList.remove('active');
        });

        const nextSessionItem = document.querySelector(`.session-item[data-session="${currentSession}"]`);
        if (nextSessionItem) {
            nextSessionItem.classList.add('active');
            nextSessionItem.querySelector('.check').textContent = '▶';
        }

        // Update session title
        const sessionTitles = {
            1: '예약 확인',
            2: '체크인',
            3: '수하물',
            4: '보안검색',
            5: '면세점',
            6: '탑승',
            7: '기내식',
            8: '좌석 조절',
            9: '기내 면세',
            10: '입국서류'
        };

        // Reset for next session
        levelProgress = { level1: 0, level2: 0, level3: 0 };

        // Show initial screen for new session
        document.getElementById('initialScreen').style.display = 'block';

        // Hide all learning modes
        document.querySelectorAll('.learning-mode').forEach(mode => {
            mode.style.display = 'none';
        });

        // Update header
        document.getElementById('sessionTitle').textContent = `Session ${currentSession}: ${sessionTitles[currentSession]}`;

        // Update session intro
        document.querySelector('.session-intro-title').textContent = `Session ${currentSession}: ${sessionTitles[currentSession]}`;

        // Reset progress
        updateProgress();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        alert('🎉 축하합니다!\n\nChapter 1: 출국 및 기내를 모두 완료했습니다!');
    }
}

// Flashcard flip
function flipCard() {
    document.getElementById('flashcard1').classList.toggle('flipped');
}

// Text-to-Speech
function speakWord(word) {
    if ('speechSynthesis' in window && word) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        speechSynthesis.speak(utterance);
    }
}

function speakSentence(sentence) {
    if ('speechSynthesis' in window && sentence) {
        const utterance = new SpeechSynthesisUtterance(sentence);
        utterance.lang = 'en-US';
        speechSynthesis.speak(utterance);
    }
}

// Safe TTS wrapper functions
function speakCurrentWord() {
    if (currentVocab && currentVocab.english) {
        speakWord(currentVocab.english);
    }
}

function speakCurrentExample() {
    if (currentVocab && currentVocab.example_en) {
        speakSentence(currentVocab.example_en);
    }
}

function speakCurrentExpression() {
    if (currentExpr && currentExpr.english) {
        speakSentence(currentExpr.english);
    }
}

// Select Option
function selectOption(button) {
    const isCorrect = button.getAttribute('data-correct') === 'true';

    document.querySelectorAll('.sentence-option').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
    });

    if (isCorrect) {
        button.style.borderColor = '#10b981';
        button.style.background = '#d1fae5';

        setTimeout(() => {
            document.querySelector('#expressions-mode .btn-next-exercise').style.display = 'block';
        }, 500);
    } else {
        button.style.borderColor = '#ef4444';
        button.style.background = '#fee2e2';

        setTimeout(() => {
            document.querySelector('[data-correct="true"]').style.borderColor = '#10b981';
            document.querySelector('[data-correct="true"]').style.background = '#d1fae5';
            document.querySelector('#expressions-mode .btn-next-exercise').style.display = 'block';
        }, 1000);
    }
}

// Use Suggestion
function useSuggestion(button) {
    document.getElementById('chatInput').value = button.textContent;
}

// Send Message
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (message) {
        const chatMessages = document.getElementById('chatMessages');
        const userMessage = document.createElement('div');
        userMessage.className = 'message user-message';
        userMessage.innerHTML = `
            <div class="message-avatar">👤</div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;
        chatMessages.appendChild(userMessage);

        input.value = '';

        // TODO [백엔드 연동] AI 대화 API 호출 ─────────────────
        // 백엔드 완성 후 아래 하드코딩 응답 대신 사용하세요
        //
        // const userId = localStorage.getItem('userId');
        // try {
        //     const res = await fetch(`${API_BASE}/conv`, {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({
        //             userId: parseInt(userId),
        //             chapterId: 1,
        //             sessionNo: currentSession,
        //             message: message,
        //             convSessionId: currentConvSessionId || null
        //         })
        //     });
        //     const data = await res.json();
        //     currentConvSessionId = data.convSessionId;
        //     // data.aiMessage 를 채팅 영역에 표시
        //     // data.feedback 를 피드백 영역에 표시
        // } catch (e) {
        //     console.error('AI 대화 실패:', e);
        // }
        // ──────────────────────────────────────────────────

        // Show feedback (하드코딩 - 백엔드 연동 시 대체)
        setTimeout(() => {
            const feedbackDiv = document.getElementById('userFeedback');
            const feedbackText = document.getElementById('feedbackText');
            const feedbackSuggestion = document.getElementById('feedbackSuggestion');

            feedbackDiv.style.display = 'block';
            feedbackText.innerHTML = '✓ 좋아요! 자연스러운 표현입니다.';
            feedbackSuggestion.innerHTML = `
                <strong>더 나은 표현:</strong>
                <p class="suggestion-text">
                    "Yes, I have a reservation for two people."
                    <button class="tts-inline" onclick="speakSentence('Yes, I have a reservation for two people')">🔊</button>
                </p>
            `;
        }, 500);

        // Simulate AI response (하드코딩 - 백엔드 연동 시 대체)
        setTimeout(() => {
            const aiMessage = document.createElement('div');
            aiMessage.className = 'message ai-message';
            aiMessage.innerHTML = `
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <p>
                        Great! Let me check your reservation.
                        <button class="tts-inline" onclick="speakSentence('Great! Let me check your reservation')">🔊</button>
                    </p>
                    <p class="message-translation">좋습니다! 예약을 확인해드리겠습니다.</p>
                </div>
            `;
            chatMessages.appendChild(aiMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 2000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const travelData = JSON.parse(localStorage.getItem('travelData') || '{}');

    // Destination-specific background images
    const destinationImages = {
        // English destinations
        'usa': 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1920&q=80',
        'uk': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80',
        'australia': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1920&q=80',
        'canada': 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1920&q=80',
        'japan': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=80',
        'china': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1920&q=80',
        'taiwan': 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=1920&q=80',
        'singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1920&q=80',
        'spain': 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1920&q=80',
        'mexico': 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1920&q=80',
        'argentina': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1920&q=80',
        'france': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80',
        'belgium': 'https://images.unsplash.com/photo-1559564484-e48bf5f6b6d3?w=1920&q=80',
        'switzerland': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
        'default': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80'
    };

    // Get destination from travel data
    const destination = travelData.destination || 'default';
    const bgImage = destinationImages[destination] || destinationImages['default'];

    // Set header background
    const header = document.querySelector('.learning-header');
    header.style.background = `
        linear-gradient(135deg, rgba(102, 126, 234, 0.85) 0%, rgba(118, 75, 162, 0.85) 100%),
        url('${bgImage}') center/cover
    `;

    // Set body background
    document.body.style.background = `
        linear-gradient(135deg, rgba(247, 249, 252, 0.95) 0%, rgba(237, 242, 247, 0.95) 100%),
        url('${bgImage}') center/cover fixed
    `;

    if (travelData.arrivalDate) {
        const arrival = new Date(travelData.arrivalDate);
        const today = new Date();
        const daysUntil = Math.ceil((arrival - today) / (1000 * 60 * 60 * 24));

        if (daysUntil > 0) {
            document.querySelector('.countdown-days').textContent = daysUntil + '일 남음';
            document.querySelector('.countdown-date').textContent =
                arrival.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) + ' 출발';

            // Add days left inline next to chapter/session
            const daysLeftInline = document.getElementById('daysLeftInline');
            if (daysLeftInline) {
                daysLeftInline.textContent = `(${daysUntil}일 남음)`;
            }
        }
    }

    // Initialize progress
    updateProgress();
});
