<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>재생목록</title>

    <link rel="stylesheet" href="<c:url value='/css/index.css' />">
    <link rel="stylesheet" href="<c:url value='/css/music.css' />">
    <link href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&family=Gaegu:wght@300;400;700&display=swap" rel="stylesheet">
</head>
<body>

<div class="bgm-wrap">

    <div class="bgm-header">🎵 현재 재생중</div>

    <div class="bgm-now">
        <img id="now-thumb" class="bgm-now-thumb"
             src="https://img.youtube.com/vi/BnkhBwzBqlQ/mqdefault.jpg"
             alt="현재 재생 중 썸네일">
        <div class="bgm-now-info">
            <div class="bgm-now-badge">▶ 재생 중</div>
            <div id="now-title" class="bgm-now-title">Needygirl Overdose</div>
            <div class="bgm-now-bar">
                <div id="now-bar-fill" class="bgm-now-bar-fill"></div>
            </div>
        </div>
    </div>

    <div class="bgm-queue-label">🎶 전체 목록</div>
    <div id="bgm-queue-list"></div>

</div>

<script src="<c:url value='/js/music/bgm.js' />"></script>
</body>
</html>