package com.kira.pj.visitor;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(name = "VisitorC", value = "/visitor")
public class VisitorC extends HttpServlet {

    // 화면을 보여주는 역할 (조회: Read)
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        // 1. [DB 로직] DAO를 통해 오라클 DB에서 방문자 목록을 가져옵니다.
        // 현재는 DAO를 만들지 않았으므로 주석 처리하거나 빈 리스트를 보냅니다.
//         VisitorDAO visitorDAO = new VisitorDAO();
        // List<VisitorDTO> visitorList = dao.getAllVisitors("DongMin"); // 홈피 주인 ID 기준 조회


        // 2. 화면 설정
        request.setAttribute("content", "visitor.jsp");

        // 3. 메인 레이아웃으로 포워딩
        request.getRequestDispatcher("main.jsp").forward(request, response);
    }

    // 새로운 방문 기록을 저장하는 역할 (생성: Create)
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");

        // 1. JSP 폼에서 넘어온 데이터 받기
        String visitorName = request.getParameter("visitorName");

        // 2. [DB 로직] 오라클 DB에 INSERT 실행
        // 실제로는 아래와 같은 모양이 될 거예요.
        /*
        VisitorDTO dto = new VisitorDTO();
        dto.setvWriterId(visitorName); // 지금은 로그인 연동 전이니 입력받은 이름 사용
        dto.setvOwnerId("DongMin");    // 현재 홈피 주인

        VisitorDAO dao = new VisitorDAO();
        dao.insertVisitor(dto);
        */

        System.out.println("오라클 DB 저장 시도: " + visitorName);

        // 3. 저장이 끝나면 목록 페이지로 리다이렉트
        response.sendRedirect("/visitor");
    }
}