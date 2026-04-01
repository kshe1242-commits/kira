let playlist = [];
let currentIndex = 0;
let ytPlayer = null;
let progressTimer = null;

// ── fetch 완료 여부 플래그 ──
let fetchDone = false;
let apiReady = false;

// ── 1. 플레이리스트 fetch ──
fetch('/api/bgm')
    .then(res => res.json())
    .then(tracks => {
        playlist = tracks;
        fetchDone = true;
        if (apiReady) initPlayer(); // API가 먼저 준비됐으면 여기서 시작
    });

// ── 2. YouTube IFrame API 준비 콜백 ──
function onYouTubeIframeAPIReady() {
    apiReady = true;
    if (fetchDone) initPlayer(); // fetch가 먼저 끝났으면 여기서 시작
}

// ── 3. 플레이어 초기화 (둘 다 준비됐을 때만 실행) ──
function initPlayer() {
    if (playlist.length === 0) return;

    ytPlayer = new YT.Player('yt-player', {
        width: '100%',
        height: '100%',
        videoId: playlist[0].youtubeId,
        playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1
        },
        events: {
            onReady: () => updateUI(0),
            onStateChange: onPlayerStateChange
        }
    });
}

// ── 4. 상태 변화 감지 ──
function onPlayerStateChange(e) {
    if (e.data === YT.PlayerState.PLAYING) {
        document.getElementById('bgm-toggle').textContent = '⏸';
        startProgressTimer();
    } else if (e.data === YT.PlayerState.PAUSED) {
        document.getElementById('bgm-toggle').textContent = '▶';
        clearInterval(progressTimer);
    } else if (e.data === YT.PlayerState.ENDED) {
        playNext();
    }
}

// ── 5. UI 업데이트 ──
function updateUI(index) {
    const track = playlist[index];
    if (!track) return;

    document.getElementById('bgm-title').textContent = '♪ ' + track.title;
    document.getElementById('bgm-duration').textContent = formatTime(track.duration);
    document.getElementById('bgm-current').textContent = '0:00';
    document.getElementById('bgm-progress-bar').style.width = '0%';
    document.getElementById('yt-link').href =
        'https://www.youtube.com/watch?v=' + track.youtubeId;
}

// ── 6. 진행바 타이머 ──
function startProgressTimer() {
    clearInterval(progressTimer);
    progressTimer = setInterval(() => {
        if (!ytPlayer || !ytPlayer.getCurrentTime) return;
        const current = Math.floor(ytPlayer.getCurrentTime());
        const total = playlist[currentIndex]?.duration || 1;

        document.getElementById('bgm-current').textContent = formatTime(current);
        document.getElementById('bgm-progress-bar').style.width =
            Math.min((current / total) * 100, 100) + '%';
    }, 1000);
}

// ── 7. 컨트롤 버튼 ──
function togglePlay() {
    if (!ytPlayer) return;
    ytPlayer.getPlayerState() === YT.PlayerState.PLAYING
        ? ytPlayer.pauseVideo()
        : ytPlayer.playVideo();
}

function playNext() {
    currentIndex = (currentIndex + 1) % playlist.length;
    ytPlayer.loadVideoById(playlist[currentIndex].youtubeId);
    updateUI(currentIndex);
}

function playPrev() {
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    ytPlayer.loadVideoById(playlist[currentIndex].youtubeId);
    updateUI(currentIndex);
}

// ── 8. 시간 포맷 ──
function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = String(sec % 60).padStart(2, '0');
    return m + ':' + s;
}