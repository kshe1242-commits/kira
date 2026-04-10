// ==========================================
// 1. 쪽지함 로드 (받은 쪽지 / 보낸 쪽지) + 읽음 처리 기능 포함
// ==========================================
function loadMessages(type) {
    // 탭 전환 UI 처리
    document.getElementById('message-write-area').style.display = 'none';
    document.getElementById('message-list-area').style.display = 'block';

    // 🚨 [추가됨] 받은 쪽지함을 누르면 서버에 "나 다 읽었어!" 라고 몰래 편지 보냄
    if (type === 'received') {
        fetch('/messageaction', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({action: 'markRead'})
        }).then(() => {
            // 읽음 처리 성공 시, 뱃지를 지우기 위해 알림 다시 확인
            if (typeof checkUnreadMessages === "function") {
                checkUnreadMessages();
            }
        });
    }

    fetch(`/messageview?action=${type}`)
        .then(res => res.json())
        .then(list => {
            const area = document.getElementById("message-list-area");
            let html = "";

            if (!list || list.length === 0) {
                html = `<div style='text-align:center; padding:50px; color:#c0b0a0;'>쪽지가 없습니다. 텅~ 🍃</div>`;
            } else {
                // 쪽지가 있을 때 리스트 그리기
                list.forEach(m => {
                    const targetName = type === 'received' ? `From: ${m.target_nick}` : `To: ${m.target_nick}`;

                    html += `
                    <div style="border-bottom:1px dashed #f2c0bd; padding:10px 0; position:relative;">
                        <div style="font-size:13px; color:#a29bfe; font-weight:bold; cursor:pointer;" 
                             onclick="goSearchMain('${m.target_pk}', '${m.target_nick}')">
                             
                            ${targetName} <span style="color:#c0b0a0; font-weight:normal; font-size:11px; margin-left:10px;">${m.m_date}</span>
                        </div>
                        
                        <div style="margin-top:8px; color:#5a4a3a; font-size:15px;">${m.m_content}</div>
                        <button onclick="deleteMsg('${m.m_pk}', '${type}')" style="position:absolute; right:5px; top:10px; border:none; background:none; cursor:pointer; color:#ff7675; font-size:14px;">✖</button>
                    </div>`;
                });
            }
            area.innerHTML = html;
        });
}

// ==========================================
// 2. 쪽지 쓰기 화면 열기
// ==========================================
function openWriteMessage(defaultTargetPk = "") {
    document.getElementById('message-list-area').style.display = 'none';
    document.getElementById('message-write-area').style.display = 'block';

    fetch('/friendview?action=list')
        .then(res => res.json())
        .then(list => {
            const select = document.getElementById('msg-receiver-select');
            select.innerHTML = '<option value="">💌 받을 일촌을 선택하세요</option>';

            list.forEach(f => {
                const isSelected = (f.friend_pk === defaultTargetPk) ? 'selected' : '';
                select.innerHTML += `<option value="${f.friend_pk}" ${isSelected}>${f.u_nickname}</option>`;
            });
        });
}

// ==========================================
// 3. 쪽지 전송 (서버로 쏘기)
// ==========================================
function sendMessage() {
    const receiverPk = document.getElementById('msg-receiver-select').value;
    const content = document.getElementById('msg-content').value;

    if (!receiverPk) {
        alert('받을 사람(일촌)을 선택해주세요!');
        return;
    }
    if (!content.trim()) {
        alert('내용을 입력해주세요!');
        return;
    }

    const params = new URLSearchParams({action: 'send', receiverPk: receiverPk, content: content});

    fetch('/messageaction', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: params
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("쪽지가 슝~ 전송되었습니다! 🚀");
                document.getElementById('msg-content').value = '';
                loadMessages('sent');
            } else {
                alert(data.message || "발송 실패");
            }
        });
}

// ==========================================
// 4. 쪽지 삭제
// ==========================================
function deleteMsg(msgPk, type) {
    if (!confirm("이 쪽지를 삭제할까요? (상대방의 쪽지함에서는 지워지지 않습니다)")) return;

    const params = new URLSearchParams({action: 'delete', msgPk: msgPk, type: type});
    fetch('/messageaction', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: params
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) loadMessages(type);
            else alert("삭제 실패!");
        });
}

// ==========================================
// 5. 새 쪽지 알림 확인 (빨간 뱃지 달기)
// ==========================================
function checkUnreadMessages() {
    // 로그인한 유저만 작동
    if (typeof loginUserPk === 'undefined' || !loginUserPk) return;

    fetch('/messageview?action=unreadCount')
        .then(res => res.json())
        .then(data => {
            // 메뉴(좌측)와 탭(중앙)에 있는 '쪽지함' 버튼을 싹 찾는다
            const msgMenus = document.querySelectorAll('.menu-item[data-src*="message.jsp"], .nb-tab[data-src*="message.jsp"]');

            msgMenus.forEach(item => {
                // 기존 뱃지 제거
                const oldBadge = item.querySelector('.msg-badge');
                if (oldBadge) oldBadge.remove();

                // 안 읽은 쪽지가 있으면 뱃지 추가
                if (data.count > 0) {
                    item.innerHTML += `<span class="msg-badge" style="background:#ff7675; color:white; border-radius:50%; padding:2px 6px; font-size:11px; margin-left:5px; box-shadow: 1px 1px 3px rgba(0,0,0,0.2); animation: pop 0.3s ease-in-out;">${data.count}</span>`;
                }
            });
        })
        .catch(err => console.error("알림 확인 실패:", err));
}

// 브라우저가 켜지면 뱃지 로직 실행 (10초마다 반복)
document.addEventListener("DOMContentLoaded", () => {
    checkUnreadMessages();
    setInterval(checkUnreadMessages, 10000);
});