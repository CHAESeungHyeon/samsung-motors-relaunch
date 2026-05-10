document.addEventListener('DOMContentLoaded', () => {
  // ── 햄버거 메뉴 ──
  const hamburger = document.getElementById('hamburger');
  const navbar    = document.querySelector('.navbar');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navbar.classList.toggle('open');
  });

  document.querySelectorAll('.navbtn1 a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navbar.classList.remove('open');
    });
  });
});

// ── 푸터 공유 툴팁 탭 접근성 ──
function tabKeyCnt() {
  const copyLink = document.querySelector('.share-copylink');
  const closeBtn = document.getElementById('tooltip-share-close');
  if (!copyLink || !closeBtn) return;
  copyLink.addEventListener('keydown', function (e) {
    if (e.shiftKey && (e.keyCode || e.which) === 9) {
      e.preventDefault();
      closeBtn.focus();
    }
  });
}