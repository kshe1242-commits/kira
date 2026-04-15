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
    private String userId;
    private String content;
    private String regDate;

}
