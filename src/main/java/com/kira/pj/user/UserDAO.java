package com.kira.pj.user;

import com.aventrix.jnanoid.jnanoid.NanoIdUtils;
import com.kira.pj.main.DBManager;

import javax.mail.Authenticator;
import javax.mail.Message;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Properties;
import java.util.Random;
//토스 import
import java.net.URI;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.OutputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.servlet.http.HttpSession;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;

public class UserDAO {
    public static final UserDAO DAO = new UserDAO();

    private UserDAO() {
    }

    /* =========================
       JSON 문자열 만들기
    ========================= */

    private String esc(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String json(boolean success, String message) {
        return "{\"success\":" + success + ",\"message\":\"" + esc(message) + "\"}";
    }

    private String json(boolean success, String message, String redirectUrl) {
        return "{\"success\":" + success + ",\"message\":\"" + esc(message) +
                "\",\"redirectUrl\":\"" + esc(redirectUrl) + "\"}";
    }

    private String jsonFindId(boolean success, String message, String foundId) {
        return "{\"success\":" + success + ",\"message\":\"" + esc(message) +
                "\",\"foundId\":\"" + esc(foundId) + "\"}";
    }

    private String jsonNext(boolean success, String message, boolean next) {
        return "{\"success\":" + success + ",\"message\":\"" + esc(message) +
                "\",\"next\":" + next + "}";
    }

    /* =========================
       회원가입
    ========================= */

    public String join(HttpServletRequest request) {
        Connection conn = null;
        PreparedStatement pstmt = null;

        try {
            String name = request.getParameter("name");
            String birth = request.getParameter("birth");
            String id = request.getParameter("id");
            String pw = request.getParameter("pw");
            String pwChk = request.getParameter("pwChk");
            String nickname = request.getParameter("nickname");
            String email = request.getParameter("email");

            String idChecked = request.getParameter("idChecked");
            String checkedId = request.getParameter("checkedId");
            String nicknameChecked = request.getParameter("nicknameChecked");
            String checkedNickname = request.getParameter("checkedNickname");
            String emailVerified = request.getParameter("emailVerified");
            String verifiedEmail = request.getParameter("verifiedEmail");

            if (name == null || name.trim().isEmpty()) {
                return json(false, "이름을 입력해주세요.");
            }
            if (birth == null || birth.trim().isEmpty()) {
                return json(false, "생년월일을 입력해주세요.");
            }
            if (id == null || id.trim().isEmpty()) {
                return json(false, "아이디를 입력해주세요.");
            }
            if (pw == null || pw.trim().isEmpty()) {
                return json(false, "비밀번호를 입력해주세요.");
            }
            if (pwChk == null || pwChk.trim().isEmpty()) {
                return json(false, "비밀번호 확인을 입력해주세요.");
            }
            if (nickname == null || nickname.trim().isEmpty()) {
                return json(false, "닉네임을 입력해주세요.");
            }
            if (email == null || email.trim().isEmpty()) {
                return json(false, "이메일을 입력해주세요.");
            }

            if (!pw.equals(pwChk)) {
                return json(false, "비밀번호와 비밀번호 확인이 다릅니다.");
            }

            if (!"Y".equals(idChecked) || checkedId == null || !checkedId.equals(id)) {
                return json(false, "아이디 중복확인을 먼저 완료해주세요.");
            }

            if (!"Y".equals(nicknameChecked) || checkedNickname == null || !checkedNickname.equals(nickname)) {
                return json(false, "닉네임 중복확인을 먼저 완료해주세요.");
            }

            if (!"Y".equals(emailVerified) || verifiedEmail == null || !verifiedEmail.equals(email)) {
                return json(false, "이메일 인증을 먼저 완료해주세요.");
            }

            if (isIdExists(id)) {
                return json(false, "이미 사용중인 아이디 입니다.");
            }

            if (isNicknameExists(nickname)) {
                return json(false, "이미 사용중인 닉네임 입니다.");
            }

            if (isEmailExists(email)) {
                return json(false, "이미 사용중인 이메일 입니다.");
            }

            String pk = NanoIdUtils.randomNanoId(
                    NanoIdUtils.DEFAULT_NUMBER_GENERATOR,
                    NanoIdUtils.DEFAULT_ALPHABET,
                    15
            );

            conn = DBManager.connect();

            String sql = "insert into userReg " +
                    "(u_pk, u_name, u_birth, u_id, u_pw, u_nickname, u_email, u_join_date) " +
                    "values (?, ?, ?, ?, ?, ?, ?, sysdate)";

            String mainSql = "insert into main_test values(?,'일상공유공간','환영합니다','사진','빈공간',sysdate)";

            pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, pk);
            pstmt.setString(2, name);
            pstmt.setDate(3, Date.valueOf(birth));
            pstmt.setString(4, id);
            pstmt.setString(5, pw);
            pstmt.setString(6, nickname);
            pstmt.setString(7, email);

            if (pstmt.executeUpdate() == 1) {
                HttpSession session = request.getSession();
                session.removeAttribute("joinEmailAuthCode");
                session.removeAttribute("joinEmailAuthTarget");


                pstmt = conn.prepareStatement(mainSql);
                pstmt.setString(1,id);
                if (pstmt.executeUpdate() == 1) {
                    System.out.println("main 부여 완료");
                }

                return json(true, "회원가입 성공", "/login");



            }

            return json(false, "회원가입 실패");

        } catch (Exception e) {
            e.printStackTrace();
            return json(false, "회원가입 실패");
        } finally {
            DBManager.close(conn, pstmt, null);
        }
    }

    public String checkId(HttpServletRequest request) {
        try {
            String id = request.getParameter("id");

            if (id == null || id.trim().isEmpty()) {
                return json(false, "아이디를 입력해주세요.");
            }

            if (isIdExists(id)) {
                return json(false, "이미 사용중인 아이디 입니다.");
            }

            return json(true, "사용 가능한 아이디 입니다.");

        } catch (Exception e) {
            e.printStackTrace();
            return json(false, "아이디 중복확인 실패");
        }
    }

    public String checkNickname(HttpServletRequest request) {
        try {
            String nickname = request.getParameter("nickname");

            if (nickname == null || nickname.trim().isEmpty()) {
                return json(false, "닉네임을 입력해주세요.");
            }
            // 닉변
            nickname = nickname.trim();

            HttpSession session = request.getSession();
            String currentNickname = (String) session.getAttribute("loginUserNickname");

            if (currentNickname != null && currentNickname.equals(nickname)) {
                return json(false, "현재 사용 중인 닉네임입니다.");
            }
            // 여기까지
            if (isNicknameExists(nickname)) {
                return json(false, "이미 사용중인 닉네임 입니다.");
            }

            return json(true, "사용 가능한 닉네임 입니다.");

        } catch (Exception e) {
            e.printStackTrace();
            return json(false, "닉네임 중복확인 실패");
        }
    }

    public String sendJoinEmailAuth(HttpServletRequest request) {
        try {
            String email = request.getParameter("email");

            if (email == null || email.trim().isEmpty()) {
                return json(false, "이메일을 입력해주세요.");
            }

            email = email.trim();

            if (!(email.endsWith("@gmail.com") || email.endsWith("@naver.com"))) {
                return json(false, "구글 메일과 네이버 메일만 사용할 수 있습니다.");
            }

            if (isEmailExists(email)) {
                return json(false, "이미 사용중인 이메일 입니다.");
            }

            String code = String.valueOf(100000 + new Random().nextInt(900000));

            HttpSession session = request.getSession();
            session.setAttribute("joinEmailAuthCode", code);
            session.setAttribute("joinEmailAuthTarget", email);

            sendMail(email, code);

            return json(true, "인증번호를 이메일로 전송했습니다.");

        } catch (Exception e) {
            e.printStackTrace();
            return json(false, "이메일 전송 실패");
        }
    }

    public String checkJoinEmailAuth(HttpServletRequest request) {
        try {
            String email = request.getParameter("email");
            String emailCode = request.getParameter("emailCode");

            HttpSession session = request.getSession();
            String sessionCode = (String) session.getAttribute("joinEmailAuthCode");
            String sessionEmail = (String) session.getAttribute("joinEmailAuthTarget");

            if (sessionCode != null && sessionEmail != null
                    && sessionCode.equals(emailCode)
                    && sessionEmail.equals(email)) {
                return json(true, "이메일 인증이 완료되었습니다.");
            }

            return json(false, "인증번호가 일치하지 않습니다.");

        } catch (Exception e) {
            e.printStackTrace();
            return json(false, "이메일 인증 확인 실패");
        }
    }

    /* =========================
       로그인
    ========================= */

    public String login(HttpServletRequest request) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            String id = request.getParameter("id");
            String pw = request.getParameter("pw");

            if (id == null || id.trim().isEmpty()) {
                return json(false, "아이디를 입력해주세요.");
            }

            if (pw == null || pw.trim().isEmpty()) {
                return json(false, "비밀번호를 입력해주세요.");
            }

            conn = DBManager.connect();

            String sql = "select * from userReg where u_id = ? and u_pw = ?";
            pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, id);
            pstmt.setString(2, pw);

            rs = pstmt.executeQuery();

            if (rs.next()) {
                HttpSession session = request.getSession();

                // 30분 동안 요청 없으면 세션 만료
                session.setMaxInactiveInterval(30 * 60);

                session.setAttribute("loginUserPk", rs.getString("u_pk"));
                session.setAttribute("loginUserName", rs.getString("u_name"));
                session.setAttribute("loginUserId", rs.getString("u_id"));
                session.setAttribute("loginUserNickname", rs.getString("u_nickname"));
                session.setAttribute("loginUserEmail", rs.getString("u_email"));
                session.setAttribute("loginUserNickTicket", rs.getInt("u_nick_ticket"));
                // =============================tk 수정 : 로그인 시 프사를 보여주기 위한 이미지url 세션으로 가져오기
                PreparedStatement pstmtProfile = null;
                ResultSet rsProfile = null;
                try {
                    // user_profile 테이블에서 해당 유저의 프사 URL 조회
                    String profileSql = "SELECT profile_img_url FROM profile WHERE userid = ?";
                    pstmtProfile = conn.prepareStatement(profileSql);
                    pstmtProfile.setString(1, rs.getString("u_id")); // 방금 로그인 성공한 아이디 사용
                    rsProfile = pstmtProfile.executeQuery();

                    if (rsProfile.next()) {
                        // DB에 프사가 있으면 세션에 저장
                        session.setAttribute("loginUserProfileImg", rsProfile.getString("profile_img_url"));
                    } else {
                        // 없으면 null (index.jsp에서 이모지로 처리됨)
                        session.setAttribute("loginUserProfileImg", null);
                    }

                } catch (Exception e) {
                    System.out.println("프로필 사진 로드 중 오류 발생");
                    e.printStackTrace();
                } finally {
                    // 서브 쿼리용 자원 반납
                    if (rsProfile != null) try { rsProfile.close(); } catch(Exception e) {}
                    if (pstmtProfile != null) try { pstmtProfile.close(); } catch(Exception e) {}
                }
                // =========================================================
                // ============================= 🌟 홈피 타이틀 세션에 올리기 추가
                PreparedStatement pshompy = null;
                ResultSet rshompy = null;
                try {
                    String hompySql = "SELECT hompy_title, st_message FROM main_test WHERE host_id = ?";
                    pshompy = conn.prepareStatement(hompySql);
                    pshompy.setString(1, rs.getString("u_id")); // 방금 로그인 성공한 아이디 사용
                    rshompy = pshompy.executeQuery();

                    if (rshompy.next()) {
                        // DB에 설정한 홈피 제목이 있으면 세션에 저장 (이름을 loginUserHompyTitle로 지정하셨네요!)
                        session.setAttribute("loginUserHompyTitle", rshompy.getString("hompy_title"));
                        session.setAttribute("loginUserStMessage", rshompy.getString("st_message"));
                    } else {
                        // 없으면 null 처리
                        session.setAttribute("loginUserHompyTitle", null);
                        session.setAttribute("loginUserStMessage", null);
                    }
                } catch (Exception e) {
                    System.out.println("홈피 타이틀 로드 중 오류 발생");
                    e.printStackTrace();
                } finally {
                    // 🌟 자원 반납 필수!
                    if (rshompy != null) try { rshompy.close(); } catch(Exception e) {}
                    if (pshompy != null) try { pshompy.close(); } catch(Exception e) {}
                }
                // =========================================================



                return json(true, "로그인 성공", "/main");
            }

            return json(false, "아이디 또는 비밀번호가 올바르지 않습니다.");

        } catch (Exception e) {
            e.printStackTrace();
            return json(false, "로그인 실패");
        } finally {
            DBManager.close(conn, pstmt, rs);
        }
    }

    public void logout(HttpServletRequest request) {
        request.getSession().invalidate();
    }

    /* =========================
       아이디 찾기
    ========================= */

    public String sendFindIdEmailAuth(HttpServletRequest request) {
        try {
            String email = request.getParameter("email");

            if (email == null || email.trim().isEmpty()) {
                return json(false, "이메일을 입력해주세요.");
            }

            email = email.trim();

            if (!(email.endsWith("@gmail.com") || email.endsWith("@naver.com"))) {
                return json(false, "구글 메일과 네이버 메일만 사용할 수 있습니다.");
            }

            String code = String.valueOf(100000 + new Random().nextInt(900000));

            HttpSession session = request.getSession();
            session.setAttribute("findIdEmailAuthCode", code);
            session.setAttribute("findIdEmailAuthTarget", email);

            sendMail(email, code);

            return json(true, "인증번호를 이메일로 전송했습니다.");

        } catch (Exception e) {
            e.printStackTrace();
            return json(false, "이메일 전송 실패");
        }
    }

    public String checkFindIdEmailAuth(HttpServletRequest request) {
        try {
            String email = request.getParameter("email");
            String emailCode = request.getParameter("emailCode");

            HttpSession session = request.getSession();
            String sessionCode = (String) session.getAttribute("findIdEmailAuthCode");
            String sessionEmail = (String) session.getAttribute("findIdEmailAuthTarget");

            if (sessionCode != null && sessionEmail != null
                    && sessionCode.equals(emailCode)
                    && sessionEmail.equals(email)) {
                return json(true, "이메일 인증이 완료되었습니다.");
            }

            return json(false, "인증번호가 일치하지 않습니다.");

        } catch (Exception e) {
            e.printStackTrace();
            return json(false, "이메일 인증 확인 실패");
        }
    }

    public String findId(HttpServletRequest request) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            String name = request.getParameter("name");
            String email = request.getParameter("email");
            String emailVerified = request.getParameter("emailVerified");
            String verifiedEmail = request.getParameter("verifiedEmail");

            if (name == null || name.trim().isEmpty()) {
                return jsonFindId(false, "이름을 입력해주세요.", "");
            }

            if (email == null || email.trim().isEmpty()) {
                return jsonFindId(false, "이메일을 입력해주세요.", "");
            }

            if (!"Y".equals(emailVerified) || verifiedEmail == null || !verifiedEmail.equals(email)) {
                return jsonFindId(false, "이메일 인증을 먼저 완료해주세요.", "");
            }

            conn = DBManager.connect();

            String sql = "select u_id from userReg where u_name = ? and u_email = ?";
            pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, name);
            pstmt.setString(2, email);

            rs = pstmt.executeQuery();

            if (rs.next()) {
                return jsonFindId(true, "아이디를 찾았습니다.", rs.getString("u_id"));
            }

            return jsonFindId(false, "일치하는 회원정보가 없습니다.", "");

        } catch (Exception e) {
            e.printStackTrace();
            return jsonFindId(false, "아이디 찾기 실패", "");
        } finally {
            DBManager.close(conn, pstmt, rs);
        }
    }

    /* =========================
       비밀번호 찾기
    ========================= */

    public String sendFindPwEmailAuth(HttpServletRequest request) {
        try {
            String email = request.getParameter("email");

            if (email == null || email.trim().isEmpty()) {
                return json(false, "이메일을 입력해주세요.");
            }

            email = email.trim();

            if (!(email.endsWith("@gmail.com") || email.endsWith("@naver.com"))) {
                return json(false, "구글 메일과 네이버 메일만 사용할 수 있습니다.");
            }

            String code = String.valueOf(100000 + new Random().nextInt(900000));

            HttpSession session = request.getSession();
            session.setAttribute("findPwEmailAuthCode", code);
            session.setAttribute("findPwEmailAuthTarget", email);

            sendMail(email, code);

            return json(true, "인증번호를 이메일로 전송했습니다.");

        } catch (Exception e) {
            e.printStackTrace();
            return json(false, "이메일 전송 실패");
        }
    }

    public String checkFindPwEmailAuth(HttpServletRequest request) {
        try {
            String email = request.getParameter("email");
            String emailCode = request.getParameter("emailCode");

            HttpSession session = request.getSession();
            String sessionCode = (String) session.getAttribute("findPwEmailAuthCode");
            String sessionEmail = (String) session.getAttribute("findPwEmailAuthTarget");

            if (sessionCode != null && sessionEmail != null
                    && sessionCode.equals(emailCode)
                    && sessionEmail.equals(email)) {
                return json(true, "이메일 인증이 완료되었습니다.");
            }

            return json(false, "인증번호가 일치하지 않습니다.");

        } catch (Exception e) {
            e.printStackTrace();
            return json(false, "이메일 인증 확인 실패");
        }
    }

    public String goResetPwPage(HttpServletRequest request) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            String id = request.getParameter("id");
            String name = request.getParameter("name");
            String email = request.getParameter("email");
            String emailVerified = request.getParameter("emailVerified");
            String verifiedEmail = request.getParameter("verifiedEmail");

            if (id == null || id.trim().isEmpty()) {
                return jsonNext(false, "아이디를 입력해주세요.", false);
            }

            if (name == null || name.trim().isEmpty()) {
                return jsonNext(false, "이름을 입력해주세요.", false);
            }

            if (email == null || email.trim().isEmpty()) {
                return jsonNext(false, "이메일을 입력해주세요.", false);
            }

            if (!"Y".equals(emailVerified) || verifiedEmail == null || !verifiedEmail.equals(email)) {
                return jsonNext(false, "이메일 인증을 먼저 완료해주세요.", false);
            }

            conn = DBManager.connect();

            String sql = "select * from userReg where u_id = ? and u_name = ? and u_email = ?";
            pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, id);
            pstmt.setString(2, name);
            pstmt.setString(3, email);

            rs = pstmt.executeQuery();

            if (rs.next()) {
                return jsonNext(true, "본인 확인 완료", true);
            }

            return jsonNext(false, "일치하는 회원정보가 없습니다.", false);

        } catch (Exception e) {
            e.printStackTrace();
            return jsonNext(false, "비밀번호 찾기 실패", false);
        } finally {
            DBManager.close(conn, pstmt, rs);
        }
    }

    public String resetPassword(HttpServletRequest request) {
        Connection conn = null;
        PreparedStatement pstmt = null;

        try {
            String id = request.getParameter("id");
            String name = request.getParameter("name");
            String email = request.getParameter("email");
            String newPw = request.getParameter("newPw");
            String newPwChk = request.getParameter("newPwChk");

            if (newPw == null || newPw.trim().isEmpty()) {
                return json(false, "새 비밀번호를 입력해주세요.");
            }

            if (newPwChk == null || newPwChk.trim().isEmpty()) {
                return json(false, "새 비밀번호 확인을 입력해주세요.");
            }

            if (!newPw.equals(newPwChk)) {
                return json(false, "새 비밀번호와 비밀번호 확인이 다릅니다.");
            }

            conn = DBManager.connect();

            String sql = "update userReg set u_pw = ? where u_id = ? and u_name = ? and u_email = ?";
            pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, newPw);
            pstmt.setString(2, id);
            pstmt.setString(3, name);
            pstmt.setString(4, email);

            if (pstmt.executeUpdate() == 1) {
                HttpSession session = request.getSession();
                session.removeAttribute("findPwEmailAuthCode");
                session.removeAttribute("findPwEmailAuthTarget");
                return json(true, "비밀번호 변경 성공", "/login");
            }

            return json(false, "비밀번호 변경 실패");

        } catch (Exception e) {
            e.printStackTrace();
            return json(false, "비밀번호 변경 실패");
        } finally {
            DBManager.close(conn, pstmt, null);
        }
    }

    /* =========================
       공통 DB 조회
    ========================= */

    public boolean isIdExists(String id) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            conn = DBManager.connect();
            String sql = "select * from userReg where u_id = ?";
            pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, id);
            rs = pstmt.executeQuery();
            return rs.next();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        } finally {
            DBManager.close(conn, pstmt, rs);
        }
    }

    public boolean isNicknameExists(String nickname) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            conn = DBManager.connect();
            String sql = "select * from userReg where u_nickname = ?";
            pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, nickname);
            rs = pstmt.executeQuery();
            return rs.next();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        } finally {
            DBManager.close(conn, pstmt, rs);
        }
    }

    public boolean isEmailExists(String email) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            conn = DBManager.connect();
            String sql = "select * from userReg where u_email = ?";
            pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, email);
            rs = pstmt.executeQuery();
            return rs.next();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        } finally {
            DBManager.close(conn, pstmt, rs);
        }
    }

    /* =========================
       메일 발송
    ========================= */

    private void sendMail(String toEmail, String code) throws Exception {
        String host = "smtp.gmail.com";
        String from = "aagfd13@gmail.com";
        String password = "ohxb afjf anea zauh";

        Properties props = new Properties();
        props.put("mail.smtp.host", host);
        props.put("mail.smtp.port", "587");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");

        Session mailSession = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(from, password);
            }
        });

        Message message = new MimeMessage(mailSession);
        message.setFrom(new InternetAddress(from));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail));
        message.setSubject("인증번호 안내");
        message.setText("인증번호는 [" + code + "] 입니다.");

        Transport.send(message);
    }
    /* 마이페이지 비밀번호 변경 */
    public boolean changePw(String pk, String oldPw, String newPw) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            conn = DBManager.connect();

            // 1. 기존 비밀번호 확인
            String checkSql = "select u_pw from userReg where u_pk = ?";
            pstmt = conn.prepareStatement(checkSql);
            pstmt.setString(1, pk);
            rs = pstmt.executeQuery();

            if (rs.next()) {
                String dbPw = rs.getString("u_pw");

                // 기존 비밀번호 틀림
                if (!dbPw.equals(oldPw)) {
                    return false;
                }
            } else {
                return false;
            }

            DBManager.close(conn, pstmt, rs);

            // 2. 새 비밀번호 변경
            conn = DBManager.connect();
            String updateSql = "update userReg set u_pw = ? where u_pk = ?";
            pstmt = conn.prepareStatement(updateSql);
            pstmt.setString(1, newPw);
            pstmt.setString(2, pk);

            return pstmt.executeUpdate() == 1;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        } finally {
            DBManager.close(conn, pstmt, rs);
        }
    }
    /* 마이페이지 회원탈퇴 */
    public boolean deleteUser(String pk, String pw) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            conn = DBManager.connect();

            // 1. 비밀번호 확인
            String checkSql = "select u_pw from userReg where u_pk = ?";
            pstmt = conn.prepareStatement(checkSql);
            pstmt.setString(1, pk);
            rs = pstmt.executeQuery();

            if (rs.next()) {
                String dbPw = rs.getString("u_pw");

                // 비밀번호 틀림
                if (!dbPw.equals(pw)) {
                    return false;
                }
            } else {
                return false;
            }

            DBManager.close(conn, pstmt, rs);

            // 2. 회원 삭제
            conn = DBManager.connect();
            String deleteSql = "delete from userReg where u_pk = ?";
            pstmt = conn.prepareStatement(deleteSql);
            pstmt.setString(1, pk);

            return pstmt.executeUpdate() == 1;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        } finally {
            DBManager.close(conn, pstmt, rs);
        }
    }

    // UserDAO.java에 추가
    public String getPkById(String uId) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        String uPk = null;

        try {
            conn = DBManager.connect();
            // userReg 테이블에서 id로 pk를 찾는 쿼리
            String sql = "SELECT u_pk FROM userReg WHERE u_id = ?";
            pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, uId);
            rs = pstmt.executeQuery();

            if (rs.next()) {
                uPk = rs.getString("u_pk");
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(conn, pstmt, rs);
        }
        return uPk; // 못 찾으면 null 반환
    }

    // 닉네임 변경
    public boolean buyNickTicket(String pk) {
        Connection conn = null;
        PreparedStatement pstmt = null;

        try {
            conn = DBManager.connect();

            String sql = "update userReg set u_nick_ticket = u_nick_ticket + 1 where u_pk = ?";
            pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, pk);

            return pstmt.executeUpdate() == 1;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        } finally {
            DBManager.close(conn, pstmt, null);
        }
    }

    public String changeNickname(HttpServletRequest request) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            HttpSession session = request.getSession();
            String pk = (String) session.getAttribute("loginUserPk");
            String currentNickname = (String) session.getAttribute("loginUserNickname");

            String newNickname = request.getParameter("newNickname");
            String nickChecked = request.getParameter("nickChecked");
            String checkedNickname = request.getParameter("checkedNickname");

            if (pk == null) {
                return json(false, "로그인이 필요합니다.");
            }

            if (newNickname == null || newNickname.trim().isEmpty()) {
                return json(false, "새 닉네임을 입력해주세요.");
            }

            newNickname = newNickname.trim();

            if (newNickname.length() < 2 || newNickname.length() > 20) {
                return json(false, "닉네임은 2자 이상 20자 이하로 입력해주세요.");
            }

            if (currentNickname != null && currentNickname.equals(newNickname)) {
                return json(false, "현재 닉네임과 동일합니다.");
            }

            if (!"Y".equals(nickChecked) || checkedNickname == null || !checkedNickname.equals(newNickname)) {
                return json(false, "닉네임 중복확인을 먼저 완료해주세요.");
            }

            conn = DBManager.connect();

            // 1. 변경권 확인
            String ticketSql = "select u_nick_ticket from userReg where u_pk = ?";
            pstmt = conn.prepareStatement(ticketSql);
            pstmt.setString(1, pk);
            rs = pstmt.executeQuery();

            if (!rs.next()) {
                return json(false, "회원 정보를 찾을 수 없습니다.");
            }

            int ticket = rs.getInt("u_nick_ticket");
            DBManager.close(null, pstmt, rs);

            if (ticket <= 0) {
                return json(false, "닉네임 변경권이 없습니다.");
            }

            // 2. 닉네임 중복 재확인
            String checkSql = "select 1 from userReg where u_nickname = ?";
            pstmt = conn.prepareStatement(checkSql);
            pstmt.setString(1, newNickname);
            rs = pstmt.executeQuery();

            if (rs.next()) {
                return json(false, "이미 사용중인 닉네임 입니다.");
            }

            DBManager.close(null, pstmt, rs);

            // 3. 닉네임 변경 + 티켓 차감
            String updateSql = "update userReg " +
                    "set u_nickname = ?, u_nick_ticket = u_nick_ticket - 1 " +
                    "where u_pk = ? and u_nick_ticket > 0";

            pstmt = conn.prepareStatement(updateSql);
            pstmt.setString(1, newNickname);
            pstmt.setString(2, pk);

            if (pstmt.executeUpdate() == 1) {
                session.setAttribute("loginUserNickname", newNickname);
                session.setAttribute("loginUserNickTicket", ticket - 1);
                return json(true, "닉네임이 변경되었습니다.");
            }

            return json(false, "닉네임 변경 실패");

        } catch (Exception e) {
            e.printStackTrace();
            return json(false, "닉네임 변경 실패");
        } finally {
            DBManager.close(conn, pstmt, rs);
        }
    }

    public int getNickTicket(String pk) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            conn = DBManager.connect();
            String sql = "select u_nick_ticket from userReg where u_pk = ?";
            pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, pk);
            rs = pstmt.executeQuery();

            if (rs.next()) {
                return rs.getInt("u_nick_ticket");
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(conn, pstmt, rs);
        }

        return 0;
    }


    public String createNickTicketOrder(String userPk, int amount, int ticketCnt) {
        Connection conn = null;
        PreparedStatement pstmt = null;

        try {
            conn = DBManager.connect();

            String orderId = "NICK_" + System.currentTimeMillis();

            String sql = "insert into nick_ticket_order " +
                    "(nto_order_id, nto_user_pk, nto_amount, nto_ticket_cnt, nto_status, nto_created_at) " +
                    "values (?, ?, ?, ?, 'READY', sysdate)";

            pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, orderId);
            pstmt.setString(2, userPk);
            pstmt.setInt(3, amount);
            pstmt.setInt(4, ticketCnt);

            if (pstmt.executeUpdate() == 1) {
                return orderId;
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            DBManager.close(conn, pstmt, null);
        }

        return null;
    }

    // 토스


    public boolean confirmNickTicketPayment(HttpServletRequest request, String paymentKey, String orderId, String amount) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        HttpURLConnection tossConn = null;
        BufferedReader br = null;

        try {
            if (paymentKey == null || paymentKey.trim().isEmpty()) return false;
            if (orderId == null || orderId.trim().isEmpty()) return false;
            if (amount == null || amount.trim().isEmpty()) return false;

            int reqAmount = Integer.parseInt(amount);

            conn = DBManager.connect();
            conn.setAutoCommit(false);

            // 1. 주문 조회
            String selectSql = "select nto_user_pk, nto_amount, nto_ticket_cnt, nto_status " +
                    "from nick_ticket_order where nto_order_id = ?";
            pstmt = conn.prepareStatement(selectSql);
            pstmt.setString(1, orderId);
            rs = pstmt.executeQuery();

            if (!rs.next()) {
                conn.rollback();
                return false;
            }

            String userPk = rs.getString("nto_user_pk");
            int dbAmount = rs.getInt("nto_amount");
            int ticketCnt = rs.getInt("nto_ticket_cnt");
            String status = rs.getString("nto_status");

            // 이미 처리된 주문이면 중복 지급 방지
            if (!"READY".equals(status)) {
                conn.rollback();
                return false;
            }

            // 금액 검증
            if (dbAmount != reqAmount) {
                conn.rollback();
                return false;
            }

            DBManager.close(null, pstmt, rs);
            pstmt = null;
            rs = null;

            // 2. 토스 승인 API 호출
            String secretKey = "test_sk_0RnYX2w532z14akl9jeM3NeyqApQ"; // test_sk_...
            String auth = Base64.getEncoder()
                    .encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));

            String jsonBody = "{"
                    + "\"paymentKey\":\"" + esc(paymentKey) + "\","
                    + "\"orderId\":\"" + esc(orderId) + "\","
                    + "\"amount\":" + reqAmount
                    + "}";

            URL url = new URL("https://api.tosspayments.com/v1/payments/confirm");
            tossConn = (HttpURLConnection) url.openConnection();
            tossConn.setRequestMethod("POST");
            tossConn.setRequestProperty("Authorization", "Basic " + auth);
            tossConn.setRequestProperty("Content-Type", "application/json");
            tossConn.setRequestProperty("Idempotency-Key", java.util.UUID.randomUUID().toString());
            tossConn.setDoOutput(true);

            OutputStream os = tossConn.getOutputStream();
            os.write(jsonBody.getBytes(StandardCharsets.UTF_8));
            os.flush();
            os.close();

            int responseCode = tossConn.getResponseCode();

            if (responseCode != 200) {
                br = new BufferedReader(new InputStreamReader(tossConn.getErrorStream(), StandardCharsets.UTF_8));
                String line;
                StringBuilder errorBody = new StringBuilder();
                while ((line = br.readLine()) != null) {
                    errorBody.append(line);
                }
                System.out.println("토스 승인 실패: " + errorBody.toString());

                conn.rollback();
                return false;
            }

            br = new BufferedReader(new InputStreamReader(tossConn.getInputStream(), StandardCharsets.UTF_8));
            String line;
            StringBuilder resultBody = new StringBuilder();
            while ((line = br.readLine()) != null) {
                resultBody.append(line);
            }

            String body = resultBody.toString();
            System.out.println("토스 승인 성공 응답: " + body);

            // 최소 검증
            if (!body.contains("\"orderId\":\"" + orderId + "\"")) {
                conn.rollback();
                return false;
            }

            if (!body.contains("\"status\":\"DONE\"")) {
                conn.rollback();
                return false;
            }

            // 3. 주문 완료 처리
            String updateOrderSql = "update nick_ticket_order " +
                    "set nto_status = 'DONE', nto_payment_key = ?, nto_approved_at = sysdate " +
                    "where nto_order_id = ? and nto_status = 'READY'";
            pstmt = conn.prepareStatement(updateOrderSql);
            pstmt.setString(1, paymentKey);
            pstmt.setString(2, orderId);

            int orderUpdated = pstmt.executeUpdate();

            DBManager.close(null, pstmt, null);
            pstmt = null;

            if (orderUpdated != 1) {
                conn.rollback();
                return false;
            }

            // 4. 유저 티켓 지급
            String updateUserSql = "update userReg " +
                    "set u_nick_ticket = u_nick_ticket + ? " +
                    "where u_pk = ?";
            pstmt = conn.prepareStatement(updateUserSql);
            pstmt.setInt(1, ticketCnt);
            pstmt.setString(2, userPk);

            int userUpdated = pstmt.executeUpdate();

            if (userUpdated != 1) {
                conn.rollback();
                return false;
            }

            conn.commit();

            // 5. 세션 갱신
            HttpSession session = request.getSession();
            session.setAttribute("loginUserNickTicket", getNickTicket(userPk));

            return true;

        } catch (Exception e) {
            e.printStackTrace();
            try {
                if (conn != null) conn.rollback();
            } catch (Exception ignored) {
            }
            return false;
        } finally {
            try {
                if (conn != null) conn.setAutoCommit(true);
            } catch (Exception ignored) {
            }

            try {
                if (br != null) br.close();
            } catch (Exception ignored) {
            }

            if (tossConn != null) {
                tossConn.disconnect();
            }

            DBManager.close(conn, pstmt, rs);
        }
    }
}