// API 기본 URL
const API_BASE = 'http://localhost:8080/api';

// 여행 목적지 데이터: 언어별로 다양한 목적지 제공
const destinations = {
    english: [
        { name: '🇺🇸 뉴욕', value: 'new-york' },
        { name: '🇬🇧 런던', value: 'london' },
        { name: '🇦🇺 시드니', value: 'sydney' },
        { name: '🇨🇦 토론토', value: 'toronto' },
        { name: '🇮🇪 더블린', value: 'dublin' }
    ],
    japanese: [
        { name: '🗾 도쿄', value: 'tokyo' },
        { name: '🗾 오사카', value: 'osaka' },
        { name: '🗾 교토', value: 'kyoto' },
        { name: '🗾 후쿠오카', value: 'fukuoka' }
    ],
    chinese: [
        { name: '🇨🇳 베이징', value: 'beijing' },
        { name: '🇨🇳 상하이', value: 'shanghai' },
        { name: '🇨🇳 광저우', value: 'guangzhou' },
        { name: '🇨🇳 시안', value: 'xian' }
    ],
    spanish: [
        { name: '🇪🇸 마드리드', value: 'madrid' },
        { name: '🇪🇸 바르셀로나', value: 'barcelona' },
        { name: '🇲🇽 멕시코시티', value: 'mexico-city' },
        { name: '🇦🇷 부에노스아이레스', value: 'buenos-aires' }
    ],
    french: [
        { name: '🇫🇷 파리', value: 'paris' },
        { name: '🇫🇷 리옹', value: 'lyon' },
        { name: '🇫🇷 마르세유', value: 'marseille' },
        { name: '🇧🇪 브뤼셀', value: 'brussels' }
    ]
};

// 배경 이미지 맵: 목적지별 배경색/이미지 설정
const backgroundMap = {
    'new-york': '#FF6B6B',
    'london': '#4ECDC4',
    'sydney': '#FFE66D',
    'tokyo': '#FF6B9D',
    'beijing': '#C96B6B',
    'madrid': '#FFB84D',
    'paris': '#8E7DCC'
};

/**
 * 페이지 로드 완료 시 초기화 함수
 * 폼 이벤트 리스너를 등록하고 기본값을 설정
 */
document.addEventListener('DOMContentLoaded', function() {
    // 언어 선택 이벤트 리스너 등록
    document.getElementById('language').addEventListener('change', function() {
        updateDestinations(this.value);
        updateBackground();
    });

    // 목적지 선택 이벤트 리스너 등록
    document.getElementById('destination').addEventListener('change', function() {
        updateBackground();
    });

    // 항공권 업로드 영역 이벤트 설정
    const ticketUpload = document.getElementById('ticketUpload');
    const ticketFile = document.getElementById('ticketFile');

    // 드래그 앤 드롭 지원
    ticketUpload.addEventListener('dragover', function(e) {
        e.preventDefault();
        ticketUpload.style.backgroundColor = '#f0f0f0';
    });

    ticketUpload.addEventListener('dragleave', function() {
        ticketUpload.style.backgroundColor = 'transparent';
    });

    ticketUpload.addEventListener('drop', function(e) {
        e.preventDefault();
        ticketUpload.style.backgroundColor = 'transparent';
        handleFileUpload(e.dataTransfer.files);
    });

    // 클릭으로 파일 선택
    ticketUpload.addEventListener('click', function() {
        ticketFile.click();
    });

    ticketFile.addEventListener('change', function(e) {
        handleFileUpload(e.target.files);
    });
});

/**
 * 선택된 언어에 따라 목적지 목록 업데이트하는 함수
 * 언어 선택이 변경되면 해당 언어의 목적지들을 드롭다운에 표시
 */
function updateDestinations(language) {
    // 선택된 언어 값 가져오기
    const destinationSelect = document.getElementById('destination');

    
    
    destinationSelect.innerHTML = '';

    if (language && destinations[language]) {
        // 선택된 언어의 목적지들로 옵션 추가
        destinations[language].forEach(dest => {
            const option = document.createElement('option');
            option.value = dest.value;
            option.textContent = dest.name;
            destinationSelect.appendChild(option);
        });
        destinationSelect.disabled = false;
    } else {
        // 언어가 선택되지 않으면 드롭다운 비활성화
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '먼저 언어를 선택하세요...';
        destinationSelect.appendChild(option);
        destinationSelect.disabled = true;
    }
}

/**
 * 선택된 목적지에 따라 배경 업데이트하는 함수
 * 목적지별로 서로 다른 배경색을 적용하여 시각적 피드백 제공
 */
function updateBackground() {
    // 선택된 목적지 값 가져오기
    const destination = document.getElementById('destination').value;
    const body = document.querySelector('body');

    // 배경색 적용 (기본값은 검은색 그래디언트)
    if (destination && backgroundMap[destination]) {
        body.style.background = backgroundMap[destination];
        body.setAttribute('data-destination', destination);
    } else {
        body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        body.setAttribute('data-destination', 'default');
    }
}

/**
 * 파일 업로드 처리 함수
 * 항공권 이미지 파일을 받아 미리보기 표시
 * @param {FileList} files - 선택된 파일 목록
 */
function handleFileUpload(files) {
    // 파일이 선택되지 않으면 종료
    if (files.length === 0) return;

    const file = files[0];
    const preview = document.getElementById('ticketPreview');

    // 이미지 파일 확인
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();

        // 파일 읽기 완료 후 미리보기 표시
        reader.onload = function(e) {
            preview.innerHTML = `
                <img src="${e.target.result}" alt="항공권 미리보기">
                <button type="button" onclick="removeTicket()">제거</button>
            `;
        };

        reader.readAsDataURL(file);
    } else {
        alert('이미지 파일만 업로드 가능합니다.');
    }
}

/**
 * 업로드된 파일 제거 함수
 * 항공권 미리보기를 초기 상태로 돌림
 */
function removeTicket() {
    document.getElementById('ticketPreview').innerHTML = '';
    document.getElementById('ticketFile').value = '';
}

/**
 * 다음 단계로 이동하는 함수
 * 현재 단계의 폼 유효성을 확인하고 다음 단계 표시
 */
function nextStep() {
    // 첫 번째 단계의 폼 유효성 확인
    const form = document.getElementById('travelForm');
    if (!form.checkValidity()) {
        alert('모든 필수 항목을 입력해주세요.');
        return;
    }

    // 현재 활성 단계 숨기기
    document.querySelector('.step-content.active').classList.remove('active');
    document.querySelector('.progress-step.active').classList.remove('active');

    // 다음 단계 표시
    document.getElementById('step2').classList.add('active');
    document.querySelector('[data-step="2"]').classList.add('active');

    // 출발 날짜로부터 남은 일수 계산
    const arrivalDate = new Date(document.getElementById('arrivalDate').value);
    const today = new Date();
    const daysUntilTravel = Math.ceil((arrivalDate - today) / (1000 * 60 * 60 * 24));

}

/**
 * 이전 단계로 이동하는 함수
 * 현재 단계에서 이전 단계로 돌아감
 */
function prevStep() {
    // 현재 활성 단계와 진행바 업데이트
    const currentStep = document.querySelector('.step-content.active');
    const currentStepNum = parseInt(currentStep.id.replace('step', ''));

    // 하나 이전 단계로 이동
    if (currentStepNum > 1) {
        currentStep.classList.remove('active');
        document.querySelector(`[data-step="${currentStepNum}"]`).classList.remove('active');

        const prevStepNum = currentStepNum - 1;
        document.getElementById(`step${prevStepNum}`).classList.add('active');
        document.querySelector(`[data-step="${prevStepNum}"]`).classList.add('active');
    }
}

/**
 * 학습 레벨 선택 함수
 * 사용자가 선택한 레벨을 하이라이트하고 다음 단계로 진행
 * @param {number} level - 선택된 레벨 (1, 2, 3)
 */
function selectLevel(level) {
    // 모든 레벨 카드의 활성 상태 제거
    document.querySelectorAll('.level-card').forEach(card => {
        card.classList.remove('selected');
    });

    // 선택된 레벨 카드에 활성 상태 추가
    document.querySelector(`[data-level="${level}"]`).classList.add('selected');

    // 선택된 레벨을 저장
    window.selectedLevel = level;

    // 잠시 후 다음 단계로 자동 이동
    setTimeout(() => {
        document.querySelector('.step-content.active').classList.remove('active');
        document.querySelector('.progress-step.active').classList.remove('active');

        document.getElementById('step3').classList.add('active');
        document.querySelector('[data-step="3"]').classList.add('active');

        // 카운트다운 업데이트
        const arrivalDate = new Date(document.getElementById('arrivalDate').value);
        const today = new Date();
        const daysUntilTravel = Math.ceil((arrivalDate - today) / (1000 * 60 * 60 * 24));
        
        document.getElementById('daysUntilTravel').textContent = Math.max(0, daysUntilTravel);
    }, 300);
}

/**
 * 학습 일정 선택 함수
 * 사용자가 선택한 주간 학습 시간을 표시
 * @param {number} hours - 주간 학습 시간 (3, 5, 7)
 */
function selectSchedule(hours) {
    // 모든 일정 카드의 활성 상태 제거
    document.querySelectorAll('.schedule-card').forEach(card => {
        card.classList.remove('active');
    });

    // 선택된 일정 카드에 활성 상태 추가
    document.querySelector(`[onclick="selectSchedule(${hours})"]`).classList.add('active');

    // 선택된 일정을 저장
    window.selectedSchedule = hours;
}

/**
 * 학습 시작 함수 (비동기)
 * 수집된 모든 정보를 백엔드에 전송하여 여행 설정을 저장하고
 * learning.html로 이동하여 학습 시작
 */
async function startLearning() {
    // 필수 정보 확인
    if (!window.selectedLevel) {
        alert('학습 레벨을 선택해주세요.');
        return;
    }

    // 폼에서 여행 정보 가져오기
    const language = document.getElementById('language').value;
    const destination = document.getElementById('destination').value;
    const arrivalDate = document.getElementById('arrivalDate').value;

    // localStorage에서 userId 가져오기
    const userId = localStorage.getItem('userId');

    if (!userId) {
        // userId가 없으면 로그인 페이지로 이동
        alert('먼저 로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }

    try {
        // POST /api/trips 요청으로 여행 설정 저장
        const response = await fetch(`${API_BASE}/trips`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: parseInt(userId),
                destination: destination,
                dDay: arrivalDate,
                language: language,
                userLevel: window.selectedLevel
            })
        });

        // JSON 응답 파싱
        const data = await response.json();

        if (response.ok && data.tripId) {
            // 성공: 여행 정보를 localStorage에 저장
            localStorage.setItem('tripId', data.tripId);
            localStorage.setItem('destination', destination);
            localStorage.setItem('dDay', arrivalDate);
            localStorage.setItem('language', language);
            localStorage.setItem('userLevel', window.selectedLevel);

            // 학습 페이지로 이동
            window.location.href = 'learning.html';
        } else {
            // 백엔드 응답에서 에러 메시지 표시 (error 또는 message 필드)
            alert(`여행 설정 실패: ${data.error || data.message || '알 수 없는 오류'}`);
        }
    } catch (error) {
        // 네트워크 오류 처리
        console.error('여행 설정 중 오류:', error);

        // 폴백: localStorage에 정보 저장 후 학습 페이지로 이동
        localStorage.setItem('tripId', 'trip-' + Date.now());
        localStorage.setItem('destination', destination);
        localStorage.setItem('dDay', arrivalDate);
        localStorage.setItem('language', language);
        localStorage.setItem('userLevel', window.selectedLevel);

        alert('네트워크 오류가 발생했습니다. 테스트 모드로 진행합니다.');
        window.location.href = 'learning.html';
    }
}
