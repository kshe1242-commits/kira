package com.kira.pj.photo;

import com.kira.pj.main.DBManager;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.sql.Connection;
import java.sql.PreparedStatement;

public class CommentDAO {
    // 싱글톤 패턴
    public static final CommentDAO CDAO = new CommentDAO();

    public int insertComment(HttpServletRequest request) {
        Connection conn = null;
        PreparedStatement ps = null;

        // 프론트엔드에서 보낸 파라미터 받기 (JS의 params.append와 이름이 같아야 함)
        String photoIdStr = request.getParameter("photoId");
        String content = request.getParameter("content");

        // Oracle DB 쿼리문 (시퀀스 사용)
        String sql = "INSERT INTO photo_comment (comment_id, photo_id, user_id, content, reg_date) " +
                "VALUES (photo_comment_seq.nextval, ?, ?, ?, sysdate)";

        try {
            conn = DBManager.connect();
            ps = conn.prepareStatement(sql);

            // 보안을 위해 작성자(user_id)는 세션에서 가져옴
            HttpSession session = request.getSession();
            String userId = session.getAttribute("loginUserId").toString();

            // 바인딩
            ps.setInt(1, Integer.parseInt(photoIdStr));
            ps.setString(2, userId);
            ps.setString(3, content);

            // 쿼리 실행 및 결과 반환 (성공 시 1 반환)
            System.out.println("comment insert success!");
            return ps.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(conn, ps, null);
        }

        return 0; // 실패 시 0 반환
    }
}