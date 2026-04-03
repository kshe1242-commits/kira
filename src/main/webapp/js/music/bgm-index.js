// bgm-index.js
// index.jsp 전용: bgm.jsp 없이도 재생 + UI 갱신

// playlist, currentIndex, ytPlayer는 player.js에서 전역 선언됨
// player.js의 playlist를 그대로 사용합니다.

function thumbUrl(youtubeId) {
    return 'https://img.youtube.com/vi/' + youtubeId + '/mqdefault.jpg';
}

function formatTime(sec) {
    if (!sec) return '0:00';
    const m = Math.floor(sec / 60);
    const s = String(sec % 60).padStart(2, '0');
    return m + ':' + s;
}

// index 전용: 화면 갱신
function updateIndexNowPlaying() {
    if (!playlist || playlist.length === 0) return;

    const track = playlist[currentIndex];

    // 썸네일
    const thumbEl = document.getElementById('phone-thumb');
    if (thumbEl) thumbEl.src = thumbUrl(track.youtubeId);

    // 제목
    const titleEl = document.getElementById('bgm-title');
    if (titleEl) titleEl.textContent = `♪  ${track.title}`;

    // YouTube 링크
    const linkEl = document.getElementById('yt-link');
    if (linkEl) linkEl.href = 'https://www.youtube.com/watch?v=' + track.youtubeId;

    // 진행률 (mini bar)
    const cur = ytPlayer && typeof ytPlayer.getCurrentTime === 'function'
        ? Math.floor(ytPlayer.getCurrentTime())
        : 0;

    const total = track.duration || 1;
    const pct = Math.min((cur / total) * 100, 100);
    const barEl = document.getElementById('bgm-progress-bar');
    if (barEl) barEl.style.width = pct + '%';

    // 시간 표시
    const curEl = document.getElementById('bgm-current');
    if (curEl) curEl.textContent = formatTime(cur);

    const durEl = document.getElementById('bgm-duration');
    if (durEl) durEl.textContent = formatTime(total);
}

// 트랙 재생 (player.js와 연결)
function playIndexTrack(index) {
    if (!playlist[index]) return;
    currentIndex = index;

    if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
        ytPlayer.loadVideoById(playlist[index].youtubeId);
    }

    updateIndexNowPlaying();
}

// 1초마다 동기화
let indexSyncTimer = null;
function startIndexSync() {
    if (indexSyncTimer) clearInterval(indexSyncTimer);

    indexSyncTimer = setInterval(() => {
        if (!playlist || playlist.length === 0) return;
        updateIndexNowPlaying();
    }, 1000);
}

function initIndexBGM() {
    startIndexSync();
    updateIndexNowPlaying();
}

window.addEventListener('beforeunload', () => {
    if (indexSyncTimer) clearInterval(indexSyncTimer);
});

// DOMContentLoaded 후 초기화
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initIndexBGM);
} else {
    initIndexBGM();
}