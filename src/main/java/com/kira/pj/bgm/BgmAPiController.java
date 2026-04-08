package com.kira.pj.bgm;

import com.google.gson.Gson;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet(name = "BgmAPiController", value = "/api/bgm")
public class BgmAPiController extends HttpServlet {

    // ── GET: 플레이리스트 조회 ─────────────────────────────────
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("loginUserPk") == null) {
            out.print("[]");
            return;
        }

        String uPk = (String) session.getAttribute("loginUserPk");
        List<BgmTrackVO> list = BgmDAO.MDAO.getTracksByUser(uPk);

        if (list.isEmpty()) {
            out.print("[]");
            return;
        }

        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            BgmTrackVO vo = list.get(i);
            if (i > 0) sb.append(",");
            sb.append("{")
                    .append("\"youtubeId\":\"").append(esc(vo.getYoutubeId())).append("\",")
                    .append("\"title\":\"").append(esc(vo.getTitle())).append("\",")
                    .append("\"duration\":").append(vo.getDuration()).append(",")
                    .append("\"trackOrder\":").append(vo.getTrackOrder()).append(",")
                    .append("\"userNickname\":\"").append(esc(vo.getUserNickname())).append("\"")
                    .append("}");
        }
        sb.append("]");
        out.print(sb.toString());
    }

    // ── POST: 트랙 추가 ───────────────────────────────────────
    // BgmAPiController.java의 doPost 수정
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // ✅ 1. 반드시 맨 윗줄에 인코딩 설정 (일본어/특수문자 방지)
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("application/json;charset=UTF-8");

        PrintWriter out = resp.getWriter();

        try {
            HttpSession session = req.getSession(false);
            if (session == null || session.getAttribute("loginUserPk") == null) {
                resp.setStatus(401);
                out.print("{\"result\":\"fail\",\"msg\":\"로그인이 필요합니다.\"}");
                return;
            }

            String uPk = (String) session.getAttribute("loginUserPk");
            String youtubeId = req.getParameter("youtubeId");
            String title = req.getParameter("title");
            String durationStr = req.getParameter("duration");

            // ✅ 2. 값 유효성 검사 (500 에러 방지)
            if (youtubeId == null || title == null || durationStr == null) {
                out.print("{\"result\":\"fail\",\"msg\":\"누락된 데이터가 있습니다.\"}");
                return;
            }

            BgmTrackVO vo = new BgmTrackVO();
            vo.setUPk(uPk);
            vo.setYoutubeId(youtubeId);
            vo.setTitle(title);
            vo.setDuration(Integer.parseInt(durationStr));

            BgmDAO.MDAO.insertTrack(vo);
            out.print("{\"result\":\"ok\"}");

        } catch (Exception e) {
            // ✅ 3. 에러 발생 시 로그 출력 및 응답
            e.printStackTrace();
            out.print("{\"result\":\"fail\",\"msg\":\"서버 내부 오류: " + e.getMessage() + "\"}");
        }
    }

    // ── DELETE: 트랙 삭제 ─────────────────────────────────────
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("loginUserPk") == null) {
            resp.setStatus(401);
            out.print("{\"result\":\"fail\",\"msg\":\"로그인 필요\"}");
            return;
        }

        String uPk       = (String) session.getAttribute("loginUserPk");
        String youtubeId = req.getParameter("youtubeId");

        if (youtubeId == null) {
            resp.setStatus(400);
            out.print("{\"result\":\"fail\",\"msg\":\"youtubeId 누락\"}");
            return;
        }

        boolean ok = BgmDAO.MDAO.deleteTrack(uPk, youtubeId);
        out.print(ok ? "{\"result\":\"ok\"}" : "{\"result\":\"fail\",\"msg\":\"삭제 실패\"}");
    }

    private String esc(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    // 재생시간 동기화
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("application/json;charset=UTF-8");

        // URL 파라미터로 명시적으로 받기
        String uPk = (String) req.getSession().getAttribute("loginUserPk");
        String youtubeId = req.getParameter("youtubeId");
        String durationStr = req.getParameter("duration");

        if (uPk != null && youtubeId != null && durationStr != null) {
            int duration = Integer.parseInt(durationStr);
            boolean ok = BgmDAO.MDAO.updateTrackDuration(uPk, youtubeId, duration);
            resp.getWriter().print("{\"result\":\"" + (ok ? "ok" : "fail") + "\"}");
        }
    }
}