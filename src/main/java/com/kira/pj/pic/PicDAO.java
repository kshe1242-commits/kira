package com.kira.pj.pic;

import com.kira.pj.main.DBManager;

import javax.servlet.http.HttpServletRequest;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

public class PicDAO {
    public static final PicDAO PDAO = new PicDAO();
    public Connection con = null;

    private PicDAO() {
        try {
            con = DBManager.connect();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

    }


    public ArrayList<PicDTO> getAllPic(HttpServletRequest request) {
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        String sql = "select * from pictures where p_userId=?";
        try {
            pstmt = con.prepareStatement(sql);
            pstmt.setString(1, "zle33");
//            pstmt.setString(1, (request.getParameter("userId")));
            rs = pstmt.executeQuery();
            ArrayList<PicDTO> list = new ArrayList<>();
            while (rs.next()) {
                PicDTO pdto = new PicDTO();
                pdto.setNo(rs.getInt("p_no"));
                pdto.setFileName(rs.getString("p_fileName"));
                pdto.setUserId(rs.getString("p_userId"));
                pdto.setText(rs.getString("p_text"));
                list.add(pdto);
            }
            return list;
        } catch (SQLException e) {
            e.printStackTrace();
        }


        return null;
    }
}
