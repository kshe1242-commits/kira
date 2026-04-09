-- 일촌 관계 테이블
CREATE TABLE friend_relation
(
    f_id        NUMBER PRIMARY KEY,         -- PK (시퀀스로 자동 증가)
    f_requester VARCHAR2(15 CHAR) NOT NULL, -- 일촌을 신청한 사람 (u_pk)
    f_receiver  VARCHAR2(15 CHAR) NOT NULL, -- 일촌 신청을 받은 사람 (u_pk)
    f_status    NUMBER DEFAULT 0,           -- 0: 수락 대기중, 1: 일촌 성립
    f_date      DATE   DEFAULT SYSDATE      -- 신청일 (수락 시 수락일로 업데이트 가능)
);

-- PK용 시퀀스
CREATE SEQUENCE friend_seq;

select *
from friend_relation