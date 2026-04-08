package com.kira.pj.diary;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/diary-delete")
public class DiaryDeleteC extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        // 1. DAO야, 넘어온 번호(no) 보고 그 일기 DB에서 싹 지워!
        DiaryDAO.DDAO.deleteDiary(request);

        // 2. 지운 다음에 달력을 다시 그려야 하니까 달력 계산기 켜기
        DiaryDAO.DDAO.getCalendar(request);

        // 3. 다이어리 화면으로 다시 포워딩 (달력 화면이 나옴)
        request.getRequestDispatcher("diary/diary.jsp").forward(request, response);
    }
}