<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<div class="diary-container">
    <c:choose>
        <%-- [1] 글쓰기 모드 화면 --%>
        <c:when test="${showMode == 'write'}">
            <div class="diary-board">
                <div class="board-header">
                    <h3>✍️ ${curYear}.${curMonth}.${selectedDay} 일기 쓰기</h3>
                    <button onclick="loadDiary('diary?y=${curYear}&m=${curMonth}&d=${selectedDay}')" class="write-btn">취소</button>
                </div>

                <form id="diaryWriteForm" style="display: flex; flex-direction: column; gap: 15px;">
                    <input type="hidden" name="d_year" value="${curYear}">
                    <input type="hidden" name="d_month" value="${curMonth}">
                    <input type="hidden" name="d_date" value="${selectedDay}">

                    <input name="d_title" placeholder="제목을 입력하세요" style="width:100%; padding:15px; border:none; border-bottom:2px solid #f7cfcd; font-family:'Gaegu'; font-size:22px; outline:none; box-sizing: border-box;">

                    <textarea name="d_txt" placeholder="내용을 입력하세요..." style="width:100%; height:250px; border:none; padding:15px; font-family:'Gaegu'; font-size:20px; outline:none; resize:none; box-sizing: border-box;"></textarea>

                    <div style="text-align:right;">
                        <button type="button" class="write-btn" onclick="submitDiaryForm()">등록하기</button>
                    </div>
                </form>
            </div>
        </c:when>

        <%-- [2] 상세 보기 모드 화면 (위치 수정 완료!) --%>
        <c:when test="${showMode == 'detail'}">
            <div class="diary-board">
                <div class="board-header">
                    <h3>👀 ${diary.d_date}의 일기</h3>
                    <button onclick="loadDiary('diary?y=${curYear}&m=${curMonth}&d=${selectedDay}')" class="write-btn">목록으로</button>
                </div>

                <div style="background:#fff; padding:20px; border-radius:10px; border:1px solid #f7cfcd;">
                    <div style="font-size:24px; font-weight:bold; color:#333; margin-bottom:20px; border-bottom:2px solid #f7cfcd; padding-bottom:10px;">
                            ${diary.title}
                    </div>
                    <div style="font-size:18px; color:#555; line-height:1.8; min-height:200px; white-space: pre-wrap;">${diary.txt}</div>

                    <div style="text-align:right; margin-top:20px;">
                        <button class="write-btn" style="background:#ddd; color:#333;">수정</button>
                        <button class="write-btn" style="background:#ff9999;">삭제</button>
                    </div>
                </div>
            </div>
        </c:when>

        <%-- [3] 기본 달력 & 일기 목록 화면 --%>
        <c:otherwise>
            <div class="calendar-header">
                <a href="javascript:void(0);" onclick="loadDiary('diary?y=${prevYear}&m=${prevMonth}')" class="cal-btn">◀</a>
                <span class="cal-title">${curYear}. ${curMonth < 10 ? '0' : ''}${curMonth}</span>
                <a href="javascript:void(0);" onclick="loadDiary('diary?y=${nextYear}&m=${nextMonth}')" class="cal-btn">▶</a>
            </div>

            <div class="calendar-wrap">
                <table class="calendar-table">
                    <thead>
                    <tr><th class="sun">SUN</th><th>MON</th><th>TUE</th><th>WED</th><th>THU</th><th>FRI</th><th class="sat">SAT</th></tr>
                    </thead>
                    <tbody>
                    <tr>
                        <c:if test="${startDay > 1}">
                            <c:forEach var="i" begin="1" end="${startDay - 1}"><td></td></c:forEach>
                        </c:if>

                        <c:forEach var="d" begin="1" end="${lastDay}">
                        <td class="${(d + startDay - 1) % 7 == 1 ? 'sun' : ((d + startDay - 1) % 7 == 0 ? 'sat' : '')}">
                            <a href="javascript:void(0);" onclick="loadDiary('diary?y=${curYear}&m=${curMonth}&d=${d}')">${d}</a>
                        </td>
                        <c:if test="${(d + startDay - 1) % 7 == 0 && d < lastDay}">
                    </tr><tr>
                        </c:if>
                        </c:forEach>
                    </tr>
                    </tbody>
                </table>
            </div>

            <%-- 특정 날짜를 눌렀을 때만 나타나는 일기 목록 --%>
            <c:if test="${showMode == 'list'}">
                <div class="diary-board">
                    <div class="board-header">
                        <h3>📅 ${selectedDay}일의 일기</h3>
                        <button onclick="loadDiary('diary?y=${curYear}&m=${curMonth}&d=${selectedDay}&mode=write')" class="write-btn">일기쓰기</button>
                    </div>

                    <div class="posts">
                        <c:forEach var="p" items="${posts}">
                            <div class="post-item">
                                <div style="display:flex; justify-content:space-between; border-bottom:1px dashed #eee; padding-bottom:10px; margin-bottom:10px;">

                                        <%-- ★ 제목에 상세 보기(diary-detail) 링크 적용 완료! ★ --%>
                                    <a href="javascript:void(0);" onclick="loadDiary('diary-detail?no=${p.no}&y=${curYear}&m=${curMonth}&d=${selectedDay}')" style="text-decoration:none;">
                                        <span style="font-weight:bold; font-size:22px; color:#555;">${p.title}</span>
                                    </a>

                                    <span style="font-size:14px; color:#bbb;">${curYear}.${curMonth}.${selectedDay}</span>
                                </div>
                                <div style="font-size:18px; color:#666; line-height:1.6; white-space: pre-wrap;">${p.txt}</div>
                            </div>
                        </c:forEach>
                    </div>
                </div>
            </c:if>
        </c:otherwise>
    </c:choose>
</div>