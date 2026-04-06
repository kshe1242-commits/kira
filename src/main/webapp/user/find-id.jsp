<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>아이디 찾기</title>

    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/user/find-id.css">
</head>
<body>

<div class="findid-wrapper">
    <div class="findid-card">
        <h1 class="findid-title">Find ID</h1>
        <div class="findid-subtitle">이메일 인증 후 등록된 아이디를 확인합니다</div>

        <form id="findIdForm">
            <div class="form-row">
                <label for="name">이름</label>
                <input id="name" name="name" required placeholder="이름 입력">
            </div>

            <div class="form-row">
                <label for="findIdEmail">이메일</label>
                <div class="inline-check">
                    <input name="email" id="findIdEmail" required placeholder="이메일 입력">
                    <button type="button" id="findIdEmailSendBtn" class="sub-btn">인증번호 받기</button>
                </div>
            </div>

            <div class="form-row">
                <label for="findIdEmailCode">인증번호</label>
                <div class="inline-check">
                    <input name="emailCode" id="findIdEmailCode" placeholder="인증번호 입력">
                    <button type="button" id="findIdEmailCheckBtn" class="sub-btn">인증확인</button>
                </div>
            </div>

            <input type="hidden" name="emailVerified" id="findIdEmailVerified" value="N">
            <input type="hidden" name="verifiedEmail" id="findIdVerifiedEmail">

            <button type="button" id="findIdBtn">아이디 찾기</button>
        </form>

        <div id="foundIdArea" class="result-area"></div>

        <div class="bottom-link">
            <a href="${pageContext.request.contextPath}/login">로그인으로 돌아가기</a>
        </div>
    </div>
</div>

<script>
    window.appCtx = "${pageContext.request.contextPath}";
</script>
<script src="${pageContext.request.contextPath}/js/user/find-id.js"></script>
</body>
</html>