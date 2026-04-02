<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!DOCTYPE html>
<html>
<head>
<<<<<<< HEAD
<meta charset="UTF-8">

<link rel="stylesheet" href="/css/index.css">
<link href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&family=Gaegu:wght@300;400;700&display=swap" rel="stylesheet">

<style>
html, body{
    margin:0;
    padding:0;
    background:transparent;
    overflow-x:hidden;
}
</style>
=======
    <meta charset="UTF-8">

    <link rel="stylesheet" href="/css/index.css">
    <link href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&family=Gaegu:wght@300;400;700&display=swap"
          rel="stylesheet">

    <style>
        html, body {
            margin: 0;
            padding: 0;
            background: transparent;
            overflow-x: hidden;
        }
    </style>
>>>>>>> 00e3a5d ([fix] 1602 1612)

</head>
<body>

<form action="visitor" method="post" class="write-row"
      style="justify-content:center; align-items:center; gap:10px; margin-bottom:20px;">

<span style="font-family:'Nanum Pen Script'; font-size:22px; color:#8a7a78;">
🐾 발도장 꾹:
</span>

<<<<<<< HEAD
<input type="text"
       name="visitorName"
       class="write-input"
       placeholder="닉네임"
       style="width:150px;"
       required>

<button type="submit" class="write-btn">다녀감</button>
=======
    <input type="text"
           name="visitorName"
           class="write-input"
           placeholder="닉네임"
           style="width:150px;"
           required>

    <button type="submit" class="write-btn">다녀감</button>
>>>>>>> 00e3a5d ([fix] 1602 1612)

</form>


<div class="posts">

<<<<<<< HEAD
<c:choose>

<c:when test="${empty visitorList}">
<div class="post-item" style="text-align:center; color:#aaa; padding:50px;">
첫 발도장을 찍어주세요 😊
</div>
</c:when>

<c:otherwise>

<c:forEach var="v" items="${visitorList}">

<div class="post-item"
     style="display:flex; justify-content:space-between; align-items:center; padding:10px 15px;">

<div style="display:flex; align-items:center; gap:10px;">
=======
    <c:choose>

        <c:when test="${empty visitorList}">
            <div class="post-item" style="text-align:center; color:#aaa; padding:50px;">
                첫 발도장을 찍어주세요 😊
            </div>
        </c:when>

        <c:otherwise>

            <c:forEach var="v" items="${visitorList}">

                <div class="post-item"
                     style="display:flex; justify-content:space-between; align-items:center; padding:10px 15px;">

                    <div style="display:flex; align-items:center; gap:10px;">
>>>>>>> 00e3a5d ([fix] 1602 1612)

<span class="moving-emoji">

<c:choose>
<<<<<<< HEAD
<c:when test="${v.v_emoji == 1}">🐾</c:when>
<c:when test="${v.v_emoji == 2}">👣</c:when>
<c:when test="${v.v_emoji == 3}">🐱</c:when>
<c:when test="${v.v_emoji == 4}">🐶</c:when>
<c:otherwise>✨</c:otherwise>
=======
    <c:when test="${v.v_emoji == 1}">🐾</c:when>
    <c:when test="${v.v_emoji == 2}">👣</c:when>
    <c:when test="${v.v_emoji == 3}">🐱</c:when>
    <c:when test="${v.v_emoji == 4}">🐶</c:when>
    <c:otherwise>✨</c:otherwise>
>>>>>>> 00e3a5d ([fix] 1602 1612)
</c:choose>

</span>

<<<<<<< HEAD
<span style="font-size:16px;">
<strong>${v.v_writer_id}</strong>님이 다녀갔습니다.
</span>

</div>


<div style="display:flex; align-items:center; gap:10px;">

<span style="font-size:12px; color:#aaa;">
${v.v_date}
</span>

<a href="javascript:void(0);"
onclick="if(confirm('삭제?')) { location.href='visitorDel?vId=${v.v_id}'; }"
style="text-decoration:none; color:#ff9999; font-weight:bold;">
&times;
</a>

</div>

</div>

</c:forEach>

</c:otherwise>

</c:choose>

</div>


<div class="paging-box"
style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; padding:0 10px;">

<c:choose>

<c:when test="${currentPage > 1}">
<button class="page-btn"
onclick="location.href='visitor?p=${currentPage-1}'">
◀ 이전
</button>
</c:when>

<c:otherwise>
<div style="width:60px;"></div>
</c:otherwise>

</c:choose>


<span style="font-family:'Nanum Pen Script'; color:#8a7a78; font-size:18px;">
Page ${currentPage}
</span>


<c:choose>

<c:when test="${fn:length(visitorList) == 7}">
<button class="page-btn"
onclick="location.href='visitor?p=${currentPage+1}'">
다음 ▶
</button>
</c:when>

<c:otherwise>
<div style="width:60px;"></div>
</c:otherwise>

</c:choose>

=======
                        <span style="font-size:16px;">
<strong>${v.v_writer_id}</strong>님이 다녀갔습니다.
</span>

                    </div>


                    <div style="display:flex; align-items:center; gap:10px;">

<span style="font-size:12px; color:#aaa;">
        ${v.v_date}
</span>

                        <a href="javascript:void(0);"
                           onclick="if(confirm('삭제?')) { location.href='visitorDel?vId=${v.v_id}'; }"
                           style="text-decoration:none; color:#ff9999; font-weight:bold;">
                            &times;
                        </a>

                    </div>

                </div>

            </c:forEach>

        </c:otherwise>

    </c:choose>

</div>


<div class="paging-box"
     style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; padding:0 10px;">

    <c:choose>

        <c:when test="${currentPage > 1}">
            <button class="page-btn"
                    onclick="location.href='visitor?p=${currentPage-1}'">
                ◀ 이전
            </button>
        </c:when>

        <c:otherwise>
            <div style="width:60px;"></div>
        </c:otherwise>

    </c:choose>


    <span style="font-family:'Nanum Pen Script'; color:#8a7a78; font-size:18px;">
Page ${currentPage}
</span>


    <c:choose>

        <c:when test="${fn:length(visitorList) == 7}">
            <button class="page-btn"
                    onclick="location.href='visitor?p=${currentPage+1}'">
                다음 ▶
            </button>
        </c:when>

        <c:otherwise>
            <div style="width:60px;"></div>
        </c:otherwise>

    </c:choose>

>>>>>>> 00e3a5d ([fix] 1602 1612)
</div>

</body>
</html>