package com.kira.pj.main;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.Part;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Properties;
import java.util.UUID;

public class SupabaseModel {

    public static String uploadSupabase(HttpServletRequest req) throws ServletException, IOException {
        String fileUrl = null;
        try {
            InputStream is = req.getServletContext().getResourceAsStream("/WEB-INF/config.properties");
            Properties props = new Properties();
            props.load(is);

            String supabaseUrl = props.getProperty("supabase.url");
            String apiKey = props.getProperty("supabase.key");
            String bucket = props.getProperty("supabase.bucket");

            // 1️⃣ 클라이언트가 보낸 파일 가져오기
            Part filePart = req.getPart("file"); // input 태그 name과 동일
            String originalFileName = filePart.getSubmittedFileName();
            InputStream fileContent = filePart.getInputStream();

            // 2️⃣ 파일 확장자 안전하게 추출
            String ext = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                ext = originalFileName.substring(originalFileName.lastIndexOf("."));
            }

            // 3️⃣ UUID 기반 랜덤 파일명 + 확장자
            String fileName = UUID.randomUUID().toString().split("-")[0] + ext;
            // 4️⃣ Supabase Storage URL 및 인증
            URL url = new URL(supabaseUrl + "/storage/v1/object/" + bucket + "/" + fileName);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setDoOutput(true);
            conn.setRequestMethod("POST"); // PUT 필수
            conn.setRequestProperty("Authorization", "Bearer " + apiKey);
            conn.setRequestProperty("Content-Type", filePart.getContentType());

            // 5️⃣ 파일 내용을 OutputStream으로 전송
            try (OutputStream os = conn.getOutputStream()) {
                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = fileContent.read(buffer)) != -1) {
                    os.write(buffer, 0, bytesRead);
                }
                os.flush();
            }

            // 6️⃣ 요청 완료 후 응답 확인
            int responseCode = conn.getResponseCode();
            System.out.println("응답 코드: " + responseCode);

            if (responseCode == 200 || responseCode == 201) {
                fileUrl = supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + fileName;
                System.out.println("업로드 성공 URL: " + fileUrl);
            } else {
                System.out.println("업로드 실패");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return fileUrl;
    }


    public static boolean deleteSupabase(HttpServletRequest req) {
        try {
            // 설정 파일 읽기
            InputStream is = req.getServletContext().getResourceAsStream("/WEB-INF/config.properties");
            Properties props = new Properties();
            props.load(is);

            String supabaseUrl = props.getProperty("supabase.url");
            String apiKey = props.getProperty("supabase.key");
            String bucket = props.getProperty("supabase.bucket");

            // 1️⃣ 프론트에서 보낸 이미지 이름(또는 풀 URL) 가져오기
            String imgName = req.getParameter("imgName");

            if (imgName == null || imgName.trim().isEmpty()) {
                System.out.println("삭제할 파일 이름이 없습니다.");
                return false;
            }

            // 2️⃣ [핵심] imgName이 전체 URL(https://...)이라면 맨 뒤의 '파일명'만 추출!
            String fileName = imgName;
            String publicUrlPrefix = supabaseUrl + "/storage/v1/object/public/" + bucket + "/";

            // 만약 문자열이 URL로 시작하면, 앞부분을 싹둑 자르고 파일명만 남깁니다.
            if (imgName.startsWith(publicUrlPrefix)) {
                fileName = imgName.substring(publicUrlPrefix.length());
            }

            // 3️⃣ Supabase 삭제 전용 API URL 만들기 (주의: 중간에 public/ 이 없습니다!)
            String deleteApiUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + fileName;

            // 4️⃣ 연결 설정 및 DELETE 요청 보내기
            URL url = new URL(deleteApiUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("DELETE");
            conn.setRequestProperty("Authorization", "Bearer " + apiKey);
            conn.setRequestProperty("apikey", apiKey);

            // 5️⃣ 응답 확인 (200 이면 성공)
            int responseCode = conn.getResponseCode();
            System.out.println("Supabase 삭제 응답 코드: " + responseCode);

            if (responseCode == 200) {
                System.out.println("✅ 클라우드 파일 삭제 성공: " + fileName);
                return true;
            } else {
                System.out.println("❌ 클라우드 파일 삭제 실패");
                return false;
            }

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


}
