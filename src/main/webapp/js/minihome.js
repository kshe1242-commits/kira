document.addEventListener("DOMContentLoaded", function() {
    const iframe = document.getElementById("notebook-frame");

    // 메뉴 아이템과 탭들을 모두 선택
    const menuItems = document.querySelectorAll(".menu-item, .nb-tab");

    menuItems.forEach(item => {
        item.addEventListener("click", function() {
            // 1. 클릭한 메뉴의 data-src 값을 가져옴
            const targetUrl = this.getAttribute("data-src");

            if (targetUrl) {
                // 2. iframe의 주소를 해당 URL로 변경! (이때 화면이 바뀜)
                iframe.src = targetUrl;

                // 3. active 클래스 변경 (선택된 메뉴 색상 칠하기)
                menuItems.forEach(m => m.classList.remove("active"));
                this.classList.add("active");
            }
        });
    });
});