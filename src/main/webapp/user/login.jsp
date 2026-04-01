<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html>
<head>
    <title>JSP - Hello World</title>
</head>
<body>
<form action="user-login" method="post">
<input type ="text" placeholder="ID" name="id"><br>
<input type = "text" placeholder = "PW" name = "pw"><br>
<button>Login</button>
</form>
<button onclick="location.href='add-user'">회원가입</button>
</body>
</html>