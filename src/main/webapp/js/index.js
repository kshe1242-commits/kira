document.addEventListener("DOMContentLoaded", function () {

    // 1. 파도타기 세션 정보 확인
    //sessionStorage 에서 현재 방문한 페이지의 hostid와 nick 을 가져옴
    const savedId = sessionStorage.getItem("currentHostId");
    const savedNick = sessionStorage.getItem("currentHostNick");
    //프로필 사진 밑 닉네임을 가져옴
    const profileName = document.getElementById("profile-name");

    // 2. 세션 정보가 있으면(파도타기 중) 해당 유저 홈으로, 없으면 내 홈으로
    //만약 sessionStorage가 비어있다면 로그인한 자기 자신의 페이지 이므로 loadPage함수를, 비어있지않다면 상대방의 페이지를 열어줘야하기 때문에 goSearchMain함수를 실행해줌

    if (savedId != null && savedNick != null) {
        if (profileName) profileName.textContent = savedNick;
        goSearchMain(savedId, savedNick);
    } else {
        if (profileName)
            profileName.textContent =
                typeof loginUserNickname !== "undefined" ? loginUserNickname : "사용자";
        loadPage("/home?ajax=true");
    }
    //만약 닉네임이 있다면 보이게 해준다는 의미?
    // 닉네임을 담는 HTML 태그가 존재한다면, 숨겨뒀던 태그를 화면에 보여줌
    if (profileName) profileName.style.visibility = "visible";


    const goMyHomeBtn = document.getElementById("goMyHome");
    //버튼이 클릭되면 일단 sessionStorage 안에 있는 정보들을 초기화 해준다
    if (goMyHomeBtn) {
        goMyHomeBtn.addEventListener("click", function () {
            // 🚨 핵심: 남의 집 ID 기억을 삭제한다!
            sessionStorage.removeItem("currentHostId");
            sessionStorage.removeItem("currentHostNick");


            // 내 닉네임으로 다시 세팅
            const profileName = document.getElementById("profile-name");
            if (profileName) profileName.textContent = loginUserNickname;


            // 내 홈 화면 로드
            loadPage("/home?ajax=true");

            // 일촌 버튼 숨기기 (내 홈피니까)
            if (typeof checkFriendStatus === "function") {
                checkFriendStatus(loginUserId);
            }
        });
    }


    // 초기 위젯 및 알림 로드
    if (typeof loadRecentVisitors === "function") loadRecentVisitors();
    if (typeof checkIncomingFriendRequests === "function")
        checkIncomingFriendRequests();

    // 내 홈피라면 일촌 버튼 숨기기 (기본값)
    if (typeof checkFriendStatus === "function") {
        checkFriendStatus(typeof loginUserId !== "undefined" ? loginUserId : null);
    }

    // 메뉴 및 탭 이벤트 등록
    document.querySelectorAll(".menu-item, .nb-tab").forEach((button) => {
        button.addEventListener("click", function (e) {
            //"클릭 이벤트 전파 막기"**입니다. 내가 버튼을 클릭했을 때, 그 클릭 충격파가 버튼을 감싸고 있는 부모 태그들로 퍼져나가는 것(버블링)을 차단합니다. 엉뚱한 부모 태그의 클릭 이벤트가 같이 실행되는 것을 막아주는 방어 코드입니다.
            e.stopPropagation();
            //내가 방금 누른 바로 그 버튼(this)에 적혀있는 data-src 값을 가져와서 targetUrl이라는 상수에 저장합니다. (예: data-src="diary.jsp" 였다면 "diary.jsp"를 가져옵니다. 즉, 이동할 목적지를 파악하는 단계입니다.)
            const targetUrl = this.getAttribute("data-src");
            //기존 불빛 끄기(초기화)"**입니다. 새로운 메뉴에 불을 켜기 전에, 화면에 있는 모든 메뉴와 탭을 다시 다 찾아서 기존에 켜져 있던 active 클래스(선택된 디자인)를 전부 지워버립니다.
            document
                .querySelectorAll(".menu-item, .nb-tab")
                .forEach((el) => el.classList.remove("active"));
            //짝꿍 찾기"**입니다. 방금 클릭한 버튼과 목적지(data-src)가 똑같은 모든 태그를 찾아냅니다. 예를 들어 좌측 메뉴의 '다이어리'를 눌렀다면, 상단 탭에 있는 '다이어리' 탭도 목적지가 같을 테니 둘 다 찾아오게 됩니다.
            const correspondingTabs = document.querySelectorAll(
                `[data-src="${targetUrl}"]`,
            );
            //내가 클릭한 버튼에 active를 달아주어 효과주기
            correspondingTabs.forEach((el) => el.classList.add("active"));
            //targetUrl로 loadPage 함수 실행
            loadPage(targetUrl);
        });
    });

    // 실시간 검색창 로직
    const searchInput = document.getElementById("live-search-input");
    const searchDropdown = document.getElementById("search-dropdown");
    //둘다 존재한다면 input 이라는 이벤트가 발생했을때 함수를 실행

    if (searchInput && searchDropdown) {
        searchInput.addEventListener("input", function () {
            //input값을 keyword로 저장하고
            const keyword = searchInput.value.trim();
            //만약 암것도 없다면 dropdown창을 안보이게 해줌
            if (keyword === "") {
                searchDropdown.classList.add("hidden");
                searchDropdown.innerHTML = "";
                return;
            }
            //rederDropdown 함수 실행
            renderDropdown(keyword);
        });
        //위에서 받은 keyword값을 fetch 를 이용해 파라미터로 전송
        function renderDropdown(keyword) {
            fetch(`/search-users?keyword=${encodeURIComponent(keyword)}`)
                .then((res) => res.json())
                .then((data) => {
                    //답변 받았으면 dropdown 초기화
                    searchDropdown.innerHTML = "";
                    if (!data || data.length === 0) {
                        //답변받앗는데 내용이 없다면 이 결과를 보여줌
                        searchDropdown.innerHTML = `<div style="padding:15px; text-align:center; color:#c0b0a0; font-family:'Gaegu', cursive; font-size:14px;">결과가 없어요! 😢</div>`;
                    } else {
                        //답변받았고 내용도 있다면 foreach를 사용해 하나하나 씩 보여줌
                        data.forEach((host) => {
                            //보여준 리스트 중 하나를 클릭하면 goSearchMain을 실시해 그 사람의 main을 열어줌
                            const html = `
                                <div class="search-item" onclick="goSearchMain('${host.u_id}','${host.u_nickname}')">
                                    <div class="search-item-title">${host.u_nickname} <span style="font-weight:normal; font-size:12px; color:#ff7675;">(${host.u_name})</span></div>
                                    <div class="search-item-desc">📧 ${host.u_email}</div>
                                </div>`;
                            searchDropdown.insertAdjacentHTML("beforeend", html);
                        });
                    }
                    //그 다음엔 다시 없애줌
                    searchDropdown.classList.remove("hidden");
                })
                .catch((err) => console.error("검색 에러:", err));
        }

        document.addEventListener("click", (e) => {
            if (
                //해설: 여기가 핵심 로직입니다! e.target은 방금 마우스로 정확히 콕 찍은 바로 그 태그를 말합니다.
                // !searchInput.contains(e.target): 방금 클릭한 곳이 '검색어 입력창' 안쪽이 아니고
                // !searchDropdown.contains(e.target): 방금 클릭한 곳이 '검색 결과 드롭다운 창' 안쪽도 아니라면!
                // 의미: "유저가 검색을 하려는 것도 아니고, 검색 결과를 누르려는 것도 아니네? 그냥 엉뚱한 바탕화면을 눌렀구나!" 하고 판단하는 조건문입니다.
                !searchInput.contains(e.target) &&
                !searchDropdown.contains(e.target)
            ) {
                searchDropdown.classList.add("hidden");
            }
        });
    }

    // 테마(스킨) 변경 코드
    //localstorage에서 myHompyTheme를 가져온다
    const savedTheme = localStorage.getItem("myHompyTheme");
    //만약 있다면 body의 클래스에 추가해준다
    if (savedTheme) {
        document.body.classList.add(savedTheme);
    }
    //테마버튼을 가져와서 상수에 넣어주고
    const themeBtns = document.querySelectorAll(".theme-btn");
    //각각 버튼을 클릭할때 data-theme를 가져와서 상수로 정의, 그리고 body 클래스에서 테마를 삭제 후
    //미리 가져와둔 newTheme를 통해 색을 myHompyTheme이라는 localstorage 에 넣어놔 준다 .
    themeBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
            const newTheme = this.getAttribute("data-theme");
            document.body.classList.remove("theme-pink", "theme-mint", "theme-purple");
            if (newTheme !== "theme-pink") {
                document.body.classList.add(newTheme);
            }
            localStorage.setItem("myHompyTheme", newTheme);
        });
    });
});


//정체: 이 객체는 미니홈피의 **'지도(Map)'**이자 **'안내 데스크'**입니다.
// 역할: 유저가 메뉴를 클릭해서 특정 페이지(예: 다이어리, 방명록)로 이동할 때, **"아, 이 페이지로 갈 때는 A라는 자바스크립트 함수를 실행해서 데이터를 가져오고, B라는 디자인(CSS)을 입혀야 해!"**라는 규칙들을 한곳에 예쁘게 모아둔 사전(Dictionary)입니다.
const pageRoutes = {
    //키 ("diary.jsp"): 유저가 이동하려는 **목적지의 이름(URL의 일부)**입니다. 메뉴를 클릭했을 때 넘어오는 주소에 이 이름이 포함되어 있으면, 안내 데스크가 이 서랍을 엽니다.
    // 값 ({ initFunc: ..., cssClass: ... }): 그 서랍 안에 들어있는 행동 지침서입니다. 목적지에 도착했을 때 브라우저가 해야 할 일들을 객체 형태로 묶어두었습니다.
    "board.jsp": {
        //() => (화살표 함수): * "지금 당장 실행하지 말고, 내가 나중에 부르면 그때 실행해 줘!" 라는 뜻입니다. 함수를 캡슐에 담아 보관하는 역할을 합니다.
        // typeof loadDiary === "function" (안전장치 🛡️): * loadDiary라는 이름이 진짜로 존재하는 '함수'인지 먼저 검사합니다.
        // 이게 왜 필요할까요? 만약 서버 통신이 느리거나 에러가 나서 loadDiary 함수가 만들어지기도 전에 이 코드가 실행되어버리면, 브라우저는 ReferenceError를 뿜고 웹사이트 전체가 멈춰버립니다. 그걸 막아주는 아주 고급 방어막입니다.
        // && loadDiary() (단축 평가 실행):
        // 자바스크립트의 &&(그리고) 연산자는 특이한 성질이 있습니다. 앞의 조건이 참(True)일 때만 뒤의 코드를 실행합니다.
        // 즉, "저 함수가 무사히 존재하는 게 확인됐어? (True) 그럼 이제 안심하고 실행해!(loadDiary())"라는 논리 구조입니다.
        initFunc: () => typeof loadGuestBoard === "function" && loadGuestBoard(),
        //역할: 특정 페이지에만 입혀줄 **특별한 옷(CSS 클래스명)**을 지정합니다.
        // 활용: 방명록(visitor) 페이지를 열 때, 자바스크립트가 화면 전체를 감싸는 공책(.notebook) 태그에 is-visitor라는 클래스를 찰칵! 하고 붙여줍니다.
        // 그러면 index.css 파일에서 .notebook.is-visitor { 배경색: 파란색; } 처럼 방명록에서만 레이아웃이나 색깔이 다르게 나오도록 마법을 부릴 수 있습니다. 다이어리나 사진첩은 이 값이 ""(빈칸)이므로 평범한 기본 공책 모양이 유지되는 것이고요.
        cssClass: "",
    },
    visitor: {
        initFunc: () => typeof initVisitorLog === "function" && initVisitorLog(),
        cssClass: "is-visitor",
    },
    "diary.jsp": {
        initFunc: () => typeof loadDiary === "function" && loadDiary(),
        cssClass: "",
    },
    "photo.jsp": {
        initFunc: () => typeof loadPhoto === "function" && loadPhoto(),
        cssClass: "",
    },
    "friend.jsp": {
        initFunc: () => loadFriendList(),
        cssClass: ""
    },
    "message.jsp": {
        initFunc: () => typeof initMessage === "function" && initMessage(),
        cssClass: "",
    }

};

function loadPage(url) {
    if (!url) return;
    //sessionStorage에서 값 받아오기
    //없으면 session에서 가져오기
    const savedOwnerId = sessionStorage.getItem("currentHostId");
    const targetOwnerId = savedOwnerId ? savedOwnerId : loginUserId;
    //url에 파라미터로 붙이기
    let fetchUrl =
        url + (url.includes("?") ? "&" : "?") + "host_id=" + targetOwnerId;
    //fetch요청
    fetch(fetchUrl)
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP 오류: ${res.status}`);
            return res.text();
        })
        //받아온 값 notebook-content에 html로 채워주기
        .then((html) => {
            const content = document.getElementById("notebook-content");
            if (content) content.innerHTML = html;

            if (typeof checkStatusPermission === "function") {
                // 혹시 모를 숫자/문자 타입 불일치를 막기 위해 String으로 감싸서 보냅니다.
                checkStatusPermission(String(targetOwnerId));
            }

            const notebook = document.getElementById("notebook");
            //notebook이 있다면
            if (notebook) {
                //isvisitor 삭제
                notebook.classList.remove("is-visitor");
                //pageRoutes에서 받아온 값으로 경로 설정해주고 함수 실행
                for (const path in pageRoutes) {
                    if (url.includes(path)) {
                        const route = pageRoutes[path];
                        if (route.cssClass) notebook.classList.add(route.cssClass);
                        if (route.initFunc) route.initFunc();
                        break;
                    }
                }
            }
        })
        .catch((err) => console.error("페이지 로드 실패:", err));
}
//
function goSearchMain(id, nick) {
    // 1. UI 즉시 반응 (검색창 닫기)
    //검색창 찾아서 상수에 저장
    const dropdown = document.getElementById("search-dropdown");
    const searchInput = document.getElementById("live-search-input");
    //검색창 열려있으면 없애는 기능
    if (dropdown) dropdown.classList.add("hidden");
    if (searchInput) searchInput.value = "";

    // 2. 세션스토리지에 새 주인 정보 저장 (가장 중요)
    sessionStorage.setItem("currentHostId", id);
    sessionStorage.setItem("currentHostNick", nick);

    // 3. 무조건 그 사람의 '홈' 화면으로 강제 이동
    loadPage(`/home?ajax=true`);

    // 다른 사람의 홈페이지를 찾기 위한 요청을 보내는 fetch
    const searchUrl = `/search-main?host_id=${id}`;
    fetch(searchUrl)
        .then((response) => response.json())
        .then((searchData) => {
            // 5. 메뉴와 탭의 활성화 불빛(active)을 강제로 '홈'으로 옮기기
            document
                .querySelectorAll(".menu-item, .nb-tab")
                .forEach((el) => el.classList.remove("active"));
            document.querySelectorAll(".menu-item, .nb-tab").forEach((el) => {
                const src = el.getAttribute("data-src");
                if (src && src.includes("home")) {
                    el.classList.add("active");
                }
            });

            // 메인을 채우는 정보들을 받아와서 그 방문한 홈페이지의 정보들로 채워주는 기능들
            const profileName = document.querySelector(".profile-name");
            if (profileName) profileName.innerText = nick;

            const titleElement = document.querySelector("#host-title");
            if (titleElement) {
                titleElement.innerText =
                    searchData.hompy_title || `📖 ${nick}님의 미니홈피`;
            }

            const stElement = document.querySelector("#status-text");
            if (stElement) {
                stElement.innerHTML = searchData.st_message || "반갑습니다. 😊";
            }

            const stDate = document.querySelector(".status-since");
            if (stDate && searchData.st_date) {
                stDate.innerHTML = `Since ${searchData.st_date.substring(0, 4)}`;
            }

            const latestGbElement = document.querySelector(
                ".gb-title + .update-text",
            );
            if (latestGbElement && searchData.latest_gb_content) {
                latestGbElement.innerText = searchData.latest_gb_content;
            }

            //프로필사진 업데이트  tk 수정 *********
            const profilePhoto = document.getElementById("profile-photo");
            profilePhoto.innerHTML = searchData.profileImgUrl
                ? `<img src="${searchData.profileImgUrl}" alt="프로필 사진" style="width:100%; height:100%; object-fit:cover; border-radius:5px;">`
                : `🌬️`;

            // 부가 기능 로드
            //최근방문자들
            if (typeof loadRecentVisitors === "function") loadRecentVisitors();
            //일촌체크
            if (typeof checkFriendStatus === "function") checkFriendStatus(id);
           //상태메세지 수정 권한 체크
            if (typeof checkStatusPermission === "function") checkStatusPermission(id);
        })
        .catch((error) => console.error("파도타기 데이터 로드 실패:", error));
}
//today 누적 함수
function updateHitCount() {
    const savedOwnerPk = sessionStorage.getItem("currentHostId");
    const targetOwnerPk = savedOwnerPk ? savedOwnerPk : loginUserId;
    if (!targetOwnerPk) return;
    //new Date().getTime()은 1970년 1월 1일을 기준으로 지금 이 순간까지 흘러온 시간을 밀리초(1000분의 1초) 단위로 계산한 숫자입니다.
    // 예: 1710554496123
    // 특징: 시간이 계속 흐르고 있으므로, 이 코드를 실행할 때마다 무조건 100% 다른 숫자(고유한 난수)가 나옵니다.
    //브라우저(크롬, 사파리 등)는 아주 똑똑하면서도 꽤나 '게으른' 녀석입니다. 효율성을 엄청나게 따지죠.
    // 만약 자바스크립트가 서버에 똑같은 주소로 데이터를 달라고 요청하면 브라우저는 이렇게 행동합니다.
    // 브라우저: "어? 자바스크립트가 /visitor?reqType=hitCount 주소로 조회수 달라고 하네? 근데 이거 내가 5분 전에 서버에서 받아온 거랑 주소가 똑같잖아? 서버까지 가기 귀찮으니까 그냥 내가 아까 저장(Cache)해 둔 옛날 조회수 데이터 줘야겠다!"
    // 이걸 **캐싱(Caching)**이라고 합니다. 이미지나 변하지 않는 파일에는 좋지만, 조회수, 실시간 댓글, 다이어리 글처럼 매번 새로운 데이터가 필요한 상황에서는 치명적인 버그(새로고침을 해도 옛날 글이 보이는 현상)를 만듭니다.
    // 그래서 우리는 방금 만든 '무조건 변하는 시간 숫자'를 주소표 뒤에 몰래 붙여버립니다.
    const noCache = new Date().getTime();
    fetch(`/visitor?reqType=hitCount&ownerPk=${targetOwnerPk}&t=${noCache}`)
        .then((res) => {
            if (!res.ok) throw new Error("서버 에러");
            return res.json();
        })
        .then((data) => {
            //받은값을 넣어줌 ! today, total
            const todayEl = document.getElementById("v-today");
            const totalEl = document.getElementById("v-total");
            if (todayEl) todayEl.innerText = data.today;
            if (totalEl) totalEl.innerText = data.total;
        })
        .catch((err) => console.error("조회수 갱신 실패:", err));
}



