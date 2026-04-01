<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<div class="nb-tabs">
    <div class="nb-tab" onclick="location.href='/main'">홈</div>
    <div class="nb-tab" onclick="location.href='/diary'">다이어리</div>
    <div class="nb-tab" onclick="location.href='/photo'">사진첩</div>
    <div class="nb-tab active">방문자</div>
</div>

<div class="nb-body">
    <form action="/visitor" method="post" class="write-row" style="display: flex; gap: 10px; align-items: center; justify-content: center;">
        <span style="font-family: 'Nanum Pen Script', cursive; font-size: 22px; color: #8a7a78;">🐾 발도장 꾹: </span>
        <input type="text" name="visitorName" placeholder="닉네임" style="width: 150px; padding: 8px; border: 1px solid #f2c0bd; border-radius: 5px; outline: none;" required />
        <button type="submit" class="write-btn">다녀감</button>
    </form>

    <div class="posts" style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #f0eee5;">
        <c:choose>
            <c:when test="${empty visitorList}">
                <div style="text-align: center; color: #aaa09a; padding: 20px 0;">
                    아직 다녀간 사람이 없어요. 첫 발도장을 찍어주세요! 😊
                </div>
            </c:when>
            <c:otherwise>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    <c:forEach var="v" items="${visitorList}">
                        <li style="padding: 12px 0; border-bottom: 1px dashed #eee; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 16px; color: #5a4a3a;">
                                <strong style="color: #f2a0a0;">${v.name}</strong>님이 다녀갔습니다.
                            </span>
                            <span style="font-size: 13px; color: #c0b0a0;">${v.visitTime}</span>
                        </li>
                    </c:forEach>
                </ul>
            </c:otherwise>
        </c:choose>
    </div>
</div>