let photoData = [];
let currentPhotoView = 'grid';
let gridScrollTop = 0;

// =============================================
// 상태 저장을 위한 변수
// =============================================
let savedScrollTop = 0;
let openCommentSections = [];

function saveState() {
    const container = document.getElementById('notebook-content');
    if (container) savedScrollTop = container.scrollTop;

    openCommentSections = [];
    photoData.forEach(item => {
        const section = document.getElementById(`comment-section-${item.photoId}`);
        if (section && section.style.maxHeight && section.style.maxHeight !== '0px') {
            openCommentSections.push(item.photoId);
        }
    });
}

function restoreState() {
    const container = document.getElementById('notebook-content');
    openCommentSections.forEach(pid => {
        const section = document.getElementById(`comment-section-${pid}`);
        if (section) {
            section.style.transition = 'none';
            section.style.maxHeight = '2000px';
            void section.offsetHeight;
            section.style.transition = 'max-height 0.3s ease-in-out';
        }
    });

    if (container) {
        container.style.scrollBehavior = 'auto';
        container.scrollTop = savedScrollTop;
        container.style.scrollBehavior = '';
    }
}

// =============================================
// 메인 로드
// =============================================
function loadPhoto(preserveState = false) {
    if (preserveState) {
        saveState();
    } else {
        currentPhotoView = 'grid';
        gridScrollTop = 0;
    }

    const container = document.getElementById('notebook-content');
    container.style.overflowY = 'auto';
    container.style.height = '100%';

    if (!preserveState) {
        container.innerHTML = '<div style="text-align:center; padding:20px; font-family:\'Gaegu\';">사진첩을 열고 있어요... 📸</div>';
    }

    const hostId = sessionStorage.getItem("currentHostId") || loginUserId;

    fetch(`/photo-data?host_id=${encodeURIComponent(hostId)}`)
        .then(res => res.json())
        .then(data => {
            photoData = data;

            if (currentPhotoView === 'grid') {
                renderGridView(hostId);

                if (container) {
                    container.style.scrollBehavior = 'auto';
                    if (preserveState) container.scrollTop = gridScrollTop;

                    requestAnimationFrame(() => {
                        const wrapper = document.getElementById('grid-wrapper');
                        if (wrapper) {
                            wrapper.style.animation = 'none';
                            wrapper.style.opacity = '1';
                        }
                        container.style.scrollBehavior = '';
                    });
                }
            } else {
                renderFeedView(hostId);

                if (container) {
                    container.style.scrollBehavior = 'auto';
                    if (preserveState) restoreState();

                    requestAnimationFrame(() => {
                        const wrapper = document.getElementById('feed-wrapper');
                        if (wrapper) {
                            wrapper.style.animation = 'none';
                            wrapper.style.opacity = '1';
                        }
                        container.style.scrollBehavior = '';
                    });
                }
            }
        })
        .catch(err => {
            container.innerHTML = '<div style="text-align:center; padding:20px; color:red;">사진첩 로딩 실패 ㅠㅠ</div>';
            console.error(err);
        });
}

// =============================================
// 3x3 그리드 뷰 렌더링
// =============================================
function renderGridView(hostId) {
    const container = document.getElementById('notebook-content');
    const isOwner = (hostId === loginUserId);

    let html = `
        <div id="grid-wrapper" class="album-wrapper" style="opacity:0;"> 
            <div class="album-header">
                <h2 class="album-title" style="display:${isOwner ? 'block' : 'none'};">
                    📸 My Photo Album
                </h2>
                <button class="album-btn-add" onclick="openAddModal()" style="display:${isOwner ? 'flex' : 'none'};">+</button>
            </div>

            <div class="grid-container">
    `;

    if (photoData.length === 0) {
        html += `<div style="text-align:center; color:#bbb; padding:40px; font-family:'Gaegu', cursive;">아직 사진이 없어요. + 버튼으로 추가해보세요!</div>`;
    } else {
        html += `<div class="grid-layout">`;
        photoData.forEach((item, index) => {
            html += `
                <div class="grid-item" onclick="switchToFeedView(${index})">
                    <img src="${item.imgName}">
                </div>
            `;
        });
        html += `</div>`;
    }

    html += `</div></div>`;
    html += buildAddModalHtml();
    container.innerHTML = html;
}

// =============================================
// 인스타그램식 화면 전환
// =============================================
function switchToFeedView(index) {
    const container = document.getElementById('notebook-content');

    if (container) gridScrollTop = container.scrollTop;

    currentPhotoView = 'feed';
    const targetPid = photoData[index].photoId;
    const hostId = sessionStorage.getItem("currentHostId") || loginUserId;

    renderFeedView(hostId);

    if (container) {
        container.style.scrollBehavior = 'auto';

        const targetCard = document.getElementById(`detail-card-${targetPid}`);
        if (targetCard) {
            container.scrollTop = targetCard.offsetTop - 60;
        }

        requestAnimationFrame(() => {
            const wrapper = document.getElementById('feed-wrapper');
            if (wrapper) wrapper.style.animation = 'expandIn 0.3s cubic-bezier(0.1, 0.9, 0.2, 1) forwards';
            container.style.scrollBehavior = '';
        });
    }
}

function switchToGridView() {
    currentPhotoView = 'grid';
    const hostId = sessionStorage.getItem("currentHostId") || loginUserId;

    renderGridView(hostId);

    const container = document.getElementById('notebook-content');
    if (container) {
        container.style.scrollBehavior = 'auto';
        container.scrollTop = gridScrollTop;

        requestAnimationFrame(() => {
            const wrapper = document.getElementById('grid-wrapper');
            if (wrapper) wrapper.style.animation = 'shrinkIn 0.3s cubic-bezier(0.1, 0.9, 0.2, 1) forwards';
            container.style.scrollBehavior = '';
        });
    }
}

// =============================================
// 피드 뷰 (모든 사진 다 렌더링)
// =============================================
function renderFeedView(hostId) {
    const container = document.getElementById('notebook-content');
    const loginId = loginUserId;
    const isOwner = (hostId === loginId);

    let html = `
        <div id="feed-wrapper" class="album-wrapper" style="opacity: 0;"> 
            <div class="album-header">
                <div class="album-header-left">
                    <button class="album-btn-back" onclick="switchToGridView()" title="목록으로">◀</button>
                    <h2 class="album-title" style="display:${isOwner ? 'block' : 'none'};">📸 My Photo Album</h2>
                </div>
                <button class="album-btn-add" onclick="openAddModal()" style="display:${isOwner ? 'flex' : 'none'};">+</button>
            </div>

            <div class="feed-container">
                <div class="feed-layout">
    `;

    photoData.forEach((item, index) => {
        html += buildFeedCard(item, index, isOwner, loginId);
    });

    html += `</div></div></div>`;
    html += buildAddModalHtml();

    container.innerHTML = html;
}

// =============================================
// 피드 카드 1장 빌더
// =============================================
function buildFeedCard(item, index, isOwner, loginId) {
    const pid = item.photoId;

    return `
    <div id="detail-card-${pid}" class="feed-card">
        <div class="feed-card-body">
            
            <div class="feed-img-box">
                <img id="detail-img-${pid}" src="${item.imgName}">
                <input type="file" id="img-input-${pid}" accept="image/*" style="display:none;" onchange="applyImgEdit(${index}, event)">
            </div>

            <div class="feed-info-box">
                <div class="feed-info-header">
                    <div id="title-view-${pid}" class="feed-post-title">${item.title}</div>
                    <button class="btn-delete-post" onclick="deletePhoto(${index})" style="display:${isOwner ? 'inline' : 'none'};">✕</button>
                </div>

                <div class="feed-meta">
                    📅 ${item.regDate} &nbsp;|&nbsp; 👤 ${item.userId}
                </div>

                <div id="content-view-${pid}" class="feed-content-text">${item.content}</div>

                <div class="feed-actions">
                    <button class="btn-action" onclick="toggleComment(${pid})">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span>댓글</span>
                        <span id="comment-count-${pid}">${item.comments ? item.comments.length : 0}</span>
                    </button>
                </div>
            </div>
        </div>

        <div id="comment-section-${pid}" class="comment-section">
            <div class="comment-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span class="comment-header-title">댓글</span>
                <span class="comment-badge">${item.comments ? item.comments.length : 0}</span>
            </div>

            <div class="comment-list">
                ${item.comments && item.comments.length > 0
        ? item.comments.map(c => {
            const initial = c.userName ? c.userName.charAt(0) : '?';
            return `
                        <div class="comment-item">
                            <div class="comment-avatar" onclick="goSearchMain('${c.userId}', '${c.userName}')">
                                ${c.profileImgUrl ? `<img src="${c.profileImgUrl}">` : initial}
                            </div>
                            <div style="flex:1;">
                                <div style="display:flex; align-items:baseline; gap:6px; margin-bottom:3px;">
                                    <span class="comment-author" onclick="goSearchMain('${c.userId}', '${c.userNickname}')">${c.userName}</span>
                                    <span class="comment-date">${c.regDate}</span>
                                </div>
                                <div class="comment-text">${c.content}</div>
                            </div>
                            ${c.userId === loginId ? `
                                <button class="btn-delete-comment" onclick="deleteComment(${c.commentId})" title="삭제">🗑️</button>
                            ` : ''}
                        </div>`;
        }).join('')
        : `<div class="comment-empty">아직 댓글이 없어요. 첫 댓글을 남겨보세요!</div>`
    }
            </div>

            <div class="comment-input-area">
                <input type="text" id="comment-input-${pid}" class="comment-input-box" placeholder="댓글을 남겨보세요 💬" onkeypress="if(event.key==='Enter') addComment(${pid})">
                <button class="btn-submit-comment" onclick="addComment(${pid})">등록</button>
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
        commentSection.style.maxHeight = '2000px';
    } else {
        commentSection.style.maxHeight = '0px';
    }
}

// =============================================
// 댓글 추가/삭제
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
        const response = await fetch('/photo-comment', { method: 'POST', body: params });
        if (response.ok) {
            inputEl.value = '';
            loadPhoto(true);
        } else {
            alert('댓글 등록에 실패했습니다.');
        }
    } catch (error) {
        console.error('Comment Error:', error);
    }
}

async function deleteComment(commentId) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    try {
        const response = await fetch(`/photo-comment?commentId=${commentId}`, { method: 'DELETE' });
        if (response.ok) loadPhoto(true);
        else alert('댓글 삭제에 실패했습니다.');
    } catch (error) {
        console.error('Delete Comment Error:', error);
    }
}

// =============================================
// 이미지/게시글 수정, 삭제
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

async function deletePhoto(index) {
    const item = photoData[index];
    if (!confirm('이 게시글을 삭제할까요?')) return;

    await deleteSupabase(item.imgName);
    try {
        const response = await fetch(`/photo-data?imgName=${encodeURIComponent(item.imgName)}&photoId=${item.photoId}`, { method: 'DELETE' });
        const row = parseInt(await response.text());
        if (row > 0) {
            alert('사진이 성공적으로 삭제되었습니다!');
            loadPhoto(false);
        } else {
            alert('DB 삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// =============================================
// 추가 모달
// =============================================
function buildAddModalHtml() {
    return `
    <div id="addModal" class="modal-overlay">
        <div class="modal-box">
            <h3 class="modal-title">📷 새 사진 추가</h3>
            
            <div class="modal-field">
                <label class="modal-label">사진 선택</label>
                <input type="file" id="addImgFile" accept="image/*" onchange="previewAddImage(event)" style="font-size:13px; width:100%;">
                <img id="addImgPreview" class="modal-preview" src="" alt="">
            </div>

            <div class="modal-field">
                <label class="modal-label">제목</label>
                <input type="text" id="addTitle" class="modal-input" placeholder="제목을 입력하세요">
            </div>

            <div class="modal-field last">
                <label class="modal-label">내용</label>
                <textarea id="addContent" class="modal-textarea" placeholder="내용을 입력하세요" rows="3"></textarea>
            </div>

            <div class="modal-actions">
                <button class="btn-modal-cancel" onclick="closeAddModal()">취소</button>
                <button class="btn-modal-submit" onclick="addPhoto()">추가하기</button>
            </div>
        </div>
    </div>`;
}

function openAddModal() { document.getElementById('addModal').style.display = 'flex'; }
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
        const response = await fetch('/photo-data', { method: 'POST', body: params });
        const row = parseInt(await response.text());
        if (row > 0) {
            closeAddModal();
            alert('사진이 성공적으로 등록되었습니다!');
            loadPhoto(false);
        } else alert('DB 저장에 실패했습니다.');
    } catch (error) {
        console.error('Error:', error);
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
        const response = await fetch('/supabase', { method: 'POST', body: formData });
        if (!response.ok) { alert('클라우드 업로드에 실패했습니다.'); return null; }
        return { url: await response.text() };
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function deleteSupabase(imgName) {
    try {
        await fetch(`/supabase?imgName=${encodeURIComponent(imgName)}`, { method: 'DELETE' });
    } catch (error) {
        console.error('Error:', error);
    }
}