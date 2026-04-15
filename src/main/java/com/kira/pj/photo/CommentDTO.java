package com.kira.pj.photo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.servlet.annotation.MultipartConfig;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class CommentDTO {

    private int commentId;
    private int photoId;
    private String userName; // ✨ 실명을 담을 변수
    private String userId;
    private String content;
    private String regDate;
    private String profileImgUrl;
    private String userNickname;

}
