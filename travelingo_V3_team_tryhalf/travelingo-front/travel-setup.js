// ── API 서버 주소 (백엔드 Spring Boot) ──
const API_BASE = 'http://localhost:8080/api';

let currentStep = 1;
let selectedLevel = null;
let travelData = {};

// Country and City Data
const destinationData = {
    english: {
        name: '영어',
        countries: [
            { value: 'usa', name: '미국 (USA)', cities: ['뉴욕', '로스앤젤레스', '샌프란시스코', '시카고', '라스베이거스', '마이애미'] },
            { value: 'uk', name: '영국 (UK)', cities: ['런던', '맨체스터', '에든버러', '리버풀', '옥스퍼드'] },
            { value: 'australia', name: '호주 (Australia)', cities: ['시드니', '멜버른', '브리즈번', '퍼스', '골드코스트'] },
            { value: 'canada', name: '캐나다 (Canada)', cities: ['토론토', '밴쿠버', '몬트리올', '캘거리', '오타와'] }
        ]
    },
    japanese: {
        name: '일본어',
        countries: [
            { value: 'japan', name: '일본 (Japan)', cities: ['도쿄', '오사카', '교토', '후쿠오카', '삿포로', '나고야', '오키나와'] }
        ]
    },
    chinese: {
        name: '중국어',
        countries: [
            { value: 'china', name: '중국 (China)', cities: ['베이징', '상하이', '광저우', '선전', '청두', '항저우'] },
            { value: 'taiwan', name: '대만 (Taiwan)', cities: ['타이베이', '가오슝', '타이중', '타이난'] },
            { value: 'singapore', name: '싱가포르 (Singapore)', cities: ['싱가포르'] }
        ]
    },
    spanish: {
        name: '스페인어',
        countries: [
            { value: 'spain', name: '스페인 (Spain)', cities: ['마드리드', '바르셀로나', '세비야', '발렌시아', '그라나다'] },
            { value: 'mexico', name: '멕시코 (Mexico)', cities: ['멕시코시티', '칸쿤', '과달라하라', '몬테레이'] },
            { value: 'argentina', name: '아르헨티나 (Argentina)', cities: ['부에노스아이레스', '코르도바', '멘도사'] }
        ]
    },
    french: {
        name: '프랑스어',
        countries: [
            { value: 'france', name: '프랑스 (France)', cities: ['파리', '리옹', '마르세유', '니스', '보르도', '스트라스부르'] },
            { value: 'belgium', name: '벨기에 (Belgium)', cities: ['브뤼셀', '앤트워프', '브뤼헤'] },
            { value: 'switzerland', name: '스위스 (Switzerland)', cities: ['제네바', '로잔', '취리히'] }
        ]
    }
};

// Language selection handler
document.getElementById('language')?.addEventListener('change', function() {
    const language = this.value;
    const destinationSelect = document.getElementById('destination');

    if (!language) {
        destinationSelect.innerHTML = '<option value="">먼저 언어를 선택하세요...</option>';
        return;
    }

    const data = destinationData[language];
    let options = '<option value="">국가/도시를 선택하세요...</option>';

    data.countries.forEach(country => {
        options += `<optgroup label="${country.name}">`;
        country.cities.forEach(city => {
            options += `<option value="${country.value}" data-city="${city}">${city}</option>`;
        });
        options += '</optgroup>';
    });

    destinationSelect.innerHTML = options;
});

// Destination change handler - Update background
document.getElementById('destination')?.addEventListener('change', function() {
    const destination = this.value;
    if (destination) {
        document.body.setAttribute('data-destination', destination);
    }
});

// Next step function
function nextStep() {
    if (!validateCurrentStep()) {
        return;
    }

    // Save data from step 1
    if (currentStep === 1) {
        const language = document.getElementById('language').value;
        const destination = document.getElementById('destination');
        const selectedOption = destination.options[destination.selectedIndex];

        travelData = {
            language: language,
            languageName: document.getElementById('language').options[document.getElementById('language').selectedIndex].text,
            destination: destination.value,
            city: selectedOption.getAttribute('data-city'),
            arrivalDate: document.getElementById('arrivalDate').value,
            departureDate: document.getElementById('departureDate').value,
            userName: document.getElementById('userName').value,
            userEmail: document.getElementById('userEmail').value
        };

        console.log('Travel Data:', travelData);
    }

    goToStep(currentStep + 1);
}

// Previous step function
function prevStep() {
    goToStep(currentStep - 1);
}

// Go to specific step
function goToStep(step) {
    if (step < 1 || step > 3) return;

    // Hide all steps
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });

    // Show target step
    document.getElementById('step' + step).classList.add('active');

    // Update progress bar
    document.querySelectorAll('.progress-step').forEach(progressStep => {
        const stepNum = parseInt(progressStep.dataset.step);
        if (stepNum <= step) {
            progressStep.classList.add('active');
        } else {
            progressStep.classList.remove('active');
        }
    });

    currentStep = step;

    // If going to step 3, calculate plan
    if (step === 3) {
        calculatePlan();
    }

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Validate current step
function validateCurrentStep() {
    if (currentStep === 1) {
        const language = document.getElementById('language').value;
        const destination = document.getElementById('destination').value;
        const arrivalDate = document.getElementById('arrivalDate').value;
        const userName = document.getElementById('userName').value;
        const userEmail = document.getElementById('userEmail').value;

        if (!language) {
            alert('학습할 언어를 선택해주세요.');
            return false;
        }

        if (!destination) {
            alert('목적지를 선택해주세요.');
            return false;
        }

        if (!arrivalDate) {
            alert('출발 날짜를 입력해주세요.');
            return false;
        }

        if (!userName) {
            alert('이름을 입력해주세요.');
            return false;
        }

        if (!userEmail) {
            alert('이메일을 입력해주세요.');
            return false;
        }

        return true;
    }

    if (currentStep === 2) {
        if (!selectedLevel) {
            alert('레벨을 선택해주세요.');
            return false;
        }
        return true;
    }

    return true;
}

// Select level
function selectLevel(level) {
    selectedLevel = level;

    // Remove active class from all cards
    document.querySelectorAll('.level-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Highlight selected card
    const selectedCard = document.querySelector(`.level-card[data-level="${level}"]`);
    selectedCard.classList.add('selected');

    // Auto advance to next step after short delay
    setTimeout(() => {
        nextStep();
    }, 800);
}

// Calculate plan
function calculatePlan() {
    // Calculate days until travel
    const arrival = new Date(travelData.arrivalDate);
    const today = new Date();
    const daysUntil = Math.ceil((arrival - today) / (1000 * 60 * 60 * 24));

    document.getElementById('daysUntilTravel').textContent = daysUntil > 0 ? daysUntil : 0;

    // Set plan details based on level
    const planDetails = {
        1: { chapters: 8, sessions: 32, words: '500+' },
        2: { chapters: 12, sessions: 48, words: '1000+' },
        3: { chapters: 16, sessions: 64, words: '2000+' }
    };

    const plan = planDetails[selectedLevel] || planDetails[1];

    document.getElementById('totalChapters').textContent = plan.chapters;
    document.getElementById('totalSessions').textContent = plan.sessions;
    document.getElementById('totalWords').textContent = plan.words;
}

// Select schedule
function selectSchedule(hours) {
    document.querySelectorAll('.schedule-card').forEach(card => {
        card.classList.remove('active');
    });

    event.target.closest('.schedule-card').classList.add('active');
}

// Start learning
function startLearning() {
    // Save all data
    const finalData = {
        ...travelData,
        level: selectedLevel,
        schedule: document.querySelector('.schedule-card.active')?.querySelector('.schedule-hours')?.textContent || '주 5시간'
    };

    localStorage.setItem('travelData', JSON.stringify(finalData));

    // TODO [백엔드 연동] ─────────────────────────────────
    // 백엔드 완성 후 아래 코드를 추가하세요 (localStorage 저장은 유지)
    //
    // const userId = localStorage.getItem('userId');
    // if (userId) {
    //     try {
    //         const res = await fetch(`${API_BASE}/trips`, {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({
    //                 userId: parseInt(userId),
    //                 destination: travelData.city + ', ' + travelData.destination,
    //                 dDay: travelData.arrivalDate,
    //                 language: travelData.language,
    //                 userLevel: selectedLevel
    //             })
    //         });
    //         const data = await res.json();
    //         if (res.ok) {
    //             localStorage.setItem('tripId', data.tripId);
    //         }
    //     } catch (e) {
    //         console.error('여행 저장 실패:', e);
    //     }
    // }
    // ──────────────────────────────────────────────────

    alert(`${travelData.userName}님, 학습을 시작합니다! 🚀\n목적지: ${travelData.city}\n레벨: ${selectedLevel}`);
    window.location.href = 'learning.html';
}

// Ticket upload
document.getElementById('ticketUpload')?.addEventListener('click', function() {
    document.getElementById('ticketFile').click();
});

document.getElementById('ticketFile')?.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function(event) {
            const preview = document.getElementById('ticketPreview');
            if (file.type.startsWith('image/')) {
                preview.innerHTML = `<img src="${event.target.result}" alt="Ticket" style="max-width: 300px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">`;
            } else {
                preview.innerHTML = `<p style="color: #10b981; font-weight: 600;">✓ 업로드됨: ${file.name}</p>`;
            }
        };

        reader.readAsDataURL(file);
    }
});

// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
document.getElementById('arrivalDate').min = today;
document.getElementById('departureDate').min = today;

// Prevent form submission
document.getElementById('travelForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    nextStep();
});
