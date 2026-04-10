package com.kira.pj.message;

import com.google.gson.Gson;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@WebServlet("/messageview")
public class MessageViewC extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json; charset=UTF-8");

        HttpSession session = request.getSession();
        // PK 대신 직관적인 ID 사용
        String myId = (String) session.getAttribute("loginUserId");

        if (myId == null) {
            response.getWriter().print("[]");
            return;
        }

        String action = request.getParameter("action");
        MessageDAO dao = new MessageDAO();

        if ("unreadCount".equals(action)) {
            int count = dao.getUnreadCount(myId);
            response.getWriter().print("{\"count\": " + count + "}");
            return;
        }

        List<Map<String, String>> list = null;
        if ("received".equals(action)) {
            list = dao.getReceivedMessages(myId);
        } else if ("sent".equals(action)) {
            list = dao.getSentMessages(myId);
        }

        if (list != null) {
            response.getWriter().print(new Gson().toJson(list));
        } else {
            response.getWriter().print("[]");
        }
    }
}