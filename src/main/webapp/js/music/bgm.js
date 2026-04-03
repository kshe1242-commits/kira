let syncTimer = null;
// playlist, currentIndex, ytPlayer는 player.js에서 전역 선언됨 — 여기서 재선언 금지

// 썸네일 URL
function thumbUrl(youtubeId) {
    return 'https://img.youtube.com/vi/' + youtubeId + '/mqdefault.jpg';
    // return 'https://img.youtube.com/vi/' + "BnkhBwzBqlQ" + '/mqdefault.jpg';
}

// 시간 포맷
function formatTime(sec) {
    if (!sec) return '0:00';
    const m = Math.floor(sec / 60);
    const s = String(sec % 60).padStart(2, '0');
    return m + ':' + s;
}

// HTML escape
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// 상단 "지금 재생 중" 업데이트
function updateNowPlaying() {
    if (!playlist || playlist.length === 0) return;

    const track = playlist[currentIndex];

    // ── bgm.jsp ──
    const nowThumb = document.getElementById('now-thumb');
    if (nowThumb) nowThumb.src = thumbUrl(track.youtubeId);

    const nowTitle = document.getElementById('now-title');
    if (nowTitle) nowTitle.textContent = track.title;

    const nowBarFill = document.getElementById('now-bar-fill');
    if (nowBarFill && ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
        const pct = Math.min((ytPlayer.getCurrentTime() / (track.duration || 1)) * 100, 100);
        nowBarFill.style.width = pct + '%';
    }

    // ── index.jsp 스마트폰 ──
    const phoneThumb = document.getElementById('phone-thumb');
    if (phoneThumb) phoneThumb.src = thumbUrl(track.youtubeId);

    const bgmTitle = document.getElementById('bgm-title');
    if (bgmTitle) bgmTitle.textContent = '♪  ' + track.title;

    const progressBar = document.getElementById('bgm-progress-bar');
    if (progressBar && ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
        const pct = Math.min((ytPlayer.getCurrentTime() / (track.duration || 1)) * 100, 100);
        progressBar.style.width = pct + '%';
    }

    const ytLink = document.getElementById('yt-link');
    if (ytLink) ytLink.href = 'https://www.youtube.com/watch?v=' + track.youtubeId;
}

// 트랙 목록 렌더링
function renderQueue() {
    const list = document.getElementById('bgm-queue-list');
    if (!list) return;

    if (!playlist || playlist.length === 0) {
        list.innerHTML = '<div class="bgm-empty">재생목록이 비어있어요 🎵</div>';
        return;
    }

    const currentTrack = playlist[currentIndex];
    document.getElementById('now-title').textContent = currentTrack.title;
    document.getElementById('now-thumb').src = thumbUrl(currentTrack.youtubeId);

    list.innerHTML = playlist.map((track, i) => {
        const isActive = i === currentIndex;
        return `
            <div class="bgm-track-item ${isActive ? 'active' : ''}" data-index="${i}">
                <div class="bgm-playing-icon">
                    <span></span><span></span><span></span>
                </div>
                <span class="bgm-track-num">${i + 1}</span>
                <img class="bgm-track-thumb"
                     src="${thumbUrl(track.youtubeId)}"
                     alt="${escapeHtml(track.title)}">
                <div class="bgm-track-info">
                    <div class="bgm-track-title">${escapeHtml(track.title)}</div>
                    <div class="bgm-track-duration">${formatTime(track.duration)}</div>
                </div>
            </div>
        `;
    }).join('');
}

// 트랙 클릭 시 재생
function playTrack(index) {
    if (!playlist[index]) return;
    currentIndex = index;

    if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
        ytPlayer.loadVideoById(playlist[index].youtubeId);
    }

    // UI 갱신
    renderQueue();           // bgm.jsp 전용
    updateNowPlaying();      // bgm.jsp 전용
    updateIndexNowPlaying(); // index.jsp 전용
}

// 목록 클릭 이벤트 위임
function bindQueueEvents() {
    const list = document.getElementById('bgm-queue-list');
    if (!list) return;

    list.addEventListener('click', (e) => {
        const item = e.target.closest('.bgm-track-item');
        if (!item) return;

        const index = Number(item.dataset.index);
        if (Number.isNaN(index)) return;

        playTrack(index);
    });
}

// 공통 1초 동기화
function startSync() {
    if (syncTimer) clearInterval(syncTimer);

    syncTimer = setInterval(() => {
        if (!playlist || playlist.length === 0) return;

        // bgm.jsp용
        document.querySelectorAll('.bgm-track-item').forEach((el, i) => {
            el.classList.toggle('active', i === currentIndex);
        });
        updateNowPlaying();

        // index.jsp용
        updateIndexNowPlaying();
    }, 1000);
}

// player.js 데이터 로드 대기 후 렌더링
function waitForPlaylist() {
    let retry = 0;
    const timer = setInterval(() => {
        if (playlist && playlist.length > 0 && fetchDone) { // fetchDone 체크 추가
            clearInterval(timer);
            renderQueue();
            updateNowPlaying();
        }
        if (++retry > 20) clearInterval(timer);
    }, 500);
}

function init() {
    bindQueueEvents();
    startSync();

    // playlist가 이미 있으면 바로 렌더링
    if (playlist && playlist.length > 0 && fetchDone) {
        renderQueue();
        updateNowPlaying();
    } else {
        // 아직 playlist 준비 안되었으면 대기
        waitForPlaylist();
    }
}

window.addEventListener('beforeunload', () => {
    if (syncTimer) clearInterval(syncTimer);
});

// DOMContentLoaded가 이미 지난 경우도 커버
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// index.jsp 전용 UI 업데이트
function updateIndexNowPlaying() {
    if (!playlist || playlist.length === 0) return;
    const track = playlist[currentIndex];

    const thumbEl = document.getElementById('phone-thumb');
    const titleEl = document.getElementById('bgm-title');
    const linkEl = document.getElementById('yt-link');

    if (thumbEl) thumbEl.src = 'https://img.youtube.com/vi/' + track.youtubeId + '/mqdefault.jpg';
    if (titleEl) titleEl.textContent = '♪ ' + track.title;
    if (linkEl) linkEl.href = 'https://www.youtube.com/watch?v=' + track.youtubeId;
}