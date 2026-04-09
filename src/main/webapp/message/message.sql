CREATE TABLE private_message
(
    m_pk           VARCHAR2(15 CHAR) PRIMARY KEY, -- 쪽지 고유 번호 (NanoID)
    m_sender_pk    VARCHAR2(15 CHAR) NOT NULL,    -- 보낸 사람
    m_receiver_pk  VARCHAR2(15 CHAR) NOT NULL,    -- 받는 사람
    m_content      VARCHAR2(2000 CHAR) NOT NULL,  -- 내용
    m_date         DATE DEFAULT SYSDATE,          -- 보낸 시간
    m_read_status  NUMBER(1) DEFAULT 0,           -- 읽음 확인 (0:안읽음, 1:읽음)
    m_sender_del   NUMBER(1) DEFAULT 0,           -- 보낸 사람 삭제 여부 (1이면 보낸쪽지함에서 안보임)
    m_receiver_del NUMBER(1) DEFAULT 0,           -- 받는 사람 삭제 여부 (1이면 받은쪽지함에서 안보임)

    -- 외래키 설정 (유저 테이블 참조)
    CONSTRAINT fk_msg_sender FOREIGN KEY (m_sender_pk) REFERENCES userReg (u_pk),
    CONSTRAINT fk_msg_receiver FOREIGN KEY (m_receiver_pk) REFERENCES userReg (u_pk)
);

select * from private_message;

COMMIT;