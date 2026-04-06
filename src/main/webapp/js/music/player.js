// player.js — index.jsp에서만 로드

// let playlist = [];
// let currentIndex = 0;
// let ytPlayer = null;
// let fetchDone = false;
// let apiReady = false;
// let playerReady = false;

window.playlist = [];
window.currentIndex = 0;
window.ytPlayer = null;
window.fetchDone = false;
window.apiReady = false;
window.playerReady = false;
window._savedStartTime = 0;

// ── 새로고침/캐시 복원 대비 플레이어 상태 초기화 ─────────────────
window.ytPlayer = null;
window.playerReady = false;

const dummyPlaylist = [
    { title: 'wake me up - avicii', youtubeId: '5y_KJAg8bHI', duration: 251, trackOrder: 1 },
    { title: 'Needygirl Overdose', youtubeId: 'BnkhBwzBqlQ', duration: 214, trackOrder: 2 },
    { title: '차가운 상어 아가씨', youtubeId: 'wZlv3qDPfjk', duration: 155, trackOrder: 3 },
    { title: '처형박수 (Execution Clap)', youtubeId: 'YcxhmHEykPg', duration: 194, trackOrder: 4 },
];

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + String(s).padStart(2, '0');
}

// ── 새로고침 대비 저장/복원 ─────────────────────────────────────
function savePlayerState() {
    if (!window.playlist || !window.playlist.length) return;

    const state = {
        currentIndex: window.currentIndex || 0,
        currentTime: (window.ytPlayer && typeof window.ytPlayer.getCurrentTime === 'function')
            ? Math.floor(window.ytPlayer.getCurrentTime())
            : 0
    };

    localStorage.setItem('bgmPlayerState', JSON.stringify(state));
}

function restorePlayerState() {
    const raw = localStorage.getItem('bgmPlayerState');
    if (!raw) return { currentIndex: 0, currentTime: 0 };

    try {
        return JSON.parse(raw);
    } catch (e) {
        return { currentIndex: 0, currentTime: 0 };
    }
}

// ── index.jsp 미니플레이어 UI 갱신 ──────────────────────────────
function updateIndexNowPlaying() {
    if (!playlist.length) return;
    const track = playlist[currentIndex];

    const phoneThumb = document.getElementById('phone-thumb');
    const ytLink = document.getElementById('yt-link');
    const bgmTitleMp3 = document.getElementById('bgm-title-mp3');
    const bgmTitlePhone = document.getElementById('bgm-title-phone');

    if (phoneThumb) phoneThumb.src = 'https://img.youtube.com/vi/' + track.youtubeId + '/mqdefault.jpg';
    if (ytLink) ytLink.href = 'https://www.youtube.com/watch?v=' + track.youtubeId;
    if (bgmTitleMp3) bgmTitleMp3.textContent = '♪ ' + track.title;
    if (bgmTitlePhone) bgmTitlePhone.textContent = '♪ ' + track.title;

    const cur = (ytPlayer && typeof ytPlayer.getCurrentTime === 'function')
        ? Math.floor(ytPlayer.getCurrentTime()) : 0;

    const durationEl = document.getElementById('bgm-duration');
    const currentEl = document.getElementById('bgm-current');
    const progressBar = document.getElementById('bgm-progress-bar');

    if (durationEl) durationEl.textContent = formatTime(track.duration);
    if (currentEl) currentEl.textContent = formatTime(cur);
    if (progressBar) progressBar.style.width = Math.min((cur / track.duration) * 100, 100) + '%';
}

// (AJAX 방식) — 같은 window에 있으므로 직접 호출
function notifyBgmFrame() {
    if (typeof window.onTrackChanged === 'function') {
        window.onTrackChanged(currentIndex);
    }
}

// ── 재생 제어 (bgm.js에서도 window.playTrack으로 호출) ───────────
function playTrack(index) {
    if (!playerReady || !ytPlayer || typeof ytPlayer.loadVideoById !== 'function')
        return;

    currentIndex = index;
    ytPlayer.loadVideoById({
        videoId: playlist[currentIndex].youtubeId,
        startSeconds: 0
    });
    updateIndexNowPlaying();
    notifyBgmFrame();
    savePlayerState();
}

function playNext() {
    if (!playerReady || !ytPlayer || typeof ytPlayer.loadVideoById !== 'function')
        return;
    currentIndex = (currentIndex + 1) % playlist.length;
    ytPlayer.loadVideoById({
        videoId: playlist[currentIndex].youtubeId,
        startSeconds: 0
    });
    updateIndexNowPlaying();
    notifyBgmFrame();
    savePlayerState();
}

function playPrev() {
    if (!playerReady || !ytPlayer || typeof ytPlayer.loadVideoById !== 'function')
        return;
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    ytPlayer.loadVideoById({
        videoId: playlist[currentIndex].youtubeId,
        startSeconds: 0
    });
    updateIndexNowPlaying();
    notifyBgmFrame();
    savePlayerState();
}

function togglePlay() {
    if (!playerReady || !ytPlayer || typeof ytPlayer.getPlayerState !== 'function')
        return;  // ✅ 핵심 수정
    ytPlayer.getPlayerState() === YT.PlayerState.PLAYING
        ? ytPlayer.pauseVideo()
        : ytPlayer.playVideo();
}

// ── 플레이어 초기화 (한 번만) ───────────────────────────────────
function initPlayer() {
    if (!playlist.length || !apiReady) return;

    const holder = document.getElementById('yt-player-hidden');
    if (!holder) return;

    holder.innerHTML = '';
    playerReady = false;
    ytPlayer=null;

    ytPlayer = new YT.Player('yt-player-hidden', {
        width: '0', height: '0',
        videoId: playlist[currentIndex].youtubeId,
        playerVars: { autoplay: 1, controls: 0, rel: 0, playsinline: 1 },
        events: {
            onReady: (event) => {
                playerReady = true;

                // 저장된 재생 위치가 있으면 해당 위치부터 복원
                const start = window._savedStartTime || 0;
                event.target.cueVideoById({
                    videoId: playlist[currentIndex].youtubeId,
                    startSeconds: start
                });

                updateIndexNowPlaying();
                notifyBgmFrame();

                // 1초마다 현재 시간 UI 갱신 + 상태 저장
                setInterval(() => {
                    updateIndexNowPlaying();
                    savePlayerState();
                }, 1000);
            },
            onStateChange: (e) => {
                if (e.data === YT.PlayerState.ENDED) playNext();

                const btn = document.getElementById('bgm-toggle');
                if (btn) btn.textContent = e.data === YT.PlayerState.PLAYING ? '⏸' : '▶';

                updateIndexNowPlaying();
                notifyBgmFrame();
                savePlayerState();
            }
        }
    });
}

// ── 플레이리스트 로드 ─────────────────────────────────────────
function loadPlaylist(userId) {
    const saved = restorePlayerState();

    // 비로그인시 더미트랙
    if (!userId) {
        playlist = dummyPlaylist;
        currentIndex = Math.min(saved.currentIndex || 0, dummyPlaylist.length - 1);
        window._savedStartTime = saved.currentTime || 0;
        fetchDone = true;
        if (apiReady) initPlayer();
        return;
    }

    // 실제 DB 연동 시:
    fetch('/api/bgm?userId=' + userId)
        .then(r => r.json())
        .then(tracks => {
            playlist = tracks;
            currentIndex = Math.min(saved.currentIndex || 0, tracks.length - 1);
            window._savedStartTime = saved.currentTime || 0;
            fetchDone = true;
            updateIndexNowPlaying();
            if (apiReady) initPlayer();
        })
        .catch(err => {
            console.error('플레이리스트 로드 실패:', err);

            // DB 연동 실패 시 더미로 폴백
            playlist = dummyPlaylist;
            currentIndex = Math.min(saved.currentIndex || 0, dummyPlaylist.length - 1);
            window._savedStartTime = saved.currentTime || 0;
            fetchDone = true;
            updateIndexNowPlaying();
            if (apiReady) initPlayer();
        });
}

// ── YouTube API 준비 콜백 ─────────────────────────────────────
window.onYouTubeIframeAPIReady = function () {
    apiReady = true;
    if (fetchDone) initPlayer();
};

// ── 페이지 이탈 직전 현재 곡/재생 위치 저장 ──────────────────────
window.addEventListener('pageshow', function (event){
    if (event.persisted){
        playerReady = false;
        ytPlayer = null;

        if (fetchDone && apiReady) {
            initPlayer();
        }
    }
});

// playTrack(0) 호출 금지 — initPlayer → onReady에서 자동 시작
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadPlaylist(loginUserId);
    });
} else {
    loadPlaylist(loginUserId);
}