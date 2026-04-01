CREATE TABLE bgm_track (
                           track_id    NUMBER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                           user_id     NUMBER,                    -- 나중에 FK 추가 예정
                           title       VARCHAR2(100) NOT NULL,
                           youtube_id  VARCHAR2(20)  NOT NULL,
                           duration    NUMBER        NOT NULL,    -- 초 단위
                           track_order NUMBER        NOT NULL
);

-- 더미 데이터
INSERT INTO bgm_track (user_id, title, youtube_id, duration, track_order) VALUES (1, '첫 번째 곡', 'dQw4w9WgXcQ', 213, 1);
INSERT INTO bgm_track (user_id, title, youtube_id, duration, track_order) VALUES (1, '두 번째 곡', 'xvFZjo5PgG0', 180, 2);
INSERT INTO bgm_track (user_id, title, youtube_id, duration, track_order) VALUES (1, '세 번째 곡', '09R8_2nJtjg', 251, 3);

select * from bgm_track;

delete

COMMIT;


-- 유저 테이블 완성 후 FK 추가
ALTER TABLE bgm_track
    MODIFY user_id NUMBER NOT NULL;

ALTER TABLE bgm_track
    ADD CONSTRAINT fk_bgm_user FOREIGN KEY (user_id) REFERENCES member(user_id);