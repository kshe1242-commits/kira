// player.js
let playlist = [];      // 실제 연동 시 DB 데이터를 받음
let currentIndex = 0;
let ytPlayer = null;
let progressTimer = null;
let fetchDone = false;  // fetch 완료 여부
let apiReady = false;

// 🔹 테스트용 더미 데이터
const dummyPlaylist = [
    { title: 'Needygirl Overdose', youtubeId: 'BnkhBwzBqlQ', duration: 214, trackOrder: 1 },
    { title: '차가운 상어 아가씨', youtubeId: 'wZlv3qDPfjk', duration: 155, trackOrder: 2 },
    { title: '처형박수 (Execution Clap)', youtubeId: 'YcxhmHEykPg', duration: 194, trackOrder: 3 },
];

// index 전용 UI 업데이트
function updateIndexNowPlaying() {
    if (!playlist || playlist.length === 0) return;

    const track = playlist[currentIndex];

    // index.jsp 전용: 스마트폰 썸네일
    const phoneThumb = document.getElementById('phone-thumb');
    const ytLink = document.getElementById('yt-link');
    const bgmTitle = document.getElementById('bgm-title');

    if (phoneThumb) phoneThumb.src = 'https://img.youtube.com/vi/' + track.youtubeId + '/mqdefault.jpg';
    if (ytLink) ytLink.href = 'https://www.youtube.com/watch?v=' + track.youtubeId;
    if (bgmTitle) bgmTitle.textContent = '♪ ' + track.title;

    // index.jsp 미니 플레이어 진행률
    const cur = ytPlayer && typeof ytPlayer.getCurrentTime === 'function'
        ? Math.floor(ytPlayer.getCurrentTime())
        : 0;
    const durationEl = document.getElementById('bgm-duration');
    const currentEl = document.getElementById('bgm-current');
    const progressBar = document.getElementById('bgm-progress-bar');

    if (durationEl) durationEl.textContent = formatTime(track.duration);
    if (currentEl) currentEl.textContent = formatTime(cur);
    if (progressBar) progressBar.style.width = Math.min((cur / track.duration) * 100, 100) + '%';
}

// 1초마다 index UI도 갱신
function startIndexSync() {
    setInterval(() => {
        updateIndexNowPlaying();
    }, 1000);
}

// player 초기화 후 호출
function initPlayer() {
    if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
        ytPlayer.loadVideoById(playlist[currentIndex].youtubeId);
    }

    updateIndexNowPlaying();
    startIndexSync();
}

// 🔹 플레이리스트 로드 함수
function loadPlaylist(userId) {
    // ========================
    // 1️⃣ 실제 DB 연동용 fetch (나중에 주석 해제)
    // ========================
    /*
    fetch('/api/bgm?userId=' + userId)
        .then(res => res.json())
        .then(tracks => {
            playlist = tracks;
            currentIndex = 0;
            fetchDone = true;

            if (apiReady) initPlayer();

            renderQueue();
            updateNowPlaying();
        })
        .catch(err => console.error(err));
    */

    // ========================
    // 2️⃣ 테스트용 더미 데이터
    // ========================
    playlist = dummyPlaylist;
    currentIndex = 0;
    fetchDone = true;

    if (apiReady) initPlayer();

    renderQueue();
    updateNowPlaying();
}

// 🔹 YouTube Iframe API 준비 완료
window.onYouTubeIframeAPIReady = function () {
    apiReady = true;
    if (fetchDone) initPlayer();
};

// 🔹 플레이어 초기화
function initPlayer() {
    if (!playlist.length || !apiReady) return;

    ytPlayer = new YT.Player('yt-player-hidden', {
        width: '0',
        height: '0',
        videoId: playlist[currentIndex].youtubeId,
        playerVars: { autoplay: 1, controls: 0, rel: 0, playsinline: 1 },
        events: {
            onReady: () => {
                renderQueue();
                updateNowPlaying();
            },
            onStateChange: (e) => {
                if (e.data === YT.PlayerState.ENDED) playNext();
                document.getElementById('bgm-toggle').textContent =
                    e.data === YT.PlayerState.PLAYING ? '⏸' : '▶';
            }
        }
    });
}

// 🔹 재생 제어
function playNext() {
    currentIndex = (currentIndex + 1) % playlist.length;
    ytPlayer.loadVideoById(playlist[currentIndex].youtubeId);
    renderQueue();
    updateNowPlaying();
}

function playPrev() {
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    ytPlayer.loadVideoById(playlist[currentIndex].youtubeId);
    renderQueue();
    updateNowPlaying();
}

function togglePlay() {
    if (!ytPlayer) return;
    ytPlayer.getPlayerState() === YT.PlayerState.PLAYING
        ? ytPlayer.pauseVideo()
        : ytPlayer.playVideo();
}

// 🔹 페이지 로드 시   재생목록데이터 로드 및 호출
document.addEventListener('DOMContentLoaded', () => {
    loadPlaylist('dongmin'); // 더미 or DB
    // 자동 재생
    playTrack(0);
});