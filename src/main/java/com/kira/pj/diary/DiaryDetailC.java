package com.kira.pj.diary;

import com.kira.pj.friend.FriendDAO;
import com.kira.pj.friend.FriendDTO;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet("/diary-detail")
public class DiaryDetailC extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        DiaryDAO.DDAO.getDiaryDetail(request);
        DiaryDTO diary = (DiaryDTO) request.getAttribute("diary");

        if (diary == null) {
            response.sendError(404);
            return;
        }

        HttpSession session = request.getSession();
        String myPk = (String) session.getAttribute("loginUserPk");
        String writerId = diary.getId(); // 작성자 아이디

        // 여기서도 주인 정보를 세션에서 가져와서 관계를 따져야 합니다.
        String ownerPk = (String) session.getAttribute("ownerUserPk");

        int relation = 0;
        if (myPk != null && ownerPk != null) {
            if (myPk.equals(ownerPk)) relation = 2;
            else {
                FriendDAO fdao = new FriendDAO();
                FriendDTO fdto = fdao.checkRelation(myPk, ownerPk);
                if (fdto != null && fdto.getF_status() == 1) relation = 1;
            }
        }

        int vis = diary.getVisibility();
        if ((vis == 0 && relation < 2) || (vis == 1 && relation < 1)) {
            request.setAttribute("showMode", "error"); // JSP에서 에러 처리
        } else {
            DiaryDAO.DDAO.getReplies(request);
            request.setAttribute("showMode", "detail");
        }

        // ★ 이 forward 한 줄이 404 에러를 잡는 열쇠입니다!
        request.getRequestDispatcher("diary/diary.jsp").forward(request, response);
    }
}