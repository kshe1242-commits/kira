// 1. 상태메시지 수정 기능
function editStatus(host_id) {
    //기존 정보 저장
    const stmSpan = document.getElementById("status-text");
    const originalStm = stmSpan.innerText;

    //수정버튼 숨기기
    const originalEditBtn = document.querySelector(".status-edit-btn");
    originalEditBtn.style.display = "none";

    //확인 취소 버튼 , 입력창
    stmSpan.innerHTML = `
    <input type="text" id="edit-status-input" value="${originalStm}" style="width:150px; font-family:'Gaegu', cursive;">
    <button id="btn-confirm" class="status-edit-btn">[확인]</button>
    <button id="btn-cancel" class="status-edit-btn">[취소]</button>
    `;

    //취소버튼
    document.getElementById("btn-cancel").addEventListener("click", () => {
        stmSpan.innerText = originalStm;
        originalEditBtn.style.display = "inline-block";
    });

    //확인버튼
    document.getElementById("btn-confirm").addEventListener("click", () => {
        const editStM = document.getElementById('edit-status-input').value;
        if(editStM == originalStm){
            stmSpan.innerHTML = originalStm;
            originalEditBtn.style.display = "inline-block";
            return;
        }
        const encodedMsg = encodeURIComponent(editStM);
        fetch(`/editStMessage?host_id=${host_id}&editStM=${encodedMsg}`)
            .then(response => response.json())
            .then(editRes => {
                stmSpan.innerText = editStM;
                originalEditBtn.style.display = "inline-block";
            })
            .catch(error => {
                console.error('상태메세지 수정 실패:', error);
                stmSpan.innerText = originalStm;
                originalEditBtn.style.display = "inline-block";
            });
    })


}
function checkStatusPermission(currentHostId) {
    const editBtn = document.querySelector(".status-edit-btn");

    // 버튼이 화면에 없으면 그냥 넘어감
    if (!editBtn) return;

    // 현재 집주인(currentHostId)과 로그인한 내 아이디(loginUserId)가 같은지 비교!
    if (currentHostId === loginUserId) {
        editBtn.style.display = "inline-block"; // 내 집이면 짠! 하고 보여줌
    } else {
        editBtn.style.display = "none";         // 남의 집이면 쥐도 새도 모르게 숨김
    }
}
