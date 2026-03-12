(function () {
  'use strict';

  /* ── DOM 참조 ── */
  const wrapper  = document.getElementById('specWrapper');
  const track    = document.getElementById('specTrack');
  const dotsWrap = document.getElementById('specDots');
  const SLIDES   = track.querySelectorAll('.spec-slide');
  const TOTAL    = SLIDES.length; // 6

  /* ── 상태 ── */
  let current    = 0;  // 현재 "페이지" 인덱스
  let perPage    = 2;  // 데스크탑=2, 모바일=1
  let totalPages = 3;  // TOTAL / perPage

  /* ── 임계값(px) : 이 이상 끌어야 슬라이드 전환 ── */
  const THRESHOLD = 60;

  /* ─────────────────────────────────────────
     반응형 설정 계산
     - 모바일(≤768): 1장씩, 도트 6개
     - 데스크탑    : 2장씩, 도트 3개
  ───────────────────────────────────────── */
  function calcConfig() {
    perPage    = window.innerWidth <= 768 ? 1 : 2;
    totalPages = Math.ceil(TOTAL / perPage);
  }

  /* ─────────────────────────────────────────
     도트 동적 생성
  ───────────────────────────────────────── */
  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
      const btn = document.createElement('button');
      btn.className  = 'spec-dot' + (i === 0 ? ' active' : '');
      btn.dataset.index = i;
      btn.setAttribute('aria-label', `슬라이드 ${i + 1}`);
      btn.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(btn);
    }
  }

  /* ─────────────────────────────────────────
     현재 도트 활성화
  ───────────────────────────────────────── */
  function updateDots() {
    dotsWrap.querySelectorAll('.spec-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  /* ─────────────────────────────────────────
     슬라이드 이동
     translateX = -(현재페이지 * wrapper너비)
     gap은 CSS에서 처리하므로 wrapperWidth만큼 이동하면
     정확히 다음 "쌍" 또는 다음 단일 슬라이드로 이동
  ───────────────────────────────────────── */
  function goTo(index, animate) {
    current = Math.max(0, Math.min(totalPages - 1, index));

    if (animate === false) {
      track.classList.add('no-anim');
    } else {
      track.classList.remove('no-anim');
    }

    const gap    = perPage === 2 ? 30 : 0;
    const offset = -(current * (wrapper.offsetWidth + gap));
    track.style.transform = `translateX(${offset}px)`;
    updateDots();
  }

  /* ─────────────────────────────────────────
     초기화 / 리사이즈
  ───────────────────────────────────────── */
  function init() {
    calcConfig();
    buildDots();
    goTo(0, false); // 애니메이션 없이 초기 위치
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const prevPerPage = perPage;
      calcConfig();
      buildDots();
      if (prevPerPage !== perPage) {
        goTo(0, false); // 뷰포트 전환 시 첫 페이지로
      } else {
        goTo(current, false); // 위치 재계산만
      }
    }, 100);
  });

  /* ─────────────────────────────────────────
     현재 translateX 픽셀 읽기 (드래그용)
  ───────────────────────────────────────── */
  function readTranslateX() {
    return new DOMMatrix(getComputedStyle(track).transform).m41;
  }

  /* ─────────────────────────────────────────
     드래그 / 스와이프 공통 변수
  ───────────────────────────────────────── */
  let dragging    = false;
  let startX      = 0;
  let startY      = 0;
  let startOffset = 0;
  let lockAxis    = null; // 'h' | 'v' | null  (터치 방향 잠금)

  /* ─────────────────────────────────────────
     드래그 공통 헬퍼
  ───────────────────────────────────────── */
  function dragStart(x, y) {
    dragging    = true;
    startX      = x;
    startY      = y;
    startOffset = readTranslateX();
    lockAxis    = null;
    track.classList.add('no-anim');
    wrapper.classList.add('is-dragging');
  }

  function dragMove(x, y) {
    if (!dragging) return;

    const dx = x - startX;
    const dy = y - startY;

    /* 방향이 아직 결정되지 않았으면 결정 */
    if (!lockAxis) {
      if (Math.abs(dx) > Math.abs(dy)) {
        lockAxis = 'h'; // 가로 스와이프
      } else if (Math.abs(dy) > Math.abs(dx)) {
        lockAxis = 'v'; // 세로 스크롤
        dragging = false;
        wrapper.classList.remove('is-dragging');
        track.classList.remove('no-anim');
        goTo(current); // 원래 위치 복귀
        return;
      } else {
        return; // 아직 방향 불명확
      }
    }

    track.style.transform = `translateX(${startOffset + dx}px)`;
  }

  function dragEnd(x) {
    if (!dragging) return;
    dragging = false;
    wrapper.classList.remove('is-dragging');

    const dx = x - startX;
    if (Math.abs(dx) > THRESHOLD) {
      goTo(current + (dx < 0 ? 1 : -1));
    } else {
      goTo(current); // 제자리 복귀
    }
  }

  /* ─────────────────────────────────────────
     마우스 이벤트 (Pointer Events + setPointerCapture)
  ───────────────────────────────────────── */
  wrapper.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') return; // 마우스만 처리
    if (e.button !== 0) return;            // 좌클릭만
    e.preventDefault();
    this.setPointerCapture(e.pointerId);
    dragStart(e.clientX, e.clientY);
  });

  wrapper.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    dragMove(e.clientX, e.clientY);
  });

  wrapper.addEventListener('pointerup', function (e) {
    if (e.pointerType !== 'mouse') return;
    dragEnd(e.clientX);
  });

  wrapper.addEventListener('pointercancel', function (e) {
    if (e.pointerType !== 'mouse') return;
    if (dragging) {
      dragging = false;
      wrapper.classList.remove('is-dragging');
      goTo(current);
    }
  });

  /* ─────────────────────────────────────────
     터치 이벤트 (passive: false → preventDefault 가능)
  ───────────────────────────────────────── */
  wrapper.addEventListener('touchstart', function (e) {
    dragStart(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  wrapper.addEventListener('touchmove', function (e) {
    if (!dragging) return;

    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;

    /* 방향 결정 전 */
    if (!lockAxis) {
      if (Math.abs(dx) > Math.abs(dy)) {
        lockAxis = 'h';
      } else if (Math.abs(dy) > Math.abs(dx)) {
        lockAxis = 'v';
        dragging = false;
        wrapper.classList.remove('is-dragging');
        track.classList.remove('no-anim');
        goTo(current);
        return;
      } else {
        return;
      }
    }

    /* 가로 방향으로 확정 → 페이지 스크롤 막기 */
    e.preventDefault();
    track.style.transform = `translateX(${startOffset + dx}px)`;
  }, { passive: false }); /* ← passive:false 여야 preventDefault 가능 */

  wrapper.addEventListener('touchend', function (e) {
    dragEnd(e.changedTouches[0].clientX);
  });

  wrapper.addEventListener('touchcancel', function () {
    if (dragging) {
      dragging = false;
      wrapper.classList.remove('is-dragging');
      goTo(current);
    }
  });

  /* ── 실행 ── */
  init();
})();