-- ============================================
-- Travelingo - Chapter 1 샘플 데이터
-- 캠퍼스 MySQL 서버용 (project-db-campus.smhrd.com:3307)
-- DB: campus_24KDT_LI8_p2_3
-- 실행방법: MySQL Workbench에서 캠퍼스 서버 접속 후
--          File → Open → 이 파일 → 번개버튼
-- ============================================

-- 먼저 schema.sql을 실행한 후 이 파일을 실행하세요!

-- ── Chapter 1: 출국 및 기내 ──────────────────
INSERT INTO chapter (language, category, chapter_no, title, persona_setting, total_sessions) VALUES
('english', '공항', 1, '출국 및 기내',
 '당신은 인천국제공항 대한항공 체크인 카운터 직원입니다. 영어로 친절하게 응대하고, 사용자가 틀린 표현을 쓰면 자연스럽게 올바른 표현으로 교정해주세요.', 10);

-- chapter 테이블의 auto_increment ID가 1이라고 가정
SET @ch1 = LAST_INSERT_ID();

-- ── Session 1: 예약 확인 ─────────────────────

-- 단어 (WORD)
INSERT INTO learning_content (chapter_id, session_no, session_name, type, priority, content_en, content_ko, example_en, example_ko, qna_q_en, qna_a_en, qna_q_ko, qna_a_ko) VALUES
(@ch1, 1, '예약 확인', 'WORD', 1,
 'reservation', '예약',
 'I made a reservation for two.', '두 명으로 예약했습니다.',
 'What does reservation mean?', 'It means a booking made in advance.',
 'Reservation이 무슨 뜻인가요?', '사전에 미리 해두는 예약을 뜻합니다.'),

(@ch1, 1, '예약 확인', 'WORD', 1,
 'confirmation', '확인(서)',
 'I received my booking confirmation by email.', '이메일로 예약 확인서를 받았습니다.',
 'What is a confirmation number?', 'It is a unique code to verify your booking.',
 '확인 번호(confirmation number)란 무엇인가요?', '예약을 증명하는 고유 코드입니다.'),

(@ch1, 1, '예약 확인', 'WORD', 1,
 'itinerary', '여행 일정표',
 'Please check your travel itinerary before departure.', '출발 전 여행 일정표를 확인하세요.',
 'What is an itinerary?', 'It is a detailed plan of your trip including flights and hotels.',
 'Itinerary란 무엇인가요?', '항공편·호텔 등 여행 계획을 상세히 적은 문서입니다.');

-- 표현 (EXPRESSION)
INSERT INTO learning_content (chapter_id, session_no, session_name, type, priority, content_en, content_ko, example_en, example_ko, qna_q_en, qna_a_en, qna_q_ko, qna_a_ko) VALUES
(@ch1, 1, '예약 확인', 'EXPRESSION', 1,
 'Can I get a confirmation email?', '확인 이메일을 받을 수 있을까요?',
 'Could you send me a confirmation email for my booking?', '예약 확인 이메일을 보내주실 수 있나요?',
 'I didn''t receive a confirmation email. What should I ask?', 'Ask Can I get a confirmation email?',
 '확인 이메일을 못 받았어요. 뭐라고 물어보나요?', '확인 이메일을 받을 수 있을까요?라고 물어보세요.'),

(@ch1, 1, '예약 확인', 'EXPRESSION', 1,
 'My booking reference number is ___.', '예약 참조 번호는 ___입니다.',
 'My booking reference number is ABC123.', '제 예약 참조 번호는 ABC123입니다.',
 'What should I say when calling the airline?', 'Say My booking reference number is ___.',
 '항공사에 전화할 때 뭐라고 하나요?', '저의 예약 참조 번호는 ___입니다.라고 말하세요.'),

(@ch1, 1, '예약 확인', 'EXPRESSION', 1,
 'I''d like to confirm my reservation.', '예약을 확인하고 싶습니다.',
 'I''d like to confirm my reservation for flight KE081.', 'KE081편 예약을 확인하고 싶습니다.',
 'How do you confirm a reservation by phone?', 'Say I''d like to confirm my reservation then give your booking number.',
 '전화로 예약 확인은 어떻게 하나요?', '예약을 확인하고 싶습니다라고 하고 예약번호를 알려주세요.');

-- 문답 (QNA)
INSERT INTO learning_content (chapter_id, session_no, session_name, type, priority, content_en, content_ko, example_en, example_ko, qna_q_en, qna_a_en, qna_q_ko, qna_a_ko) VALUES
(@ch1, 1, '예약 확인', 'QNA', 2,
 'What is the check-in deadline?', '체크인 마감 시간이 언제인가요?',
 'What is the check-in deadline for my flight?', '제 비행편의 체크인 마감 시간이 언제인가요?',
 'What is the check-in deadline?', 'The check-in deadline is usually 1 hour before departure.',
 '체크인 마감 시간이 언제인가요?', '보통 출발 1시간 전까지 체크인해야 합니다.'),

(@ch1, 1, '예약 확인', 'QNA', 2,
 'Can I change my flight date?', '비행 날짜를 변경할 수 있나요?',
 'I need to travel earlier. Can I change my flight date?', '더 일찍 가야 해요. 비행 날짜를 바꿀 수 있나요?',
 'Can I change my flight date?', 'Yes, but a change fee may apply depending on your ticket type.',
 '비행 날짜를 변경할 수 있나요?', '네, 하지만 티켓 종류에 따라 변경 수수료가 발생할 수 있습니다.'),

(@ch1, 1, '예약 확인', 'QNA', 2,
 'Is my booking confirmed?', '예약이 확정되었나요?',
 'Excuse me, is my booking confirmed for tomorrow''s flight?', '실례합니다, 내일 비행편 예약이 확정되었나요?',
 'Is my booking confirmed?', 'Yes, your booking is confirmed. Your seat is 24A.',
 '예약이 확정되었나요?', '네, 예약이 확정되었습니다. 좌석은 24A입니다.');

-- ── Session 1: 문화 팁 ──────────────────────
INSERT INTO culture_tip (chapter_id, session_no, tip_ko, tip_en) VALUES
(@ch1, 1,
 '예약 확인 시 PNR(예약번호)을 항상 준비하세요. 미국·유럽 항공사는 전화보다 앱·웹 셀프 체크인을 선호합니다.',
 'Always have your PNR (booking reference) ready. US and European airlines prefer app/web self check-in over phone calls.');

-- ── Session 2: 체크인 ───────────────────────

-- 단어
INSERT INTO learning_content (chapter_id, session_no, session_name, type, priority, content_en, content_ko, example_en, example_ko, qna_q_en, qna_a_en, qna_q_ko, qna_a_ko) VALUES
(@ch1, 2, '체크인', 'WORD', 1,
 'check-in', '체크인',
 'The check-in counter opens at 6 AM.', '체크인 카운터는 오전 6시에 열립니다.',
 'Where do I check in?', 'You can check in at the counter or online.',
 '어디서 체크인하나요?', '카운터나 온라인으로 체크인할 수 있습니다.'),

(@ch1, 2, '체크인', 'WORD', 1,
 'boarding pass', '탑승권',
 'Please show your boarding pass at the gate.', '탑승구에서 탑승권을 제시하세요.',
 'What is a boarding pass?', 'It is the document that allows you to board the plane.',
 '탑승권이란 무엇인가요?', '비행기에 탑승할 수 있게 해주는 서류입니다.'),

(@ch1, 2, '체크인', 'WORD', 1,
 'frequent flyer', '마일리지 회원',
 'I''d like to add my frequent flyer number.', '마일리지 회원 번호를 추가하고 싶습니다.',
 'What is a frequent flyer program?', 'It is a loyalty program where you earn points for flying.',
 '마일리지 프로그램이란 무엇인가요?', '비행 시 포인트를 적립하는 항공사 멤버십 프로그램입니다.');

-- 표현
INSERT INTO learning_content (chapter_id, session_no, session_name, type, priority, content_en, content_ko, example_en, example_ko, qna_q_en, qna_a_en, qna_q_ko, qna_a_ko) VALUES
(@ch1, 2, '체크인', 'EXPRESSION', 1,
 'How many bags can I check in?', '수하물을 몇 개까지 부칠 수 있나요?',
 'How many bags can I check in with this ticket?', '이 티켓으로 수하물을 몇 개까지 부칠 수 있나요?',
 'I have two suitcases. What should I ask?', 'Ask How many bags can I check in?',
 '큰 가방이 두 개인데 뭐라고 물어보나요?', '수하물을 몇 개까지 부칠 수 있나요?라고 물어보세요.'),

(@ch1, 2, '체크인', 'EXPRESSION', 1,
 'I''d like to check in for my flight.', '제 비행편 체크인을 하고 싶습니다.',
 'Hello, I''d like to check in for my flight to New York.', '안녕하세요, 뉴욕행 비행편 체크인을 하고 싶습니다.',
 'What do you say at the check-in counter?', 'Say I''d like to check in for my flight.',
 '체크인 카운터에서 뭐라고 하나요?', '제 비행편 체크인을 하고 싶습니다.라고 말하세요.'),

(@ch1, 2, '체크인', 'EXPRESSION', 1,
 'Window seat, please.', '창가 좌석으로 주세요.',
 'If possible, I''d like a window seat, please.', '가능하다면 창가 좌석으로 부탁드립니다.',
 'How do you request a window seat?', 'Say Window seat, please or Aisle seat, please.',
 '창가 좌석을 어떻게 요청하나요?', '창가 좌석으로 주세요. 또는 통로 좌석으로 주세요.라고 하면 됩니다.');

-- 문답
INSERT INTO learning_content (chapter_id, session_no, session_name, type, priority, content_en, content_ko, example_en, example_ko, qna_q_en, qna_a_en, qna_q_ko, qna_a_ko) VALUES
(@ch1, 2, '체크인', 'QNA', 2,
 'Is my flight on time?', '제 비행편이 정시 출발인가요?',
 'Excuse me, is my flight to London on time?', '실례합니다, 런던행 비행편이 정시 출발인가요?',
 'Is my flight on time?', 'Yes, your flight is on time. / No, it is delayed by 30 minutes.',
 '제 비행편이 정시 출발인가요?', '네, 정시 출발 예정입니다. / 아니요, 30분 지연됩니다.'),

(@ch1, 2, '체크인', 'QNA', 2,
 'Can I add my frequent flyer number?', '마일리지 번호를 추가할 수 있나요?',
 'Can I add my frequent flyer number to this booking?', '이 예약에 마일리지 번호를 추가할 수 있나요?',
 'Can I add my frequent flyer number?', 'Yes, please provide your frequent flyer number.',
 '마일리지 번호를 추가할 수 있나요?', '네, 마일리지 회원 번호를 알려주세요.'),

(@ch1, 2, '체크인', 'QNA', 2,
 'Can I upgrade to business class?', '비즈니스 클래스로 업그레이드할 수 있나요?',
 'Is it possible to upgrade to business class at check-in?', '체크인 시 비즈니스 클래스로 업그레이드가 가능한가요?',
 'Can I upgrade to business class?', 'Sometimes upgrades are available at the counter for an extra fee.',
 '비즈니스 클래스로 업그레이드할 수 있나요?', '때때로 추가 요금을 내면 카운터에서 업그레이드가 가능합니다.');

-- Session 2 문화 팁
INSERT INTO culture_tip (chapter_id, session_no, tip_ko, tip_en) VALUES
(@ch1, 2,
 '온라인 체크인은 출발 24~48시간 전부터 가능합니다. 미리 해두면 공항에서 긴 줄을 서지 않아도 됩니다.',
 'Online check-in opens 24-48 hours before departure. Doing it early saves you from long airport lines.');

-- ============================================
-- 확인: SELECT COUNT(*) FROM learning_content WHERE chapter_id = @ch1;
-- 예상 결과: 18 (Session 1: 9개 + Session 2: 9개)
-- ============================================
