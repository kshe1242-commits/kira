let photoData = [];

// =============================================
// 상태 저장을 위한 변수 (댓글 작성/삭제 시 스크롤 및 열림 상태 유지용)
// =============================================
let savedScrollTop = 0;
let openCommentSections = [];

function saveState() {
    const container = document.getElementById('notebook-content');
    if (container) savedScrollTop = container.scrollTop;

    openCommentSections = [];
    photoData.forEach(item => {
        const section = document.getElementById(`comment-section-${item.photoId}`);
        // maxHeight가 0px이 아니고 세팅되어 있다면 열려있는 상태
        if (section && section.style.maxHeight && section.style.maxHeight !== '0px') {
            openCommentSections.push(item.photoId);
        }
    });
}

function restoreState() {
    const container = document.getElementById('notebook-content');
    if (container) container.scrollTop = savedScrollTop;

    openCommentSections.forEach(pid => {
        const section = document.getElementById(`comment-section-${pid}`);
        if (section) {
            // ✨ 깜빡임 방지 로직: 스르륵 열리는 애니메이션을 잠시 끄고 즉시 엽니다.
            section.style.transition = 'none';
            section.style.maxHeight = '500px';

            // 브라우저 렌더링 강제 업데이트
            void section.offsetHeight;

            // 다음번 토글을 위해 원래 애니메이션 복구
            section.style.transition = 'max-height 0.3s ease-in-out';
        }
    });
}

// =============================================
// 메인 로드
// =============================================
// preserveState가 true면 기존 스크롤과 댓글창 열림 상태를 기억합니다.
function loadPhoto(preserveState = false) {
    if (preserveState) saveState();

    const container = document.getElementById('notebook-content');
    container.style.overflowY = 'auto';
    container.style.height = '100%';

    // 상태 유지가 아닐 때만 로딩바 표시 (댓글 달 때 깜빡임 방지)
    if (!preserveState) {
        container.innerHTML = '<div style="text-align:center; padding:20px;">사진첩을 열고 있어요... 📸</div>';
    }

    const hostId = sessionStorage.getItem("currentHostId") || loginUserId;

    fetch(`/photo-data?host_id=${encodeURIComponent(hostId)}`)
        .then(res => res.json())
        .then(data => {
            photoData = data;
            renderFeedView(hostId);
            if (preserveState) restoreState(); // 렌더링 후 상태 복구
        })
        .catch(err => {
            container.innerHTML = '<div style="text-align:center; padding:20px; color:red;">사진첩 로딩 실패 ㅠㅠ</div>';
            console.error(err);
        });
}

// =============================================
// 피드 뷰
// =============================================
function renderFeedView(hostId) {
    const container = document.getElementById('notebook-content');
    const loginId = loginUserId;
    const isOwner = (hostId === loginId);

    let html = `
        <div style="
            position:sticky; top:-15px; z-index:10;
            background:#fff; border-bottom:1px solid #eee;
            padding:12px 16px; display:flex; justify-content:space-between; align-items:center;
            box-shadow:0 2px 6px rgba(0,0,0,0.06);">
            <h2 style=" display:${isOwner ? 'inline' : 'none'}; margin:0; font-size:18px; color:#333; font-family:'Gaegu', cursive;">🖼️ My Photo Album</h2>
            <button onclick="openAddModal()" style="
                width:34px; height:34px; border-radius:50%;
                border:2px solid #bbb; background:#fff;
                font-size:20px; cursor:pointer; color:#666;
                display:${isOwner ? 'flex' : 'none'}; align-items:center; justify-content:center;
                box-shadow:2px 2px 6px rgba(0,0,0,0.1);"
                onmouseover="this.style.background='#f0f0f0'"
                onmouseout="this.style.background='#fff'">+</button>
        </div>

        <div style="font-family:'Gaegu', cursive; background:#f5f5f5; min-height:100%; padding-bottom:30px; padding-top:10px;">
            <div style="display:flex; flex-direction:column; gap:16px; padding:0 16px;">
    `;

    if (photoData.length === 0) {
        html += `<div style="text-align:center; color:#bbb; padding:40px;">아직 사진이 없어요. + 버튼으로 추가해보세요!</div>`;
    }

    photoData.forEach((item, index) => {
        html += buildFeedCard(item, index, isOwner, loginId);
    });

    html += `</div></div>`;
    html += buildAddModalHtml();

    container.innerHTML = html;
}

// =============================================
// 피드 카드 1장 빌더
// =============================================
function buildFeedCard(item, index, isOwner, loginId) {
    const pid = item.photoId;

    return `
    <div id="detail-card-${pid}" style="
        background:#fff; border-radius:12px;
        border:0.5px solid #eee; overflow:hidden;
        display:flex; flex-direction:column;
        box-shadow: 0 4px 10px rgba(0,0,0,0.03); margin-bottom: 20px;">

        <div style="display:flex; flex-direction:row;">
            <div style="width:520px; min-width:520px; height:400px; overflow:hidden; border-right:1px solid #eee;">
                <img id="detail-img-${pid}"
                     src="${item.imgName}"
                     style="width:100%; height:100%; object-fit:cover; display:block;">
                <input type="file" id="img-input-${pid}" accept="image/*"
                       style="display:none;" onchange="applyImgEdit(${index}, event)">
            </div>

            <div style="flex:1; padding:24px; display:flex; flex-direction:column;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                    <div id="title-view-${pid}" style="font-size:22px; font-weight:bold; color:#444; font-family:'Gaegu', cursive;">
                        ${item.title}
                    </div>
                    <button onclick="deletePhoto(${index})" style="
                        display:${isOwner ? 'inline' : 'none'};
                        background:none; border:none; font-size:18px;
                        color:#ccc; cursor:pointer; padding:0;"
                        onmouseover="this.style.color='#e55'"
                        onmouseout="this.style.color='#ccc'">✕</button>
                </div>

                <div style="font-size:13px; color:#c0b0a0; margin-bottom:20px; border-bottom:1px dashed #eee; padding-bottom:12px;">
                    📅 ${item.regDate} &nbsp;|&nbsp; 👤 ${item.userId}
                </div>

                <div id="content-view-${pid}"
                     style="font-size:15px; color:#666; line-height:1.6;
                            flex:1; overflow-y:auto; white-space:pre-wrap;
                            margin-bottom:20px; font-family:'Gaegu', cursive;">${item.content}</div>

                <div style="display:flex; align-items:center; gap:20px; border-top:1px dashed #eee; padding-top:16px;">
                    <button onclick="toggleComment(${pid})" style="
                        background:none; border:none; cursor:pointer;
                        display:flex; align-items:center; gap:6px;
                        color:#888; font-size:15px; font-family:'Gaegu'; padding:0;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span>댓글</span>
                        <span id="comment-count-${pid}">${item.comments ? item.comments.length : 0}</span>
                    </button>
                </div>
            </div>
        </div>

        <div id="comment-section-${pid}" style="
            max-height: 0; overflow: hidden; transition: max-height 0.3s ease-in-out;
            background: #fdfcf8; border-top: 1px solid #eee;">

            <div style="
                padding: 14px 18px 10px;
                border-bottom: 0.5px dashed #f0e6e8;
                display: flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span style="font-size:13px; color:#bbb; font-family:'Gaegu', cursive;">댓글</span>
                <span style="
                    background:#ffb3ba22; color:#d4537e;
                    font-size:12px; font-weight:700;
                    padding:2px 8px; border-radius:20px;
                    border:1px solid #f4c0d133;
                    font-family:'Gaegu', cursive;">
                    ${item.comments ? item.comments.length : 0}
                </span>
            </div>

            <div style="padding: 6px 18px 0; display:flex; flex-direction:column;">
                ${item.comments && item.comments.length > 0
        ? item.comments.map(c => {
            const initial = c.userName ? c.userName.charAt(0) : '?';
            return `
                        <div style="
                            display:flex; align-items:flex-start; gap:10px;
                            padding:10px 0;
                            border-bottom:0.5px dashed #f0eae8;">

                            <div style="
                                width:30px; height:30px; min-width:30px;
                                border-radius:50%;
                                background:#fbeaf0;
                                display:flex; align-items:center; justify-content:center;
                                font-size:13px; font-weight:700; color:#d4537e;
                                border:1px solid #f4c0d155;
                                overflow:hidden;
                                font-family:'Gaegu', cursive;">
                                ${c.profileImgUrl
                ? `<img src="${c.profileImgUrl}" style="width:100%; height:100%; object-fit:cover;">`
                : initial
            }
                            </div>

                            <div style="flex:1;">
                                <div style="display:flex; align-items:baseline; gap:6px; margin-bottom:3px;">
                                    <span style="font-size:14px; font-weight:700; color:#444; font-family:'Gaegu', cursive;">
                                        ${c.userName}
                                    </span>
                                    <span style="font-size:11px; color:#bbb; font-family:'Gaegu', cursive;">
                                        ${c.regDate}
                                    </span>
                                </div>
                                <div style="font-size:14px; color:#666; line-height:1.5; font-family:'Gaegu', cursive;">
                                    ${c.content}
                                </div>
                            </div>

                            ${c.userId === loginId ? `
                                <button onclick="deleteComment(${c.commentId})" style="
                                    background:none; border:none; cursor:pointer;
                                    font-size:13px; opacity:0.35; padding:2px 4px;
                                    border-radius:4px;"
                                    onmouseover="this.style.opacity='1'"
                                    onmouseout="this.style.opacity='0.35'"
                                    title="삭제">🗑️</button>
                            ` : ''}
                        </div>`;
        }).join('')
        : `<div style="
                        padding:18px 0; text-align:center;
                        font-size:13px; color:#ccc; font-family:'Gaegu', cursive;">
                        아직 댓글이 없어요. 첫 댓글을 남겨보세요!
                    </div>`
    }
            </div>

            <div style="
                padding:12px 18px 14px;
                border-top:0.5px dashed #f0e6e8;
                display:flex; gap:8px; align-items:center;
                margin-top:4px;">
                <input type="text"
                    id="comment-input-${pid}"
                    placeholder="댓글을 남겨보세요 💬"
                    style="
                        flex:1; padding:9px 14px;
                        border:1px solid #e8dde0;
                        border-radius:24px;
                        font-family:'Gaegu', cursive; font-size:14px; outline:none;
                        background:#fdfcfa; color:#555;"
                    onkeypress="if(event.key==='Enter') addComment(${pid})">
                <button onclick="addComment(${pid})" style="
                    padding:8px 16px;
                    background:#ffb3ba; color:#7a2035;
                    border:none; border-radius:24px;
                    font-family:'Gaegu', cursive; font-size:13px; font-weight:700;
                    cursor:pointer; white-space:nowrap;">
                    등록
                </button>
            </div>
        </div>
    </div>
    `;
}

// =============================================
// 댓글창 슬라이드 토글 기능
// =============================================
function toggleComment(pid) {
    const commentSection = document.getElementById(`comment-section-${pid}`);
    if (commentSection.style.maxHeight === '0px' || commentSection.style.maxHeight === '') {
        commentSection.style.maxHeight = '500px';
    } else {
        commentSection.style.maxHeight = '0px';
    }
}

// =============================================
// 댓글 추가 비동기 요청
// =============================================
async function addComment(photoId) {
    const inputEl = document.getElementById(`comment-input-${photoId}`);
    const content = inputEl.value.trim();

    if (!content) {
        alert('댓글 내용을 입력해주세요.');
        inputEl.focus();
        return;
    }

    const params = new URLSearchParams();
    params.append('photoId', photoId);
    params.append('content', content);

    try {
        const response = await fetch('/photo-comment', {
            method: 'POST',
            body: params
        });

        if (response.ok) {
            inputEl.value = '';
            loadPhoto(true); // true를 넘겨서 애니메이션 없이 상태 유지!
        } else {
            alert('댓글 등록에 실패했습니다.');
        }
    } catch (error) {
        console.error('Comment Error:', error);
        alert('서버 통신 중 오류가 발생했습니다.');
    }
}

// =============================================
// 댓글 삭제 (신규 기능)
// =============================================
async function deleteComment(commentId) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    try {
        const response = await fetch(`/photo-comment?commentId=${commentId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadPhoto(true); // 삭제 후에도 스크롤 및 댓글창 열림 유지
        } else {
            alert('댓글 삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('Delete Comment Error:', error);
        alert('서버 통신 중 오류가 발생했습니다.');
    }
}


// =============================================
// 이미지 수정
// =============================================
function applyImgEdit(index, event) {
    const file = event.target.files[0];
    if (!file) return;
    const newUrl = URL.createObjectURL(file);
    photoData[index].imgUrl = newUrl;
    photoData[index].imgName = file.name;
    const pid = photoData[index].photoId;
    document.getElementById(`detail-img-${pid}`).src = newUrl;
}

// =============================================
// 게시글 삭제
// =============================================
async function deletePhoto(index) {
    const item = photoData[index];
    if (!confirm('이 게시글을 삭제할까요?')) return;

    await deleteSupabase(item.imgName);

    try {
        const response = await fetch(`/photo-data?imgName=${encodeURIComponent(item.imgName)}&photoId=${item.photoId}`, {
            method: 'DELETE'
        });

        const text = await response.text();
        const row = parseInt(text);
        if (row > 0) {
            alert('사진이 성공적으로 삭제되었습니다!');
            loadPhoto(false); // 게시글이 삭제되었으므로 스크롤 리셋
        } else {
            alert('DB 삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('서버 통신 중 오류가 발생했습니다.');
    }
}

// =============================================
// 추가 모달
// =============================================
function buildAddModalHtml() {
    return `
    <div id="addModal" style="
        display:none; position:fixed; inset:0;
        background:rgba(0,0,0,0.45); z-index:1000;
        justify-content:center; align-items:center;">

        <div style="
            background:#fff; border-radius:14px; padding:28px;
            width:400px; max-width:90%;
            box-shadow:0 8px 30px rgba(0,0,0,0.18);
            font-family:'Gaegu', cursive;">

            <h3 style="margin:0 0 18px; font-size:18px;
                        border-bottom:2px dashed #ddd; padding-bottom:10px;">
                📷 새 사진 추가
            </h3>

            <div style="margin-bottom:14px;">
                <label style="font-size:14px; color:#555; display:block; margin-bottom:6px;">사진 선택</label>
                <input type="file" id="addImgFile" accept="image/*"
                       onchange="previewAddImage(event)" style="font-size:13px; width:100%;">
                <img id="addImgPreview" src="" alt="" style="
                    display:none; margin-top:10px; width:100%; max-height:160px;
                    object-fit:cover; border-radius:8px; border:1px solid #eee;">
            </div>

            <div style="margin-bottom:14px;">
                <label style="font-size:14px; color:#555; display:block; margin-bottom:6px;">제목</label>
                <input type="text" id="addTitle" placeholder="제목을 입력하세요" style="
                    width:100%; padding:8px 10px; font-size:14px; font-family:'Gaegu';
                    border:1px solid #ddd; border-radius:6px; box-sizing:border-box;">
            </div>

            <div style="margin-bottom:22px;">
                <label style="font-size:14px; color:#555; display:block; margin-bottom:6px;">내용</label>
                <textarea id="addContent" placeholder="내용을 입력하세요" rows="3" style="
                    width:100%; padding:8px 10px; font-size:14px; font-family:'Gaegu';
                    border:1px solid #ddd; border-radius:6px; resize:none; box-sizing:border-box;"></textarea>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:10px;">
                <button onclick="closeAddModal()" style="
                    padding:8px 18px; border:1px solid #ccc; border-radius:6px;
                    background:#f5f5f5; cursor:pointer; font-family:'Gaegu'; font-size:14px;">
                    취소
                </button>
                <button onclick="addPhoto()" style="
                    padding:8px 20px; border:none; border-radius:6px;
                    background:#555; color:#fff; cursor:pointer;
                    font-family:'Gaegu'; font-size:14px;">
                    추가하기
                </button>
            </div>
        </div>
    </div>`;
}

function openAddModal() {
    document.getElementById('addModal').style.display = 'flex';
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
    document.getElementById('addTitle').value = '';
    document.getElementById('addContent').value = '';
    document.getElementById('addImgFile').value = '';
    document.getElementById('addImgPreview').style.display = 'none';
}

function previewAddImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    const preview = document.getElementById('addImgPreview');
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
}

async function addPhoto() {
    const title = document.getElementById('addTitle').value.trim();
    const content = document.getElementById('addContent').value.trim();
    if (!title || !content) {
        alert('제목과 내용을 모두 입력해주세요!');
        return;
    }
    const data = await uploadSupabase();
    if (!data || !data.url) return;

    const params = new URLSearchParams();
    params.append('title', title);
    params.append('content', content);
    params.append('imgName', data.url);

    try {
        const response = await fetch('/photo-data', {
            method: 'POST',
            body: params
        });
        const text = await response.text();
        const row = parseInt(text);

        if (row > 0) {
            closeAddModal();
            alert('사진이 성공적으로 등록되었습니다!');
            loadPhoto(false);
        } else {
            alert('DB 저장에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('서버 통신 중 오류가 발생했습니다.');
    }
}

// =============================================
// Supabase 업로드 / 삭제
// =============================================
async function uploadSupabase() {
    const fileInput = document.getElementById('addImgFile');
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/supabase', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            alert('클라우드 업로드에 실패했습니다.');
            return null;
        }

        const text = await response.text();
        return { url: text };
    } catch (error) {
        console.error('Error:', error);
        alert('서버 통신 중 오류가 발생했습니다.');
        return null;
    }
}

async function deleteSupabase(imgName) {
    try {
        const response = await fetch(`/supabase?imgName=${encodeURIComponent(imgName)}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            console.error('클라우드 파일 삭제 실패');
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}