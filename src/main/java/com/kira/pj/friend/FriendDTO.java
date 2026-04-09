package com.kira.pj.friend;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor


public class FriendDTO {
    private int f_id;
    private String f_requester; // 신청한 사람 (PK)
    private String f_receiver;  // 신청 받은 사람 (PK)
    private int f_status;       // 0: 대기중, 1: 일촌 성립
    private String f_date;      // 신청일/수락일


}
