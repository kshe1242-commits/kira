package com.kira.pj.photo;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(name = "CommentC", value = "/photo-comment")
public class CommentC extends HttpServlet {

    // 댓글 등록 요청 (POST)
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("text/plain;charset=UTF-8");

        int result = CommentDAO.CDAO.insertComment(request);

        if (result > 0) {
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().print(result);
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().print("Fail");
        }
    }

    // 댓글 삭제 요청 (DELETE) - 신규 추가!
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("text/plain;charset=UTF-8");

        int result = CommentDAO.CDAO.deleteComment(request);

        if (result > 0) {
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().print(result);
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().print("Fail");
        }
    }
}