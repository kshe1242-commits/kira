<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html>
<head>
    <title>JSP - Hello World</title>
</head>
<body>

<div class="picture-container" style="display: flex">
    <c:forEach var="p" items="${pictures}">
        <div class="picture-card">
            <div>${p.no}</div>
            <div>${p.userId}</div>
            <div><img src="/images/${p.fileName}" alt="" style="width: 100px; height: 100px; object-fit: cover;"></div>
            <div> ${p.text}</div>
        </div>
    </c:forEach>

</div>

</body>
</html>
