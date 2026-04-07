<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>비밀번호 찾기</title>

    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/user/find-pw.css">
</head>
<body>

<div class="findpw-wrapper">
    <div class="findpw-card">
        <h1 class="findpw-title">Find Password</h1>
        <div class="findpw-subtitle">본인 확인 후 비밀번호 재설정으로 이동합니다</div>

        <form id="findPwForm">
            <div class="form-row">
                <label for="id">아이디</label>
                <input id="id" name="id" required placeholder="아이디 입력">
            </div>

            <div class="form-row">
                <label for="name">이름</label>
                <input id="name" name="name" required placeholder="이름 입력">
            </div>

            <div class="form-row">
                <label for="findPwEmail">이메일</label>
                <div class="inline-check">
                    <input name="email" id="findPwEmail" required placeholder="이메일 입력">
                    <button type="button" id="findPwEmailSendBtn" class="sub-btn">인증번호 받기</button>
                </div>
            </div>

            <div class="form-row">
                <label for="findPwEmailCode">인증번호</label>
                <div class="inline-check">
                    <input name="emailCode" id="findPwEmailCode" placeholder="인증번호 입력">
                    <button type="button" id="findPwEmailCheckBtn" class="sub-btn">인증확인</button>
                </div>
            </div>

            <input type="hidden" name="emailVerified" id="findPwEmailVerified" value="N">
            <input type="hidden" name="verifiedEmail" id="findPwVerifiedEmail">

            <button type="button" id="goResetPwBtn">다음</button>
        </form>

        <div class="bottom-link">
            <a href="${pageContext.request.contextPath}/login">로그인으로 돌아가기</a>
        </div>
    </div>
</div>

<script>
    window.appCtx = "${pageContext.request.contextPath}";
</script>
<script src="${pageContext.request.contextPath}/js/user/find-pw.js"></script>
</body>
</html>