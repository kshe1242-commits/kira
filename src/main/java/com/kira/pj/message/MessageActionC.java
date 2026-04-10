package com.kira.pj.message;

import com.google.gson.JsonObject;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

@WebServlet("/messageaction")
public class MessageActionC extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=UTF-8");

        HttpSession session = request.getSession();
        // PK 대신 직관적인 ID 사용
        String myId = (String) session.getAttribute("loginUserId");
        JsonObject resultJson = new JsonObject();

        if (myId == null) {
            resultJson.addProperty("success", false);
            resultJson.addProperty("message", "로그인이 필요합니다.");
            response.getWriter().print(resultJson.toString());
            return;
        }

        String action = request.getParameter("action");
        MessageDAO dao = new MessageDAO();

        if ("send".equals(action)) {
            // 프론트에서 ID를 넘기므로 receiverId 로 받음
            String receiverId = request.getParameter("receiverId");
            String content = request.getParameter("content");

            int res = dao.sendMessage(myId, receiverId, content);

            if (res == -1) {
                resultJson.addProperty("success", false);
                resultJson.addProperty("message", "일촌에게만 쪽지를 보낼 수 있습니다. 🔒");
            } else if (res > 0) {
                resultJson.addProperty("success", true);
            } else {
                resultJson.addProperty("success", false);
                resultJson.addProperty("message", "서버 오류로 발송에 실패했습니다.");
            }

        } else if ("delete".equals(action)) {
            // 쪽지 고유 번호인 msgPk는 그대로 둔다 (게시글 번호와 같은 개념이므로 ID화 할 수 없음)
            String msgPk = request.getParameter("msgPk");
            String type = request.getParameter("type");

            int res = dao.deleteMessage(msgPk, myId, type);
            if (res > 0) {
                resultJson.addProperty("success", true);
            } else {
                resultJson.addProperty("success", false);
                resultJson.addProperty("message", "삭제에 실패했습니다.");
            }

        } else if ("markRead".equals(action)) {
            dao.markAsRead(myId);
            resultJson.addProperty("success", true);
        }

        response.getWriter().print(resultJson.toString());
    }
}