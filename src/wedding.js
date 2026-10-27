import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * ============================================================================
 * THƯỚC PHIM CƯỚI RETRO VĂN TIẾN & BẢO CHÂU — JAVASCRIPT LOGIC
 * Tương tác lướt mượt mà, ScrollTrigger 3D vuốt đến đâu animation đến đó,
 * hiệu ứng mở phong bì chân thực, cuộn film 35mm & âm sắc hoài niệm
 * ============================================================================
 */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const body = document.body;

// 1. KHỞI TẠO LENIS SMOOTH SCROLL & ĐỒNG BỘ GSAP SCROLLTRIGGER
const lenis = new Lenis({
  duration: reducedMotion ? 0.01 : 1.8, // Cuộn chậm đều, quý phái
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 0.85,
  touchMultiplier: 1.1,
  infinite: false,
});

if (!body.classList.contains('invite-open')) {
  lenis.stop();
}

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Cập nhật thanh tiến trình cuộn phim
const filmProgress = document.querySelector('.film-scroll-bar .film-progress');
lenis.on('scroll', (e) => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (filmProgress && max > 0) {
    const progress = Math.min(1, Math.max(0, e.scroll / max));
    filmProgress.style.width = `${progress * 100}%`;
  }
});

// KHỞI TẠO CANVAS HIỆU ỨNG KHÔNG GIAN LÃNG MẠN (GOLDEN STARDUST & ROSE PETALS)
function initAmbientRomanticParticles() {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }, { passive: true });

  let mouseX = -500;
  let mouseY = -500;
  let prevMouseX = -500;
  let prevMouseY = -500;
  let mouseVelX = 0;
  let mouseVelY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseVelX = mouseX - prevMouseX;
    mouseVelY = mouseY - prevMouseY;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
  }, { passive: true });

  // Tối ưu 60FPS mobile: Giới hạn tối đa 12 hạt lơ lửng nhẹ nhàng, không shadowBlur
  const emberColors = ['#FFD166', '#FFE8A3', '#F4D06F', '#E29578', '#FFF9E6'];
  const embers = [];
  const emberCount = reducedMotion ? 4 : 8;

  for (let i = 0; i < emberCount; i++) {
    embers.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1 + Math.random() * 2.0,
      baseAlpha: 0.25 + Math.random() * 0.55,
      alpha: 0.5,
      pulseSpeed: 0.015 + Math.random() * 0.03,
      phase: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -0.2 - Math.random() * 0.45,
      color: emberColors[Math.floor(Math.random() * emberColors.length)],
    });
  }

  // 4 Cánh hoa hồng rơi lững lờ theo gió (Romantic Rose Petals)
  const petalColors = [
    'rgba(184, 58, 42, 0.72)',
    'rgba(205, 75, 58, 0.68)',
    'rgba(142, 38, 25, 0.65)',
    'rgba(224, 108, 92, 0.6)',
  ];
  const petals = [];
  const petalCount = reducedMotion ? 2 : 4;

  for (let i = 0; i < petalCount; i++) {
    petals.push({
      x: Math.random() * width,
      y: Math.random() * height,
      w: 8 + Math.random() * 7,
      h: 6 + Math.random() * 6,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      vy: 0.4 + Math.random() * 0.6,
      swayAngle: Math.random() * Math.PI * 2,
      swaySpeed: 0.02 + Math.random() * 0.02,
      swayDist: 0.5 + Math.random() * 0.6,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
    });
  }

  let isPaused = false;
  document.addEventListener('visibilitychange', () => {
    isPaused = document.hidden;
  });

  function render() {
    if (!isPaused) {
      ctx.clearRect(0, 0, width, height);

      // Cập nhật & Vẽ hạt bụi vàng (không dùng ctx.shadowBlur để giữ 60FPS)
      for (let i = 0; i < embers.length; i++) {
        const p = embers[i];
        p.phase += p.pulseSpeed;
        p.alpha = p.baseAlpha + Math.sin(p.phase) * 0.22;
        p.x += p.vx + Math.sin(p.phase * 0.5) * 0.25;
        p.y += p.vy;

        // Phản hồi luồng gió nhẹ khi lia chuột qua
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < 120 && dist > 0) {
          const force = (1 - dist / 120) * 1.5;
          p.x += (dx / dist) * force * 1.5 + mouseVelX * 0.03;
          p.y += (dy / dist) * force * 1.5 + mouseVelY * 0.03;
        }

        // Tái tạo khi bay quá màn hình
        if (p.y < -15) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -15) p.x = width + 10;
        if (p.x > width + 15) p.x = -10;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.fill();
        ctx.restore();
      }

      // Cập nhật & Vẽ cánh hoa hồng
      for (let i = 0; i < petals.length; i++) {
        const pt = petals[i];
        pt.swayAngle += pt.swaySpeed;
        pt.rotation += pt.rotSpeed;
        pt.x += Math.sin(pt.swayAngle) * pt.swayDist;
        pt.y += pt.vy;

        // Phản hồi luồng gió chuột trên cánh hoa
        const dx = pt.x - mouseX;
        const dy = pt.y - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < 130 && dist > 0) {
          const force = (1 - dist / 130) * 1.8;
          pt.x += (dx / dist) * force * 1.8 + mouseVelX * 0.04;
          pt.y += (dy / dist) * force * 1.8 + mouseVelY * 0.04;
          pt.rotation += 0.04;
        }

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
initAmbientRomanticParticles();

// 2. HIỆU ỨNG MỞ PHONG BÌ RETRO 3D CHÂN THỰC & LẮP ĐẦY MÀN HÌNH
const openEnvelopeTrigger = document.getElementById('openEnvelopeTrigger');
const skipEnvelopeTrigger = document.getElementById('skipEnvelopeTrigger');
const envWaxSeal = document.getElementById('envWaxSeal');
const envelopeBox = document.getElementById('envelopeBox');

let isEnvelopeOpening = false;

// A. KHỞI TẠO CON TRỎ CHUỘT NGHỆ THUẬT RETRO
function initRetroCursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring || window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;
  let isVisible = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isVisible) {
      isVisible = true;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
      ringX = mouseX;
      ringY = mouseY;
    }
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    isVisible = false;
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  gsap.ticker.add(() => {
    if (!isVisible) return;
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
  });

  const interactiveSelector = 'a, button, .env-wax-seal, .envelope-box, .film-frame-slide, .cine-photo-polaroid, .qr-card-box, input, textarea, select';
  document.addEventListener('mouseover', (e) => {
    if (e.target && e.target.closest && e.target.closest(interactiveSelector)) {
      ring.classList.add('is-hovering');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target && e.target.closest && e.target.closest(interactiveSelector)) {
      ring.classList.remove('is-hovering');
    }
  });
}
initRetroCursor();

// B. KHỞI TẠO HẠT BỤI VÀNG LƠ LỬNG TRONG KHÔNG GIAN CINEMATIC
function initIntroDust() {
  const container = document.getElementById('introDustParticles');
  if (!container) return;
  const count = 32;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'dust-particle';
    const size = 2 + Math.random() * 3.8;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${50 + Math.random() * 50}%`;
    p.style.animationDelay = `${Math.random() * 8}s`;
    p.style.animationDuration = `${6 + Math.random() * 7}s`;
    container.appendChild(p);
  }
}
initIntroDust();

// C. HIỆU ỨNG XUẤT HIỆN TRANG TRỌNG CỦA PHONG BÌ KHI TẢI TRANG
function initEnvelopeIntroEntrance() {
  if (reducedMotion) return;
  const envBox = document.getElementById('envelopeBox');
  const badge = document.getElementById('envHeaderBadge');
  const controls = document.getElementById('envControls');

  if (envBox) {
    gsap.fromTo(envBox,
      { y: 55, opacity: 0, rotateX: 12, scale: 0.92 },
      { y: 0, opacity: 1, rotateX: 0, scale: 1, duration: 1.35, ease: 'power3.out', delay: 0.15 }
    );
  }
  if (badge) {
    gsap.fromTo(badge,
      { y: -18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out', delay: 0.35 }
    );
  }
  if (controls) {
    gsap.fromTo(controls,
      { y: 22, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out', delay: 0.6 }
    );
  }
}
window.addEventListener('DOMContentLoaded', initEnvelopeIntroEntrance);
if (document.readyState !== 'loading') initEnvelopeIntroEntrance();

// D. TƯƠNG TÁC 3D PARALLAX THEO CHUỘT TRÊN PHONG BÌ THƯ
function initEnvelopeParallax() {
  const screen = document.getElementById('envelopeScreen');
  const box = document.getElementById('envelopeBox');
  if (!screen || !box || reducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

  screen.addEventListener('mousemove', (e) => {
    if (isEnvelopeOpening || body.classList.contains('invite-open')) return;
    const rect = screen.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    gsap.to(box, {
      rotateY: x * 9,
      rotateX: -y * 9,
      duration: 0.5,
      ease: 'power2.out',
      transformPerspective: 1200,
    });
  }, { passive: true });

  screen.addEventListener('mouseleave', () => {
    if (isEnvelopeOpening || body.classList.contains('invite-open')) return;
    gsap.to(box, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.8,
      ease: 'power2.out',
    });
  });
}
initEnvelopeParallax();

// E. 36 TIA PHÁO SÁNG VÀNG PHẢN HỒI KHI CHẠM DẤU SÁP
function createSealSparkles(x, y) {
  const container = document.getElementById('envelopeScreen') || document.body;
  const count = 36;
  const colors = ['#FFE4A0', '#FFD166', '#D49A32', '#B84736', '#FFFFFF'];

  for (let i = 0; i < count; i++) {
    const spark = document.createElement('div');
    const size = 3 + Math.random() * 4.5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    spark.style.position = 'fixed';
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.width = `${size}px`;
    spark.style.height = `${size}px`;
    spark.style.borderRadius = '50%';
    spark.style.background = color;
    spark.style.boxShadow = `0 0 10px ${color}, 0 0 4px #FFF`;
    spark.style.pointerEvents = 'none';
    spark.style.zIndex = '9999';
    container.appendChild(spark);

    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const distance = 55 + Math.random() * 95;

    gsap.to(spark, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance + (Math.random() * 35 + 15),
      opacity: 0,
      scale: 0.1,
      duration: 0.85 + Math.random() * 0.55,
      ease: 'power2.out',
      onComplete: () => spark.remove(),
    });
  }
}

// G. MẢNH VỠ CON DẤU SÁP 3D & SÓNG XUNG KÍCH VÀNG TỎA RA KHI MỞ
function createWaxSealShatter(x, y) {
  const container = document.getElementById('envelopeScreen') || document.body;

  // 1. Vòng sóng xung kích tỏa ra
  const shockwave = document.createElement('div');
  shockwave.className = 'wax-shockwave-ring';
  shockwave.style.left = `${x}px`;
  shockwave.style.top = `${y}px`;
  shockwave.style.width = '50px';
  shockwave.style.height = '50px';
  container.appendChild(shockwave);

  gsap.to(shockwave, {
    scale: 5.5,
    opacity: 0,
    duration: 0.9,
    ease: 'power2.out',
    onComplete: () => shockwave.remove(),
  });

  // 2. 6 Mảnh sáp vật lý nứt tung theo các hướng
  const clipPaths = [
    'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
    'polygon(30% 0%, 90% 20%, 100% 80%, 20% 100%, 0% 40%)',
    'polygon(0% 0%, 100% 20%, 80% 100%, 0% 80%)',
    'polygon(20% 0%, 100% 0%, 90% 90%, 10% 100%)',
    'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    'polygon(40% 10%, 90% 30%, 70% 90%, 10% 80%)',
  ];

  for (let i = 0; i < 6; i++) {
    const shard = document.createElement('div');
    shard.className = 'wax-shard';
    const size = 16 + Math.random() * 12;
    shard.style.width = `${size}px`;
    shard.style.height = `${size}px`;
    shard.style.clipPath = clipPaths[i % clipPaths.length];
    shard.style.left = `${x}px`;
    shard.style.top = `${y}px`;
    shard.style.transform = 'translate(-50%, -50%)';
    container.appendChild(shard);

    const angle = (i / 6) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const distance = 65 + Math.random() * 75;

    gsap.to(shard, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance + (Math.random() * 70 + 40),
      rotationX: Math.random() * 720 - 360,
      rotationY: Math.random() * 720 - 360,
      rotationZ: Math.random() * 720 - 360,
      scale: 0.15,
      opacity: 0,
      duration: 0.9 + Math.random() * 0.4,
      ease: 'power2.out',
      onComplete: () => shard.remove(),
    });
  }
}

// H. CHỚP SÁNG CUỘN PHIM 35MM KHI THIỆP LẮP ĐẦY MÀN HÌNH (PROJECTOR LIGHT LEAK FLASH)
function triggerFilmLightLeak() {
  const leak = document.getElementById('filmLightLeak');
  if (!leak) return;
  leak.classList.add('is-flashing');
  setTimeout(() => {
    leak.classList.remove('is-flashing');
  }, 450);
}

// F. TIẾN TRÌNH GSAP TIMELINE MỞ PHONG BÌ & PHÓNG TO THIỆP LẮP ĐẦY MÀN HÌNH
function handleOpenEnvelope(e) {
  if (body.classList.contains('invite-open') || isEnvelopeOpening) return;
  isEnvelopeOpening = true;

  const envelopeScreen = document.getElementById('envelopeScreen');
  const envBox = document.getElementById('envelopeBox');
  const envFlapTop = document.getElementById('envFlapTop');
  const envCard = document.getElementById('envCard');
  const seal = document.getElementById('envWaxSeal');
  const controls = document.getElementById('envControls');
  const badge = document.getElementById('envHeaderBadge');

  if (envCard) {
    envCard.classList.remove('env-card-closed');
  }

  if (envelopeScreen) envelopeScreen.classList.add('is-opening');

  // Lấy tọa độ con dấu sáp
  let sealX = window.innerWidth / 2;
  let sealY = window.innerHeight / 2;
  if (seal) {
    const rect = seal.getBoundingClientRect();
    sealX = rect.left + rect.width / 2;
    sealY = rect.top + rect.height / 2;
  }
  if (e && e.clientX && e.clientY) {
    sealX = e.clientX;
    sealY = e.clientY;
  }

  // Âm thanh nứt sáp & khởi động giai điệu
  playGentleChime();
  createSealSparkles(sealX, sealY);
  createWaxSealShatter(sealX, sealY);
  playWeddingMusic();

  if (reducedMotion) {
    body.classList.add('invite-open');
    if (envelopeScreen) envelopeScreen.style.display = 'none';
    const heroSection = document.getElementById('invitation');
    if (heroSection) lenis.scrollTo(heroSection, { duration: 0.1 });
    return;
  }

  // GSAP 3-STEP HIGH-PERFORMANCE 60FPS TIMELINE (0ms – 1150ms, NO BLACK SCREEN):
  const tl = gsap.timeline({
    onComplete: () => {
      body.classList.remove('invite-closed');
      body.classList.add('invite-open');
      lenis.start();
      window.scrollTo(0, 0);
      ScrollTrigger.refresh();
      if (envelopeScreen) {
        envelopeScreen.style.display = 'none';
      }
      const heroSection = document.getElementById('invitation');
      if (heroSection) {
        lenis.scrollTo(heroSection, { duration: 0.9, offset: 0 });
      }
    }
  });

  // Giai đoạn 1 (0ms - 350ms): Wax seal pulses & fades out, top triangular flap folds open 180deg
  if (seal) {
    tl.to(seal, {
      scale: 0.85,
      opacity: 0,
      duration: 0.35,
      ease: 'power2.in',
    }, 0);
  }

  if (controls || badge) {
    tl.to([controls, badge].filter(Boolean), {
      opacity: 0,
      y: 12,
      duration: 0.3,
      ease: 'power1.out',
    }, 0);
  }

  if (envFlapTop) {
    tl.to(envFlapTop, {
      rotateX: 180,
      duration: 0.55,
      ease: 'power2.inOut',
      onStart: () => {
        if (envelopeScreen) envelopeScreen.classList.add('flap-opened');
      }
    }, 0.05);
  }

  // Giai đoạn 2 (250ms - 800ms): Inner card slides smoothly upward (translate3d(0, -42%, 0)) with gentle spring
  if (envCard) {
    tl.set(envCard, {
      visibility: 'visible',
      opacity: 0,
    }, 0.22);

    tl.fromTo(envCard,
      { yPercent: 12, opacity: 0 },
      {
        yPercent: -42,
        opacity: 1,
        duration: 0.55,
        ease: 'back.out(1.25)',
        boxShadow: '0 24px 50px rgba(0,0,0,0.4)',
      },
      0.25
    );
  }

  if (envBox) {
    tl.to(envBox, {
      y: 16,
      scale: 0.98,
      duration: 0.55,
      ease: 'power2.out',
    }, 0.25);
  }

  // Trigger projector light leak flash
  tl.call(triggerFilmLightLeak, null, 0.7);

  // Giai đoạn 3 (700ms - 1150ms): Cross-dissolve envelope overlay directly over Hero section (scale 0.96 -> 1)
  if (envelopeScreen) {
    tl.to(envelopeScreen, {
      opacity: 0,
      duration: 0.45,
      ease: 'power2.out',
    }, 0.7);
  }

  gsap.fromTo('#invitation',
    { scale: 0.96, opacity: 0.4 },
    { scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.65 }
  );

  // Kích hoạt animation xuất hiện chữ nghệ thuật Hero
  gsap.fromTo('.hero-couple-title .title-word',
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.12, duration: 0.85, ease: 'power3.out', delay: 0.75 }
  );
  gsap.fromTo('.hero-couple-title .title-ampersand',
    { scale: 0.4, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.75, ease: 'back.out(1.5)', delay: 0.85 }
  );
}

function handleSkipEnvelope() {
  const envelopeScreen = document.getElementById('envelopeScreen');
  const envCard = document.getElementById('envCard');
  if (envelopeScreen) {
    envelopeScreen.classList.add('is-opening');
    envelopeScreen.style.opacity = '0';
    envelopeScreen.style.pointerEvents = 'none';
    setTimeout(() => { envelopeScreen.style.display = 'none'; }, 180);
  }
  if (envCard) {
    envCard.classList.remove('env-card-closed');
  }
  body.classList.remove('invite-closed');
  body.classList.add('invite-open');
  lenis.start();
  window.scrollTo(0, 0);
  ScrollTrigger.refresh();
  playWeddingMusic();
  const heroSection = document.getElementById('invitation');
  if (heroSection) {
    lenis.scrollTo(heroSection, { duration: 0.2, offset: 0 });
  }
}

if (openEnvelopeTrigger) {
  openEnvelopeTrigger.addEventListener('click', handleOpenEnvelope);
  openEnvelopeTrigger.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleOpenEnvelope(e);
  }, { passive: false });
}
if (envWaxSeal) {
  envWaxSeal.addEventListener('click', handleOpenEnvelope);
  envWaxSeal.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleOpenEnvelope(e);
  }, { passive: false });
}
if (envelopeBox) {
  envelopeBox.addEventListener('click', (e) => {
    // Bấm vào bất kỳ đâu trên phong bì cũng kích hoạt mở
    if (!isEnvelopeOpening) handleOpenEnvelope(e);
  });
}
if (skipEnvelopeTrigger) {
  skipEnvelopeTrigger.addEventListener('click', handleSkipEnvelope);
  skipEnvelopeTrigger.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleSkipEnvelope();
  }, { passive: false });
}

// 3. SCROLL-DRIVEN 3D ANIMATION: VUỐT ĐẾN ĐÂU ANIMATION ĐẾN ĐÓ
function initScrollTrigger3D() {
  if (reducedMotion) return;

  // A. Hiệu ứng Parallax cho Tấm Ảnh Đại Cảnh Mở Đầu (Hero Banner)
  const heroPhotoStage = document.getElementById('heroPhotoStage');
  const heroImg = document.querySelector('.hero-img-cinematic');
  if (heroPhotoStage && heroImg) {
    gsap.to(heroImg, {
      yPercent: 12,
      scale: 1.08,
      ease: 'none',
      scrollTrigger: {
        trigger: heroPhotoStage,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
      },
    });
  }

  // B. Phân Cảnh 03: Tactile Polaroid Scrapbook Deck (3D Alternating Scroll-Tilt & Tap-to-Focus)
  const polaroidCards = document.querySelectorAll('.polaroid-scrapbook-card');
  if (polaroidCards.length) {
    polaroidCards.forEach((card, idx) => {
      const isOdd = idx % 2 === 0;
      const initialTilt = isOdd ? -2.5 : 2.5;
      const restTilt = isOdd ? -1 : 1;
      const initialX = isOdd ? -20 : 20;
      const yearPill = card.querySelector('.polaroid-year-pill');

      gsap.fromTo(card,
        { x: initialX, y: 30, opacity: 0, rotate: initialTilt },
        {
          x: 0,
          y: 0,
          opacity: 1,
          rotate: restTilt,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none none',
          }
        }
      );

      if (yearPill) {
        gsap.fromTo(yearPill,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            ease: 'back.out(1.6)',
            scrollTrigger: {
              trigger: card,
              start: 'top 75%',
              toggleActions: 'play none none none',
            }
          }
        );
      }

      // Tap-to-focus: Chạm để thẳng ảnh & quét tia sáng ấm áp
      card.addEventListener('click', () => {
        polaroidCards.forEach(c => {
          if (c !== card) c.classList.remove('is-focused');
        });
        card.classList.toggle('is-focused');
      });
    });
  }

  // C. Hiệu ứng hiển thị 60FPS cho từng phân cảnh (Chapter Cards)
  const chapterCards = document.querySelectorAll('.film-chapter-card');
  chapterCards.forEach((card) => {
    gsap.fromTo(
      card,
      { y: 24, scale: 0.98, opacity: 0 },
      {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // D. Hiệu ứng vạch kẻ tiêu đề chương vẽ ra nhẹ nhàng khi cuộn tới
  const chapterLines = document.querySelectorAll('.chapter-badge-line .chapter-line');
  chapterLines.forEach((line) => {
    gsap.fromTo(
      line,
      { scaleX: 0, transformOrigin: 'left center' },
      {
        scaleX: 1,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: line,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // E. Phân cảnh 01: Gia Đình Hai Họ (Medallion Spring Bounce, Expanding Divider Lines & Staggered Family Slide-in)
  const familyCard = document.getElementById('family');
  const familyCrest = document.querySelector('.family-center-crest');
  const dividerLines = document.querySelectorAll('.divider-gold-line');
  const groomBlock = document.getElementById('groomFamilyBlock');
  const brideBlock = document.getElementById('brideFamilyBlock');

  if (familyCard) {
    ScrollTrigger.create({
      trigger: familyCard,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        if (familyCrest) {
          gsap.fromTo(familyCrest,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.75, ease: 'back.out(1.6)' }
          );
        }
        if (dividerLines.length) {
          gsap.fromTo(dividerLines,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.85, ease: 'power2.out', delay: 0.15 }
          );
        }
        if (groomBlock) {
          gsap.fromTo(groomBlock,
            { x: -16, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.25 }
          );
        }
        if (brideBlock) {
          gsap.fromTo(brideBlock,
            { x: 16, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.35 }
          );
        }
      }
    });
  }

  // F. Phân cảnh 02: Bức thư uyên ương — viền đỏ mọc xuống, từng đoạn văn & con tem xuất hiện
  const letterSheet = document.querySelector('.letter-sheet-container');
  if (letterSheet) {
    const letterParas = letterSheet.querySelectorAll('.letter-body-copy p, .letter-salutation, .letter-sign-block');
    const letterStamp = letterSheet.querySelector('.letter-postmark-stamp');

    if (letterParas.length) {
      gsap.fromTo(letterParas,
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#letter',
            start: 'top 75%',
            toggleActions: 'play none none none',
          }
        }
      );
    }

    if (letterStamp) {
      gsap.fromTo(letterStamp,
        { scale: 1.45, opacity: 0, rotate: 25 },
        {
          scale: 1,
          opacity: 0.85,
          rotate: 12,
          duration: 0.7,
          ease: 'back.out(1.6)',
          scrollTrigger: {
            trigger: '#letter',
            start: 'top 70%',
            toggleActions: 'play none none none',
          }
        }
      );
    }
  }

  // G. Phân cảnh 04: Bảng màu trang phục — 5 vòng tròn màu pop-in nảy lò xo
  const swatches = document.querySelectorAll('.color-swatch-box');
  if (swatches.length) {
    gsap.fromTo(swatches,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        stagger: 0.08,
        duration: 0.6,
        ease: 'back.out(1.8)',
        scrollTrigger: {
          trigger: '.dress-code-panel',
          start: 'top 85%',
          toggleActions: 'play none none none',
        }
      }
    );
  }
}

// TƯƠNG TÁC 3D TILT & VỆT SÁNG QUÉT DYNAMIC TRÊN TẤM ẢNH ĐẠI CẢNH HERO
function initHeroPhotoTilt() {
  const stage = document.getElementById('heroPhotoStage');
  const glare = document.getElementById('heroPhotoGlare');
  const wrapper = stage?.querySelector('.hero-photo-wrapper');
  if (!stage || !wrapper || reducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

  stage.addEventListener('mousemove', (e) => {
    const rect = stage.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    gsap.to(wrapper, {
      rotateY: x * 7,
      rotateX: -y * 7,
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
  }, { passive: true });

  stage.addEventListener('mouseleave', () => {
    gsap.to(wrapper, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.8,
      ease: 'power2.out',
    });
  });
}

// TƯƠNG TÁC 3D TILT TỰ NHIÊN TRÊN CÁC KHUNG ẢNH POLAROID
function initPolaroidTilt() {
  if (reducedMotion || window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('.cine-photo-polaroid, .sticky-polaroid-card .polaroid-frame-box').forEach((polaroid) => {
    polaroid.addEventListener('mousemove', (e) => {
      const rect = polaroid.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      gsap.to(polaroid, {
        rotateY: x * 8,
        rotateX: -y * 8,
        scale: 1.03,
        duration: 0.35,
        ease: 'power1.out',
      });
    }, { passive: true });

    polaroid.addEventListener('mouseleave', () => {
      gsap.to(polaroid, {
        rotateY: 0,
        rotateX: 0,
        scale: 1,
        duration: 0.6,
        ease: 'power2.out',
      });
    });
  });
}

// Chạy sau khi DOM đã render
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initScrollTrigger3D();
    initHeroPhotoTilt();
    initPolaroidTilt();
  });
} else {
  initScrollTrigger3D();
  initHeroPhotoTilt();
  initPolaroidTilt();
}

// 4. ĐỒNG HỒ ĐẾM NGƯỢC THỜI GIAN THỰC (COUNTDOWN TIMER)
// 10:30 AM Thứ Bảy, 18.12.2027 GMT+7
const targetDate = new Date('2027-12-18T10:30:00+07:00').getTime();
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

// 5. THÊM NGÀY CƯỚI VÀO LỊCH (GOOGLE / APPLE CALENDAR)
const addToCalBtn = document.getElementById('addToCalBtn');
if (addToCalBtn) {
  addToCalBtn.addEventListener('click', () => {
    const title = encodeURIComponent('Lễ Cưới Văn Tiến & Bảo Châu');
    const details = encodeURIComponent('Trân trọng kính mời bạn đến chung vui trong ngày hạnh phúc của Văn Tiến & Bảo Châu tại Đà Nẵng.');
    const location = encodeURIComponent('Trung tâm Tiệc cưới Vườn Trong Nắng, 02 Đường 2 Tháng 9, Hải Châu, Đà Nẵng');
    const start = '20271218T033000Z'; // 10:30 AM GMT+7
    const end = '20271218T140000Z';   // 21:00 PM GMT+7

    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
    window.open(googleCalUrl, '_blank', 'noopener,noreferrer');
    showEditorialToast('Đang mở Lịch Google để lưu ngày cưới...');
  });
}

// 6. CUỘN PHIM 35MM (35MM FILM REEL SLIDER) & LIGHTBOX PHÓNG TO
const filmStripTrack = document.getElementById('filmStripTrack');
const filmSlides = document.querySelectorAll('.film-frame-slide');
const filmPrevBtn = document.getElementById('filmPrevBtn');
const filmNextBtn = document.getElementById('filmNextBtn');
const filmCounter = document.getElementById('filmCounter');

// Danh sách các bức ảnh chất lượng cao đã chọn lọc từ thư mục photo
const curatedFilmPhotos = [
  { src: '/photo/BEE05873.JPG', caption: 'Đại cảnh chung đôi hạnh phúc — Văn Tiến & Bảo Châu' },
  { src: '/photo/BEE05727.JPG', caption: 'Bàn tay tạo hình trái tim ôm trọn nụ cười rạng rỡ' },
  { src: '/photo/BEE06018.JPG', caption: 'Kính râm retro cá tính & nụ cười tràn ngập niềm vui' },
  { src: '/photo/BEE06042.JPG', caption: 'Lời thề hẹn ước Vows trăm năm gắn kết' },
  { src: '/photo/BEE05929.JPG', caption: 'Ánh mắt đong đầy thương mến bên hoa cưới nhung đỏ' },
  { src: '/photo/BEE05509.JPG', caption: 'Khoảnh khắc rạng ngời cùng bó hoa cưới trắng tinh khôi' },
  { src: '/photo/BEE05674.JPG', caption: 'Trang trọng cùng đọc lời hẹn ước trọn đời' },
  { src: '/photo/BEE06457.JPG', caption: 'Chữ Hỷ Vu Quy đỏ thắm bên tà áo dài truyền thống' },
  { src: '/photo/BEE06251.JPG', caption: 'Nụ cười tinh nghịch và ánh mắt tràn ngập yêu thương' },
  { src: '/photo/BEE05707.JPG', caption: 'Bình yên luôn ở phía sau lưng anh' },
];

let currentFilmIndex = 0;
const totalFilmSlides = filmSlides.length;

function updateFilmCounter() {
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

  // Hiệu ứng 3D Coverflow Perspective 60FPS
  filmSlides.forEach((slide, idx) => {
    if (idx === closestIdx) {
      slide.style.transform = 'scale(1) translateZ(0)';
      slide.style.opacity = '1';
    } else {
      slide.style.transform = 'scale(0.92)';
      slide.style.opacity = '0.65';
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
  updateFilmCounter();
}

if (filmPrevBtn) {
  filmPrevBtn.addEventListener('click', () => {
    scrollToFilmFrame(currentFilmIndex - 1);
  });
}

if (filmNextBtn) {
  filmNextBtn.addEventListener('click', () => {
    scrollToFilmFrame(currentFilmIndex + 1);
  });
}

if (filmStripTrack) {
  filmStripTrack.addEventListener('scroll', () => {
    requestAnimationFrame(updateFilmCounter);
  }, { passive: true });
}

// Flash chớp sáng máy ảnh (Camera Shutter Flash Effect - 120ms)
function triggerCameraShutterFlash() {
  const flash = document.getElementById('cameraShutterFlash');
  if (!flash) return;
  flash.classList.add('is-flashing');
  setTimeout(() => {
    flash.classList.remove('is-flashing');
  }, 120);
}

// Lightbox Modal
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

// Chạm bất kỳ ảnh nào trong Cuộn phim 35MM để nháy Flash và mở Lightbox
filmSlides.forEach((slide) => {
  slide.addEventListener('click', () => {
    const idx = parseInt(slide.dataset.index, 10) || 0;
    triggerCameraShutterFlash();
    setTimeout(() => {
      openCinematicLightbox(idx);
    }, 60);
  });
});

// Chạm bất kỳ ảnh nào trong Phân Cảnh 03 (Polaroid Scrapbook) để nháy Flash và mở Lightbox
document.querySelectorAll('.polaroid-scrapbook-card').forEach((card, idx) => {
  const img = card.querySelector('.polaroid-photo-canvas img');
  const captionEl = card.querySelector('.chin-title');
  const captionText = captionEl ? captionEl.textContent : `Thước phim chuyện mình · Cảnh 0${idx + 1}`;
  if (img) {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerCameraShutterFlash();
      setTimeout(() => {
        openCustomPhotoLightbox(img.src, captionText);
      }, 60);
    });
  }
});

if (lightboxExitBtn) lightboxExitBtn.addEventListener('click', closeCinematicLightbox);
if (lightboxCurtain) lightboxCurtain.addEventListener('click', closeCinematicLightbox);

if (lightboxPrevBtn) {
  lightboxPrevBtn.addEventListener('click', () => {
    activePhotoIndex = (activePhotoIndex - 1 + curatedFilmPhotos.length) % curatedFilmPhotos.length;
    renderLightboxPhoto();
  });
}

if (lightboxNextBtn) {
  lightboxNextBtn.addEventListener('click', () => {
    activePhotoIndex = (activePhotoIndex + 1) % curatedFilmPhotos.length;
    renderLightboxPhoto();
  });
}

// Cử chỉ vuốt tay (Swipe) chuyển ảnh mượt mà trên điện thoại
let touchStartX = 0;
let touchEndX = 0;
if (cinematicLightbox) {
  cinematicLightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  cinematicLightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        lightboxPrevBtn?.click();
      } else {
        lightboxNextBtn?.click();
      }
    }
  }, { passive: true });
}

window.addEventListener('keydown', (e) => {
  if (!cinematicLightbox?.classList.contains('is-open')) return;
  if (e.key === 'Escape') closeCinematicLightbox();
  if (e.key === 'ArrowLeft') lightboxPrevBtn?.click();
  if (e.key === 'ArrowRight') lightboxNextBtn?.click();
});

// 7. SEGMENTED PILL SWITCHER & 3D HORIZONTAL CARD FLIP (MỪNG CƯỚI)
const tabGroomBtn = document.getElementById('tabGroomBtn');
const tabBrideBtn = document.getElementById('tabBrideBtn');
const panelGroom = document.getElementById('panelGroom');
const panelBride = document.getElementById('panelBride');
const giftSliderPill = document.getElementById('giftSliderPill');

function switchGiftTab(target) {
  if (target === 'groom') {
    if (tabGroomBtn) tabGroomBtn.classList.add('is-active');
    if (tabBrideBtn) tabBrideBtn.classList.remove('is-active');
    if (giftSliderPill) giftSliderPill.style.transform = 'translate3d(0, 0, 0)';
    if (panelGroom && panelBride) {
      panelGroom.classList.add('is-active', 'is-flipping');
      panelBride.classList.remove('is-active', 'is-flipping');
      setTimeout(() => panelGroom.classList.remove('is-flipping'), 400);
    }
  } else {
    if (tabBrideBtn) tabBrideBtn.classList.add('is-active');
    if (tabGroomBtn) tabGroomBtn.classList.remove('is-active');
    if (giftSliderPill) giftSliderPill.style.transform = 'translate3d(100%, 0, 0)';
    if (panelGroom && panelBride) {
      panelBride.classList.add('is-active', 'is-flipping');
      panelGroom.classList.remove('is-active', 'is-flipping');
      setTimeout(() => panelBride.classList.remove('is-flipping'), 400);
    }
  }
}

if (tabGroomBtn) {
  tabGroomBtn.addEventListener('click', () => switchGiftTab('groom'));
}
if (tabBrideBtn) {
  tabBrideBtn.addEventListener('click', () => switchGiftTab('bride'));
}

// BÙNG NỔ PHÁO HOA KIM TUYẾN VÀNG KHI SAO CHÉP SỐ TÀI KHOẢN
function createCoinConfetti(btn) {
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  const count = 22;
  const colors = ['#FFD166', '#FFE4A0', '#D49A32', '#FFF5D6', '#E85D48'];

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'gold-confetti-particle';
    const size = 5 + Math.random() * 7;
    const isCircle = Math.random() > 0.4;
    p.style.width = `${size}px`;
    p.style.height = `${isCircle ? size : size * 1.5}px`;
    p.style.borderRadius = isCircle ? '50%' : '2px';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.left = `${originX}px`;
    p.style.top = `${originY}px`;
    document.body.appendChild(p);

    const angle = Math.random() * Math.PI + Math.PI; // Vòng cung bắn lên (180° - 360°)
    const distance = 40 + Math.random() * 110;
    const spreadX = (Math.random() - 0.5) * 120;

    gsap.to(p, {
      x: spreadX,
      y: Math.sin(angle) * distance + (Math.random() * 50 + 40),
      rotation: Math.random() * 720 - 360,
      opacity: 0,
      scale: 0.3,
      duration: 0.9 + Math.random() * 0.6,
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
      navigator.clipboard.writeText(acc).then(() => {
        showEditorialToast(`Đã sao chép số tài khoản: ${acc}`);
      }).catch(() => {
        showEditorialToast(`Số tài khoản: ${acc}`);
      });
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
    wish: 'Chúc anh Tiến và bé Châu trăm năm hạnh phúc, bền chặt yêu thương và sớm đón thiên thần nhỏ nhé!'
  },
  {
    name: 'Minh Đức',
    time: '1 giờ trước',
    wish: 'Chúc mừng người anh em đã tìm được một nửa hoàn hảo của cuộc đời. Hẹn gặp hai bạn ở Đà Nẵng ngày 18.12!'
  },
  {
    name: 'Ngọc Anh',
    time: 'Hôm qua',
    wish: 'Cô dâu chú rể đẹp đôi nhất trần đời! Chúc hai bạn một hành trình mới ngập tràn tiếng cười và thương yêu đong đầy.'
  }
];

const guestbookStream = document.getElementById('guestbookStream');
const wishesCounter = document.getElementById('wishesCounter');
const weddingRsvpForm = document.getElementById('weddingRsvpForm');

function loadGuestbook() {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem('wedding_guestbook_tien_chau') || localStorage.getItem('wedding_guestbook_thai_tran') || '[]');
  } catch {}

  const combined = [...saved, ...defaultWishes];
  renderGuestbook(combined);
}

function renderGuestbook(list) {
  if (!guestbookStream) return;
  if (wishesCounter) wishesCounter.textContent = `${list.length} lời chúc`;

  guestbookStream.innerHTML = list
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
  guestbookStream.scrollTop = 0;
}

function sanitize(str) {
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
}

loadGuestbook();

// HIỆU ỨNG PHÁO TIM / BỤI VÀNG CHÚC PHÚC KHI GỬI RSVP
function createCelebrationBurst(btn) {
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const icons = ['❤️', '✨', '囍', '💛', '🌸', '🥂'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('span');
    p.textContent = icons[Math.floor(Math.random() * icons.length)];
    p.style.position = 'fixed';
    p.style.left = `${centerX}px`;
    p.style.top = `${centerY}px`;
    p.style.fontSize = `${14 + Math.random() * 12}px`;
    p.style.pointerEvents = 'none';
    p.style.zIndex = '99999';
    p.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(p);

    const angle = (i / 20) * Math.PI * 2;
    const distance = 45 + Math.random() * 75;
    gsap.to(p, {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - (30 + Math.random() * 20),
      opacity: 0,
      scale: 0.3,
      duration: 1.1 + Math.random() * 0.45,
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
      name: name,
      time: 'Vừa xong',
      wish: wish || (attendance === 'yes' ? 'Hẹn gặp Văn Tiến & Bảo Châu trong ngày vui sắp tới!' : 'Chúc hai bạn trăm năm hạnh phúc và ngập tràn niềm vui!')
    };

    try {
      const saved = JSON.parse(localStorage.getItem('wedding_guestbook_tien_chau') || localStorage.getItem('wedding_guestbook_thai_tran') || '[]');
      saved.unshift(newEntry);
      localStorage.setItem('wedding_guestbook_tien_chau', JSON.stringify(saved));
    } catch {}

    loadGuestbook();
    const firstItem = guestbookStream?.querySelector('.stream-item');
    if (firstItem) {
      firstItem.classList.add('wish-pop-in');
    }
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

// Âm thanh nứt dấu sáp & chuỗi pha lê lãng mạn bằng Web Audio
function playGentleChime() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    // A. Tiếng nứt sáp (Crackle noise burst)
    const bufferSize = audioCtx.sampleRate * 0.1;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1400, now);
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.09, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(now);

    // B. Chuỗi âm sắc chuông pha lê lãng mạn
    const playTone = (freq, time, length = 0.8) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.12, time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + length);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(time);
      osc.stop(time + length);
    };

    playTone(523.25, now + 0.02, 0.6); // C5
    playTone(659.25, now + 0.12, 0.7); // E5
    playTone(783.99, now + 0.22, 0.9); // G5
    playTone(1046.50, now + 0.32, 1.2); // C6
  } catch {}
}

// NỐT NHẠC BAY LƠ LỬNG KHI PHÁT BÀI HÁT
let floatingNotesInterval = null;
const noteSymbols = ['♫', '♪', '♩', '♬', '𝄢'];

function spawnFloatingNote() {
  const container = document.getElementById('floatingNotes');
  if (!container || !isAudioActive) return;

  const note = document.createElement('span');
  note.className = 'floating-note';
  note.textContent = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];
  const size = 13 + Math.random() * 9;
  note.style.fontSize = `${size}px`;
  note.style.left = `${Math.random() * 30 - 15}px`;
  container.appendChild(note);

  setTimeout(() => {
    note.remove();
  }, 1800);
}

function startFloatingNotes() {
  if (floatingNotesInterval) clearInterval(floatingNotesInterval);
  spawnFloatingNote();
  floatingNotesInterval = setInterval(spawnFloatingNote, 1300);
}

function stopFloatingNotes() {
  if (floatingNotesInterval) {
    clearInterval(floatingNotesInterval);
    floatingNotesInterval = null;
  }
}

// Bắt đầu phát bài nhạc cưới lãng mạn với âm lượng tăng dần êm ái (Fade In)
function playWeddingMusic() {
  const audio = weddingAudio || document.getElementById('weddingAudio');
  if (!audio) return;

  if (audioFadeInterval) {
    clearInterval(audioFadeInterval);
    audioFadeInterval = null;
  }

  // Bắt đầu từ mức 0 để fade-in êm ái
  audio.volume = 0;
  const playPromise = audio.play();

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        isAudioActive = true;
        if (vinylPlayer) vinylPlayer.classList.add('is-playing');
        if (musicToggleBtn) musicToggleBtn.setAttribute('aria-pressed', 'true');
        if (musicLabelText) musicLabelText.textContent = 'Đang phát';
        startFloatingNotes();

        // Tăng âm lượng mượt mà (Fade In từ 0 đến 0.75)
        let vol = 0;
        audioFadeInterval = setInterval(() => {
          vol += 0.05;
          if (vol >= 0.75) {
            audio.volume = 0.75;
            clearInterval(audioFadeInterval);
            audioFadeInterval = null;
          } else {
            audio.volume = Number(vol.toFixed(2));
          }
        }, 75);
      })
      .catch((err) => {
        // Trình duyệt chặn autoplay khi chưa có tương tác trực tiếp
        console.warn('Cần tương tác của người dùng để phát nhạc:', err);
      });
  }
}

// Tạm dừng bài hát với hiệu ứng giảm âm lượng êm dịu (Fade Out)
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
      if (vinylPlayer) vinylPlayer.classList.remove('is-playing');
      if (musicToggleBtn) musicToggleBtn.setAttribute('aria-pressed', 'false');
      if (musicLabelText) musicLabelText.textContent = 'Giai điệu';
    } else {
      audio.volume = Number(vol.toFixed(2));
    }
  }, 45);
}

// Chuyển đổi trạng thái Bật / Tắt nhạc nền
function toggleWeddingMusic() {
  const audio = weddingAudio || document.getElementById('weddingAudio');
  if (!audio) return;

  if (isAudioActive && !audio.paused) {
    pauseWeddingMusic();
    showEditorialToast('Đã tạm dừng giai điệu');
  } else {
    playWeddingMusic();
    showEditorialToast('Đang phát: Gói Con Tim Làm Quà (Bò Sữa Bay OST) — Nguyễn Hùng ♫');
  }
}

if (musicToggleBtn) {
  musicToggleBtn.addEventListener('click', toggleWeddingMusic);
}

if (weddingAudio) {
  weddingAudio.addEventListener('ended', () => {
    weddingAudio.currentTime = 0;
    weddingAudio.play().catch(() => {});
  });
}

// 10. ĐIỀU HƯỚNG MƯỢT MÀ VỚI LENIS KHI NHẤP LINK ANCHOR
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

    lenis.scrollTo(targetEl, {
      duration: reducedMotion ? 0.01 : 1.6,
      offset: -40,
    });
  });
});

// 11. ĐỒNG BỘ NÚT ACTIVE TRÊN THANH DOCK CAPSULE MOBILE — "iOS 26 LIQUID GLASS & GOOEY MORPHING"
function initMobileStickyBar() {
  const bar = document.getElementById('mobileStickyBar');
  const pillIndicator = document.getElementById('liquidNavPill');
  const pills = document.querySelectorAll('.editorial-sticky-bar .bar-link-pill');
  if (!pills.length || !bar) return;

  // Hỗ trợ đồng bộ cả 2 chuẩn định danh Section ID: Tiếng Anh và Tiếng Việt
  const sections = [
    { el: document.getElementById('itinerary') || document.getElementById('lich-trinh'), index: 0 },
    { el: document.getElementById('film-reel') || document.getElementById('cuon-phim'), index: 1 },
    { el: document.getElementById('wedding-gift') || document.getElementById('mung-cuoi'), index: 2 },
    { el: document.getElementById('rsvp'), index: 3 }
  ];

  let currentIndex = 0;

  function setActiveIndex(newIndex) {
    if (newIndex < 0 || newIndex > 3) return;
    if (currentIndex !== newIndex) {
      if (pillIndicator) {
        pillIndicator.classList.remove('is-morphing');
        void pillIndicator.offsetWidth; // Trigger reflow để chạy hiệu ứng kéo dãn giọt nước liquidStretch
        pillIndicator.classList.add('is-morphing');
      }
      currentIndex = newIndex;
    }
    bar.style.setProperty('--active-index', newIndex);

    pills.forEach((pill, idx) => {
      if (idx === newIndex) {
        pill.classList.add('is-active');
      } else {
        pill.classList.remove('is-active');
      }
    });
  }

  // Tương tác chạm tức thời trên mỗi tab
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const idx = parseInt(pill.dataset.index, 10);
      if (!isNaN(idx)) {
        setActiveIndex(idx);
      }
    });
  });

  // 60FPS Hardware-Accelerated Scroll-Spy bằng IntersectionObserver (Không dùng window scroll geometry queries)
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          const topVisible = visibleEntries[0];
          const matched = sections.find((s) => s.el === topVisible.target);
          if (matched) {
            setActiveIndex(matched.index);
          }
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
