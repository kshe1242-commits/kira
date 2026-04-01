<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <title>Minihome</title>
    <link rel="stylesheet" href="/css/index.css">
    <script defer src="/js/minihome.js"></script>
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
                        <span style="font-size:11px; color:#c0b0a0">since 2005</span>
                    </div>
                </div>
                <div class="menu-card">
                    <div class="menu-list">
                        <div class="menu-item active">홈</div>
                        <div class="menu-item">다이어리</div>
                        <div class="menu-item">사진첩</div>
                        <div class="menu-item">방명록</div>
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
        <%-- ══ /왼쪽 ══ --%>

        <%-- ══ 가운데: 공책 ══ --%>
        <div class="notebook">

            <div class="notebook-header">
                <h2>📖 DongMin의 소소한 일상</h2>
                <div class="visitor">Today 15 | Total 1,234</div>
            </div>

            <div class="nb-tabs">
                <div class="nb-tab active">홈</div>
                <div class="nb-tab">다이어리</div>
                <div class="nb-tab">사진첩</div>
                <div class="nb-tab">방명록</div>
            </div>

            <iframe id="notebook-frame"
                    src="/home-body"
                    frameborder="0;">
            </iframe>

<%--            <div class="nb-body">--%>
<%--                <div class="write-row">--%>
<%--                    <input class="write-input" placeholder="지금 기분은 어때요? ✏️"/>--%>
<%--                    <button class="write-btn">기록</button>--%>
<%--                </div>--%>

<%--                <div class="posts">--%>
<%--                    <div class="post-item">--%>
<%--                        <div class="post-header">--%>
<%--                            <span class="post-user">DongMin</span>--%>
<%--                            <span class="post-date">2026.03.31</span>--%>
<%--                        </div>--%>
<%--                        <div class="post-text">--%>
<%--                            기능 구현 준비 완료! 이 자리에 DB 데이터를 뿌려주세요. 😊--%>
<%--                        </div>--%>
<%--                    </div>--%>
<%--                </div>--%>
<%--            </div>--%>
        </div>
        <%-- ══ /가운데 ══ --%>

        <%-- ══ 오른쪽: MP3 + 스마트폰 + 포스트잇 ══ --%>
        <div class="right-col">

            <%-- MP3 플레이어 (BGM 연결) --%>
            <div class="mp3">
                <div class="mp3-screen">
                    <div class="mp3-marquee">
                        <span class="mp3-title-inner" id="bgm-title"
                              style="cursor:pointer"
                              onclick="location.href='/bgm'">
                            ♪
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
                <div class="phone-screen">
                    <div id="yt-player">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiYapiOg0bGxys9KbUX99TnjvcgYRuFd0TGA&s">
                    </div>
                    <a id="yt-link" href="#" target="_blank" class="phone-yt-link">
                        ▶ YouTube에서 보기
                    </a>
                </div>
                <div class="phone-home"></div>
            </div>

            <%-- 포스트잇 ← right-col 안에 있어야 함 --%>
            <div class="postit">
                오늘도<br/>몽글몽글한<br/>하루 보내장🌤<br/>
                <span style="font-size:12px; color:#8a8030">— 2026.03.31</span>
            </div>

        </div>
        <%-- ══ /오른쪽 ══ --%>

    </div><%-- /desk-surface --%>
    <div class="desk-front"></div>
</div><%-- /desk-wrapper --%>

<%-- ══ BGM 스크립트 ══ --%>
<div id="yt-player-hidden" style="display:none;"></div>
<script src="https://www.youtube.com/iframe_api"></script>
<script src="/js/music/player.js"></script>
<script src="/js/music/router.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", function () {
        // 이 페이지 프로필 유저 ID로 BGM 로드
        // 나중에 → loadPlaylist(${profileUser.id}) 로 교체
        loadPlaylist(1);
    });
</script>

</body>
</html>