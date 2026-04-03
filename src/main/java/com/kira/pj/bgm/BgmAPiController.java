package com.kira.pj.bgm;

import com.google.gson.Gson;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet(name = "BgmAPiController", value = "/api/bgm")
public class BgmAPiController extends HttpServlet {


    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException, ServletException {

        String userId = request.getParameter("userId");
        if (userId == null || userId.isEmpty()) userId = "dongmin";

        List<BgmTrackVO> tracks = new BgmDAO().getTracksByUser(userId);

        response.setContentType("application/json; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        new Gson().toJson(tracks, response.getWriter());
    }

    public void destroy() {
    }
}