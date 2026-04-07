create table diary_test(
    d_no int primary key,
    d_id varchar2(50) not null ,
    d_date Date not null ,
    d_title varchar2(100) not null ,
    d_txt varchar2(1000) not null ,
    d_created_at Date not null
);

create sequence diary_test_seq;

SELECT * FROM diary_test;