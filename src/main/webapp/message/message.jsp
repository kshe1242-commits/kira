<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<div class="message-container" style="padding:20px; font-family:'Gaegu', cursive;">
    <h3 style="color:#a29bfe; border-bottom:2px solid #a29bfe; padding-bottom:10px;">📫 나의 쪽지함</h3>

    <div class="msg-tabs" style="display:flex; gap:10px; margin-bottom:15px;">
        <button onclick="loadMessages('received')" class="msg-tab-btn active">받은 쪽지</button>
        <button onclick="loadMessages('sent')" class="msg-tab-btn">보낸 쪽지</button>
    </div>

    <div id="message-list-area" style="background:white; border-radius:10px; padding:10px; min-height:300px; border:1px solid #eee;">
    </div>
</div>