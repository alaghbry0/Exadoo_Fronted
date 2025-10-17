(function () {
  'use strict';

  // --- 1. DOM Selection & Params ---
  const params = new URLSearchParams(location.search);
  const u = params.get('u') || '';
  const h = params.get('h') || '';
  const t = params.get('t') || '';

  const stage = document.getElementById('stage');
  const video = document.getElementById('v');
  const gate = document.getElementById('gate');
  const fallback = document.getElementById('fallback');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const nudgeLeft = document.getElementById('nudgeLeft');
  const nudgeRight = document.getElementById('nudgeRight');
  const tapLeft = document.getElementById('tapLeft');
  const tapRight = document.getElementById('tapRight');
  const controlsContainer = document.getElementById('controls-container');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const volumeBtn = document.getElementById('volumeBtn');
  const volumeIcon = document.getElementById('volumeIcon');
  const muteIcon = document.getElementById('muteIcon');
  const volumeSlider = document.getElementById('volumeSlider');
  const volumeLevel = document.getElementById('volumeLevel');
  const timeDisplay = document.getElementById('timeDisplay');
  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar');
  const progressHandle = document.getElementById('progressHandle');
  const thumbnailPreview = document.getElementById('thumbnailPreview');
  const thumbnailTime = document.getElementById('thumbnailTime');
  const settingsBtn = document.getElementById('settingsBtn');
  const qualityMenu = document.getElementById('qualityMenu');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const fullscreenEnterIcon = document.getElementById('fullscreenEnterIcon');
  const fullscreenExitIcon = document.getElementById('fullscreenExitIcon');
  const retryBtn = document.getElementById('retryBtn');

  const proxSrc = `/api/proxy/hls?u=${encodeURIComponent(u)}${h ? `&h=${encodeURIComponent(h)}` : ''}`;
  let hls = null;
  let controlsTimeout;
  let saveProgressInterval;
  let thumbnails = [];

  // --- 2. Helpers ---
  const showOverlay = (el) => el.classList.add('visible');
  const hideOverlay = (el) => el.classList.remove('visible');

  function showControls() {
    stage.classList.add('controls-visible');
    clearTimeout(controlsTimeout);
    if (!video.paused) controlsTimeout = setTimeout(hideControls, 3000);
  }
  function hideControls() {
    if (qualityMenu.classList.contains('show') || document.pointerLockElement) return;
    stage.classList.remove('controls-visible');
  }
  function formatTime(seconds) {
    if (!isFinite(seconds)) return '00:00';
    const s = Math.floor(seconds % 60);
    const m = Math.floor(seconds / 60) % 60;
    const h = Math.floor(seconds / 3600);
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  function postParentMessage(action, data) {
    if (window.self !== window.top) {
      window.parent.postMessage({ action, ...data }, '*'); // بدّل * بالـ origin في الإنتاج
    }
  }

  // --- 3. LocalStorage State ---
  const storageKey = `playerState_${u}`;
  function savePlayerState() {
    try {
      const state = { volume: video.volume, muted: video.muted, progress: video.currentTime };
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {}
  }
  function loadPlayerState() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const state = JSON.parse(raw);
      if (typeof state.volume === 'number') video.volume = state.volume;
      if (typeof state.muted === 'boolean') video.muted = state.muted;
      if (typeof state.progress === 'number' && state.progress > 5) {
        const apply = () => {
          if (video.duration && state.progress < video.duration - 10) {
            video.currentTime = state.progress;
          }
        };
        if (isFinite(video.duration) && video.duration > 0) apply();
        else video.addEventListener('loadedmetadata', apply, { once: true });
      }
    } catch {}
  }

  // --- 4. Thumbnails (VTT) ---
  async function loadThumbnails() {
    if (!t) return;
    try {
      const vttUrl = `/api/proxy/hls?u=${encodeURIComponent(t)}`;
      const res = await fetch(vttUrl);
      if (!res.ok) throw new Error('Failed to fetch VTT file');
      const vttText = await res.text();

      const lines = vttText.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('-->')) {
          const [start, end] = lines[i].split(' --> ').map((ts) => {
            const parts = ts.trim().split(':');
            return (+parts[0]) * 3600 + (+parts[1]) * 60 + parseFloat(parts[2]);
          });
          const urlLine = lines[++i]?.trim();
          if (!urlLine) continue;
          const [url, xywh] = urlLine.split('#xywh=');
          if (!xywh) continue;
          const [x, y, w, h] = xywh.split(',').map(Number);
          thumbnails.push({ start, end, url, x, y, w, h });
        }
      }
    } catch (e) {
      console.error('Failed to load thumbnails:', e);
    }
  }
  function updateThumbnail(e) {
    if (thumbnails.length === 0 || !isFinite(video.duration)) return;
    const rect = progressContainer.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = Math.max(0, Math.min(video.duration * percent, video.duration));
    const th = thumbnails.find((t) => time >= t.start && time <= t.end);
    if (th) {
      thumbnailPreview.style.backgroundImage = `url(${th.url})`;
      thumbnailPreview.style.backgroundPosition = `-${th.x}px -${th.y}px`;
      const x = Math.min(Math.max(e.clientX - rect.left, 80), rect.width - 80);
      thumbnailPreview.style.left = `${x}px`;
      thumbnailTime.textContent = formatTime(time);
      thumbnailPreview.classList.add('visible');
    }
  }

  // --- 5. Core Player ---
  async function playWithSound() {
    try {
      await video.play();
      hideOverlay(gate);
    } catch {
      video.muted = true;
      try {
        await video.play();
        hideOverlay(gate);
      } catch {
        showOverlay(gate);
      }
    }
  }

  async function initializePlayer() {
    try {
      if (!u) throw new Error('No video URL provided');
      showOverlay(loadingSpinner);
      hideOverlay(fallback);
      await loadThumbnails();

      if (window.Hls && window.Hls.isSupported()) {
        if (hls) hls.destroy();
        hls = new Hls({
          enableWorker: true,           // ارجعها false لو عندك منع Workers في CSP
          capLevelToPlayerSize: true,
        });
        hls.loadSource(proxSrc);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          hideOverlay(loadingSpinner);
          buildQualityMenu();
          playWithSound();
        });
        hls.on(Hls.Events.LEVEL_SWITCHED, syncQualityMenu);
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            console.error('HLS Fatal Error:', data);
            hideOverlay(loadingSpinner);
            showOverlay(fallback);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = proxSrc;
        video.addEventListener('loadedmetadata', () => {
          hideOverlay(loadingSpinner);
          playWithSound();
        }, { once: true });
      } else {
        throw new Error('HLS not supported');
      }
    } catch (error) {
      console.error('Initialization Error:', error);
      hideOverlay(loadingSpinner);
      showOverlay(fallback);
    }
  }

  // --- 6. UI Updates ---
  const updatePlayPauseIcons = () => {
    const isPaused = video.paused;
    stage.classList.toggle('paused', isPaused);
    playIcon.style.display = isPaused ? 'block' : 'none';
    pauseIcon.style.display = isPaused ? 'none' : 'block';
  };
  const updateVolume = (newVolume) => { video.muted = false; video.volume = Math.max(0, Math.min(1, newVolume)); };
  const updateVolumeUI = () => {
    const isMuted = video.muted || video.volume === 0;
    volumeIcon.style.display = isMuted ? 'none' : 'block';
    muteIcon.style.display = isMuted ? 'block' : 'none';
    volumeLevel.style.width = isMuted ? '0%' : `${video.volume * 100}%`;
  };
  const updateProgress = () => {
    if (!video.duration) return;
    const progress = (video.currentTime / video.duration) * 100;

    // الشريط يتعبّى عادي
    progressBar.style.width = `${progress}%`;

    // مقبض التقدم يدعم RTL
    if (document.documentElement.dir === 'rtl') {
      progressHandle.style.right = `${progress}%`;
      progressHandle.style.left = 'auto';
    } else {
      progressHandle.style.left = `${progress}%`;
      progressHandle.style.right = 'auto';
    }

    timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
  };
  const updateFullscreenIcons = () => {
    const isFullscreen = !!document.fullscreenElement;
    fullscreenEnterIcon.style.display = isFullscreen ? 'none' : 'block';
    fullscreenExitIcon.style.display = isFullscreen ? 'block' : 'none';
  };

  // --- 6.1 Quality Menu: Build + Positioning ---
  function buildQualityMenu() {
    if (!hls || hls.levels.length <= 1) {
      settingsBtn.style.display = 'none';
      return;
    }
    settingsBtn.style.display = 'flex';
    qualityMenu.innerHTML = '';

    // زر إغلاق يظهر فقط على الموبايل (CSS يتكفّل بإخفائه على الديسكتوب)
    const closeBtn = document.createElement('button');
    closeBtn.id = 'qualityCloseBtn';
    closeBtn.textContent = 'إغلاق';
    closeBtn.addEventListener('click', closeQualityMenu);
    qualityMenu.appendChild(closeBtn);

    const autoOpt = document.createElement('button');
    autoOpt.className = 'quality-option active';
    autoOpt.dataset.level = '-1';
    autoOpt.innerHTML = `<span>تلقائي</span><span class="dot"></span>`;
    qualityMenu.appendChild(autoOpt);

    hls.levels.forEach((level, index) => {
      const label = `${level.height}p`;
      const opt = document.createElement('button');
      opt.className = 'quality-option';
      opt.dataset.level = String(index);
      opt.innerHTML = `<span>${label}</span><span class="dot"></span>`;
      qualityMenu.appendChild(opt);
    });
  }

  const syncQualityMenu = () => {
    document.querySelectorAll('.quality-option').forEach((el) => {
      el.classList.toggle('active', el.dataset.level == hls.currentLevel);
    });
  };

  // --- 6.2 Positioning logic (Desktop) + Bottom Sheet (Mobile) ---
  function positionQualityMenu() {
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    qualityMenu.classList.toggle('mobile', isMobile);

    if (isMobile) {
      qualityMenu.style.top = 'auto';
      qualityMenu.style.left = '0';
      qualityMenu.style.right = '0';
      qualityMenu.style.bottom = '0';
      return;
    }

    // Desktop positioning near the settings button
    const btnRect = settingsBtn.getBoundingClientRect();

    // temporarily show to measure
    const wasHidden = !qualityMenu.classList.contains('show');
    if (wasHidden) {
      qualityMenu.style.visibility = 'hidden';
      qualityMenu.classList.add('show');
    }
    const menuRect = qualityMenu.getBoundingClientRect();
    if (wasHidden) {
      qualityMenu.classList.remove('show');
      qualityMenu.style.visibility = '';
    }

    const margin = 8;
    let top = btnRect.top - menuRect.height - margin; // try above button
    let left = btnRect.right - menuRect.width;        // align to button's right (RTL-friendly)

    if (top < margin) top = btnRect.bottom + margin; // if not enough space above, put below

    // clamp horizontally inside viewport
    if (left + menuRect.width > window.innerWidth - margin) {
      left = window.innerWidth - menuRect.width - margin;
    }
    if (left < margin) left = margin;

    // clamp vertically inside viewport
    const maxTop = window.innerHeight - menuRect.height - margin;
    if (top > maxTop) top = maxTop;
    if (top < margin) top = margin;

    qualityMenu.style.top = `${top}px`;
    qualityMenu.style.left = `${left}px`;
  }

  function openQualityMenu() {
    qualityMenu.classList.add('show');
    positionQualityMenu();
  }
  function closeQualityMenu() {
    qualityMenu.classList.remove('show');
  }

  // --- 7. Interactions ---
  const togglePlayPause = () => (video.paused ? video.play() : video.pause());
  const toggleMute = () => (video.muted = !video.muted);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) stage.requestFullscreen?.();
    else document.exitFullscreen?.();
  };
  const seekBy = (sec) => {
    if (!isFinite(video.duration)) return;
    video.currentTime = Math.max(0, Math.min(video.currentTime + sec, video.duration));
  };
  const showNudge = (el) => { el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 500); };

  function handleProgressSeek(clientX) {
    if (!video.duration) return;

    const rect = progressContainer.getBoundingClientRect();
    let percent = 0;

    if (document.documentElement.dir === 'rtl') {
      percent = (rect.right - clientX) / rect.width;
    } else {
      percent = (clientX - rect.left) / rect.width;
    }
    percent = Math.max(0, Math.min(1, percent));

    video.currentTime = percent * video.duration;
    updateProgress();
  }

  // Player events
  video.addEventListener('play', () => { updatePlayPauseIcons(); saveProgressInterval = setInterval(savePlayerState, 5000); });
  video.addEventListener('pause', () => { updatePlayPauseIcons(); clearInterval(saveProgressInterval); savePlayerState(); });
  video.addEventListener('ended', () => postParentMessage('videoEnded', { u }));
  video.addEventListener('volumechange', () => { updateVolumeUI(); savePlayerState(); });
  video.addEventListener('timeupdate', updateProgress);
  video.addEventListener('loadedmetadata', () => { updateProgress(); loadPlayerState(); });
  video.addEventListener('waiting', () => showOverlay(loadingSpinner));
  video.addEventListener('canplay', () => hideOverlay(loadingSpinner));

  // UI events
  gate.addEventListener('click', playWithSound);
  retryBtn.addEventListener('click', initializePlayer);
  playPauseBtn.addEventListener('click', togglePlayPause);
  volumeBtn.addEventListener('click', toggleMute);
  fullscreenBtn.addEventListener('click', toggleFullscreen);

  // افتح/أغلق قائمة الجودة بذكاء
  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (qualityMenu.classList.contains('show')) closeQualityMenu();
    else openQualityMenu();
    showControls();
  });

  // أغلق عند الضغط خارجها/ Escape
  document.addEventListener('click', (e) => {
    if (!settingsBtn.contains(e.target) && !qualityMenu.contains(e.target)) closeQualityMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeQualityMenu();
  });

  // أعِد التموضع عند تغيير الحجم أو السكrol
  window.addEventListener('resize', () => {
    if (qualityMenu.classList.contains('show')) positionQualityMenu();
  });
  window.addEventListener('scroll', () => {
    if (qualityMenu.classList.contains('show')) positionQualityMenu();
  }, { passive: true });

  let isPointerDown = false;
  progressContainer.addEventListener('pointerdown', (e) => { isPointerDown = true; handleProgressSeek(e.clientX); });
  document.addEventListener('pointermove', (e) => { if (isPointerDown) handleProgressSeek(e.clientX); });
  document.addEventListener('pointerup', () => { isPointerDown = false; });

  progressContainer.addEventListener('mouseenter', (e) => { if (thumbnails.length > 0) updateThumbnail(e); });
  progressContainer.addEventListener('mousemove', (e) => { if (thumbnails.length > 0) updateThumbnail(e); });
  progressContainer.addEventListener('mouseleave', () => thumbnailPreview.classList.remove('visible'));

  volumeSlider.addEventListener('click', (e) => {
    const rect = volumeSlider.getBoundingClientRect();
    updateVolume((e.clientX - rect.left) / rect.width);
  });

  qualityMenu.addEventListener('click', (e) => {
    const target = e.target.closest('.quality-option');
    if (!target || !hls) return;
    hls.currentLevel = parseInt(target.dataset.level, 10);
    closeQualityMenu();
  });

  stage.addEventListener('mousemove', showControls);
  stage.addEventListener('mouseleave', hideControls);
  controlsContainer.addEventListener('mouseenter', showControls);

  setupDoubleTap(tapLeft, () => { seekBy(-10); showNudge(nudgeLeft); });
  setupDoubleTap(tapRight, () => { seekBy(10); showNudge(nudgeRight); });

  document.addEventListener('fullscreenchange', updateFullscreenIcons);
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.altKey || e.ctrlKey || e.metaKey) return;
    switch (e.code) {
      case 'Space':
      case 'KeyK': togglePlayPause(); break;
      case 'ArrowLeft': seekBy(-10); showNudge(nudgeLeft); break;
      case 'ArrowRight': seekBy(10); showNudge(nudgeRight); break;
      case 'KeyM': toggleMute(); break;
      case 'KeyF': toggleFullscreen(); break;
      default: return;
    }
    e.preventDefault();
    showControls();
  });

  window.addEventListener('beforeunload', () => { savePlayerState(); hls?.destroy(); });

  // --- 8. Init ---
  updatePlayPauseIcons();
  updateVolumeUI();
  updateFullscreenIcons();
  initializePlayer();

  // --- Utils ---
  function setupDoubleTap(element, action) {
    let lastTap = 0;
    element.addEventListener('click', (e) => { if (e.detail === 2) action(); });
    element.addEventListener('touchstart', (e) => {
      const now = Date.now();
      if (now - lastTap < 300) { e.preventDefault(); action(); }
      lastTap = now;
    }, { passive: false });
  }
})();
