package com.kira.pj.friend;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.kira.pj.main.DBManager;

public class FriendDAO {

    // =================================================================
    // 1. 관계 확인
    // =================================================================
    public FriendDTO checkRelation(String user1, String user2) {
        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        FriendDTO dto = null;

        String sql = "SELECT f_id, f_requester, f_receiver, f_status, TO_CHAR(f_date, 'YYYY.MM.DD') as f_date_fmt "
                + "FROM friend_relation "
                + "WHERE (f_requester = ? AND f_receiver = ?) OR (f_requester = ? AND f_receiver = ?)";

        try {
            con = DBManager.connect();
            pstmt = con.prepareStatement(sql);
            pstmt.setString(1, user1);
            pstmt.setString(2, user2);
            pstmt.setString(3, user2);
            pstmt.setString(4, user1);
            rs = pstmt.executeQuery();

            if (rs.next()) {
                dto = new FriendDTO();
                dto.setF_id(rs.getInt("f_id"));
                dto.setF_requester(rs.getString("f_requester"));
                dto.setF_receiver(rs.getString("f_receiver"));
                dto.setF_status(rs.getInt("f_status"));
                dto.setF_date(rs.getString("f_date_fmt"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(con, pstmt, rs);
        }
        return dto;
    }

    // =================================================================
    // 2. 일촌 신청
    // =================================================================
    public int requestFriend(String requester, String receiver) {
        Connection con = null;
        PreparedStatement pstmt = null;
        String sql = "INSERT INTO friend_relation (f_id, f_requester, f_receiver, f_status, f_date) "
                + "VALUES (friend_seq.NEXTVAL, ?, ?, 0, SYSDATE)";

        try {
            con = DBManager.connect();
            pstmt = con.prepareStatement(sql);
            pstmt.setString(1, requester);
            pstmt.setString(2, receiver);
            return pstmt.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        } finally {
            DBManager.close(con, pstmt, null);
        }
    }

    // =================================================================
    // 3. 일촌 수락
    // =================================================================
    public int acceptFriend(String requester, String receiver) {
        Connection con = null;
        PreparedStatement pstmt = null;
        String sql = "UPDATE friend_relation SET f_status = 1, f_date = SYSDATE "
                + "WHERE f_requester = ? AND f_receiver = ?";

        try {
            con = DBManager.connect();
            pstmt = con.prepareStatement(sql);
            pstmt.setString(1, requester);
            pstmt.setString(2, receiver);
            return pstmt.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        } finally {
            DBManager.close(con, pstmt, null);
        }
    }

    // =================================================================
    // 4. 일촌 거절 / 삭제 / 취소
    // =================================================================
    public int deleteFriend(String user1, String user2) {
        Connection con = null;
        PreparedStatement pstmt = null;
        String sql = "DELETE FROM friend_relation "
                + "WHERE (f_requester = ? AND f_receiver = ?) OR (f_requester = ? AND f_receiver = ?)";

        try {
            con = DBManager.connect();
            pstmt = con.prepareStatement(sql);
            pstmt.setString(1, user1);
            pstmt.setString(2, user2);
            pstmt.setString(3, user2);
            pstmt.setString(4, user1);
            return pstmt.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        } finally {
            DBManager.close(con, pstmt, null);
        }
    }

    // =================================================================
    // 5. 나에게 일촌 신청을 보낸 사람들의 목록 조회
    // =================================================================
    public List<Map<String, String>> getPendingRequests(String myId) { // myPk -> myId로 수정
        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        List<Map<String, String>> list = new ArrayList<>();

        String sql = "SELECT f.f_requester, u.u_nickname " +
                "FROM friend_relation f " +
                "JOIN userReg u ON f.f_requester = u.u_id " +
                "WHERE f.f_receiver = ? AND f.f_status = 0";

        try {
            con = DBManager.connect();
            pstmt = con.prepareStatement(sql);
            pstmt.setString(1, myId);
            rs = pstmt.executeQuery();

            while (rs.next()) {
                Map<String, String> map = new HashMap<>();
                map.put("requesterPk", rs.getString("f_requester")); // 프론트 호환을 위해 키값은 유지
                map.put("nickname", rs.getString("u_nickname"));
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
    // 6. 내 일촌 목록 불러오기
    // =================================================================
    public List<Map<String, String>> getFriendList(String myId) { // myPk -> myId로 수정
        Connection con = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        List<Map<String, String>> list = new ArrayList<>();

        String sql = "SELECT "
                + "  CASE WHEN f.f_requester = ? THEN f.f_receiver ELSE f.f_requester END as friend_pk, "
                + "  u.u_nickname, u.u_id, TO_CHAR(f.f_date, 'YYYY.MM.DD') as f_date "
                + "FROM friend_relation f "
                + "JOIN userReg u ON u.u_id = (CASE WHEN f.f_requester = ? THEN f.f_receiver ELSE f.f_requester END) "
                + "WHERE (f.f_requester = ? OR f.f_receiver = ?) AND f.f_status = 1";

        try {
            con = DBManager.connect();
            pstmt = con.prepareStatement(sql);
            pstmt.setString(1, myId);
            pstmt.setString(2, myId);
            pstmt.setString(3, myId);
            pstmt.setString(4, myId);
            rs = pstmt.executeQuery();

            while (rs.next()) {
                Map<String, String> map = new HashMap<>();
                map.put("friend_pk", rs.getString("friend_pk")); // 프론트 호환용
                map.put("u_id", rs.getString("u_id"));
                map.put("u_nickname", rs.getString("u_nickname"));
                map.put("f_date", rs.getString("f_date"));
                list.add(map);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(con, pstmt, rs);
        }
        return list;
    }
}