package com.kira.pj.photo;

import com.kira.pj.main.DBManager;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.sql.Connection;
import java.sql.PreparedStatement;

public class CommentDAO {
    public static final CommentDAO CDAO = new CommentDAO();

    // 1. 댓글 등록
    public int insertComment(HttpServletRequest request) {
        Connection conn = null;
        PreparedStatement ps = null;

        String photoIdStr = request.getParameter("photoId");
        String content = request.getParameter("content");

        String sql = "INSERT INTO photo_comment (comment_id, photo_id, user_id, content, reg_date) " +
                "VALUES (photo_comment_seq.nextval, ?, ?, ?, sysdate)";

        try {
            conn = DBManager.connect();
            ps = conn.prepareStatement(sql);

            HttpSession session = request.getSession();
            String userId = session.getAttribute("loginUserId").toString();

            ps.setInt(1, Integer.parseInt(photoIdStr));
            ps.setString(2, userId);
            ps.setString(3, content);

            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(conn, ps, null);
        }
        return 0;
    }

    // 2. 댓글 삭제 (신규 추가!)
    public int deleteComment(HttpServletRequest request) {
        Connection conn = null;
        PreparedStatement ps = null;

        String commentIdStr = request.getParameter("commentId");
        String sql = "DELETE FROM photo_comment WHERE comment_id = ? AND user_id = ?";

        try {
            conn = DBManager.connect();
            ps = conn.prepareStatement(sql);

            HttpSession session = request.getSession();
            String userId = session.getAttribute("loginUserId").toString();

            ps.setInt(1, Integer.parseInt(commentIdStr));
            ps.setString(2, userId);
            System.out.println("delete comment success!");
            return ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(conn, ps, null);
        }
        return 0;
    }
}