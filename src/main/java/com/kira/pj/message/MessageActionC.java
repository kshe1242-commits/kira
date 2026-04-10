package com.kira.pj.message; // 본인 프로젝트 패키지명에 맞게 수정하세요

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
        // 1. 인코딩 및 JSON 세팅
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=UTF-8");

        HttpSession session = request.getSession();
        String myPk = (String) session.getAttribute("loginUserPk");
        JsonObject resultJson = new JsonObject();

        if (myPk == null) {
            resultJson.addProperty("success", false);
            resultJson.addProperty("message", "로그인이 필요합니다.");
            response.getWriter().print(resultJson.toString());
            return;
        }

        String action = request.getParameter("action");
        MessageDAO dao = new MessageDAO();

        // ===========================================
        // [기능 1] 쪽지 발송
        // ===========================================
        if ("send".equals(action)) {
            String receiverPk = request.getParameter("receiverPk");
            String content = request.getParameter("content");

            int res = dao.sendMessage(myPk, receiverPk, content);

            if (res == -1) {
                resultJson.addProperty("success", false);
                resultJson.addProperty("message", "일촌에게만 쪽지를 보낼 수 있습니다. 🔒");
            } else if (res > 0) {
                resultJson.addProperty("success", true);
            } else {
                resultJson.addProperty("success", false);
                resultJson.addProperty("message", "서버 오류로 발송에 실패했습니다.");
            }

            // ===========================================
            // [기능 2] 쪽지 삭제
            // ===========================================
        } else if ("delete".equals(action)) {
            String msgPk = request.getParameter("msgPk");
            String type = request.getParameter("type");

            int res = dao.deleteMessage(msgPk, myPk, type);
            if (res > 0) {
                resultJson.addProperty("success", true);
            } else {
                resultJson.addProperty("success", false);
                resultJson.addProperty("message", "삭제에 실패했습니다.");
            }

            // 🚨 [새로운 기능 3] 받은 쪽지함 열었을 때 모두 읽음 처리
        } else if ("markRead".equals(action)) {
            dao.markAsRead(myPk);
            resultJson.addProperty("success", true);
        }

        // 완성된 결과를 발사!
        response.getWriter().print(resultJson.toString());
    }
}