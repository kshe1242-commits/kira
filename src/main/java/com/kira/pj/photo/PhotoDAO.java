package com.kira.pj.photo;

import com.kira.pj.main.DBManager;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class PhotoDAO {
    public static final PhotoDAO PDAO = new PhotoDAO();

    public ArrayList<String> getJson(HttpServletRequest request) {

        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        String sql = "select * from photo where user_id = ? order by reg_date desc ";
        String hostId = request.getParameter("host_id");
//        if (hostId == null || hostId.isEmpty()) {
//            HttpSession session = request.getSession();
//            hostId = session.getAttribute("loginUserId").toString();
//        }

        try {
            conn = DBManager.connect();
            System.out.println("conn success!!");
            ps = conn.prepareStatement(sql);
            ps.setString(1, hostId);
            rs = ps.executeQuery();
            ArrayList<String> photos = new ArrayList<>();
            PhotoDTO photo = new PhotoDTO();
            while (rs.next()) {
                photo.setUserId(rs.getString(2));
                photo.setImgName(rs.getString(3));
                photo.setTitle(rs.getString(4));
                photo.setContent(rs.getString(5));
                photo.setRegDate(rs.getString(6));
                photos.add(photo.toJSON());

            }
//            System.out.println(photos);
            System.out.println(hostId);
            System.out.println("is that you..?");
            return photos;
        } catch (Exception e) {
            e.printStackTrace();

        } finally {
            DBManager.close(conn, ps, rs);
        }
        return null;
    }

    public int updatePhoto(HttpServletRequest request) {
        String title = request.getParameter("title");
        String content = request.getParameter("content");
        String imgName = request.getParameter("imgName");

        Connection conn = null;
        PreparedStatement ps = null;
        String sql = "insert into photo values(photo_seq.nextval, ? , ? , ? , ? ,sysdate)";
        try {
            conn = DBManager.connect();
            ps = conn.prepareStatement(sql);
            HttpSession session = request.getSession();
            ps.setString(1, session.getAttribute("loginUserId").toString());
            ps.setString(2, imgName);
            ps.setString(3, title);
            ps.setString(4, content);
            return ps.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();

        } finally {
            DBManager.close(conn, ps, null);
        }
        return 0;
    }

    public int deletePhoto(HttpServletRequest request) {
        String imgName = request.getParameter("imgName");

        Connection conn = null;
        PreparedStatement ps = null;
        String sql = "delete from photo where img_name = ? and user_id = ?";
        try {
            conn = DBManager.connect();
            ps = conn.prepareStatement(sql);
            ps.setString(1, imgName);
            HttpSession session = request.getSession();
            ps.setString(2, session.getAttribute("loginUserId").toString());
            return ps.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();

        } finally {
            DBManager.close(conn, ps, null);
        }
        return 0;

    }


    public int updateProfile(HttpServletRequest request) {
        String imgUrl = request.getParameter("imgUrl");
        System.out.println("받은 이미지 URL: " + imgUrl);

        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = DBManager.connect();
            HttpSession session = request.getSession();
            String userId = session.getAttribute("loginUserId").toString();

            // 1. 먼저 UPDATE를 시도합니다. (기존 프사가 있는 유저)
            String updateSql = "UPDATE profile SET profile_img_url = ? WHERE userid = ?";
            ps = conn.prepareStatement(updateSql);
            ps.setString(1, imgUrl);
            ps.setString(2, userId);

            int result = ps.executeUpdate();
            System.out.println("profile update");

            // 2. 만약 result가 0이라면? (기존 프사가 없어서 UPDATE된 항목이 없음 = 처음 프사 올리는 유저)
            if (result == 0) {
                ps.close(); // 쓰던 PreparedStatement 닫아주고

                // 기존에 쓰시던 쿼리로 새로 INSERT 해줍니다.
                String insertSql = "insert into profile values(? , ?)";
                ps = conn.prepareStatement(insertSql);
                ps.setString(1, userId);
                ps.setString(2, imgUrl);

                result = ps.executeUpdate();
                System.out.println("profile add");
            }

            // 3. DB 저장이 성공(1)했다면 세션도 갱신해줍니다.
            if (result > 0) {
                session.setAttribute("loginUserProfileImg", imgUrl);
            }

            return result;

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(conn, ps, null);
        }

        return 0;
    }

    public List<PhotoDTO> getPhotoList(HttpServletRequest request) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        // photo_id(PK)를 반드시 SELECT 해야 합니다.
        String sql = "SELECT photo_id, user_id, img_name, title, content, reg_date FROM photo WHERE user_id = ? ORDER BY reg_date DESC";
        String hostId = request.getParameter("host_id");

        List<PhotoDTO> photos = new ArrayList<>();

        try {
            conn = DBManager.connect();
            ps = conn.prepareStatement(sql);
            ps.setString(1, hostId);
            rs = ps.executeQuery();

            while (rs.next()) {
                PhotoDTO photo = new PhotoDTO();
                photo.setPhotoId(rs.getInt("photo_id")); // 컬럼명으로 가져오는 것이 안전합니다
                photo.setUserId(rs.getString("user_id"));
                photo.setImgName(rs.getString("img_name"));
                photo.setTitle(rs.getString("title"));
                photo.setContent(rs.getString("content"));
                photo.setRegDate(rs.getString("reg_date"));

                // 핵심: 현재 사진의 ID(photoId)를 이용해 해당 사진의 댓글들을 가져와서 DTO에 담습니다.
                List<CommentDTO> commentList = getCommentsByPhotoId(conn, photo.getPhotoId());
                photo.setComments(commentList);

                photos.add(photo);
            }
            return photos;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(conn, ps, rs);
        }
        return photos;
    }

    // 특정 사진의 댓글만 가져오는 내부 메서드 추가
    // 특정 사진의 댓글만 가져오는 내부 메서드
    // 특정 사진의 댓글만 가져오는 내부 메서드
    private List<CommentDTO> getCommentsByPhotoId(Connection conn, int photoId) {
        PreparedStatement ps = null;
        ResultSet rs = null;

        // ✨ 핵심: profile(p) 테이블을 LEFT JOIN 하여 프로필 사진(profile_img_url)을 가져옵니다!
        // c.user_id 와 p.userid 가 같은 사람의 데이터를 엮어줍니다.
        String sql = "SELECT c.comment_id, c.photo_id, c.user_id, ur.u_name AS user_name, c.content, TO_CHAR(c.reg_date, 'YYYY-MM-DD HH24:MI') AS reg_date, p.profile_img_url " +
                "FROM photo_comment c " +
                "JOIN userreg ur ON c.user_id = ur.u_id " +
                "LEFT JOIN profile p ON c.user_id = p.userid " + // 프로필 사진이 없는 사람도 에러 없이 댓글이 나오도록 LEFT JOIN 사용
                "WHERE c.photo_id = ? ORDER BY c.reg_date DESC";

        List<CommentDTO> comments = new ArrayList<>();

        try {
            ps = conn.prepareStatement(sql);
            ps.setInt(1, photoId);
            rs = ps.executeQuery();

            while(rs.next()) {
                CommentDTO comment = new CommentDTO();
                comment.setCommentId(rs.getInt("comment_id"));
                comment.setPhotoId(rs.getInt("photo_id"));
                comment.setUserId(rs.getString("user_id"));

                // 조인해서 가져온 실명(u_name) 세팅
                comment.setUserName(rs.getString("user_name"));

                comment.setContent(rs.getString("content"));
                comment.setRegDate(rs.getString("reg_date"));

                // ✨ DB에서 가져온 프로필 사진 URL 세팅 (프사가 없는 유저는 null이 들어갑니다)
                comment.setProfileImgUrl(rs.getString("profile_img_url"));

                comments.add(comment);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (rs != null) try { rs.close(); } catch(Exception e){}
            if (ps != null) try { ps.close(); } catch(Exception e){}
        }
        return comments;
    }
}

