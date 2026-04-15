package com.kira.pj.photo;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

// 프론트엔드의 fetch('/photo-comment') 요청과 매핑됩니다.
@WebServlet(name = "CommentC", value = "/photo-comment")
public class CommentC extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // 1. 한글 깨짐 방지를 위한 인코딩 설정 (가장 먼저 해야 함)
        request.setCharacterEncoding("UTF-8");
        response.setContentType("text/plain;charset=UTF-8");

        // 2. DAO 호출하여 DB에 INSERT
        int result = CommentDAO.CDAO.insertComment(request);

        // 3. 결과에 따라 HTTP 상태 코드와 메시지 응답
        if (result > 0) {
            // 성공: 200 OK 상태 코드와 함께 성공 행의 수(1)를 보냄
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().print(result);
        } else {
            // 실패: 500 에러 상태 코드를 보내 프론트엔드의 response.ok가 false가 되도록 함
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().print("Fail");
        }
    }
}