// 쪽지 쓰기 팝업 또는 모달 호출
function openSendMessage(targetPk, targetNick) {
    const content = prompt(`${targetNick}님에게 보낼 쪽지 내용을 입력하세요!`);
    if (!content || content.trim() === "") return;

    const params = new URLSearchParams({
        receiverPk: targetPk,
        content: content
    });

    fetch('/messageaction?action=send', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: params
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) alert("쪽지를 보냈습니다! ✉️");
            else alert(data.message || "발송 실패 (일촌 관계를 확인하세요)");
        });
}

// 쪽지함 로드
function loadMessages(type) {
    fetch(`/messageview?action=${type}`)
        .then(res => res.json())
        .then(list => {
            const area = document.getElementById("message-list-area");
            let html = "";
            if (list.length === 0) {
                html = "<div style='text-align:center; padding:50px; color:#ccc;'>쪽지가 없습니다.</div>";
            } else {
                list.forEach(m => {
                    html += `
                        <div style="border-bottom:1px solid #f9f9f9; padding:10px; position:relative;">
                            <div style="font-size:12px; color:#999;">${type === 'received' ? 'From: ' + m.sender_nick : 'To: ' + m.receiver_nick} (${m.m_date})</div>
                            <div style="margin-top:5px; color:#555;">${m.m_content}</div>
                            <button onclick="deleteMsg('${m.m_pk}', '${type}')" style="position:absolute; right:10px; top:10px; border:none; background:none; cursor:pointer;">❌</button>
                        </div>`;
                });
            }
            area.innerHTML = html;
        });
}