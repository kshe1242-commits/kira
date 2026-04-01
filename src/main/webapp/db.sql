create table pictures (
    p_no number(3) primary key ,
    p_fileName varchar2(300 char) not null,
    p_userId varchar2(30 char) not null ,
    p_text varchar2(500 char) not null

);
create sequence pictures_seq;
insert into pictures values (pictures_seq.nextval, 'test1.jpg','zle33' , 'this is the best way');
insert into pictures values (pictures_seq.nextval, 'test2.jpg','zle33' , 'today is my birthday');
insert into pictures values (pictures_seq.nextval, 'test3.jpg','kimkimam' , 'busy tough');
select * from pictures;