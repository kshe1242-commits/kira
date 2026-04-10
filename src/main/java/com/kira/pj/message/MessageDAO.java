package com.kira.pj.message;

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

    // [핵심] ID를 받아 PK를 찾아오는 보조 메서드
    private String getUserPkById(String userId) {
        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        try {
            con = DBManager.connect();
            String sql = "SELECT u_pk FROM userReg WHERE u_id = ?";
            pstmt = con.prepareStatement(sql);
            pstmt.setString(1, userId.trim());
            rs = pstmt.executeQuery();
            if (rs.next()) return rs.getString("u_pk");
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(con, pstmt, rs);
        }
        return null;
    }

    // =================================================================
    // 1. 쪽지 보내기 (일촌 검문소 탑재)
    // =================================================================
    public int sendMessage(String senderId, String receiverId, String content) {
        // 🚨 [수정됨] 일촌 확인은 반드시 'ID' 그대로 진행한다! (FriendDAO가 ID를 쓰기 때문)
        FriendDAO fDao = new FriendDAO();
        FriendDTO relation = fDao.checkRelation(senderId, receiverId);

        // 일촌이 아니면 즉각 차단
        if (relation == null || relation.getF_status() != 1) {
            return -1;
        }

        // 🚨 통과했다면, 쪽지를 저장하기 위해 DB(private_message)가 요구하는 PK를 조회한다.
        String senderPk = getUserPkById(senderId);
        String receiverPk = getUserPkById(receiverId);

        if (senderPk == null || receiverPk == null) return 0;

        Connection con = null;
        PreparedStatement pstmt = null;
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
    // 2. 받은 쪽지함 조회
    // =================================================================
    public List<Map<String, String>> getReceivedMessages(String myId) {
        String myPk = getUserPkById(myId);
        List<Map<String, String>> list = new ArrayList<>();
        if (myPk == null) return list;

        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

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
                // 프론트엔드가 ID로 작동하도록 target_id를 내려줌
                map.put("target_id", rs.getString("u_id"));
                map.put("target_nick", rs.getString("sender_nick"));
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
    // 3. 보낸 쪽지함 조회
    // =================================================================
    public List<Map<String, String>> getSentMessages(String myId) {
        String myPk = getUserPkById(myId);
        List<Map<String, String>> list = new ArrayList<>();
        if (myPk == null) return list;

        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

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
                // 프론트엔드가 ID로 작동하도록 target_id를 내려줌
                map.put("target_id", rs.getString("u_id"));
                map.put("target_nick", rs.getString("receiver_nick"));
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
    // 4. 쪽지 삭제
    // =================================================================
    public int deleteMessage(String msgPk, String myId, String type) {
        String myPk = getUserPkById(myId);
        if (myPk == null) return 0;

        Connection con = null;
        PreparedStatement pstmt = null;
        String sql = "";

        if ("received".equals(type)) {
            sql = "UPDATE private_message SET m_receiver_del = 1 WHERE m_pk = ? AND m_receiver_pk = ?";
        } else if ("sent".equals(type)) {
            sql = "UPDATE private_message SET m_sender_del = 1 WHERE m_pk = ? AND m_sender_pk = ?";
        } else {
            return 0;
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
    // 5. 안 읽은 쪽지 개수 가져오기
    // =================================================================
    public int getUnreadCount(String myId) {
        String myPk = getUserPkById(myId);
        if (myPk == null) return 0;

        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
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
    // 6. 쪽지 전체 읽음 처리
    // =================================================================
    public int markAsRead(String myId) {
        String myPk = getUserPkById(myId);
        if (myPk == null) return 0;

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