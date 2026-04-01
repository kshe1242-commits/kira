package com.kira.pj.pic;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PicDTO {
    private int no;
    private String fileName;
    private String userId;
    private String text;

}
