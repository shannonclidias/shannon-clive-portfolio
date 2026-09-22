/**
 * Shannon Clive Dias — Portfolio Interactive Controller
 * Features:
 * - Dual Mode: Editorial Scroll vs. Presentation Deck Mode (1-to-1 slides)
 * - Video Reel Player with switcher (DJ Keagen, Cain Reel, Teran)
 * - High-Resolution Photo Lightbox with navigation
 * - Keyboard & Touch navigation
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. VIDEO REELS & STAGE CONTROLLER
  // =========================================================================
  function setupReelPlayer(frame, video) {
    if (!frame || !video) return;

    const overlay = frame.querySelector('.video-overlay');
    const playBtn = frame.querySelector('.play-trigger-btn');
    const soundBtn = frame.querySelector('.sound-toggle-btn');
    const fsBtn = frame.querySelector('.fullscreen-btn');

    const togglePlay = (e) => {
      // Prevent double firing when clicking child buttons
      if (e.target.closest('.reel-controls')) return;

      if (video.paused) {
        // Pause other videos
        document.querySelectorAll('video').forEach(v => {
          if (v !== video) {
            v.pause();
            v.closest('.reel-frame')?.classList.remove('playing');
          }
        });

        video.play().then(() => {
          frame.classList.add('playing');
        }).catch(err => console.log('Playback error:', err));
      } else {
        video.pause();
        frame.classList.remove('playing');
      }
    };

    frame.addEventListener('click', togglePlay);

    video.addEventListener('play', () => frame.classList.add('playing'));
    video.addEventListener('pause', () => frame.classList.remove('playing'));
    video.addEventListener('ended', () => {
      frame.classList.remove('playing');
    });

    // Sound toggle
    if (soundBtn) {
      soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        const iconMuted = soundBtn.querySelector('.icon-muted');
        const iconUnmuted = soundBtn.querySelector('.icon-unmuted');
        if (iconMuted && iconUnmuted) {
          iconMuted.style.display = video.muted ? 'block' : 'none';
          iconUnmuted.style.display = video.muted ? 'none' : 'block';
        }
      });
    }

    // Fullscreen toggle
    if (fsBtn) {
      fsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (video.requestFullscreen) {
          video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
          video.webkitRequestFullscreen();
        }
      });
    }
  }

  // Initialize each reel player across Slide 3 and Slide 4
  document.querySelectorAll('.reel-frame').forEach(frame => {
    const video = frame.querySelector('.reel-video');
    setupReelPlayer(frame, video);
  });

  // =========================================================================
  // 2. HIGH-RESOLUTION PHOTO LIGHTBOX
  // =========================================================================
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  const backdrop = document.querySelector('.lightbox-backdrop');

  const clickableImages = Array.from(document.querySelectorAll('.clickable-img'));
  let currentImageIndex = 0;

  function openLightbox(index) {
    if (index < 0 || index >= clickableImages.length) return;
    currentImageIndex = index;
    const imgEl = clickableImages[index];
    const fullSrc = imgEl.getAttribute('data-full') || imgEl.getAttribute('src');
    const caption = imgEl.getAttribute('data-caption') || imgEl.getAttribute('alt') || '';

    lightboxImg.src = fullSrc;
    lightboxCaption.textContent = caption;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    if (!document.body.classList.contains('deck-mode')) {
      document.body.style.overflow = '';
    }
  }

  function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % clickableImages.length;
    openLightbox(currentImageIndex);
  }

  function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + clickableImages.length) % clickableImages.length;
    openLightbox(currentImageIndex);
  }

  clickableImages.forEach((img, idx) => {
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox(idx);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (backdrop) backdrop.addEventListener('click', closeLightbox);
  if (nextBtn) nextBtn.addEventListener('click', nextImage);
  if (prevBtn) prevBtn.addEventListener('click', prevImage);

  // =========================================================================
  // 3. PRESENTATION DECK MODE (Slide-by-Slide Canva style)
  // =========================================================================
  const toggleDeckBtn = document.getElementById('toggle-deck-btn');
  const deckCloseBtn = document.getElementById('deck-close-btn');
  const deckPrevBtn = document.getElementById('deck-prev-btn');
  const deckNextBtn = document.getElementById('deck-next-btn');
  const currentSlideNumEl = document.getElementById('current-slide-num');
  const totalSlideNumEl = document.getElementById('total-slide-num');

  const slides = Array.from(document.querySelectorAll('.slide-section'));
  let currentSlideIndex = 0;
  let isDeckMode = false;

  if (totalSlideNumEl) {
    totalSlideNumEl.textContent = String(slides.length).padStart(2, '0');
  }

  function updateDeckView(newIndex) {
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= slides.length) newIndex = slides.length - 1;
    currentSlideIndex = newIndex;

    slides.forEach((slide, idx) => {
      if (idx === currentSlideIndex) {
        slide.classList.add('deck-active');
      } else {
        slide.classList.remove('deck-active');
      }
    });

    if (currentSlideNumEl) {
      currentSlideNumEl.textContent = String(currentSlideIndex + 1).padStart(2, '0');
    }
  }

  function enterDeckMode(initialIndex = 0) {
    isDeckMode = true;
    document.body.classList.remove('scroll-mode');
    document.body.classList.add('deck-mode');
    if (toggleDeckBtn) {
      toggleDeckBtn.querySelector('.btn-text').textContent = 'Scroll View';
    }
    updateDeckView(initialIndex);
  }

  function exitDeckMode() {
    isDeckMode = false;
    document.body.classList.remove('deck-mode');
    document.body.classList.add('scroll-mode');
    slides.forEach(slide => slide.classList.remove('deck-active'));
    if (toggleDeckBtn) {
      toggleDeckBtn.querySelector('.btn-text').textContent = 'Deck View';
    }
    document.body.style.overflow = '';
    // Scroll to the active slide smoothly
    slides[currentSlideIndex].scrollIntoView({ behavior: 'smooth' });
  }

  if (toggleDeckBtn) {
    toggleDeckBtn.addEventListener('click', () => {
      if (isDeckMode) {
        exitDeckMode();
      } else {
        // Find whichever slide is currently in view
        let visibleIdx = 0;
        const scrollPos = window.scrollY + window.innerHeight / 3;
        slides.forEach((slide, idx) => {
          if (scrollPos >= slide.offsetTop) visibleIdx = idx;
        });
        enterDeckMode(visibleIdx);
      }
    });
  }

  if (deckCloseBtn) deckCloseBtn.addEventListener('click', exitDeckMode);
  if (deckNextBtn) deckNextBtn.addEventListener('click', () => updateDeckView(currentSlideIndex + 1));
  if (deckPrevBtn) deckPrevBtn.addEventListener('click', () => updateDeckView(currentSlideIndex - 1));

  // =========================================================================
  // 4. KEYBOARD NAVIGATION
  // =========================================================================
  window.addEventListener('keydown', (e) => {
    // If Lightbox is open:
    if (lightbox.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      return;
    }

    // If Deck Mode is active:
    if (isDeckMode) {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        updateDeckView(currentSlideIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        updateDeckView(currentSlideIndex - 1);
      } else if (e.key === 'Escape') {
        exitDeckMode();
      }
    }
  });

  // =========================================================================
  // 5. TOUCH SWIPE NAVIGATION (Mobile Deck Mode)
  // =========================================================================
  let touchStartX = 0;
  let touchStartY = 0;

  window.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (!isDeckMode && !lightbox.classList.contains('active')) return;

    const diffX = e.changedTouches[0].screenX - touchStartX;
    const diffY = e.changedTouches[0].screenY - touchStartY;

    // Detect horizontal swipe if delta X > delta Y and > 40px
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX < 0) {
        // Swiped Left -> Next
        if (lightbox.classList.contains('active')) nextImage();
        else updateDeckView(currentSlideIndex + 1);
      } else {
        // Swiped Right -> Prev
        if (lightbox.classList.contains('active')) prevImage();
        else updateDeckView(currentSlideIndex - 1);
      }
    }
  }, { passive: true });

  // =========================================================================
  // 6. SCROLL SPY FOR HEADER NAV
  // =========================================================================
  const navLinks = document.querySelectorAll('.nav-links .nav-link');
  window.addEventListener('scroll', () => {
    if (isDeckMode) return;
    const scrollPos = window.scrollY + 120;

    slides.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });

});
