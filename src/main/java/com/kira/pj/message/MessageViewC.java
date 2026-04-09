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
        // 1. 한글 깨짐 방지 및 JSON 타입 세팅
        response.setContentType("application/json; charset=UTF-8");

        // 2. 세션에서 내 PK 가져오기 (보안 검색대)
        HttpSession session = request.getSession();
        String myPk = (String) session.getAttribute("loginUserPk");

        if (myPk == null) {
            response.getWriter().print("[]"); // 로그인이 안 되어있으면 빈 배열 반환
            return;
        }

        String action = request.getParameter("action");
        MessageDAO dao = new MessageDAO();
        List<Map<String, String>> list = null;

        // 3. 요청(action)에 따라 분기 처리
        if ("received".equals(action)) {
            list = dao.getReceivedMessages(myPk);
        } else if ("sent".equals(action)) {
            list = dao.getSentMessages(myPk);
        }

        // 4. 리스트를 JSON 문자열로 바꿔서 프론트엔드로 발사!
        if (list != null) {
            response.getWriter().print(new Gson().toJson(list));
        } else {
            response.getWriter().print("[]");
        }
    }
}