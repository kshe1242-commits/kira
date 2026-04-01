package com.kira.pj.pic;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet(name = "PicC", value = "/pic")
public class PicC extends HttpServlet {

    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        request.setAttribute("pictures" ,PicDAO.PDAO.getAllPic(request) );
        request.setAttribute("content", "pic/pic.jsp");
        request.getRequestDispatcher("index.jsp").forward(request,response);



    }

    public void destroy() {
    }
}