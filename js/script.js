document.addEventListener('DOMContentLoaded', () => {

  const overlayLeft  = document.getElementById('overlay-left');
  const overlayRight = document.getElementById('overlay-right');
  const yearEl       = document.getElementById('year-text');
  const logoIcon     = document.getElementById('logo-icon');
  const engTxt       = document.getElementById('eng-txt');

  const timers = [];
  let loopTimer = null;

  function addTimer(fn, delay) {
    timers.push(setTimeout(fn, delay));
  }

  function clearAllTimers() {
    timers.forEach(t => clearTimeout(t));
    timers.length = 0;
    clearTimeout(loopTimer);
  }

  function countLinear(from, to, duration, el) {
    let startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      el.textContent = Math.floor(progress * (to - from) + from) + '년 3월.';
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // 오버레이 초기화 (20% 지점으로 리셋)
  function resetOverlays() {
    overlayLeft.style.transition  = 'none';
    overlayRight.style.transition = 'none';
    overlayLeft.style.clipPath    = 'inset(0 80% 0 20%)'; // 20% 지점에서 숨김
    overlayRight.style.clipPath   = 'inset(0 80% 0 20%)'; // 20% 지점에서 숨김
    overlayLeft.getBoundingClientRect(); // reflow
  }

  // ── 순방향: 1998 → 2028 ──
  // 20% 지점에서 왼쪽(→0%)과 오른쪽(→100%)으로 동시에 열림
  function forwardTransition() {
    clearAllTimers();
    resetOverlays();

    countLinear(1998, 2028, 5000, yearEl);

    // Stage 1: 빠르게 초기 일부 열림 (1초)
    addTimer(() => {
      overlayLeft.style.transition  = 'clip-path 1s ease-in';
      overlayRight.style.transition = 'clip-path 5s ease-in';
      overlayLeft.style.clipPath    = 'inset(0 80% 0 0%)';  // 왼쪽으로 빠르게
      overlayRight.style.clipPath   = 'inset(0 80% 0 20%)'; // 오른쪽으로 빠르게
    }, 0);

    // Stage 2: 2초 대기 후 나머지 천천히 열림 (5초)
    addTimer(() => {
      overlayLeft.style.transition  = 'clip-path 5s ease-out';
      overlayRight.style.transition = 'clip-path 5s ease-out';
      overlayLeft.style.clipPath    = 'inset(0 80% 0 0%)';  // 왼쪽 끝까지
      overlayRight.style.clipPath   = 'inset(0 0% 0 20%)';  // 오른쪽 끝까지
    }, 3000);

    // 완료 후 로고 & 영문 텍스트 등장
    addTimer(() => {
      logoIcon.classList.add('show');
      engTxt.classList.add('show');
    }, 7000);

    loopTimer = setTimeout(() => reverseTransition(), 15000);
  }

  // ── 역방향: 2028 → 1998 ──
  // 라이트(overlayLeft) : 0% → 20% 로 오른쪽으로 물러나며 숨김 (기존 동일)
  // 신차(overlayRight)  : 20% → 100% 로 왼→오 방향으로 빠져나가며 배경 등장
  function reverseTransition() {
    clearAllTimers();

    logoIcon.classList.remove('show');
    engTxt.classList.remove('show');

    countLinear(2028, 1998, 5000, yearEl);

    // Stage 1: 라이트(overlayLeft) 0% → 20% 로 먼저 물러남
    addTimer(() => {
      overlayLeft.style.transition = 'clip-path 1s ease-in';
      overlayLeft.style.clipPath   = 'inset(0 80% 0 20%)'; // 0% → 20% (오른쪽으로 숨김)
    }, 0);

    // Stage 2: 신차(overlayRight) 20% → 100% 로 왼→오 방향으로 빠져나감
    //          left inset이 20% → 100% 로 커지면서 오른쪽으로 사라짐 = 배경 드러남
    addTimer(() => {
      overlayRight.style.transition = 'clip-path 5s ease-out';
      overlayRight.style.clipPath   = 'inset(0 0% 0 100%)'; // 20% → 100% (왼→오 퇴장)
    }, 3000);

    loopTimer = setTimeout(() => forwardTransition(), 14000);
  }

  forwardTransition();
}); // DOMContentLoaded 닫는 괄호

/* ── 카드 슬라이더 dot 지시자 ── */
(function () {
  const slider   = document.querySelector('.card-slider');
  const dotsWrap = document.getElementById('cardDots');
  if (!slider || !dotsWrap) return;

  const cards = slider.querySelectorAll('.card-grid .card');
  const TOTAL = cards.length;
  if (TOTAL === 0) return;

  /* 도트 생성 */
  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < TOTAL; i++) {
      const btn = document.createElement('button');
      btn.className = 'card-dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', '카드 ' + (i + 1));
      btn.addEventListener('click', function () {
        const cardWidth = cards[0].offsetWidth;
        slider.scrollTo({ left: i * (cardWidth + 15), behavior: 'smooth' });
      });
      dotsWrap.appendChild(btn);
    }
  }

  /* 스크롤 위치에 따라 활성 dot 업데이트 */
  function updateDots() {
    const cardWidth = cards[0].offsetWidth;
    const idx = Math.round(slider.scrollLeft / (cardWidth + 15));
    dotsWrap.querySelectorAll('.card-dot').forEach(function (d, i) {
      d.classList.toggle('active', i === idx);
    });
  }

  slider.addEventListener('scroll', updateDots, { passive: true });

  buildDots();
})();