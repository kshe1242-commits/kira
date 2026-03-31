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

        <!-- 왼쪽 -->
        <div class="left-col">

            <div class="profile-card">

                <div class="profile-photo">
                    🐱
                </div>

                <div class="profile-name">
                    동헌
                </div>

                <div class="profile-mood">
                    오늘도 개발중
                </div>

            </div>

            <div class="menu-card">

                <div class="menu-item">홈</div>
                <div class="menu-item">방명록</div>
                <div class="menu-item">사진첩</div>
                <div class="menu-item">다이어리</div>

            </div>

        </div>

        <!-- 메인 -->

        <div class="notebook">

            <div class="notebook-header">

                <h2>Minihome</h2>

                <div class="visitor">
                    TODAY 3 | TOTAL 120
                </div>

            </div>

            <div class="nb-tabs">

                <div class="nb-tab active">방명록</div>

            </div>

            <div class="nb-body">

                <div class="write-row">

                    <input class="write-input" placeholder="방명록을 남겨주세요">

                    <button class="write-btn">
                        작성
                    </button>

                </div>

                <div class="posts">

                </div>

            </div>

        </div>

    </div>

</div>

</body>

</html>