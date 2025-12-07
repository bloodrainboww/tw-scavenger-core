// ==========================================
//  TW SCAVENGER SAFE CORE
//  Input doldurur - Asla gönderme yapmaz
//  Paneli bozmaz - Gri yapmaz
//  Enter ile gönderme YOK
// ==========================================

(function () {

    if (window.SCAVENGER_CORE_LOADED) {
        UI.InfoMessage("Scavenger Core zaten açık ✅");
        return;
    }
    window.SCAVENGER_CORE_LOADED = true;

    console.log("✅ Scavenger Safe Core Yüklendi");

    // ============================
    // 1) TwCheese ASS yükle
    // ============================
    var s = document.createElement("script");
    s.src = "https://cheesasaurus.github.io/twcheese/launch/ASS.js?" + Date.now();
    document.body.appendChild(s);

    // ============================
    // 2) Otomatik gönderimleri KİLİTLE
    // ============================
    var blocker = setInterval(function () {
        try {

            // Free send butonlarını kilitle ama bozma
            document.querySelectorAll(".free_send_button").forEach(function (btn) {
                btn.onclick = function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    UI.ErrorMessage("❌ Otomatik gönderme bu sürümde KAPALI.\nSadece input doldurulur.");
                    return false;
                };
                btn.title = "Otomatik gönderme kapalı";
            });

            // Enter ile gönderme tamamen kapalı
            document.addEventListener("keydown", function (e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    UI.ErrorMessage("❌ Enter ile gönderme kapalı.\nSadece manuel gönderim.");
                    return false;
                }
            }, true);

        } catch (e) {}
    }, 500);

    // ============================
    // 3) Bilgi mesajı
    // ============================
    setTimeout(function () {
        UI.SuccessMessage("✅ Scavenger Safe Core Aktif (Gönderme Yok – Input Serbest)");
    }, 1500);

})();
