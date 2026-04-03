<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html>
<head>
    <%-- 라이브러리 --%>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://npmcdn.com/flatpickr/dist/l10n/ko.js"></script>

    <%-- CSS --%>
    <link rel="stylesheet" href="css/index.css">
    <link rel="stylesheet" href="css/visitor.css">
    <link rel="stylesheet" href="css/guestboard.css">
    <link rel="stylesheet" href="css/diary.css">

    <%-- JS --%>
    <script src="js/guestboard.js"></script>
    <script src="js/diary.js"></script>
    <script src="js/index.js"></script>
    <script src="js/visitor.js"></script>


    <title>Team Kira - Minihompy</title>
</head>
<body>
<div class="desk-wrapper">
    <div class="desk-surface">
        <%-- ══ 왼쪽: 프로필 + 메뉴 + 색연필통 ══ --%>
        <div class="left-col">
            <div class="profile">
                <div class="profile-card">
                    <div class="profile-photo">🌬️</div>
                    <div class="profile-name">DongMin</div>
                    <div class="profile-mood">
                        햇살 가득한 오후,<br/>기분 좋은 바람... 🍃<br/>
                        <span style="font-size: 11px; color: #c0b0a0">since 2005</span>
                    </div>
                </div>
                <div class="menu-card">
                    <div class="menu-list">
                        <div class="menu-item active" data-src="main.jsp">홈</div>
                        <div class="menu-item" data-src="diary/diary.jsp">다이어리</div>
                        <div class="menu-item" data-src="pic/pic.jsp">사진첩</div>
                        <div class="menu-item" data-src="board/board.jsp">방명록</div>
                    </div>
                </div>
            </div>

            <div class="pencil-jar-wrap">
                <div class="tools-out">
                    <div class="tool pencil1"></div>
                    <div class="tool pencil2"></div>
                    <div class="tool pencil3"></div>
                </div>
                <div class="jar"></div>
                <div class="jar-label">꾸미기</div>
            </div>
        </div>

        <%-- ══ 가운데: 노트북 도화지 ══ --%>
        <div class="notebook" id="notebook">
            <div class="notebook-header">
                <h2>📖 Team Kira의 소소한 일상</h2>
                <div class="visitor">Today 15 | Total 1,234</div>
            </div>

            <div class="nb-tabs">
                <div class="nb-tab active" data-src="main.jsp">홈</div>
                <div class="nb-tab" data-src="diary/diary.jsp">다이어리</div>
                <div class="nb-tab" data-src="pic/pic.jsp">사진첩</div>
                <div class="nb-tab" data-src="board/board.jsp">방명록</div>
            </div>

            <%-- ✨ 핵심: 화면이 갈아끼워지는 전용 공간 --%>
            <div id="notebook-content" style="flex:1; width:100%; overflow-y:auto; padding:10px;">
            </div>
        </div>



        <%-- ══ /가운데 ══ --%>

        <%-- ══ 오른쪽: MP3 + 스마트폰 + 포스트잇 ══ --%>
        <div class="right-col">

            <%-- MP3 플레이어 (BGM 연결) --%>
            <div class="mp3">
                <div class="mp3-screen">
                    <div class="mp3-marquee">
                        <%--클릭하면 음악 상세페이지로 이동--%>
                        <span id="bgm-title" class="mp3-title-inner"
                              data-src="/bgm?ajax=true"
                              style="cursor: pointer;">
                            ♪ Hype Boy - NewJeans &nbsp;&nbsp;&nbsp;&nbsp;
                            ♪ Attention - NewJeans
                        </span>
                    </div>
                    <div class="mp3-controls-row">
                        <div class="mp3-time" id="bgm-current">0:00</div>
                        <div class="mp3-bar-mini">
                            <div class="mp3-fill-mini" id="bgm-progress-bar"></div>
                        </div>
                        <div class="mp3-time" id="bgm-duration">0:00</div>
                    </div>
                </div>
                <div class="mp3-buttons">
                    <div class="mp3-btn" onclick="playPrev()">◀◀</div>
                    <div class="mp3-btn play" id="bgm-toggle" onclick="togglePlay()">⏸</div>
                    <div class="mp3-btn" onclick="playNext()">▶▶</div>
                </div>
            </div>

            <%-- 스마트폰 (YouTube IFrame) --%>
            <div class="smartphone">
                <div class="phone-camera"></div>
                <!-- 화면: YouTube iframe -->
                <div class="phone-screen"
                     data-src="/bgm?ajax=true"
                     style="cursor: pointer;">
                    <!-- YT IFrame API가 이 div를 iframe으로 교체 -->
                    <div id="yt-player">
                        <img src="https://pbs.twimg.com/media/Gew2zMua8AAJoOM.jpg">
                    </div>
                    <!-- 유튜브 바로가기 링크 -->
                    <a id="yt-link" href="#" target="_blank" class="phone-yt-link">
                        ▶ YouTube에서 보기
                    </a>
                </div>
                <!-- 홈버튼 누르면 음악 상세페이지로 이동 -->
                <div class="phone-home"
                     data-src="/bgm?ajax=true"
                     style="cursor: pointer"></div>
            </div>

            <%-- 방문자 보기도 iframe 방식으로 --%>
            <div class="visitor-btn-wrap"
                 onclick="loadPage('visitor/visitor.jsp')">
                <div class="visitor-btn-card">
                    <span class="visitor-icon">🐾</span>
                    <span class="visitor-text">방문자 보기</span>
                </div>
            </div>
        </div>

        <div class="postit">
            오늘도<br/>몽글몽글한<br/>하루 보내장🌤<br/>
            <span style="font-size: 12px; color: #8a8030">— 2026.03.31</span>
        </div>
    </div>
</div>
<div class="desk-front"></div>
</div>

<div id="yt-player-hidden" style="display:none;"></div>
<script src="https://www.youtube.com/iframe_api"></script>
<script src="/js/music/player.js"></script>
<script src="/js/music/router.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", function () {
        loadPlaylist(1); // 나중에 → loadPlaylist(${loginUser.id}) 로 교체
    });
</script>
</body>
</html>