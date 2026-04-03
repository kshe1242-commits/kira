// 방명록 데이터 불러오기 함수
function loadGuestBoard(date = "") {
    const gbUrl = date ? `/board?date=${date}` : `/board`;

    fetch(gbUrl)
        .then(response => response.json())
        .then(showGB => {
            // 상단 날짜 업데이트
            document.getElementById('calendar-trigger').innerText = showGB.selectedDate;

            // 게시글 영역 비우기
            const gbContent = document.getElementById('gbPostText');
            gbContent.innerHTML = '';

            // 받아온 리스트를 화면에 그리기
            showGB.guestBoards.forEach(gb => {
                const htmlTemplate = `
                      <div class="gb-content-row">
                       <span class="gb-text-part">
                            ${gb.guest_nick} : <span id="guestHi_${gb.gboard_pk}"> ${gb.board_content}</span>
                       </span>
                             <a href="javascript:void(0);" onclick="editMode('${gb.gboard_pk}', '${gb.board_content}','${showGB.selectedDate}')" class="gbUp">📝</a>
                             <a href="javascript:void(0);" onclick="location.href='delGB?gboard_pk=${gb.gboard_pk}'" class="gbDel">🗑️</a>
                      </div>
                      <div class="gb-created-at">
                            ${gb.created_at}
                      </div>
               `;
                gbContent.insertAdjacentHTML('beforeend', htmlTemplate);
            })

            // 달력 기능 다시 씌워주기
            initFlatpickr(showGB.selectedDate);
        })
        .catch(error => console.error("데이터 가져오기 실패:", error));
}

// 달력 세팅
function initFlatpickr(defaultDate){
    flatpickr('#datePicker',{
        locale : "ko",
        dateFormat: "Y-m-d",
        defaultDate: defaultDate || "today",
        onChange: function (selectedDates, dateStr) {
            loadGuestBoard(dateStr);
        }
    });

    const trigger = document.getElementById('calendar-trigger');
    trigger.onclick = function () {
        document.getElementById('datePicker')._flatpickr.open();
    };
}

// 수정 모드 변경
function editMode(pk, content, date) {
    const container = document.getElementById(`guestHi_${pk}`);

    // 입력창과 버튼으로 교체 (취소 시 기존 날짜로 다시 load)
    container.innerHTML = `
        <input type="text" id="input_gc_${pk}" value="${content}" class="edit-input">
        <a href="javascript:void(0);" onclick="location.href='updateGB?guest_board=${content}&gboard_pk=${pk}'" style="font-size:12px;">[확인]</a>
        <a href="javascript:void(0);" onclick="loadGuestBoard('${date}')" style="font-size:12px;">[취소]</a>
    `;

    document.getElementById(`input_gc_${pk}`).focus();
}