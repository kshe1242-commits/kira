// player.js — index.jsp에서만 로드

window.playlist = [];
window.currentIndex = 0;
window.ytPlayer = null;
window.fetchDone = false;
window.apiReady = false;
window.playerReady = false;
window.isDefaultPlaylist = true;
window.bgmUiTimer = null; // [FIX 1] 중복 인터벌 방지

const dummyPlaylist = [
    { title: "BIGBANG - 하루하루(HARU HARU)",              youtubeId: "8OAQ6RuYFGE", duration: 323, trackOrder: 1 },
    { title: "미안해서 미안해 (Feat.G.NA) - 김진표",        youtubeId: "8Aug4u0dhIU", duration: 220, trackOrder: 2 },
    { title: "프리스타일 - Y",                              youtubeId: "WxUwgAli2Ec", duration: 280, trackOrder: 3 },
    { title: "프라이머리 - 입장정리 (Feat. 최자, Simon D)",  youtubeId: "aMbIW_Z3P2g", duration: 297, trackOrder: 4 },
    { title: "BIGBANG - 거짓말(LIE)",                      youtubeId: "NeDeZUqNiVo", duration: 294, trackOrder: 5 },
];

window.defaultPlaylist = dummyPlaylist.map((track) => ({ ...track }));

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ":" + String(s).padStart(2, "0");
}

// [FIX 2] window.currentIndex 기준 통일
function saveCurrentIndex() {
    localStorage.setItem("bgmCurrentIndex", String(window.currentIndex));
}

// [FIX 2] 공통 함수 — initPlayer/reloadPlaylist 모두 여기서 사용
function restoreCurrentIndex(playlistLength) {
    const saved = parseInt(localStorage.getItem("bgmCurrentIndex") || "0", 10);
    return Math.min(saved, playlistLength - 1);
}

function updateIndexNowPlaying() {
    if (!window.playlist.length) return;
    const track = window.playlist[window.currentIndex];
    if (!track) return; // [FIX 4] 범위 방어

    const phoneThumb     = document.getElementById("phone-thumb");
    const phoneThumbBlur = document.getElementById("phone-thumb-blur");
    const thumbUrl       = "https://img.youtube.com/vi/" + track.youtubeId + "/mqdefault.jpg";
    const ytLink         = document.getElementById("yt-link");
    const bgmTitleMp3    = document.getElementById("bgm-title-mp3");

    if (phoneThumb)     phoneThumb.src     = thumbUrl;
    if (phoneThumbBlur) phoneThumbBlur.src = thumbUrl;
    if (ytLink)         ytLink.href        = "https://www.youtube.com/watch?v=" + track.youtubeId;
    if (bgmTitleMp3)    bgmTitleMp3.textContent = "♪ " + track.title;

    const cur = window.ytPlayer && typeof window.ytPlayer.getCurrentTime === "function"
        ? Math.floor(window.ytPlayer.getCurrentTime()) : 0;

    const durationEl  = document.getElementById("bgm-duration");
    const currentEl   = document.getElementById("bgm-current");
    const progressBar = document.getElementById("bgm-progress-bar");

    if (durationEl)  durationEl.textContent  = formatTime(track.duration);
    if (currentEl)   currentEl.textContent   = formatTime(cur);
    if (progressBar) progressBar.style.width = Math.min((cur / track.duration) * 100, 100) + "%";
}

function notifyBgmFrame() {
    if (typeof window.onTrackChanged === "function") {
        window.onTrackChanged(window.currentIndex); // [FIX 2]
    }
}

// [FIX 2] + [FIX 4] — window.* 통일, 범위 검사 추가
function playTrack(index) {
    if (!window.playerReady) return;
    if (index < 0 || index >= window.playlist.length) return; // [FIX 4]
    window.currentIndex = index;
    localStorage.setItem("bgmCurrentIndex", window.currentIndex);
    window.ytPlayer.loadVideoById(window.playlist[window.currentIndex].youtubeId);
    updateIndexNowPlaying();
    notifyBgmFrame();
    saveCurrentIndex();
}

function playNext() {
    if (!window.playerReady) return;
    window.currentIndex = (window.currentIndex + 1) % window.playlist.length;
    localStorage.setItem("bgmCurrentIndex", window.currentIndex);
    window.ytPlayer.loadVideoById(window.playlist[window.currentIndex].youtubeId);
    updateIndexNowPlaying();
    notifyBgmFrame();
    saveCurrentIndex();
}

function playPrev() {
    if (!window.playerReady) return;
    window.currentIndex = (window.currentIndex - 1 + window.playlist.length) % window.playlist.length;
    localStorage.setItem("bgmCurrentIndex", window.currentIndex);
    window.ytPlayer.loadVideoById(window.playlist[window.currentIndex].youtubeId);
    updateIndexNowPlaying();
    notifyBgmFrame();
    saveCurrentIndex();
}

function togglePlay() {
    if (!window.playerReady || !window.ytPlayer || typeof window.ytPlayer.getPlayerState !== "function") return;
    window.ytPlayer.getPlayerState() === YT.PlayerState.PLAYING
        ? window.ytPlayer.pauseVideo()
        : window.ytPlayer.playVideo();
}

function initPlayer() {
    if (!window.playlist.length || !window.apiReady) return;

    // [FIX 2] 공통 함수 사용
    window.currentIndex = restoreCurrentIndex(window.playlist.length);

    const holder = document.getElementById("yt-player-hidden");
    if (holder) holder.innerHTML = "";
    window.ytPlayer = null;
    window.playerReady = false;

    window.ytPlayer = new YT.Player("yt-player-hidden", {
        width: "0", height: "0",
        videoId: window.playlist[window.currentIndex].youtubeId,
        playerVars: { autoplay: 1, controls: 0, rel: 0, playsinline: 1 },
        events: {
            onReady: (event) => {
                window.playerReady = true;

                const realDuration = Math.floor(event.target.getDuration());
                const currentTrack = window.playlist[window.currentIndex];
                if (currentTrack && Math.abs(currentTrack.duration - realDuration) > 1) {
                    console.log(`[시간 보정] ${currentTrack.title}: ${realDuration}초로 수정 중...`);
                    currentTrack.duration = realDuration;
                    const params = new URLSearchParams();
                    params.append("youtubeId", currentTrack.youtubeId);
                    params.append("duration", realDuration);
                    fetch("/api/bgm?" + params.toString(), { method: "PUT" })
                        .then(res => res.json())
                        .then(json => { if (json.result === "ok" && typeof renderQueue === "function") renderQueue(); })
                        .catch(err => console.error("업데이트 실패:", err));
                }

                event.target.playVideo();
                updateIndexNowPlaying();

                // [FIX 1] 기존 타이머 제거 후 새로 등록
                if (window.bgmUiTimer) clearInterval(window.bgmUiTimer);
                window.bgmUiTimer = setInterval(updateIndexNowPlaying, 1000);

                notifyBgmFrame();
            },

            onStateChange: (e) => {
                if (e.data === YT.PlayerState.ENDED) {
                    const realDuration = Math.floor(e.target.getDuration());
                    const currentTrack = window.playlist[window.currentIndex];
                    if (currentTrack && realDuration > 0 && Math.abs(currentTrack.duration - realDuration) > 1) {
                        currentTrack.duration = realDuration;
                        const params = new URLSearchParams();
                        params.append("youtubeId", currentTrack.youtubeId);
                        params.append("duration", realDuration);
                        fetch("/api/bgm?" + params.toString(), { method: "PUT" }).then(() => {
                            if (typeof renderQueue === "function") renderQueue();
                            playNext();
                        });
                    } else {
                        playNext();
                    }
                }

                if (e.data === YT.PlayerState.PLAYING) {
                    localStorage.setItem("bgmCurrentIndex", window.currentIndex);
                }

                const btn = document.getElementById("bgm-toggle");
                if (btn) btn.textContent = e.data === YT.PlayerState.PLAYING ? "⏸" : "▶";

                notifyBgmFrame();
            },
        },
    });
}

function loadPlaylist(targetPk) {
    const myPk = String(window.loginUserPk || "");
    const isActuallyMe = !targetPk || String(targetPk) === myPk;
    const currentPk = isActuallyMe ? "MY" : targetPk;
    const isSameTarget = window.lastLoadedPk === currentPk;

    window.isMyPlaylist = isActuallyMe;
    window.lastLoadedPk = currentPk;

    const url = isActuallyMe ? "/api/bgm" : `/api/visitor/bgm?ownerPk=${targetPk}`;

    fetch(url).then(r => r.json()).then(tracks => {
        if (!tracks || tracks.length === 0) {
            window.playlist = dummyPlaylist;
            window.isDefaultPlaylist = true;
            window.currentHostNickname = null;
        } else {
            window.playlist = tracks;
            window.isDefaultPlaylist = false;
            window.currentHostNickname = tracks[0].userNickname;
        }

        window.fetchDone = true;
        if (typeof renderQueue === "function") renderQueue();

        if (isSameTarget) {
            console.log("이미 같은 목록 재생 중 - 상태 유지");
            return;
        }

        window.currentIndex = 0;
        if (window.ytPlayer && window.playerReady) {
            window.ytPlayer.loadVideoById(window.playlist[0].youtubeId);
        } else if (window.apiReady) {
            initPlayer();
        }
    });
}

window.onYouTubeIframeAPIReady = function () {
    window.apiReady = true;
    if (window.fetchDone) initPlayer();
};

if (window.YT && window.YT.Player) {
    window.onYouTubeIframeAPIReady();
}

// [FIX 1] BFCache 복귀 시 타이머도 정리
window.addEventListener("pageshow", function (event) {
    if (event.persisted || window.performance.navigation.type === 2) {
        window.playerReady = false;

        if (window.bgmUiTimer) {
            clearInterval(window.bgmUiTimer);
            window.bgmUiTimer = null;
        }

        if (window.ytPlayer) {
            try { window.ytPlayer.destroy(); } catch (e) {}
            window.ytPlayer = null;
        }

        const holder = document.getElementById("yt-player-hidden");
        if (holder) holder.innerHTML = "";

        setTimeout(() => {
            if (window.fetchDone && window.apiReady) initPlayer();
        }, 100);
    }
});

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        loadPlaylist(window.loginUserPk || "");
        const prevBtn = document.getElementById("bgm-prev");
        const nextBtn = document.getElementById("bgm-next");
        if (prevBtn) prevBtn.addEventListener("click", playPrev);
        if (nextBtn) nextBtn.addEventListener("click", playNext);
    });
} else {
    loadPlaylist(window.loginUserPk || "");
    const prevBtn = document.getElementById("bgm-prev");
    const nextBtn = document.getElementById("bgm-next");
    if (prevBtn) prevBtn.addEventListener("click", playPrev);
    if (nextBtn) nextBtn.addEventListener("click", playNext);
}