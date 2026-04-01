<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html>
<head>
    <title>Board</title>
</head>
<body>
<div class="nb-tabs">
    <div class="nb-tab ">홈</div>
    <div class="nb-tab">다이어리</div>
    <div class="nb-tab">사진첩</div>
    <div class="nb-tab active">방명록</div>
</div>

<div class="nb-body">


    <div class="posts">
        <div class="post-item">
            <div class="post-header">
                <span class="post-user">방명록</span>
                <jsp:useBean id="now" class="java.util.Date" />
                <span class="post-date"><fmt:formatDate value="${now}" pattern="yyyy-MM-dd" /></span>
            </div>
            <div class="post-text">
                <c:forEach items="${guestBoard}" var="gb">
                    ${gb.guest_nick}/${gb.board_content}/${gb.created_at}
                </c:forEach>

            </div>
        </div>
    </div>

    <form action="board" method="post">
    <div class="write-row">
        <input class="write-input" placeholder="인사를 남겨주세요! ✏️" name="content" type="text"/>
        <button class="write-btn" >남기기</button>
    </div>
    </form>


</div>

</body>
</html>