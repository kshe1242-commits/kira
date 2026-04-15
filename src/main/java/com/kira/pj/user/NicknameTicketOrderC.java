package com.kira.pj.user;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

@WebServlet("/nickname-ticket-order")
public class NicknameTicketOrderC extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=UTF-8");

        HttpSession session = request.getSession();
        String pk = (String) session.getAttribute("loginUserPk");

        if (pk == null) {
            response.getWriter().print("{\"success\":false,\"message\":\"로그인이 필요합니다.\"}");
            return;
        }

        String orderId = UserDAO.DAO.createNickTicketOrder(pk, 1000, 1);

        if (orderId == null) {
            response.getWriter().print("{\"success\":false,\"message\":\"주문 생성 실패\"}");
            return;
        }

        response.getWriter().print(
                "{\"success\":true,\"orderId\":\"" + orderId + "\",\"amount\":1000,\"orderName\":\"닉네임 변경권 1개\"}"
        );
    }
}