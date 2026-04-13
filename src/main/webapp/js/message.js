function loadMessages(type) {
    document.getElementById('message-write-area').style.display = 'none';
    document.getElementById('message-list-area').style.display = 'block';

    if (type === 'received') {
        fetch('/messageaction', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({action: 'markRead'})
        }).then(() => {
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
                list.forEach(m => {
                    const targetName = type === 'received' ? `From: ${m.target_nick}` : `To: ${m.target_nick}`;

                    // 대상의 ID (target_id)를 사용하여 goSearchMain 실행
                    html += `
                    <div style="border-bottom:1px dashed #f2c0bd; padding:10px 0; position:relative;">
                        <div style="font-size:13px; color:#a29bfe; font-weight:bold; cursor:pointer;" 
                             onclick="goSearchMain('${m.target_id}', '${m.target_nick}')">
                             
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

function openWriteMessage(defaultTargetId = "") {
    document.getElementById('message-list-area').style.display = 'none';
    document.getElementById('message-write-area').style.display = 'block';

    fetch('/friendview?action=list')
        .then(res => res.json())
        .then(list => {
            const select = document.getElementById('msg-receiver-select');
            select.innerHTML = '<option value="">💌 받을 일촌을 선택하세요</option>';

            list.forEach(f => {
                // 친구 목록에서 받아온 u_id를 드롭다운 value로 설정
                const isSelected = (f.u_id === defaultTargetId) ? 'selected' : '';
                select.innerHTML += `<option value="${f.u_id}" ${isSelected}>${f.u_nickname}</option>`;
            });
        });
}

function sendMessage() {
    // receiverId 획득
    const receiverId = document.getElementById('msg-receiver-select').value;
    const content = document.getElementById('msg-content').value;

    if (!receiverId) {
        alert('받을 사람(일촌)을 선택해주세요!');
        return;
    }
    if (!content.trim()) {
        alert('내용을 입력해주세요!');
        return;
    }

    // 서버에 전송하는 변수명도 receiverId로 변경
    const params = new URLSearchParams({action: 'send', receiverId: receiverId, content: content});

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

function deleteMsg(msgPk, type) {
    if (!confirm("이 쪽지를 삭제할까요? (상대방의 쪽지함에서는 지워지지 않습니다)")) return;

    // msgPk는 쪽지 자체의 식별자(NanoID 등)이므로 그대로 유지한다
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

function checkUnreadMessages() {
    if (typeof loginUserId === 'undefined' || !loginUserId) return; // loginUserPk -> loginUserId 로 변경 가능성 대비

    fetch('/messageview?action=unreadCount')
        .then(res => res.json())
        .then(data => {
            const msgMenus = document.querySelectorAll('.menu-item[data-src*="message.jsp"], .nb-tab[data-src*="message.jsp"]');

            msgMenus.forEach(item => {
                const oldBadge = item.querySelector('.msg-badge');
                if (oldBadge) oldBadge.remove();

                if (data.count > 0) {
                    item.innerHTML += `<span class="msg-badge" style="background:#ff7675; color:white; border-radius:50%; padding:2px 6px; font-size:11px; margin-left:5px; box-shadow: 1px 1px 3px rgba(0,0,0,0.2); animation: pop 0.3s ease-in-out;">${data.count}</span>`;
                }
            });
        })
        .catch(err => console.error("알림 확인 실패:", err));
}

document.addEventListener("DOMContentLoaded", () => {
    checkUnreadMessages();
    setInterval(checkUnreadMessages, 10000);
});

// 미니홈피 소유자 여부를 확인하는 공통 함수
function isPageOwner() {
    if (typeof loginUserId === 'undefined' || typeof ownerId === 'undefined') {
        console.error("권한 검증 에러: loginUserId 또는 ownerId가 정의되지 않았습니다.");
        return false;
    }
    return loginUserId === ownerId;
}

function loadMessages(type) {
    // [핵심 변경 사항] 본인이 아닌 경우 쪽지함 열람 차단
    if (!isPageOwner()) {
        alert("쪽지함은 미니홈피 주인만 열람할 수 있습니다. 🔒");
        return;
    }

    document.getElementById('message-write-area').style.display = 'none';
    document.getElementById('message-list-area').style.display = 'block';

    if (type === 'received') {
        fetch('/messageaction', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({action: 'markRead'})
        }).then(() => {
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
                list.forEach(m => {
                    const targetName = type === 'received' ? `From: ${m.target_nick}` : `To: ${m.target_nick}`;

                    html += `
                    <div style="border-bottom:1px dashed #f2c0bd; padding:10px 0; position:relative;">
                        <div style="font-size:13px; color:#a29bfe; font-weight:bold; cursor:pointer;" 
                             onclick="goSearchMain('${m.target_id}', '${m.target_nick}')">
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

function openWriteMessage(defaultTargetId = "") {
    // 쪽지 쓰기는 타인(방문자)도 주인에게 보낼 수 있어야 하므로 소유자 검증을 하지 않는다.
    document.getElementById('message-list-area').style.display = 'none';
    document.getElementById('message-write-area').style.display = 'block';

    fetch('/friendview?action=list')
        .then(res => res.json())
        .then(list => {
            const select = document.getElementById('msg-receiver-select');
            select.innerHTML = '<option value="">💌 받을 일촌을 선택하세요</option>';

            list.forEach(f => {
                const isSelected = (f.u_id === defaultTargetId) ? 'selected' : '';
                select.innerHTML += `<option value="${f.u_id}" ${isSelected}>${f.u_nickname}</option>`;
            });
        });
}

function sendMessage() {
    const receiverId = document.getElementById('msg-receiver-select').value;
    const content = document.getElementById('msg-content').value;

    if (!receiverId) {
        alert('받을 사람(일촌)을 선택해주세요!');
        return;
    }
    if (!content.trim()) {
        alert('내용을 입력해주세요!');
        return;
    }

    const params = new URLSearchParams({action: 'send', receiverId: receiverId, content: content});

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

                // 보낸 후 보낸 쪽지함을 로드하려 시도하되, 주인이 아니면 UI에서 알아서 튕겨냄
                if (isPageOwner()) {
                    loadMessages('sent');
                } else {
                    // 주인이 아니면 폼을 닫거나 안내 메시지 출력
                    document.getElementById('message-write-area').style.display = 'none';
                }
            } else {
                alert(data.message || "발송 실패");
            }
        });
}

function deleteMsg(msgPk, type) {
    if (!isPageOwner()) {
        alert("삭제 권한이 없습니다.");
        return;
    }

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

function checkUnreadMessages() {
    if (typeof loginUserId === 'undefined' || !loginUserId) return;

    // 알림 배지도 본인 홈피에서만 노출되게 하려면 여기서 차단
    if (!isPageOwner()) return;

    fetch('/messageview?action=unreadCount')
        .then(res => res.json())
        .then(data => {
            const msgMenus = document.querySelectorAll('.menu-item[data-src*="message.jsp"], .nb-tab[data-src*="message.jsp"]');

            msgMenus.forEach(item => {
                const oldBadge = item.querySelector('.msg-badge');
                if (oldBadge) oldBadge.remove();

                if (data.count > 0) {
                    item.innerHTML += `<span class="msg-badge" style="background:#ff7675; color:white; border-radius:50%; padding:2px 6px; font-size:11px; margin-left:5px; box-shadow: 1px 1px 3px rgba(0,0,0,0.2); animation: pop 0.3s ease-in-out;">${data.count}</span>`;
                }
            });
        })
        .catch(err => console.error("알림 확인 실패:", err));
}

document.addEventListener("DOMContentLoaded", () => {
    checkUnreadMessages();
    // 타인의 홈피에서는 주기적 확인을 할 필요가 없음
    if (isPageOwner()) {
        setInterval(checkUnreadMessages, 10000);
    }
});