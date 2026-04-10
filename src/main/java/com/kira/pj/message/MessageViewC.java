package com.kira.pj.message; // 본인 프로젝트 패키지명에 맞게 수정하세요

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
        // 1. 한글 깨짐 방지 및 JSON 응답 세팅
        response.setContentType("application/json; charset=UTF-8");

        // 2. 세션 검사 (로그인 안 되어있으면 차단)
        HttpSession session = request.getSession();
        String myPk = (String) session.getAttribute("loginUserPk");

        if (myPk == null) {
            response.getWriter().print("[]"); // 프론트엔드 에러 방지용 빈 배열 반환
            return;
        }

        String action = request.getParameter("action");
        MessageDAO dao = new MessageDAO();

        // 🚨 [새로운 기능 1] 안 읽은 쪽지 개수 알려주기 (빨간 뱃지용)
        if ("unreadCount".equals(action)) {
            int count = dao.getUnreadCount(myPk);
            response.getWriter().print("{\"count\": " + count + "}");
            return; // 여기서 바로 통신 종료
        }

        // 3. 받은 쪽지함 / 보낸 쪽지함 리스트 가져오기
        List<Map<String, String>> list = null;
        if ("received".equals(action)) {
            list = dao.getReceivedMessages(myPk);
        } else if ("sent".equals(action)) {
            list = dao.getSentMessages(myPk);
        }

        // 4. JSON으로 변환해서 프론트엔드로 발사!
        if (list != null) {
            response.getWriter().print(new Gson().toJson(list));
        } else {
            response.getWriter().print("[]");
        }
    }
}