let photoData = [];

// =============================================
// 메인 로드
// =============================================
function loadPhoto() {
    const container = document.getElementById('notebook-content');
    container.style.overflowY = 'auto';
    container.style.height = '100%';
    container.innerHTML = '<div style="text-align:center; padding:20px;">사진첩을 열고 있어요... 📸</div>';
    const hostId = sessionStorage.getItem("currentHostId") || loginUserId; // 없으면 내 id

    fetch(`/photo-data?host_id=${encodeURIComponent(hostId)}`)
        .then(res => res.json())
        .then(data => {
            // 백엔드에서 Gson으로 변환한 List<PhotoDTO> 데이터
            photoData = data;
            renderFeedView(hostId);
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
    const isOwner = (hostId === loginId); // 내 홈피인지 여부

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
        html += buildFeedCard(item, index, isOwner);
    });

    html += `</div></div>`;
    html += buildAddModalHtml();

    container.innerHTML = html;
}

// =============================================
// 피드 카드 1장 빌더 (DB의 photoId 적극 활용)
// =============================================
function buildFeedCard(item, index, isOwner) {
    // DB의 고유 ID (PK)
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
                    <div id="title-view-${pid}"
                         style="font-size:22px; font-weight:bold; color:#444; font-family:'Gaegu', cursive;">
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
                    <button onclick="onLikeClick(${pid})" style="
                        background:none; border:none; cursor:pointer;
                        display:flex; align-items:center; gap:6px;
                        color:#e88; font-size:15px; font-family:'Gaegu'; padding:0;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e88" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        <span id="like-count-${pid}">0</span>
                    </button>
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
            <div style="padding: 20px;">
                <div style="font-size:14px; color:#777; margin-bottom:10px;">댓글을 남겨보세요 💬</div>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="comment-input-${pid}" placeholder="내용을 입력하세요..." style="
                        flex:1; padding:8px 12px; border:1px solid #ddd; border-radius:20px;
                        font-family:'Gaegu', cursive; font-size:14px; outline:none;">
                    <button onclick="addComment(${pid})" style="
                        padding:6px 16px; background:#ffb3ba; color:#fff; border:none;
                        border-radius:20px; font-family:'Gaegu', cursive; cursor:pointer;">등록</button>
                </div>
                <div style="margin-top:15px; font-size:13px; color:#888;">
                    ${item.comments && item.comments.length > 0 ? item.comments.map(c =>
        `<div style="padding:8px 0; border-bottom:1px dashed #eee;">
                        <b>${c.userId}</b> : ${c.content}
                    </div>`).join('') : `<div style="padding:8px 0;">아직 작성된 댓글이 없습니다.</div>`}
                </div>          
            </div>
        </div>
    </div>
    `;
}

// 좋아요 / 댓글 - 로직은 나중에
function onLikeClick(pid) {
    // 나중에 구현
}

// =============================================
// 댓글창 슬라이드 토글 기능 (pid 기준)
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
            loadPhoto(); // 임시로 전체를 다시 불러옴. 나중에는 DOM만 추가하는 방식으로 개선 가능
        } else {
            alert('댓글 등록에 실패했습니다.');
        }
    } catch (error) {
        console.error('Comment Error:', error);
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

    // DB PK인 photoId를 찾아서 UI 변경
    const pid = photoData[index].photoId;
    document.getElementById(`detail-img-${pid}`).src = newUrl;
}

// =============================================
// 게시글 삭제
// =============================================
async function deletePhoto(index) {
    const item = photoData[index];
    if (!confirm('이 게시글을 삭제할까요?')) return;

    // 1. Supabase에서 먼저 삭제 (파일명 기준)
    await deleteSupabase(item.imgName);

    try {
        // 2. DB에서 삭제 (파일명과 PK 모두 넘김)
        const response = await fetch(`/photo-data?imgName=${encodeURIComponent(item.imgName)}&photoId=${item.photoId}`, {
            method: 'DELETE'
        });

        const text = await response.text();
        const row = parseInt(text);
        if (row > 0) {
            alert('사진이 성공적으로 삭제되었습니다!');
            loadPhoto();
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
            loadPhoto();
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