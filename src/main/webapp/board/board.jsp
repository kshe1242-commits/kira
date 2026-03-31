<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html>
<head>
    <title>Board</title>
</head>
<body>
<div class="desk-wrapper">
    <div class="desk-surface">
        <div class="left-col">
            <div class="profile">
                <div class="profile-card">
                    <div class="profile-photo">🌬️</div>
                    <div class="profile-name">DongMin</div>
                    <div class="profile-mood">
                        햇살 가득한 오후,<br />기분 좋은 바람... 🍃<br />
                        <span style="font-size: 11px; color: #c0b0a0">since 2005</span>
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

            <div class="nb-body">
                <div class="write-row">
                    <input class="write-input" placeholder="지금 기분은 어때요? ✏️" />
                    <button class="write-btn">기록</button>
                </div>

                <div class="posts">
                    <div class="post-item">
                        <div class="post-header">
                            <span class="post-user">DongMin</span>
                            <span class="post-date">2026.03.31</span>
                        </div>
                        <div class="post-text">
                            기능 구현 준비 완료! 이 자리에 DB 데이터를 뿌려주세요. 😊
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="right-col">
            <div class="mp3">
                <div class="mp3-screen">
                    <div class="mp3-marquee">
                <span class="mp3-title-inner"
                >♪ Hype Boy - NewJeans &nbsp;&nbsp;&nbsp;&nbsp; ♪ Attention -
                  NewJeans</span
                >
                    </div>
                    <div class="mp3-controls-row">
                        <div class="mp3-time">01:23</div>
                        <div class="mp3-bar-mini">
                            <div class="mp3-fill-mini"></div>
                        </div>
                        <div class="mp3-time">03:07</div>
                    </div>
                </div>
                <div class="mp3-buttons">
                    <div class="mp3-btn">◀◀</div>
                    <div class="mp3-btn play">⏸</div>
                    <div class="mp3-btn">▶▶</div>
                </div>
            </div>

            <div class="postit">
                오늘도<br />몽글몽글한<br />하루 보내장🌤<br />
                <span style="font-size: 12px; color: #8a8030">— 2026.03.31</span>
            </div>
        </div>
    </div>
    <div class="desk-front"></div>
</div>
</body>
</html>