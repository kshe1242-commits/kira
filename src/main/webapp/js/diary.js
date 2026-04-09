/**
 * [1] 다이어리 내용을 비동기로 불러와서 화면을 갈아끼우는 핵심 함수
 */
function loadDiary(url = "diary") {
    // 1. URL에 ajax 파라미터가 없으면 붙여줌 (상태 유지용)
    if (!url.includes("ajax=true")) {
        url += (url.includes("?") ? "&" : "?") + "ajax=true";
    }

    // 2. 주소창 앞에 슬래시(/)가 없어서 발생하는 404 방지 (상대경로 이슈 해결)
    // 인텔리제이 context path가 '/'일 때 가장 안전한 방식입니다.
    console.log("📬 요청 주소:", url);

    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`서버 응답 에러 (상태코드: ${response.status})`);
            }
            // ★ 핵심: 반드시 .text()로 받아서 HTML로 처리
            return response.text();
        })
        .then((html) => {
            const contentArea = document.getElementById("notebook-content");
            if (contentArea) {
                // 기존 내용을 싹 비우고 새 HTML 주입
                contentArea.innerHTML = html;

                // 페이지 상단으로 스크롤 이동 (부드럽게)
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            // 특정 날짜 목록인 경우 해당 위치로 스크롤 (성현님 기존 로직 유지)
            if (url.includes("d=")) {
                const board = document.querySelector(".diary-board");
                if (board) {
                    board.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }
        })
        .catch((error) => {
            console.error("❌ 다이어리 로드 실패:", error);
            // 에러 시 사용자에게 알림 (선택 사항)
            // alert("화면을 불러오는 중 오류가 발생했습니다.");
        });
}

/**
 * [2] 일기 작성 (Create)
 */
function submitDiaryForm() {
    const form = document.getElementById('diaryWriteForm');
    if (!form) return;

    const formData = new FormData(form);
    const params = new URLSearchParams(formData);

    fetch('diary-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: params
    })
        .then(response => response.text())
        .then(() => {
            // 등록 후 해당 날짜 목록으로 이동
            const y = formData.get('d_year');
            const m = formData.get('d_month');
            const d = formData.get('d_date');
            loadDiary(`diary?y=${y}&m=${m}&d=${d}`);
        })
        .catch(error => console.error("일기 등록 실패:", error));
}

/**
 * [3] 일기 수정 (Update)
 */
function updateDiaryForm() {
    const form = document.getElementById('diaryUpdateForm');
    if (!form) return;

    const formData = new FormData(form);
    const params = new URLSearchParams(formData);

    fetch('diary-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: params
    })
        .then(response => response.text())
        .then(() => {
            const no = formData.get('no');
            const y = formData.get('d_year');
            const m = formData.get('d_month');
            const d = formData.get('d_date');
            // 수정 완료 후 상세 페이지 재로드
            loadDiary(`diary-detail?no=${no}&y=${y}&m=${m}&d=${d}`);
        })
        .catch(error => console.error("일기 수정 실패:", error));
}

/**
 * [4] 댓글 등록
 */
function submitReply(no, y, m, d) {
    const form = document.getElementById('replyWriteForm');
    if (!form) return;

    const input = form.querySelector('input[name="r_txt"]');
    if (!input.value.trim()) {
        alert("댓글 내용을 입력해주세요! 😊");
        input.focus();
        return;
    }

    const formData = new FormData(form);
    const params = new URLSearchParams(formData);

    fetch('diary-reply-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: params
    })
        .then(response => response.text())
        .then(() => {
            // 댓글 창 비우기
            input.value = "";
            // 상세 페이지 새로고침
            loadDiary(`diary-detail?no=${no}&y=${y}&m=${m}&d=${d}`);
        })
        .catch(error => console.error("댓글 등록 실패:", error));
}

/**
 * [5] 댓글 삭제
 */
function deleteReply(r_no, d_no, y, m, d) {
    if (!confirm("이 댓글을 정말 삭제할까요? 🗑️")) return;

    fetch(`diary-reply-delete?r_no=${r_no}`)
        .then(response => response.text())
        .then(() => {
            // 삭제 후 상세 페이지 새로고침
            loadDiary(`diary-detail?no=${d_no}&y=${y}&m=${m}&d=${d}`);
        })
        .catch(error => console.error("댓글 삭제 실패:", error));
}