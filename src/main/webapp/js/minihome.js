function loadPage(url, tabEl) {
    document.getElementById('notebook-frame').src = url;
    document.querySelectorAll('.nb-tab').forEach(t => t.classList.remove('active'));
    if (tabEl) tabEl.classList.add('active');
}