// (이후 checkFriendStatus, handleFriendAction 등의 함수는 기존과 동일하게 유지)
// ==========================================
// 5. 일촌 상태 확인 (버튼 UI 자동 변경)
// ==========================================
function checkFriendStatus(targetPk) {
    const btn = document.getElementById("btn-friend-action");
    if (!btn) return;
    // 🚨 [강력한 방어막] targetPk가 내 PK와 같거나, 아예 없으면 무조건 숨김
    if (!targetPk || targetPk === loginUserPk || targetPk === "" || targetPk === "null") {
        btn.style.display = "none";
        return;
    }

    // 추적기 발동!
    console.log(`[일촌 확인] 타겟 PK: ${targetPk} 서버로 요청 보냄...`);

    fetch(`/friendview?action=status&targetPk=${targetPk}`)
        .then(res => {
            console.log(`[일촌 확인] 서버 응답 코드: ${res.status}`); // 여기서 404면 자바 설정 문제
            if (!res.ok) throw new Error("서버 에러");
            return res.text();
        })
        .then(text => {
            console.log(`[일촌 확인] 서버가 보낸 데이터: ${text}`); // 데이터가 잘 왔는지 확인

            btn.style.display = "inline-block";
            btn.dataset.target = targetPk;

            if (!text || text.trim() === "null") {
                btn.innerText = "일촌 신청";
                btn.dataset.action = "request";
                btn.style.background = "#ff7675";
                btn.style.color = "white";
                return;
            }

            const data = JSON.parse(text);

            if (data.f_status === 1) {
                btn.innerText = "일촌 끊기";
                btn.dataset.action = "delete";
                btn.style.background = "#fdcb6e";
                btn.style.color = "#555";
            } else if (data.f_status === 0) {
                if (data.f_requester === loginUserPk) {
                    btn.innerText = "수락 대기중";
                    btn.dataset.action = "pending";
                    btn.style.background = "#a29bfe";
                    btn.style.color = "white";
                } else {
                    btn.innerText = "일촌 수락";
                    btn.dataset.action = "accept";
                    btn.style.background = "#ff7675";
                    btn.style.color = "white";
                }
            }
        })
        .catch(err => console.error("[일촌 확인 에러]:", err));
}

// 6. 일촌 버튼 클릭 액션 처리

function handleFriendAction() {
    const btn = document.getElementById("btn-friend-action");
    const action = btn.dataset.action;
    const targetPk = btn.dataset.target;

    if (action === "pending") {
        alert("상대방의 수락을 기다리는 중입니다 💌");
        return;
    }

    let confirmMsg = "";
    if (action === "request") confirmMsg = "이 유저에게 일촌을 신청할까요? 🌱";
    else if (action === "accept") confirmMsg = "일촌 신청을 수락하시겠습니까? ✨";
    else if (action === "delete") confirmMsg = "정말 일촌을 끊으시겠습니까? 😢";

    if (!confirm(confirmMsg)) return;

    // 서버로 액션 명령 전송 (POST)
    const params = new URLSearchParams({
        action: action,
        targetPk: targetPk
    });

    fetch('/friendaction', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: params
    })
        .then(res => {
            if (res.ok) {
                // 통신 성공 시 버튼 상태를 다시 갱신한다.
                checkFriendStatus(targetPk);
            } else {
                alert("처리에 실패했습니다. 다시 시도해주세요.");
            }
        })
        .catch(err => console.error("일촌 액션 에러:", err));
}

// 나에게 온 일촌 신청 확인
// 나에게 온 일촌 신청 확인
function checkIncomingFriendRequests() {
    console.log("[알림 확인] 서버에 일촌 신청 목록 요청..."); // 🔍 추적기 1

    fetch(`/friendview?action=pendingList`)
        .then(res => {
            if (!res.ok) throw new Error("서버 응답 오류");
            return res.json();
        })
        .then(list => {
            console.log("[알림 확인] 서버에서 받은 목록:", list); // 🔍 추적기 2 (여기가 빈 배열 [] 이면 안 뜸)

            // 🚨 수정: profile-card 안쪽이 아니라 바깥쪽(.profile)에 안전하게 붙인다!
            const profileArea = document.querySelector(".profile");
            if (!profileArea) return;

            // 기존 알림창이 있다면 찌꺼기 제거
            const oldNotify = document.getElementById("friend-notify");
            if (oldNotify) oldNotify.remove();

            // 받은 신청이 1개라도 있으면 알림창 생성
            if (list && list.length > 0) {
                const notifyDiv = document.createElement("div");
                notifyDiv.id = "friend-notify";
                notifyDiv.style = "background:#fff5f5; border:1px solid #ff7675; padding:12px; border-radius:10px; margin-top:15px; font-size:13px; box-shadow: 2px 2px 5px rgba(0,0,0,0.03);";

                let html = `<p style="margin:0 0 8px 0; color:#ff7675; font-weight:bold; font-family:'Gaegu', cursive; font-size:16px;">💌 일촌 신청 도착!</p>`;

                list.forEach(req => {
                    html += `
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px dashed #f2c0bd; padding-bottom:5px;">
                            <span style="color:#5a4a3a;"><b>${req.nickname}</b>님</span>
                            <div style="display:flex; gap:5px;">
                                <button onclick="handleAccept('${req.requesterPk}')" style="background:#ff7675; color:white; border:none; border-radius:5px; cursor:pointer; padding:4px 8px; font-family:'Gaegu', cursive;">수락</button>
                                <button onclick="handleReject('${req.requesterPk}')" style="background:#f0eee5; color:#8a7a78; border:none; border-radius:5px; cursor:pointer; padding:4px 8px; font-family:'Gaegu', cursive;">거절</button>
                            </div>
                        </div>`;
                });
                notifyDiv.innerHTML = html;
                profileArea.appendChild(notifyDiv);
            }
        })
        .catch(err => console.error("[알림 확인 에러]:", err));
}

// 수락 버튼 함수
function handleAccept(requesterPk) {
    if (!confirm("일촌 신청을 수락할까요?")) return;
    executeFriendAction("accept", requesterPk);
}

// 거절 버튼 함수
function handleReject(requesterPk) {
    if (!confirm("신청을 거절하시겠습니까?")) return;
    executeFriendAction("delete", requesterPk);
}

// 공통 액션 실행기
function executeFriendAction(action, targetPk) {
    const params = new URLSearchParams({action: action, targetPk: targetPk});
    fetch('/friendaction', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: params
    }).then(res => {
        if (res.ok) {
            checkIncomingFriendRequests(); // 알림창 갱신
            alert(action === "accept" ? "이제 일촌입니다! ✨" : "거절되었습니다.");
        }
    });
}

function loadFriendList() {
    // 도화지 껍데기를 먼저 만든다.
    document.getElementById("notebook-content").innerHTML = `
        <div style="padding: 20px;">
            <h3 style="color:#ff7675; font-family:'Gaegu', cursive; margin-bottom: 20px;">💖 나의 일촌 목록</h3>
            <div id="friend-list-container" style="display:flex; flex-direction:column; gap:10px;">
                <div class="nb-spinner"></div>
            </div>
        </div>
    `;

    fetch(`/friendview?action=list`)
        .then(res => res.json())
        .then(list => {
            const container = document.getElementById("friend-list-container");
            container.innerHTML = "";

            if (!list || list.length === 0) {
                container.innerHTML = `<div style="text-align:center; color:#c0b0a0; padding:30px;">아직 일촌이 없어요. 😢<br>파도타기를 통해 일촌을 맺어보세요!</div>`;
                return;
            }

            list.forEach(f => {
                // 별명이 있으면 별명을 메인으로, 없으면 닉네임을 메인으로 쓴다.
                const displayName = f.alias_name ? `${f.alias_name} <span style="font-size:12px; color:#c0b0a0;">(${f.u_nickname})</span>` : f.u_nickname;

                const html = `
                <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; padding:15px; border-radius:10px; border:1px solid #f2c0bd;">
                    <div style="display:flex; flex-direction:column; gap:5px;">
                        <span style="font-size:18px; cursor:pointer;" onclick="goSearchMain('${f.u_id}', '${f.friend_pk}', '${f.u_nickname}')">
                            🌱 <b>${displayName}</b>
                        </span>
                        <span style="font-size:11px; color:#c0b0a0;">일촌 맺은 날: ${f.f_date}</span>
                    </div>
                    
                    <div style="display:flex; gap:5px;">
                        <button onclick="editFriendAlias('${f.friend_pk}', '${f.alias_name}')" style="background:#fdcb6e; color:#555; border:none; padding:5px 10px; border-radius:15px; cursor:pointer; font-family:'Gaegu', cursive;">별명</button>
                        <button onclick="deleteFriendFromList('${f.friend_pk}')" style="background:#ff7675; color:white; border:none; padding:5px 10px; border-radius:15px; cursor:pointer; font-family:'Gaegu', cursive;">끊기</button>
                    </div>
                </div>`;
                container.insertAdjacentHTML('beforeend', html);
            });
        })
        .catch(err => console.error("일촌 목록 로딩 실패:", err));
}

// 별명 수정 함수
function editFriendAlias(targetPk, currentAlias) {
    const newAlias = prompt("이 일촌의 새로운 별명을 입력해주세요! (비워두면 삭제됩니다)", currentAlias);
    if (newAlias === null) return; // 취소 누름

    const params = new URLSearchParams({
        action: "alias",
        targetPk: targetPk,
        alias: newAlias.trim()
    });

    fetch('/friendaction', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: params
    }).then(res => {
        if (res.ok) loadFriendList(); // 성공 시 리스트 다시 그리기
        else alert("별명 변경에 실패했습니다.");
    });
}

// 리스트에서 바로 일촌 끊기 함수
function deleteFriendFromList(targetPk) {
    if (!confirm("정말 이 유저와 일촌을 끊으시겠습니까? 😢")) return;

    const params = new URLSearchParams({action: "delete", targetPk: targetPk});
    fetch('/friendaction', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: params
    }).then(res => {
        if (res.ok) loadFriendList(); // 성공 시 리스트 다시 그리기
        else alert("삭제에 실패했습니다.");
    });
}