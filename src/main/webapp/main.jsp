<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <title>Minihome</title>
    <link rel="stylesheet" href="/css/index.css">
    <script defer src="/js/minihome.js"></script>
</head>

<body>
일단 홈화면
</body>

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