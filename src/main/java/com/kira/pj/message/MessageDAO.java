package com.kira.pj.message; // 패키지명은 네 프로젝트에 맞게 수정해라

import com.aventrix.jnanoid.jnanoid.NanoIdUtils;
import com.kira.pj.friend.FriendDAO;
import com.kira.pj.friend.FriendDTO;
import com.kira.pj.main.DBManager;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MessageDAO {

    // =================================================================
    // 1. 쪽지 보내기 (일촌 검문소 탑재)
    // =================================================================
    public int sendMessage(String senderPk, String receiverPk, String content) {
        // [비판적 검증] 서버 단에서 무조건 일촌 여부를 2차로 확인한다.
        FriendDAO fDao = new FriendDAO();
        FriendDTO relation = fDao.checkRelation(senderPk, receiverPk);

        // 남남이거나(null), 상태가 1(일촌)이 아니라면 철벽 방어!
        if (relation == null || relation.getF_status() != 1) {
            return -1; // -1을 반환하면 컨트롤러에서 "일촌만 보낼 수 있습니다"라고 처리하면 됨.
        }

        Connection con = null;
        PreparedStatement pstmt = null;
        // m_pk는 NanoID로 고유하게 생성
        String sql = "INSERT INTO private_message (m_pk, m_sender_pk, m_receiver_pk, m_content) VALUES (?, ?, ?, ?)";

        try {
            con = DBManager.connect();
            pstmt = con.prepareStatement(sql);
            pstmt.setString(1, NanoIdUtils.randomNanoId(NanoIdUtils.DEFAULT_NUMBER_GENERATOR, NanoIdUtils.DEFAULT_ALPHABET, 15));
            pstmt.setString(2, senderPk);
            pstmt.setString(3, receiverPk);
            pstmt.setString(4, content);
            return pstmt.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        } finally {
            DBManager.close(con, pstmt, null);
        }
    }

    // =================================================================
    // 2. 받은 쪽지함 조회 (내가 수신자이고, 삭제하지 않은 것)
    // =================================================================
    public List<Map<String, String>> getReceivedMessages(String myPk) {
        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        List<Map<String, String>> list = new ArrayList<>();

        // 발신자의 닉네임을 알기 위해 userReg와 JOIN
        // [수정 1] SELECT 문에 u.u_id 추가!
        String sql = "SELECT m.m_pk, m.m_sender_pk, u.u_nickname as sender_nick, u.u_id, m.m_content, TO_CHAR(m.m_date, 'YY.MM.DD HH24:MI') as m_date_fmt, m.m_read_status "
                + "FROM private_message m "
                + "JOIN userReg u ON m.m_sender_pk = u.u_pk "
                + "WHERE m.m_receiver_pk = ? AND m.m_receiver_del = 0 "
                + "ORDER BY m.m_date DESC";

        try {
            con = DBManager.connect();
            pstmt = con.prepareStatement(sql);
            pstmt.setString(1, myPk);
            rs = pstmt.executeQuery();

            while (rs.next()) {
                Map<String, String> map = new HashMap<>();
                map.put("m_pk", rs.getString("m_pk"));
                map.put("target_pk", rs.getString("m_sender_pk"));
                map.put("target_nick", rs.getString("sender_nick"));

                // 🚨 [수정 완료] 프론트엔드에서 날짜를 띄울 수 있도록 m_date 추가!
                map.put("m_date", rs.getString("m_date_fmt"));

                map.put("m_content", rs.getString("m_content"));
                list.add(map);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(con, pstmt, rs);
        }
        return list;
    }

    // =================================================================
    // 3. 보낸 쪽지함 조회 (내가 발신자이고, 삭제하지 않은 것)
    // =================================================================
    public List<Map<String, String>> getSentMessages(String myPk) {
        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        List<Map<String, String>> list = new ArrayList<>();

        // 수신자의 닉네임을 알기 위해 userReg와 JOIN
        String sql = "SELECT m.m_pk, m.m_receiver_pk, u.u_nickname as receiver_nick, u.u_id, m.m_content, TO_CHAR(m.m_date, 'YY.MM.DD HH24:MI') as m_date_fmt, m.m_read_status "
                + "FROM private_message m "
                + "JOIN userReg u ON m.m_receiver_pk = u.u_pk "
                + "WHERE m.m_sender_pk = ? AND m.m_sender_del = 0 "
                + "ORDER BY m.m_date DESC";

        try {
            con = DBManager.connect();
            pstmt = con.prepareStatement(sql);
            pstmt.setString(1, myPk);
            rs = pstmt.executeQuery();

            while (rs.next()) {
                Map<String, String> map = new HashMap<>();
                map.put("m_pk", rs.getString("m_pk"));
                map.put("target_pk", rs.getString("m_receiver_pk"));
                map.put("target_nick", rs.getString("receiver_nick"));

                // 🚨 [수정 완료] 프론트엔드에서 날짜를 띄울 수 있도록 m_date 추가!
                map.put("m_date", rs.getString("m_date_fmt"));

                map.put("m_content", rs.getString("m_content"));
                list.add(map);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(con, pstmt, rs);
        }
        return list;
    }

    // =================================================================
    // 4. 쪽지 삭제 (양방향 분기 처리)
    // =================================================================
    public int deleteMessage(String msgPk, String myPk, String type) {
        Connection con = null;
        PreparedStatement pstmt = null;
        String sql = "";

        // type이 received면 받은 쪽지함에서 지운 것, sent면 보낸 쪽지함에서 지운 것
        if ("received".equals(type)) {
            sql = "UPDATE private_message SET m_receiver_del = 1 WHERE m_pk = ? AND m_receiver_pk = ?";
        } else if ("sent".equals(type)) {
            sql = "UPDATE private_message SET m_sender_del = 1 WHERE m_pk = ? AND m_sender_pk = ?";
        } else {
            return 0; // 잘못된 요청
        }

        try {
            con = DBManager.connect();
            pstmt = con.prepareStatement(sql);
            pstmt.setString(1, msgPk);
            pstmt.setString(2, myPk);
            return pstmt.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        } finally {
            DBManager.close(con, pstmt, null);
        }
    }

    // =================================================================
    // 5. 안 읽은 쪽지 개수 가져오기 (알림 뱃지용)
    // =================================================================
    public int getUnreadCount(String myPk) {
        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        // 내 쪽지 중 안 지웠고(0) 안 읽은(0) 쪽지 개수
        String sql = "SELECT COUNT(*) FROM private_message WHERE m_receiver_pk = ? AND m_read_status = 0 AND m_receiver_del = 0";
        try {
            con = DBManager.connect();
            pstmt = con.prepareStatement(sql);
            pstmt.setString(1, myPk);
            rs = pstmt.executeQuery();
            if (rs.next()) return rs.getInt(1);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(con, pstmt, rs);
        }
        return 0;
    }

    // =================================================================
    // 6. 쪽지 전체 읽음 처리 (받은 쪽지함을 열었을 때 실행)
    // =================================================================
    public int markAsRead(String myPk) {
        Connection con = null;
        PreparedStatement pstmt = null;
        String sql = "UPDATE private_message SET m_read_status = 1 WHERE m_receiver_pk = ? AND m_read_status = 0";
        try {
            con = DBManager.connect();
            pstmt = con.prepareStatement(sql);
            pstmt.setString(1, myPk);
            return pstmt.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        } finally {
            DBManager.close(con, pstmt, null);
        }
    }
}