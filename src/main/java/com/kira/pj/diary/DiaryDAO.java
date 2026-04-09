package com.kira.pj.diary;

import com.kira.pj.friend.FriendDAO;
import com.kira.pj.friend.FriendDTO;
import com.kira.pj.main.DBManager;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Calendar;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

public class DiaryDAO {

    public static final DiaryDAO DDAO = new DiaryDAO();
    public Connection con = null;

    private DiaryDAO() {
    }

    public void getCalendar(HttpServletRequest req) {
        Calendar cal = Calendar.getInstance();

        String y = req.getParameter("y");
        String m = req.getParameter("m");
        String d = req.getParameter("d");
        String mode = req.getParameter("mode");

        int year = (y == null || y.equals("")) ? cal.get(Calendar.YEAR) : Integer.parseInt(y);
        int month = (m == null || m.equals("")) ? cal.get(Calendar.MONTH) : Integer.parseInt(m) - 1;

        cal.set(year, month, 1);
        int curYear = cal.get(Calendar.YEAR);
        int curMonth = cal.get(Calendar.MONTH);
        int startDay = cal.get(Calendar.DAY_OF_WEEK);
        int lastDay = cal.getActualMaximum(Calendar.DAY_OF_MONTH);

        // [중요] 달력 기본 데이터 세팅 (에러 나기 전에 미리 세팅!)
        req.setAttribute("startDay", startDay);
        req.setAttribute("lastDay", lastDay);
        req.setAttribute("curYear", curYear);
        req.setAttribute("curMonth", curMonth + 1);
        req.setAttribute("prevYear", (curMonth == 0) ? curYear - 1 : curYear);
        req.setAttribute("prevMonth", (curMonth == 0) ? 12 : curMonth);
        req.setAttribute("nextYear", (curMonth == 11) ? curYear + 1 : curYear);
        req.setAttribute("nextMonth", (curMonth == 11) ? 1 : curMonth + 2);

        String showMode = "calendar";
        if ("write".equals(mode)) { showMode = "write"; req.setAttribute("selectedDay", d); }
        else if (d != null && !d.equals("")) { showMode = "list"; req.setAttribute("selectedDay", d); }
        req.setAttribute("showMode", showMode);

        if ("list".equals(showMode)) {
            Connection con = null;
            PreparedStatement pstmt = null;
            ResultSet rs = null;
            ArrayList<DiaryDTO> posts = new ArrayList<>();

            try {
                con = DBManager.connect();
                HttpSession session = req.getSession();

                // 세션에서 내 정보 가져오기
                String myId = (String) session.getAttribute("loginUserId");
                String myPk = (String) session.getAttribute("loginUserPk");

                // 미니홈피 주인 정보 (없으면 나로 간주)
                String ownerId = (String) session.getAttribute("ownerUserId");
                String ownerPk = (String) session.getAttribute("ownerUserPk");
                if (ownerId == null) ownerId = (myId != null) ? myId : "";
                if (ownerPk == null) ownerPk = (myPk != null) ? myPk : "";

                // 관계 파악 (0:남남, 1:일촌, 2:본인)
                int relation = 0;
                if (myId != null && !myId.isEmpty() && ownerId != null && !ownerId.isEmpty()) {
                    if (myId.equals(ownerId)) { relation = 2; }
                    else if (myPk != null && ownerPk != null) {
                        FriendDAO fdao = new FriendDAO();
                        FriendDTO fdto = fdao.checkRelation(myPk, ownerPk);
                        if (fdto != null && fdto.getF_status() == 1) relation = 1;
                    }
                }

                String formattedMonth = String.format("%02d", curMonth + 1);
                String formattedDay = String.format("%02d", Integer.parseInt(d));
                String fullDate = curYear + "-" + formattedMonth + "-" + formattedDay;

                // SQL 쿼리 (공개범위 필터링)
                String sql = "SELECT * FROM diary_test WHERE TO_CHAR(d_date, 'YYYY-MM-DD') = ? AND d_id = ? ";
                if (relation == 2) sql += "AND d_visibility IN (0, 1, 2) ";
                else if (relation == 1) sql += "AND d_visibility IN (1, 2) ";
                else sql += "AND d_visibility = 2 ";
                sql += "ORDER BY d_no DESC";

                pstmt = con.prepareStatement(sql);
                pstmt.setString(1, fullDate);
                pstmt.setString(2, ownerId);
                rs = pstmt.executeQuery();

                while (rs.next()) {
                    DiaryDTO dto = new DiaryDTO();
                    dto.setNo(rs.getInt("d_no"));
                    dto.setId(rs.getString("d_id").trim());
                    dto.setTitle(rs.getString("d_title"));
                    dto.setTxt(rs.getString("d_txt"));
                    dto.setVisibility(rs.getInt("d_visibility"));

//                    System.out.println("여기 비저빌리티 있어요~!~!"+rs.getInt("d_visibility"));
                    posts.add(dto);
                }
            } catch (Exception e) { e.printStackTrace(); }
            finally { DBManager.close(con, pstmt, rs); }



            req.setAttribute("posts", posts);
        }
    }

    // 전체조회
    public void selectAllDiary(HttpServletRequest req) {
        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            con = DBManager.connect();

            // ★ 전체 조회에서도 내 글만 보이게 쿼리 수정!
            HttpSession session = req.getSession();
            String loginId = (String) session.getAttribute("loginUserId");

            // ★ 공개 설정이 2(전체 공개)이거나, 내가 쓴 글인 것 가져오기!
            String sql = "SELECT * FROM diary_test WHERE (d_visibility = 2 OR d_id = ?) ORDER BY d_date DESC";
            pstmt = con.prepareStatement(sql);

            if(loginId == null) loginId = "";
            pstmt.setString(1, loginId);

            rs = pstmt.executeQuery();
            ArrayList<DiaryDTO> diaries = new ArrayList<>();

            while (rs.next()) {
                DiaryDTO dto = new DiaryDTO();
                dto.setNo(rs.getInt("d_no"));
                dto.setId(rs.getString("d_id"));
                dto.setDate(rs.getDate("d_date"));
                dto.setTitle(rs.getString("d_title"));
                dto.setTxt(rs.getString("d_txt"));
                dto.setVisibility(rs.getInt("d_visibility"));

                diaries.add(dto);
            }
            req.setAttribute("diaries", diaries);

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(con, pstmt, rs);
        }
    }

    // 일기 등록 기능 (Create)
    public void insertDiary(HttpServletRequest req) {
        Connection con = null;
        PreparedStatement pstmt = null;

        try {
            con = DBManager.connect();
            String sql = "INSERT INTO diary_test VALUES (diary_test_seq.nextval, ?, TO_DATE(?, 'YYYY-MM-DD'), ?, ?, SYSDATE, ?)";
            pstmt = con.prepareStatement(sql);

            String year = req.getParameter("d_year");
            String month = req.getParameter("d_month");
            String date = req.getParameter("d_date");
            String title = req.getParameter("d_title");
            String txt = req.getParameter("d_txt");
            String visibility = req.getParameter("d_visibility");

            // ★ 임시 아이디 지우고, 세션에서 진짜 아이디 꺼내기!
            HttpSession session = req.getSession();
            String id = (String) session.getAttribute("loginUserId");

            // 로그인이 안 되어있으면 글 못 쓰게 막기
            if (id == null || id.isEmpty()) {
                System.out.println("로그인이 필요합니다!");
                return;
            }

            String formattedMonth = String.format("%02d", Integer.parseInt(month));
            String formattedDay = String.format("%02d", Integer.parseInt(date));
            String fullDate = year + "-" + formattedMonth + "-" + formattedDay;

            pstmt.setString(1, id); // 👈 진짜 내 아이디 등록!
            pstmt.setString(2, fullDate);
            pstmt.setString(3, title);
            pstmt.setString(4, txt);

            int visValue = (visibility == null || visibility.equals("")) ? 2 : Integer.parseInt(visibility);
            pstmt.setInt(5, visValue);

            if (pstmt.executeUpdate() == 1) {
                System.out.println("일기 등록 완벽 성공! (유저 연동 완료)");
            }

        } catch (Exception e) {
            System.out.println("일기 등록 실패 ㅠㅠ");
            e.printStackTrace();
        } finally {
            DBManager.close(con, pstmt, null);
        }
    }

    // 상세보기 기능
    public void getDiaryDetail(HttpServletRequest req) {
        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            con = DBManager.connect();

            String no = req.getParameter("no");
            String y = req.getParameter("y");
            String m = req.getParameter("m");
            String d = req.getParameter("d");

            String sql = "SELECT * FROM diary_test WHERE d_no = ?";
            pstmt = con.prepareStatement(sql);
            pstmt.setInt(1, Integer.parseInt(no));
            rs = pstmt.executeQuery();

            if (rs.next()) {
                DiaryDTO dto = new DiaryDTO();
                dto.setNo(rs.getInt("d_no"));
                dto.setId(rs.getString("d_id").trim());
                dto.setTitle(rs.getString("d_title"));
                dto.setTxt(rs.getString("d_txt"));
                dto.setDate(rs.getDate("d_date"));
                dto.setVisibility(rs.getInt("d_visibility"));

                req.setAttribute("diary", dto);
            }

            req.setAttribute("curYear", y);
            req.setAttribute("curMonth", m);
            req.setAttribute("selectedDay", d);

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(con, pstmt, rs);
        }
    }

    // 삭제 기능
    public void deleteDiary(HttpServletRequest request) {
        Connection con = null;
        PreparedStatement pstmt = null;

        try {
            con = DBManager.connect();
            String no = request.getParameter("no");
            String sql = "DELETE FROM diary_test WHERE d_no = ?";
            pstmt = con.prepareStatement(sql);
            pstmt.setInt(1, Integer.parseInt(no));

            if (pstmt.executeUpdate() == 1) {
                System.out.println("일기 삭제 완벽 성공!");
            }

        } catch (Exception e) {
            System.out.println("일기 삭제 실패 ㅠㅠ");
            e.printStackTrace();
        } finally {
            DBManager.close(con, pstmt, null);
        }
    }

    // 수정 기능
    public void updateDiary(HttpServletRequest request) {
        Connection con = null;
        PreparedStatement pstmt = null;

        try {
            con = DBManager.connect();

            String no = request.getParameter("no");
            String title = request.getParameter("d_title");
            String txt = request.getParameter("d_txt");
            String visibility = request.getParameter("d_visibility");

            String sql = "UPDATE diary_test SET d_title = ?, d_txt = ?, d_visibility = ? WHERE d_no = ?";
            pstmt = con.prepareStatement(sql);

            pstmt.setString(1, title);
            pstmt.setString(2, txt);

            int visValue = (visibility == null || visibility.equals("")) ? 2 : Integer.parseInt(visibility);
            pstmt.setInt(3, visValue);
            pstmt.setInt(4, Integer.parseInt(no));

            if (pstmt.executeUpdate() == 1) {
                System.out.println("일기 수정 완벽 성공!");
            }

        } catch (Exception e) {
            System.out.println("일기 수정 실패 ㅠㅠ");
            e.printStackTrace();
        } finally {
            DBManager.close(con, pstmt, null);
        }
    }

    // --- [댓글 기능 추가] ---

    // 1. 댓글 등록 (Create)
    public void insertReply(HttpServletRequest req) {
        Connection con = null;
        PreparedStatement pstmt = null;
        try {
            con = DBManager.connect();
            String sql = "INSERT INTO diary_reply VALUES (diary_reply_seq.nextval, ?, ?, ?, SYSDATE)";
            pstmt = con.prepareStatement(sql);

            // 어느 글에 다는 댓글인지(d_no), 누가 쓰는지(id), 내용(txt)
            String d_no = req.getParameter("d_no");
            String r_txt = req.getParameter("r_txt");

            HttpSession session = req.getSession();
            String r_id = (String) session.getAttribute("loginUserId");

            pstmt.setInt(1, Integer.parseInt(d_no));
            pstmt.setString(2, r_id);
            pstmt.setString(3, r_txt);

            pstmt.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(con, pstmt, null);
        }
    }

    // 2. 해당 일기의 댓글들 가져오기 (Read)
    public void getReplies(HttpServletRequest req) {
        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        try {
            con = DBManager.connect();
            String d_no = req.getParameter("no"); // 상세 보기 중인 일기 번호

            String sql = "SELECT * FROM diary_reply WHERE d_no = ? ORDER BY r_date ASC";
            pstmt = con.prepareStatement(sql);
            pstmt.setInt(1, Integer.parseInt(d_no));
            rs = pstmt.executeQuery();

            ArrayList<ReplyDTO> replies = new ArrayList<>();
            while (rs.next()) {
                replies.add(new ReplyDTO(
                        rs.getInt("r_no"),
                        rs.getInt("d_no"),
                        rs.getString("r_id"),
                        rs.getString("r_txt"),
                        rs.getDate("r_date")
                ));
            }
            req.setAttribute("replies", replies); // JSP에서 쓸 이름
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(con, pstmt, rs);
        }
    }

    // 댓글 삭제 기능
    public void deleteReply(HttpServletRequest req) {
        Connection con = null;
        PreparedStatement pstmt = null;
        try {
            con = DBManager.connect();
            String r_no = req.getParameter("r_no");

            String sql = "DELETE FROM diary_reply WHERE r_no = ?";
            pstmt = con.prepareStatement(sql);
            pstmt.setInt(1, Integer.parseInt(r_no));

            pstmt.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(con, pstmt, null);
        }
    }
}