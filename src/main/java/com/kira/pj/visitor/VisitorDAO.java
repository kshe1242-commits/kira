package com.kira.pj.visitor;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.kira.pj.main.DBManager;

public class VisitorDAO {

    // 1. 발도장 찍기 (최신 시간 갱신을 위해 DELETE 후 INSERT 수행)
    public int upsertVisitor(VisitorDTO dto) {
        Connection con = null;
        PreparedStatement pstmtDel = null;
        PreparedStatement pstmtIns = null;

        try {
            con = DBManager.connect();
            // 두 개의 작업(삭제, 삽입)을 하나의 세트로 묶기 위해 자동 커밋을 끈다.
            // 보통 명령 하나 완료시 즉시 커밋을 하지만 지금은 기존 기록 삭제/새 기록 삽입 두가지 행동이 하나의 세트여서
            // 트랜잭션 제어를 한다
            con.setAutoCommit(false);

            // Step A: 오늘 날짜로 남긴 발도장이 있다면 무조건 삭제한다.
            String sqlDel = "DELETE FROM visitor_log WHERE v_writer_pk = ? AND v_owner_pk = ? AND TRUNC(v_date) = TRUNC(SYSDATE)";
            pstmtDel = con.prepareStatement(sqlDel);
            pstmtDel.setString(1, dto.getV_writer_pk());
            pstmtDel.setString(2, dto.getV_owner_pk());
            pstmtDel.executeUpdate();

            // Step B: 기존 것이 지워졌든 안 지워졌든, 지금 시간(SYSDATE)으로 무조건 새로 등록한다.
            String sqlIns = "INSERT INTO visitor_log (v_id, v_writer_pk, v_owner_pk, v_emoji, v_date) VALUES (visitor_seq.NEXTVAL, ?, ?, ?, SYSDATE)";
            // 복잡하게 수정을 안쓰고 삭제 후 삽입을 하는 이유는 기존 데이터가 존재하는지 조회한 다음 분기처리를 하는거보다
            // 조건부 삭제 후 무조건 삽입을 하는 것이 시간 갱신 측멱에서 코드가 훨씬 간결해지기 때문
            // 하지만 로그가 더 중요한 상황에서는 지금 사용불가능
            pstmtIns = con.prepareStatement(sqlIns);
            pstmtIns.setString(1, dto.getV_writer_pk());
            pstmtIns.setString(2, dto.getV_owner_pk());
            pstmtIns.setInt(3, dto.getV_emoji());

            int result = pstmtIns.executeUpdate();

            // 삭제와 삽입이 모두 에러 없이 끝났다면 완벽하게 저장(Commit)한다.
            con.commit();
            return result;

        } catch (Exception e) {
            // 중간에 에러가 나면 데이터를 롤백(취소)하여 DB를 보호한다.
            try {
                if (con != null) con.rollback();
            } catch (Exception ex) {
            }
            e.printStackTrace();
            throw new RuntimeException("방명록 갱신 오류: " + e.getMessage(), e);
        } finally {
            DBManager.close(con, pstmtIns, null);
            DBManager.close(null, pstmtDel, null);
        }
    }

    // 2. 전체 방문자 목록 조회
    public List<VisitorDTO> getAllVisitors(String ownerPk) {
        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        List<VisitorDTO> list = new ArrayList<>();

        String sql =
                "SELECT v_id, v_writer_pk, v_owner_pk, v_emoji, " +
                        "TO_CHAR(v_date, 'MM.DD AM HH12:MI') as v_date_fmt " +
                        //내림차순으로 정렬해서 가져옴 DESC
                        "FROM visitor_log WHERE v_owner_pk = ? ORDER BY v_date DESC";

        try {
            con = DBManager.connect();
            pstmt = con.prepareStatement(sql);
            pstmt.setString(1, ownerPk);
            rs = pstmt.executeQuery();


            while (rs.next()) {
                VisitorDTO v = new VisitorDTO();
                v.setV_id(rs.getInt("v_id"));
                v.setV_writer_pk(rs.getString("v_writer_pk"));
                v.setV_emoji(rs.getInt("v_emoji"));
                v.setV_date(rs.getString("v_date_fmt"));
                list.add(v);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(con, pstmt, rs);
        }
        return list;
    }

    // 3. 최근 방문자 5명 조회 (메인 위젯용) - JOIN 적용
    public List<VisitorDTO> getRecentVisitors(String ownerPk) {
        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        List<VisitorDTO> list = new ArrayList<>();

        // [핵심] userReg 테이블과 JOIN하여 u_nickname을 가져온다.
        String sql =
                // join을 사용해서 발생할 수 있는 버그는 양쪽 db값이 다 있어야하는데 탈퇴한 회원이 생기면
                // 표시는 안되는데 4개만 나오는 유령회원이 될 수 있어서 LEFT OUTER JOIN문을 써서 해결할 수 있지만
                // 닉네임이 null로 넘어오니 따로 탈퇴한 회원으로 분기처리가 필요함
                "SELECT * FROM (" +
                        "  SELECT v.v_id, v.v_writer_pk, u.u_nickname AS v_writer_nickname, v.v_emoji, TO_CHAR(v.v_date, 'MM.DD') as v_date_fmt " +
                        "  FROM visitor_log v " +
                        "  JOIN userReg u ON v.v_writer_pk = u.u_id " +
                        "  WHERE v.v_owner_pk = ? ORDER BY v.v_date DESC" +
                        ") WHERE rownum <= 5";
        try {
            con = DBManager.connect();
            pstmt = con.prepareStatement(sql);
            pstmt.setString(1, ownerPk);
            rs = pstmt.executeQuery();

            while (rs.next()) {
                VisitorDTO v = new VisitorDTO();
                v.setV_writer_pk(rs.getString("v_writer_pk"));
                v.setV_writer_nickname(rs.getString("v_writer_nickname")); // 닉네임 세팅
                v.setV_date(rs.getString("v_date_fmt"));
                v.setV_emoji(rs.getInt("v_emoji"));
                list.add(v);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(con, pstmt, rs);
        }
        return list;
    }

    // 4. 삭제 및 페이징 코드는 파라미터만 ownerPk로 맞춰서 사용하면 된다.
    // ... 기존 삭제/페이징 코드에서 컬럼명을 v_writer_pk, v_owner_pk 로 교체하여 사용
    public int deleteVisitor(int vId) {
        Connection con = null;
        PreparedStatement pstmt = null;
        String sql = "DELETE FROM visitor_log WHERE v_id = ?";

        try {
            con = DBManager.connect();
            pstmt = con.prepareStatement(sql);
            pstmt.setInt(1, vId);
            return pstmt.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        } finally {
            DBManager.close(con, pstmt, null);
        }
    }

    // 5. 페이징 방문자 조회 - JOIN 적용
    public List<VisitorDTO> getVisitorsByPage(String ownerPk, int page) {
        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        List<VisitorDTO> list = new ArrayList<>();
        //
        int start = (page - 1) * 7 + 1;
        int end = page * 7;

        // [핵심] userReg 테이블과 JOIN하여 u_nickname을 가져온다.
        String sql =
                "SELECT * FROM (" +
                        "  SELECT rownum as rn, t.* FROM (" +
                        "    SELECT v.v_id, v.v_writer_pk, u.u_nickname AS v_writer_nickname, v.v_emoji, TO_CHAR(v.v_date, 'MM.DD AM HH12:MI') as v_date_fmt " +
                        "    FROM visitor_log v " +
                        "    JOIN userReg u ON v.v_writer_pk = u.u_id " +
                        "    WHERE v.v_owner_pk = ? ORDER BY v.v_date DESC" +
                        "  ) t" +
                        ") WHERE rn BETWEEN ? AND ?";

        try {
            con = DBManager.connect();
            pstmt = con.prepareStatement(sql);
            pstmt.setString(1, ownerPk);
            pstmt.setInt(2, start);
            pstmt.setInt(3, end);
            rs = pstmt.executeQuery();

            while (rs.next()) {
                VisitorDTO v = new VisitorDTO();
                v.setV_id(rs.getInt("v_id"));
                v.setV_writer_pk(rs.getString("v_writer_pk"));
                v.setV_writer_nickname(rs.getString("v_writer_nickname")); // 닉네임 세팅
                v.setV_date(rs.getString("v_date_fmt"));
                v.setV_emoji(rs.getInt("v_emoji"));
                list.add(v);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(con, pstmt, rs);
        }
        return list;
    }

    // 6. 방문자 수 통계 (Today / Total)
    public Map<String, Integer> getHitCount(String ownerPk) {
        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        Map<String, Integer> map = new HashMap<>();

        // 기본값 세팅
        map.put("today", 0);
        map.put("total", 0);

        try {
            con = DBManager.connect();

            // 1. 토탈(Total) 조회: 해당 홈피의 전체 방문 기록 수
            String sqlTotal = "SELECT COUNT(*) FROM visitor_log WHERE v_owner_pk = ?";
            pstmt = con.prepareStatement(sqlTotal);
            pstmt.setString(1, ownerPk);
            rs = pstmt.executeQuery();
            if (rs.next()) map.put("total", rs.getInt(1));
            rs.close();
            pstmt.close();

            // 2. 투데이(Today) 조회: 해당 홈피의 '오늘' 방문 기록 수
            String sqlToday = "SELECT COUNT(*) FROM visitor_log WHERE v_owner_pk = ? AND TRUNC(v_date) = TRUNC(SYSDATE)";
            pstmt = con.prepareStatement(sqlToday);
            pstmt.setString(1, ownerPk);
            rs = pstmt.executeQuery();
            if (rs.next()) map.put("today", rs.getInt(1));

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(con, pstmt, rs);
        }
        return map;
    }


}