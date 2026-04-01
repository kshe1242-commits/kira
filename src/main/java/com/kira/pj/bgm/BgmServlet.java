package com.kira.pj.bgm;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(name = "Main", value = "/main")
public class BgmServlet extends HttpServlet {

    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
//    request.setAttribute("content", "home-body.jsp");
    request.getRequestDispatcher("/index.jsp").forward(request,response);
    }

    public void destroy() {
    }
}