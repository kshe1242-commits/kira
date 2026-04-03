// router.js — BGM 라우팅 & 마퀴 제어

// ── 마퀴 텍스트 업데이트 ──
function updateMarquee() {
    const titleEl = document.getElementById('bgm-title');
    if (!titleEl || playlist.length === 0) return;

    const fullText = playlist
        .map((t, i) => (i === currentIndex ? '▶ ' : '♪ ') + t.title)
        .join('　　　　');

    titleEl.textContent = fullText;
}

// ── 스마트폰 썸네일 + 링크 업데이트 ──
function updatePhoneScreen(index) {
    const track = playlist[index];
    if (!track) return;

    const ytLink = document.getElementById('yt-link');
    if (ytLink) {
        ytLink.href = 'https://www.youtube.com/watch?v=' + track.youtubeId;
    }

    // ── 추가: 썸네일 이미지 업데이트 ──
    const phoneThumb = document.getElementById('phone-thumb');
    if (phoneThumb) {
        phoneThumb.src = 'https://img.youtube.com/vi/' + track.youtubeId + '/mqdefault.jpg';
    }
}

// ── player.js의 updateUI를 감싸서 마퀴 + 스마트폰 화면 같이 갱신 ──
const _originalUpdateUI = updateUI;
function updateUI(index) {
    _originalUpdateUI(index);
    updateMarquee();
    updatePhoneScreen(index);  // ── 추가
}

// ── player.js의 playNext / playPrev 이후 훅 ──
const _originalPlayNext = playNext;
function playNext() {
    _originalPlayNext();
    updatePhoneScreen(currentIndex);
}

const _originalPlayPrev = playPrev;
function playPrev() {
    _originalPlayPrev();
    updatePhoneScreen(currentIndex);
}