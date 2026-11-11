import './wedding.css';
import './cinematic-intro.css';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './wedding-sync.js';
import './cinematic-intro.js';

gsap.registerPlugin(ScrollTrigger);

// Ngăn thanh địa chỉ mobile ẩn/hiện làm giật lại vị trí ScrollTrigger
ScrollTrigger.config({
  ignoreMobileResize: true,
  autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
});

/**
 * ============================================================================
 * THƯỚC PHIM CƯỚI RETRO VĂN TIẾN & BẢO CHÂU — JAVASCRIPT LOGIC (PONYTAIL 5)
 * Tối ưu 60/120FPS trên Mobile: Native momentum scroll trên cảm ứng,
 * chỉ animate GPU (transform, opacity), choreography điện ảnh mượt mà.
 * ============================================================================
 */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
const body = document.body;

// 1. KHỞI TẠO CUỘN MƯỢT: Native 120Hz trên Mobile, Lenis trên Desktop
let lenis = null;
if (!isTouchDevice && !reducedMotion) {
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.9,
    syncTouch: false,
    infinite: false,
  });

  if (!body.classList.contains('invite-open')) {
    lenis.stop();
  }

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
}
gsap.ticker.lagSmoothing(0);

window.__lenis = lenis;
window.ScrollTrigger = ScrollTrigger;

// Thanh tiến trình cuộn phim trên cùng — 100% GPU scaleX, dùng RAF chống layout thrashing
const filmProgress = document.querySelector('.film-scroll-bar .film-progress');
let progressTicking = false;

function updateFilmProgressBar() {
  progressTicking = false;
  if (!filmProgress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max > 0) {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const progress = Math.min(1, Math.max(0, scrollY / max));
    filmProgress.style.transform = `scaleX(${progress.toFixed(4)})`;
  }
}

window.addEventListener(
  'scroll',
  () => {
    if (!progressTicking) {
      progressTicking = true;
      requestAnimationFrame(updateFilmProgressBar);
    }
  },
  { passive: true }
);

// 2. CANVAS KHÔNG GIAN LÃNG MẠN (GOLDEN STARDUST & ROSE PETALS) — OFFSCREEN SPRITE 60FPS
function initAmbientRomanticParticles() {
  if (reducedMotion) return;
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener(
    'resize',
    () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    },
    { passive: true }
  );

  // Vẽ sẵn sprite hạt bụi vàng 1 lần duy nhất thay vì gọi createRadialGradient mỗi frame
  const emberSprite = document.createElement('canvas');
  emberSprite.width = emberSprite.height = 24;
  const sCtx = emberSprite.getContext('2d');
  if (sCtx) {
    const grad = sCtx.createRadialGradient(12, 12, 0, 12, 12, 12);
    grad.addColorStop(0, 'rgba(255, 245, 210, 0.95)');
    grad.addColorStop(0.35, 'rgba(232, 185, 95, 0.65)');
    grad.addColorStop(1, 'rgba(212, 154, 50, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 24, 24);
  }

  const emberCount = isTouchDevice ? 5 : 9;
  const embers = [];
  for (let i = 0; i < emberCount; i++) {
    embers.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 10 + Math.random() * 12,
      baseAlpha: 0.25 + Math.random() * 0.45,
      pulseSpeed: 0.015 + Math.random() * 0.025,
      phase: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.18 - Math.random() * 0.35,
    });
  }

  const petalColors = [
    'rgba(184, 58, 42, 0.65)',
    'rgba(205, 75, 58, 0.6)',
    'rgba(142, 38, 25, 0.58)',
  ];
  const petalCount = isTouchDevice ? 2 : 4;
  const petals = [];
  for (let i = 0; i < petalCount; i++) {
    petals.push({
      x: Math.random() * width,
      y: Math.random() * height,
      w: 8 + Math.random() * 6,
      h: 6 + Math.random() * 5,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.018,
      vy: 0.38 + Math.random() * 0.5,
      swayAngle: Math.random() * Math.PI * 2,
      swaySpeed: 0.018 + Math.random() * 0.018,
      swayDist: 0.45 + Math.random() * 0.5,
      color: petalColors[i % petalColors.length],
    });
  }

  let isPaused = false;
  document.addEventListener('visibilitychange', () => {
    isPaused = document.hidden;
  });

  function render() {
    if (!isPaused) {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < embers.length; i++) {
        const p = embers[i];
        p.phase += p.pulseSpeed;
        p.x += p.vx + Math.sin(p.phase * 0.5) * 0.2;
        p.y += p.vy;

        if (p.y < -15) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -15) p.x = width + 10;
        if (p.x > width + 15) p.x = -10;

        ctx.globalAlpha = Math.max(0.08, Math.min(0.9, p.baseAlpha + Math.sin(p.phase) * 0.2));
        ctx.drawImage(emberSprite, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }

      ctx.globalAlpha = 1;
      for (let i = 0; i < petals.length; i++) {
        const pt = petals[i];
        pt.swayAngle += pt.swaySpeed;
        pt.rotation += pt.rotSpeed;
        pt.x += Math.sin(pt.swayAngle) * pt.swayDist;
        pt.y += pt.vy;

        if (pt.y > height + 20) {
          pt.y = -20;
          pt.x = Math.random() * width;
        }
        if (pt.x < -25) pt.x = width + 20;
        if (pt.x > width + 25) pt.x = -20;

        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rotation);
        ctx.beginPath();
        ctx.moveTo(0, -pt.h / 2);
        ctx.bezierCurveTo(pt.w / 2, -pt.h / 2, pt.w / 2, pt.h / 2, 0, pt.h / 2);
        ctx.bezierCurveTo(-pt.w / 2, pt.h / 2, -pt.w / 2, -pt.h / 2, 0, -pt.h / 2);
        ctx.fillStyle = pt.color;
        ctx.fill();
        ctx.restore();
      }
    }
    requestAnimationFrame(render);
  }

  render();
}

// 3. GRAND HERO ENTRANCE & CHOREOGRAPHED SCROLLTRIGGER REVEALS (GPU-ONLY)
let heroEntrancePlayed = false;

function runHeroEntrance() {
  if (heroEntrancePlayed || reducedMotion) return;
  heroEntrancePlayed = true;

  const heroWrapper = document.getElementById('heroPhotoStage');
  const heroSeal = document.querySelector('.hero-postal-seal');
  const heroPretitle = document.querySelector('.hero-pretitle');
  const heroWords = document.querySelectorAll('.hero-couple-title .title-word, .hero-couple-title .title-ampersand');
  const heroTicket = document.getElementById('heroAdmissionTicket');
  const heroQuote = document.querySelector('.hero-poetic-quote');
  const heroBtns = document.querySelectorAll('.hero-quick-actions .hero-btn');

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (heroWrapper) {
    tl.fromTo(
      heroWrapper,
      { scale: 1.06, opacity: 0.25 },
      { scale: 1, opacity: 1, duration: 1.05, clearProps: 'transform,opacity' },
      0
    );
  }

  if (heroSeal) {
    tl.fromTo(
      heroSeal,
      { scale: 1.45, rotate: -18, opacity: 0 },
      { scale: 1, rotate: 6, opacity: 1, duration: 0.65, ease: 'back.out(1.8)' },
      0.28
    );
  }

  if (heroPretitle) {
    tl.fromTo(
      heroPretitle,
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 },
      0.15
    );
  }

  if (heroWords.length) {
    tl.fromTo(
      heroWords,
      { y: 22, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.72 },
      0.22
    );
  }

  if (heroTicket) {
    tl.fromTo(
      heroTicket,
      { y: 26, scale: 0.96, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.25)', clearProps: 'transform' },
      0.34
    );
  }

  if (heroQuote) {
    tl.fromTo(
      heroQuote,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65 },
      0.46
    );
  }

  if (heroBtns.length) {
    tl.fromTo(
      heroBtns,
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.6, clearProps: 'transform' },
      0.52
    );
  }
}

if (body.classList.contains('invite-open')) {
  initAmbientRomanticParticles();
  runHeroEntrance();
} else {
  document.addEventListener(
    'intro:done',
    () => {
      runHeroEntrance();
      setTimeout(initAmbientRomanticParticles, 250);
    },
    { once: true }
  );
}

function initScrollTrigger3D() {
  if (reducedMotion) return;

  // A. Hiệu ứng Parallax nhẹ cho Ảnh Đại Cảnh Hero
  const heroPhotoStage = document.getElementById('heroPhotoStage');
  const heroImg = document.querySelector('.hero-img-cinematic');
  if (heroPhotoStage && heroImg && !isTouchDevice) {
    gsap.to(heroImg, {
      yPercent: 8,
      scale: 1.05,
      ease: 'none',
      scrollTrigger: {
        trigger: heroPhotoStage,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });
  }

  // B. Tiêu đề & Vạch kẻ từng Phân Cảnh (Không scale cả card lớn để giữ 60FPS và bảo toàn position: sticky)
  document.querySelectorAll('.film-chapter-card').forEach((card) => {
    const badgeLine = card.querySelector('.chapter-badge-line');
    const ruleLine = card.querySelector('.chapter-badge-line .chapter-line');
    const heading = card.querySelector('.card-display-title');
    const introText = card.querySelector('.card-intro-text');

    const headerTargets = [badgeLine, heading, introText].filter(Boolean);
    if (headerTargets.length) {
      gsap.fromTo(
        headerTargets,
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.72,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 86%',
            once: true,
          },
        }
      );
    }

    if (ruleLine) {
      gsap.fromTo(
        ruleLine,
        { scaleX: 0, transformOrigin: 'left center' },
        {
          scaleX: 1,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 86%',
            once: true,
          },
        }
      );
    }
  });

  // C. Phân cảnh 01: Gia Đình Hai Họ & Ảnh Áo Dài Truyền Thống
  const familyCard = document.getElementById('family');
  if (familyCard) {
    const familyCrest = familyCard.querySelector('.family-center-crest');
    const dividerLines = familyCard.querySelectorAll('.divider-gold-line');
    const groomBlock = document.getElementById('groomFamilyBlock');
    const brideBlock = document.getElementById('brideFamilyBlock');
    const tradPhoto = familyCard.querySelector('.traditional-photo-stage');

    ScrollTrigger.create({
      trigger: familyCard,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        if (familyCrest) {
          gsap.fromTo(
            familyCrest,
            { scale: 0.4, rotate: -20, opacity: 0 },
            { scale: 1, rotate: 0, opacity: 1, duration: 0.75, ease: 'back.out(1.7)' }
          );
        }
        if (dividerLines.length) {
          gsap.fromTo(
            dividerLines,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.8, ease: 'power2.out', delay: 0.12 }
          );
        }
        const blocks = [groomBlock, brideBlock].filter(Boolean);
        if (blocks.length) {
          gsap.fromTo(
            blocks,
            { y: 22, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.12, duration: 0.75, ease: 'power2.out', delay: 0.18 }
          );
        }
      },
    });

    if (tradPhoto) {
      gsap.fromTo(
        tradPhoto,
        { y: 26, scale: 0.97, opacity: 0 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.82,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: tradPhoto,
            start: 'top 86%',
            once: true,
          },
        }
      );
    }
  }

  // D. Phân cảnh 02: Lá Thư Uyên Ương & Con Dấu "THƯƠNG MẾN"
  const letterSheet = document.querySelector('.letter-sheet-container');
  if (letterSheet) {
    const letterParas = letterSheet.querySelectorAll('.letter-salutation, .letter-body-copy p, .letter-sign-block');
    const letterStamp = letterSheet.querySelector('.letter-postmark-stamp');

    if (letterParas.length) {
      gsap.fromTo(
        letterParas,
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.11,
          duration: 0.75,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#letter',
            start: 'top 78%',
            once: true,
          },
        }
      );
    }

    if (letterStamp) {
      gsap.fromTo(
        letterStamp,
        { scale: 1.55, opacity: 0, rotate: 24 },
        {
          scale: 1,
          opacity: 0.88,
          rotate: -10,
          duration: 0.68,
          ease: 'back.out(2)',
          scrollTrigger: {
            trigger: '#letter',
            start: 'top 68%',
            once: true,
          },
        }
      );
    }
  }

  // E. Phân cảnh 03: Tactile Polaroid Scrapbook Deck (Hiệu ứng xếp chồng Sticky Stacking Cards mượt 60FPS)
  const polaroidCards = document.querySelectorAll('.polaroid-scrapbook-card');
  if (polaroidCards.length) {
    polaroidCards.forEach((card, idx) => {
      const yearPill = card.querySelector('.polaroid-year-pill');
      const innerFrame = card.querySelector('.polaroid-photo-frame');

      // Pop-in huy hiệu năm & quét vệt nắng ấm khi thẻ bước vào khung hình
      ScrollTrigger.create({
        trigger: card,
        start: 'top 84%',
        once: true,
        onEnter: () => {
          if (yearPill) {
            gsap.fromTo(
              yearPill,
              { scale: 0, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.8)' }
            );
          }
          card.classList.add('is-focused');
          setTimeout(() => card.classList.remove('is-focused'), 950);
        },
      });

      // Chiều sâu xếp chồng 3D: Khi thẻ sau trượt lên đè lên thẻ trước, thẻ trước thu nhỏ nhẹ và lùi về sau
      if (idx < polaroidCards.length - 1 && innerFrame) {
        const nextCard = polaroidCards[idx + 1];
        gsap.to(innerFrame, {
          scale: 0.935,
          y: -8,
          opacity: 0.84,
          ease: 'none',
          scrollTrigger: {
            trigger: nextCard,
            start: 'top 80%',
            end: 'top 22%',
            scrub: true,
          },
        });
      }

      // Chạm để ngắm thẳng thẻ ảnh
      card.addEventListener('click', () => {
        polaroidCards.forEach((c) => {
          if (c !== card) c.classList.remove('is-focused');
        });
        card.classList.toggle('is-focused');
      });
    });
  }

  // F. Phân cảnh 04: Đồng Hồ Đếm Ngược (Split-Flap Digits Pop-in)
  const countdownCard = document.querySelector('.countdown-card');
  if (countdownCard) {
    const segments = countdownCard.querySelectorAll('.clock-segment');
    const calBox = countdownCard.querySelector('.calendar-action-box');
    if (segments.length) {
      gsap.fromTo(
        segments,
        { y: 20, scale: 0.9, opacity: 0 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          stagger: 0.08,
          duration: 0.65,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: countdownCard,
            start: 'top 82%',
            once: true,
          },
        }
      );
    }
    if (calBox) {
      gsap.fromTo(
        calBox,
        { y: 14, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          delay: 0.22,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: countdownCard,
            start: 'top 82%',
            once: true,
          },
        }
      );
    }
  }

  // G. Phân cảnh 05: Lịch Trình Hôn Lễ (Từng thẻ sự kiện & con dấu ngày tháng)
  const eventTiles = document.querySelectorAll('.itinerary-grid .event-tile');
  eventTiles.forEach((tile) => {
    const stamp = tile.querySelector('.event-tile-stamp');
    gsap.fromTo(
      tile,
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.72,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: tile,
          start: 'top 86%',
          once: true,
        },
      }
    );
    if (stamp) {
      gsap.fromTo(
        stamp,
        { scale: 1.4, rotate: -14, opacity: 0 },
        {
          scale: 1,
          rotate: -4,
          opacity: 0.88,
          duration: 0.55,
          delay: 0.18,
          ease: 'back.out(1.8)',
          scrollTrigger: {
            trigger: tile,
            start: 'top 86%',
            once: true,
          },
        }
      );
    }
  });

  // H. Phân cảnh 06, 07, 08 & Finale: Cuộn Film, Mừng Cưới, RSVP & Lời Cảm Tạ
  const filmViewport = document.querySelector('.film-strip-viewport');
  if (filmViewport) {
    gsap.fromTo(
      filmViewport,
      { y: 22, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.78,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#film-reel',
          start: 'top 82%',
          once: true,
        },
      }
    );
  }

  const giftBlocks = document.querySelectorAll('#wedding-gift .gift-switch-track, #wedding-gift .gift-cards-container');
  if (giftBlocks.length) {
    gsap.fromTo(
      giftBlocks,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.12,
        duration: 0.72,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#wedding-gift',
          start: 'top 82%',
          once: true,
        },
      }
    );
  }

  const rsvpBlocks = document.querySelectorAll('#rsvp .form-wrapper, #rsvp .guestbook-feed-panel');
  if (rsvpBlocks.length) {
    gsap.fromTo(
      rsvpBlocks,
      { y: 22, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.14,
        duration: 0.75,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#rsvp',
          start: 'top 82%',
          once: true,
        },
      }
    );
  }

  const finaleCard = document.querySelector('.finale-card');
  if (finaleCard) {
    const seal = finaleCard.querySelector('.finale-art-seal');
    const items = finaleCard.querySelectorAll('.finale-subtitle, .finale-title, .finale-names-tag, .finale-geo-tag, .finale-return-anchor');
    if (seal) {
      gsap.fromTo(
        seal,
        { scale: 0.6, rotate: -15, opacity: 0 },
        {
          scale: 1,
          rotate: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'back.out(1.6)',
          scrollTrigger: {
            trigger: finaleCard,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }
    if (items.length) {
      gsap.fromTo(
        items,
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.68,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: finaleCard,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }
  }
}

// TƯƠNG TÁC 3D TILT TRÊN DESKTOP
function initHeroPhotoTilt() {
  const stage = document.getElementById('heroPhotoStage');
  const glare = document.getElementById('heroPhotoGlare');
  if (!stage || reducedMotion || isTouchDevice) return;

  stage.addEventListener(
    'mousemove',
    (e) => {
      const rect = stage.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      gsap.to(stage, {
        rotateY: x * 5,
        rotateX: -y * 5,
        duration: 0.4,
        ease: 'power1.out',
        transformPerspective: 1000,
      });

      if (glare) {
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top) / rect.height) * 100;
        glare.style.setProperty('--glare-x', `${px}%`);
        glare.style.setProperty('--glare-y', `${py}%`);
      }
    },
    { passive: true }
  );

  stage.addEventListener('mouseleave', () => {
    gsap.to(stage, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.7,
      ease: 'power2.out',
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initScrollTrigger3D();
    initHeroPhotoTilt();
  });
} else {
  initScrollTrigger3D();
  initHeroPhotoTilt();
}

// 4. ĐỒNG HỒ ĐẾM NGƯỢC THỜI GIAN THỰC (COUNTDOWN TIMER)
// 10:30 AM Thứ Tư, 25.11.2026 GMT+7
const targetDate = new Date('2026-11-25T10:30:00+07:00').getTime();
const countNodes = {
  days: document.querySelector('[data-count="days"]'),
  hours: document.querySelector('[data-count="hours"]'),
  minutes: document.querySelector('[data-count="minutes"]'),
  seconds: document.querySelector('[data-count="seconds"]'),
};

function triggerOdometer(node) {
  if (!node) return;
  node.classList.remove('odometer-flip');
  void node.offsetWidth;
  node.classList.add('odometer-flip');
}

function updateCountdown() {
  const now = Date.now();
  let diff = Math.max(0, Math.floor((targetDate - now) / 1000));

  const days = String(Math.floor(diff / 86400)).padStart(3, '0');
  diff %= 86400;
  const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
  diff %= 3600;
  const minutes = String(Math.floor(diff / 60)).padStart(2, '0');
  const seconds = String(diff % 60).padStart(2, '0');

  if (countNodes.days && countNodes.days.textContent !== days) {
    countNodes.days.textContent = days;
    triggerOdometer(countNodes.days);
  }
  if (countNodes.hours && countNodes.hours.textContent !== hours) {
    countNodes.hours.textContent = hours;
    triggerOdometer(countNodes.hours);
  }
  if (countNodes.minutes && countNodes.minutes.textContent !== minutes) {
    countNodes.minutes.textContent = minutes;
    triggerOdometer(countNodes.minutes);
  }
  if (countNodes.seconds && countNodes.seconds.textContent !== seconds) {
    countNodes.seconds.textContent = seconds;
    triggerOdometer(countNodes.seconds);
  }
}
updateCountdown();
window.setInterval(updateCountdown, 1000);

// 5. THÊM NGÀY CƯỚI VÀO LỊCH (GOOGLE / APPLE CALENDAR .ICS)
function openGoogleCalendar() {
  const title = encodeURIComponent('Lễ Cưới Văn Tiến & Bảo Châu');
  const details = encodeURIComponent('Trân trọng kính mời bạn đến chung vui trong ngày hạnh phúc của Văn Tiến & Bảo Châu tại Nghệ An.');
  const location = encodeURIComponent('Tư gia Nhà Trai / Nhà Gái, Xã Đại Đồng, Huyện Thanh Chương, Tỉnh Nghệ An');
  const start = '20261125T033000Z';
  const end = '20261125T140000Z';

  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  window.open(googleCalUrl, '_blank', 'noopener,noreferrer');
  showEditorialToast('Đang mở Lịch Google để lưu ngày cưới...');
}

function downloadWeddingIcs() {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Thu Bao Hy//Nguyen Van Tien & Pham Thi Bao Chau//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:vuquy-20261124-tienchau@duvansi.me',
    'DTSTAMP:20261109T000000Z',
    'DTSTART:20261124T043000Z',
    'DTEND:20261124T070000Z',
    'SUMMARY:Lễ Vu Quy — Văn Tiến & Bảo Châu',
    'DESCRIPTION:Kính mời dự Lễ Vu Quy và chung vui bữa cơm thân mật cùng gia đình Nhà Gái tại Thôn Dùng 1, Xã Đại Đồng, Tỉnh Nghệ An.',
    'LOCATION:Tư gia Nhà Gái — Thôn Dùng 1, Xã Đại Đồng, Tỉnh Nghệ An',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Nhắc nhở ngày mai có Lễ Vu Quy Văn Tiến & Bảo Châu',
    'TRIGGER:-P1D',
    'END:VALARM',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'UID:thanhhon-20261125-tienchau@duvansi.me',
    'DTSTAMP:20261109T000000Z',
    'DTSTART:20261125T033000Z',
    'DTEND:20261125T070000Z',
    'SUMMARY:Lễ Thành Hôn — Văn Tiến & Bảo Châu',
    'DESCRIPTION:Trân trọng kính mời bạn đến chung vui Lễ Thành Hôn và tiệc cưới cùng gia đình Nhà Trai tại Thôn Dùng 2, Xã Đại Đồng, Tỉnh Nghệ An.',
    'LOCATION:Tư gia Nhà Trai — Thôn Dùng 2, Xã Đại Đồng, Tỉnh Nghệ An',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Nhắc nhở ngày mai có Lễ Thành Hôn Văn Tiến & Bảo Châu',
    'TRIGGER:-P1D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  try {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'le-cuoi-tien-chau.ics');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showEditorialToast('Đã tải file lịch hẹn Apple (.ics) thành công!');
  } catch (_) {
    showEditorialToast('Không thể tạo file lịch trên trình duyệt này');
  }
}

document.getElementById('addGoogleCalBtn')?.addEventListener('click', openGoogleCalendar);
document.getElementById('addAppleCalBtn')?.addEventListener('click', downloadWeddingIcs);
document.getElementById('addToCalBtn')?.addEventListener('click', openGoogleCalendar);

// 6. CUỘN PHIM 35MM (35MM FILM REEL SLIDER) & LIGHTBOX PHÓNG TO
const filmStripTrack = document.getElementById('filmStripTrack');
const filmSlides = document.querySelectorAll('.film-frame-slide');
const filmPrevBtn = document.getElementById('filmPrevBtn');
const filmNextBtn = document.getElementById('filmNextBtn');
const filmCounter = document.getElementById('filmCounter');

const curatedFilmPhotos = [
  { src: './photo/BEE05884.jpg', caption: 'Đại cảnh chung đôi hạnh phúc — Văn Tiến & Bảo Châu' },
  { src: './photo/BEE05473.jpg', caption: 'Váy cưới bồng xòe lộng lẫy & vest tuxedo trang trọng' },
  { src: './photo/BEE05587.jpg', caption: 'Nụ hôn yêu thương ngọt ngào trao nhau' },
  { src: './photo/BEE06016.jpg', caption: 'Kính râm retro cá tính & nụ cười tràn ngập niềm vui' },
  { src: './photo/BEE06053.jpg', caption: 'Rạng rỡ nụ cười cùng lời hẹn ước Vows trăm năm' },
  { src: './photo/BEE05911.jpg', caption: 'Phút giây chỉnh áo & nụ cười tươi tắn bên hoa cưới' },
  { src: './photo/BEE06546.JPG', caption: 'Áo dài truyền thống đỏ thắm bên Chữ Hỷ vàng' },
  { src: './photo/BEE06530.jpg', caption: 'Chú rể bế cô dâu ngập tràn tiếng cười hạnh phúc' },
  { src: './photo/BEE06206.jpg', caption: 'Ánh mắt đong đầy dịu dàng trao nhau' },
  { src: './photo/BEE06269.jpg', caption: 'Tà váy cưới satin bồng bềnh kiêu sa trong nắng' },
];

let currentFilmIndex = 0;
const totalFilmSlides = filmSlides.length;
let isFilmTicking = false;

function updateFilmCounter() {
  isFilmTicking = false;
  if (!filmStripTrack || !filmCounter || !totalFilmSlides) return;
  const trackRect = filmStripTrack.getBoundingClientRect();
  const trackCenter = trackRect.left + trackRect.width / 2;
  let closestIdx = 0;
  let minDiff = Infinity;

  filmSlides.forEach((slide, idx) => {
    const rect = slide.getBoundingClientRect();
    const slideCenter = rect.left + rect.width / 2;
    const diff = Math.abs(slideCenter - trackCenter);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = idx;
    }
  });

  currentFilmIndex = closestIdx;
  filmCounter.textContent = `${String(closestIdx + 1).padStart(2, '0')} / ${String(totalFilmSlides).padStart(2, '0')}`;

  filmSlides.forEach((slide, idx) => {
    if (idx === closestIdx) {
      slide.style.transform = 'scale(1) translateZ(0)';
      slide.style.opacity = '1';
    } else {
      slide.style.transform = 'scale(0.93) translateZ(0)';
      slide.style.opacity = '0.68';
    }
  });
}

function scrollToFilmFrame(index) {
  if (!filmStripTrack || !filmSlides[index]) return;
  currentFilmIndex = Math.max(0, Math.min(totalFilmSlides - 1, index));
  filmSlides[currentFilmIndex].scrollIntoView({
    behavior: reducedMotion ? 'auto' : 'smooth',
    block: 'nearest',
    inline: 'center',
  });
}

filmPrevBtn?.addEventListener('click', () => scrollToFilmFrame(currentFilmIndex - 1));
filmNextBtn?.addEventListener('click', () => scrollToFilmFrame(currentFilmIndex + 1));

if (filmStripTrack) {
  filmStripTrack.addEventListener(
    'scroll',
    () => {
      if (!isFilmTicking) {
        isFilmTicking = true;
        requestAnimationFrame(updateFilmCounter);
      }
    },
    { passive: true }
  );
}

function triggerCameraShutterFlash() {
  const flash = document.getElementById('cameraShutterFlash');
  if (!flash) return;
  flash.classList.add('is-flashing');
  setTimeout(() => {
    flash.classList.remove('is-flashing');
  }, 120);
}

const cinematicLightbox = document.getElementById('cinematicLightbox');
const lightboxScreenImg = document.getElementById('lightboxScreenImg');
const lightboxStoryText = document.getElementById('lightboxStoryText');
const lightboxExitBtn = document.getElementById('lightboxExitBtn');
const lightboxCurtain = document.getElementById('lightboxCurtain');
const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
const lightboxNextBtn = document.getElementById('lightboxNextBtn');

let activePhotoIndex = 0;

function openCinematicLightbox(index) {
  activePhotoIndex = index;
  renderLightboxPhoto();
  if (cinematicLightbox) cinematicLightbox.classList.add('is-open');
}

function closeCinematicLightbox() {
  if (cinematicLightbox) cinematicLightbox.classList.remove('is-open');
}

function renderLightboxPhoto() {
  const item = curatedFilmPhotos[activePhotoIndex];
  if (!item) return;
  if (lightboxScreenImg) lightboxScreenImg.src = item.src;
  if (lightboxStoryText) lightboxStoryText.textContent = item.caption;
}

function openCustomPhotoLightbox(src, caption) {
  if (lightboxScreenImg) lightboxScreenImg.src = src;
  if (lightboxStoryText) lightboxStoryText.textContent = caption;
  if (cinematicLightbox) cinematicLightbox.classList.add('is-open');
}

filmSlides.forEach((slide) => {
  slide.addEventListener('click', () => {
    const idx = parseInt(slide.dataset.index, 10) || 0;
    triggerCameraShutterFlash();
    setTimeout(() => openCinematicLightbox(idx), 60);
  });
});

document.querySelectorAll('.polaroid-scrapbook-card').forEach((card, idx) => {
  const img = card.querySelector('.polaroid-photo-canvas img, .polaroid-img-box img, img');
  const captionEl = card.querySelector('.chin-title');
  const captionText = captionEl ? captionEl.textContent : `Thước phim chuyện mình · Cảnh 0${idx + 1}`;
  if (img) {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerCameraShutterFlash();
      setTimeout(() => openCustomPhotoLightbox(img.src, captionText), 60);
    });
  }
});

lightboxExitBtn?.addEventListener('click', closeCinematicLightbox);
lightboxCurtain?.addEventListener('click', closeCinematicLightbox);

lightboxPrevBtn?.addEventListener('click', () => {
  activePhotoIndex = (activePhotoIndex - 1 + curatedFilmPhotos.length) % curatedFilmPhotos.length;
  renderLightboxPhoto();
});

lightboxNextBtn?.addEventListener('click', () => {
  activePhotoIndex = (activePhotoIndex + 1) % curatedFilmPhotos.length;
  renderLightboxPhoto();
});

let touchStartX = 0;
let touchEndX = 0;
if (cinematicLightbox) {
  cinematicLightbox.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  cinematicLightbox.addEventListener(
    'touchend',
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) lightboxPrevBtn?.click();
        else lightboxNextBtn?.click();
      }
    },
    { passive: true }
  );
}

window.addEventListener('keydown', (e) => {
  if (!cinematicLightbox?.classList.contains('is-open')) return;
  if (e.key === 'Escape') closeCinematicLightbox();
  if (e.key === 'ArrowLeft') lightboxPrevBtn?.click();
  if (e.key === 'ArrowRight') lightboxNextBtn?.click();
});

// 7. SEGMENTED PILL SWITCHER & 3D CARD FLIP (MỪNG CƯỚI)
const tabGroomBtn = document.getElementById('tabGroomBtn');
const tabBrideBtn = document.getElementById('tabBrideBtn');
const panelGroom = document.getElementById('panelGroom');
const panelBride = document.getElementById('panelBride');
const giftSliderPill = document.getElementById('giftSliderPill');

function switchGiftTab(target) {
  if (target === 'groom') {
    tabGroomBtn?.classList.add('is-active');
    tabBrideBtn?.classList.remove('is-active');
    if (giftSliderPill) giftSliderPill.style.transform = 'translate3d(0, 0, 0)';
    if (panelGroom && panelBride) {
      panelGroom.classList.add('is-active', 'is-flipping');
      panelBride.classList.remove('is-active', 'is-flipping');
      setTimeout(() => panelGroom.classList.remove('is-flipping'), 400);
    }
  } else {
    tabBrideBtn?.classList.add('is-active');
    tabGroomBtn?.classList.remove('is-active');
    if (giftSliderPill) giftSliderPill.style.transform = 'translate3d(100%, 0, 0)';
    if (panelGroom && panelBride) {
      panelBride.classList.add('is-active', 'is-flipping');
      panelGroom.classList.remove('is-active', 'is-flipping');
      setTimeout(() => panelBride.classList.remove('is-flipping'), 400);
    }
  }
}

tabGroomBtn?.addEventListener('click', () => switchGiftTab('groom'));
tabBrideBtn?.addEventListener('click', () => switchGiftTab('bride'));

function createCoinConfetti(btn) {
  if (!btn || reducedMotion) return;
  const rect = btn.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  const count = 18;
  const colors = ['#FFD166', '#FFE4A0', '#D49A32', '#FFF5D6', '#E85D48'];

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'gold-confetti-particle';
    const size = 5 + Math.random() * 6;
    const isCircle = Math.random() > 0.4;
    p.style.width = `${size}px`;
    p.style.height = `${isCircle ? size : size * 1.5}px`;
    p.style.borderRadius = isCircle ? '50%' : '2px';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.left = `${originX}px`;
    p.style.top = `${originY}px`;
    document.body.appendChild(p);

    const angle = Math.random() * Math.PI + Math.PI;
    const distance = 40 + Math.random() * 100;
    const spreadX = (Math.random() - 0.5) * 110;

    gsap.to(p, {
      x: spreadX,
      y: Math.sin(angle) * distance + (Math.random() * 45 + 35),
      rotation: Math.random() * 540 - 270,
      opacity: 0,
      scale: 0.3,
      duration: 0.85 + Math.random() * 0.45,
      ease: 'power2.out',
      onComplete: () => p.remove(),
    });
  }
}

document.querySelectorAll('.copy-account-btn').forEach((btn) => {
  const originalHtml = btn.innerHTML;
  btn.addEventListener('click', () => {
    const acc = btn.getAttribute('data-account') || '';
    createCoinConfetti(btn);
    btn.classList.add('is-copied');
    btn.innerHTML = `<span class="btn-check">✓</span> ĐÃ SAO CHÉP THÀNH CÔNG!`;
    setTimeout(() => {
      btn.classList.remove('is-copied');
      btn.innerHTML = originalHtml;
    }, 2400);

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(acc)
        .then(() => showEditorialToast(`Đã sao chép số tài khoản: ${acc}`))
        .catch(() => showEditorialToast(`Số tài khoản: ${acc}`));
    } else {
      showEditorialToast(`Số tài khoản: ${acc}`);
    }
  });
});

// 8. SỔ LƯU BÚT & FORM RSVP XÁC NHẬN THAM DỰ
const defaultWishes = [
  {
    name: 'Hoàng Nam & Mai Linh',
    time: 'Vừa xong',
    wish: 'Chúc anh Tiến và bé Châu trăm năm hạnh phúc, bền chặt yêu thương và sớm đón thiên thần nhỏ nhé!',
  },
  {
    name: 'Minh Đức',
    time: '1 giờ trước',
    wish: 'Chúc mừng người anh em đã tìm được một nửa hoàn hảo của cuộc đời. Hẹn gặp hai bạn ở Nghệ An ngày 24 - 25.11!',
  },
  {
    name: 'Ngọc Anh',
    time: 'Hôm qua',
    wish: 'Cô dâu chú rể đẹp đôi nhất trần đời! Chúc hai bạn một hành trình mới ngập tràn tiếng cười và thương yêu đong đầy.',
  },
];

const guestbookStream = document.getElementById('guestbookStream');
const wishesCounter = document.getElementById('wishesCounter');
const weddingRsvpForm = document.getElementById('weddingRsvpForm');
const guestbookMoreWrapper = document.getElementById('guestbookMoreWrapper');
const guestbookMoreBtn = document.getElementById('guestbookMoreBtn');

let wishesVisibleCount = 5;
let fullWishesList = [];

function sanitize(str) {
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
}

function loadGuestbook() {
  let saved = [];
  try {
    saved = JSON.parse(
      localStorage.getItem('wedding_guestbook_tien_chau') ||
        localStorage.getItem('wedding_guestbook_thai_tran') ||
        '[]'
    );
  } catch (_) {}

  fullWishesList = [...saved, ...defaultWishes];
  renderGuestbook(fullWishesList);
}

function renderGuestbook(list) {
  if (!guestbookStream) return;
  if (wishesCounter) wishesCounter.textContent = `${list.length} lời chúc`;

  const visibleList = list.slice(0, wishesVisibleCount);
  guestbookStream.innerHTML = visibleList
    .map(
      (item) => `
      <article class="stream-item">
        <div class="stream-item-top">
          <span class="stream-author">${sanitize(item.name)}</span>
          <span class="stream-timestamp">${sanitize(item.time || 'Vừa xong')}</span>
        </div>
        <p class="stream-body">${sanitize(item.wish)}</p>
      </article>
    `
    )
    .join('');

  if (guestbookMoreWrapper && guestbookMoreBtn) {
    if (list.length > wishesVisibleCount) {
      guestbookMoreWrapper.style.display = 'flex';
      const remaining = list.length - wishesVisibleCount;
      guestbookMoreBtn.innerHTML = `<span>Xem thêm lời chúc ↓ (còn ${remaining})</span>`;
    } else {
      guestbookMoreWrapper.style.display = 'none';
    }
  }
}

guestbookMoreBtn?.addEventListener('click', () => {
  wishesVisibleCount += 5;
  renderGuestbook(fullWishesList);
});

loadGuestbook();

// P0-5: STEPPER − 1 + VÀ THẺ CHỌN (CHIP CARDS)
const guestMinusBtn = document.getElementById('guestMinusBtn');
const guestPlusBtn = document.getElementById('guestPlusBtn');
const guestCountDisplay = document.getElementById('guestCountDisplay');
const guestCountInput = document.getElementById('guestCount');

if (guestMinusBtn && guestPlusBtn && guestCountDisplay && guestCountInput) {
  guestMinusBtn.addEventListener('click', () => {
    let val = parseInt(guestCountInput.value, 10) || 1;
    if (val > 1) {
      val--;
      guestCountInput.value = val;
      guestCountDisplay.textContent = val;
    }
  });

  guestPlusBtn.addEventListener('click', () => {
    let val = parseInt(guestCountInput.value, 10) || 1;
    if (val < 10) {
      val++;
      guestCountInput.value = val;
      guestCountDisplay.textContent = val;
    }
  });
}

document.querySelectorAll('input[name="eventChoice"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    document.querySelectorAll('.event-chip-card').forEach((card) => card.classList.remove('is-active'));
    radio.closest('.event-chip-card')?.classList.add('is-active');
  });
});

function createCelebrationBurst(btn) {
  if (!btn || reducedMotion) return;
  const rect = btn.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const icons = ['囍', '✦', '♥', '✿'];
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('span');
    p.textContent = icons[i % icons.length];
    p.style.cssText = `position:fixed;left:${centerX}px;top:${centerY}px;font-size:${14 + Math.random() * 10}px;color:#B83522;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);`;
    document.body.appendChild(p);

    const angle = (i / 16) * Math.PI * 2;
    const distance = 45 + Math.random() * 70;
    gsap.to(p, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - (25 + Math.random() * 20),
      opacity: 0,
      scale: 0.3,
      duration: 0.95 + Math.random() * 0.35,
      ease: 'power2.out',
      onComplete: () => p.remove(),
    });
  }
}

if (weddingRsvpForm) {
  weddingRsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = weddingRsvpForm.name?.value.trim();
    const attendance = weddingRsvpForm.attendance?.value;
    const wish = weddingRsvpForm.wish?.value.trim();

    if (!name) {
      showEditorialToast('Vui lòng nhập họ và tên của bạn nhé!');
      return;
    }

    const submitBtn = weddingRsvpForm.querySelector('button[type="submit"]');
    createCelebrationBurst(submitBtn);

    const newEntry = {
      name,
      time: 'Vừa xong',
      wish:
        wish ||
        (attendance === 'yes'
          ? 'Hẹn gặp Văn Tiến & Bảo Châu trong ngày vui sắp tới!'
          : 'Chúc hai bạn trăm năm hạnh phúc và ngập tràn niềm vui!'),
    };

    try {
      const saved = JSON.parse(
        localStorage.getItem('wedding_guestbook_tien_chau') ||
          localStorage.getItem('wedding_guestbook_thai_tran') ||
          '[]'
      );
      saved.unshift(newEntry);
      localStorage.setItem('wedding_guestbook_tien_chau', JSON.stringify(saved));
    } catch (_) {}

    loadGuestbook();
    guestbookStream?.querySelector('.stream-item')?.classList.add('wish-pop-in');
    weddingRsvpForm.reset();
    showEditorialToast(`Cảm ơn bạn ${name} đã gửi lời hồi âm & chúc phúc!`);
  });
}

// 9. BỘ PHÁT NHẠC NỀN HOÀI NIỆM (VINTAGE GRAMOPHONE AUDIO PLAYER)
const vinylPlayer = document.getElementById('vinylPlayer');
const musicToggleBtn = document.getElementById('musicToggleBtn');
const musicLabelText = document.querySelector('.music-label-text');
const weddingAudio = document.getElementById('weddingAudio');

let audioCtx = null;
let isAudioActive = false;
let audioFadeInterval = null;

function playGentleChime() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    const playTone = (freq, time, length = 0.7) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.09, time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + length);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(time);
      osc.stop(time + length);
    };

    playTone(523.25, now + 0.01, 0.55);
    playTone(659.25, now + 0.1, 0.65);
    playTone(783.99, now + 0.19, 0.8);
    playTone(1046.5, now + 0.28, 1.05);
  } catch (_) {}
}

let floatingNotesInterval = null;
const noteSymbols = ['♫', '♪', '♩', '♬'];

function spawnFloatingNote() {
  const container = document.getElementById('floatingNotes');
  if (!container || !isAudioActive || reducedMotion) return;

  const note = document.createElement('span');
  note.className = 'floating-note';
  note.textContent = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];
  note.style.fontSize = `${13 + Math.random() * 8}px`;
  note.style.left = `${Math.random() * 28 - 14}px`;
  container.appendChild(note);

  setTimeout(() => note.remove(), 1800);
}

function startFloatingNotes() {
  if (floatingNotesInterval) clearInterval(floatingNotesInterval);
  spawnFloatingNote();
  floatingNotesInterval = setInterval(spawnFloatingNote, 1500);
}

function stopFloatingNotes() {
  if (floatingNotesInterval) {
    clearInterval(floatingNotesInterval);
    floatingNotesInterval = null;
  }
}

function playWeddingMusic() {
  const audio = weddingAudio || document.getElementById('weddingAudio');
  if (!audio) return;

  if (audioFadeInterval) {
    clearInterval(audioFadeInterval);
    audioFadeInterval = null;
  }

  audio.volume = 0;
  const playPromise = audio.play();

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        isAudioActive = true;
        const vp = vinylPlayer || document.getElementById('vinylPlayer');
        const btn = musicToggleBtn || document.getElementById('musicToggleBtn');
        vp?.classList.add('is-playing');
        if (btn) {
          btn.setAttribute('aria-pressed', 'true');
          btn.classList.add('is-playing');
        }
        if (musicLabelText) musicLabelText.textContent = 'Đang phát';
        startFloatingNotes();

        let vol = 0;
        audioFadeInterval = setInterval(() => {
          vol += 0.06;
          if (vol >= 0.75) {
            audio.volume = 0.75;
            clearInterval(audioFadeInterval);
            audioFadeInterval = null;
          } else {
            audio.volume = Number(vol.toFixed(2));
          }
        }, 70);
      })
      .catch(() => {});
  }
}

function pauseWeddingMusic() {
  const audio = weddingAudio || document.getElementById('weddingAudio');
  if (!audio) return;

  stopFloatingNotes();

  if (audioFadeInterval) {
    clearInterval(audioFadeInterval);
    audioFadeInterval = null;
  }

  let vol = audio.volume;
  audioFadeInterval = setInterval(() => {
    vol -= 0.08;
    if (vol <= 0.05) {
      audio.volume = 0;
      audio.pause();
      clearInterval(audioFadeInterval);
      audioFadeInterval = null;
      isAudioActive = false;
      const vp = vinylPlayer || document.getElementById('vinylPlayer');
      const btn = musicToggleBtn || document.getElementById('musicToggleBtn');
      vp?.classList.remove('is-playing');
      if (btn) {
        btn.setAttribute('aria-pressed', 'false');
        btn.classList.remove('is-playing');
      }
      if (musicLabelText) musicLabelText.textContent = 'Giai điệu';
    } else {
      audio.volume = Number(vol.toFixed(2));
    }
  }, 45);
}

function toggleWeddingMusic() {
  const audio = weddingAudio || document.getElementById('weddingAudio');
  if (!audio) return;

  if (isAudioActive && !audio.paused) {
    pauseWeddingMusic();
    showEditorialToast('Đã tạm dừng giai điệu');
  } else {
    playWeddingMusic();
    showEditorialToast('Đang phát: Gói Con Tim Làm Quà — Nguyễn Hùng ♫');
  }
}

window.__playChime = playGentleChime;
window.__playMusic = playWeddingMusic;
window.__pauseMusic = pauseWeddingMusic;
window.__toggleMusic = toggleWeddingMusic;

musicToggleBtn?.addEventListener('click', toggleWeddingMusic);

weddingAudio?.addEventListener('ended', () => {
  weddingAudio.currentTime = 0;
  weddingAudio.play().catch(() => {});
});

// 10. ĐIỀU HƯỚNG MƯỢT MÀ KHI NHẤP LINK ANCHOR
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    e.preventDefault();
    if (!body.classList.contains('invite-open')) {
      body.classList.add('invite-open');
    }

    if (lenis) {
      lenis.scrollTo(targetEl, {
        duration: reducedMotion ? 0.01 : 1.35,
        offset: -36,
      });
    } else {
      const top = targetEl.getBoundingClientRect().top + window.scrollY - 36;
      window.scrollTo({
        top,
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
    }
  });
});

// 11. ĐỒNG BỘ NÚT ACTIVE TRÊN THANH DOCK CAPSULE MOBILE
function initMobileStickyBar() {
  const bar = document.getElementById('mobileStickyBar');
  const pillIndicator = document.getElementById('liquidNavPill');
  const pills = document.querySelectorAll('.editorial-sticky-bar .bar-link-pill');
  if (!pills.length || !bar) return;

  const sections = [
    { el: document.getElementById('itinerary') || document.getElementById('lich-trinh'), index: 0 },
    { el: document.getElementById('film-reel') || document.getElementById('cuon-phim'), index: 1 },
    { el: document.getElementById('wedding-gift') || document.getElementById('mung-cuoi'), index: 2 },
    { el: document.getElementById('rsvp'), index: 3 },
  ];

  let currentIndex = 0;

  function setActiveIndex(newIndex) {
    if (newIndex < 0 || newIndex > 3) return;
    if (currentIndex !== newIndex) {
      if (pillIndicator) {
        pillIndicator.classList.remove('is-morphing');
        void pillIndicator.offsetWidth;
        pillIndicator.classList.add('is-morphing');
      }
      currentIndex = newIndex;
    }
    bar.style.setProperty('--active-index', newIndex);

    pills.forEach((pill, idx) => {
      pill.classList.toggle('is-active', idx === newIndex);
    });
  }

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const idx = parseInt(pill.dataset.index, 10);
      if (!isNaN(idx)) setActiveIndex(idx);
    });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          const matched = sections.find((s) => s.el === visibleEntries[0].target);
          if (matched) setActiveIndex(matched.index);
        }
      },
      {
        root: null,
        rootMargin: '-15% 0px -40% 0px',
        threshold: [0.1, 0.25, 0.5],
      }
    );

    sections.forEach((s) => {
      if (s.el) observer.observe(s.el);
    });
  }
}
initMobileStickyBar();

// 12. RETRO TOAST THÔNG BÁO TIỆN ÍCH
const editorialToast = document.getElementById('editorialToast');
let toastTimer;

function showEditorialToast(msg) {
  if (!editorialToast) return;
  editorialToast.textContent = msg;
  editorialToast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    editorialToast.classList.remove('is-visible');
  }, 3500);
}
