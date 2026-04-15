package com.kira.pj.user;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/payment/success")
public class NickTicketPaymentSuccessC extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");

        String paymentKey = request.getParameter("paymentKey");
        String orderId = request.getParameter("orderId");
        String amount = request.getParameter("amount");

        boolean ok = UserDAO.DAO.confirmNickTicketPayment(request, paymentKey, orderId, amount);

        if (ok) {
            response.sendRedirect(request.getContextPath() + "/mypage?pay=success");
        } else {
            response.sendRedirect(request.getContextPath() + "/mypage?pay=fail");
        }
    }
}
