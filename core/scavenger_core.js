// =====================================================
//  TW SCAVENGER SAFE CORE (ASS WRAPPER)
//  - Orijinal Another Scavenging Script (ASS) yüklenir
//  - Otomatik gönderme ve Enter ile gönderme KAPALI
//  - Saldırı / savunma butonlarına script tıklamaz
//  - Sadece ASS'in yaptığı input doldurma özellikleri kalır
// =====================================================

(function () {
    "use strict";

    // Aynı sekmede ikinci kez çalışmasın
    if (window.SCAVENGER_CORE_SAFE_LOADED) {
        try {
            if (window.UI && window.UI.InfoMessage) {
                window.UI.InfoMessage("Scavenger Safe Core zaten yüklü ✅");
            } else {
                console.log("Scavenger Safe Core zaten yüklü.");
            }
        } catch (e) {}
        return;
    }
    window.SCAVENGER_CORE_SAFE_LOADED = true;

    console.log("Scavenger Safe Core başlatılıyor...");

    // -------------------------------
    // 1) Orijinal ASS'i yükle
    // -------------------------------
    try {
        var s = document.createElement("script");
        s.src = "https://cheesasaurus.github.io/twcheese/launch/ASS.js?" + Date.now();
        s.onload = function () {
            console.log("TwCheese ASS yüklendi (Safe Core).");
        };
        s.onerror = function () {
            console.log("❌ TwCheese ASS yüklenemedi.");
            try {
                if (window.UI && UI.ErrorMessage) {
                    UI.ErrorMessage("❌ TwCheese ASS yüklenemedi.");
                } else {
                    alert("❌ TwCheese ASS yüklenemedi.");
                }
            } catch (e) {}
        };
        document.body.appendChild(s);
    } catch (e) {
        console.log("ASS yükleme hatası:", e);
    }

    // -------------------------------
    // 2) Gönderme ve Enter'ı KİLİTLE
    // -------------------------------
    function applySafety() {
        try {
            // a) Gönderme butonlarını kilitle
            var buttons = document.querySelectorAll(".free_send_button");
            buttons.forEach(function (btn) {
                if (btn.dataset.scavSafePatched === "1") return;

                btn.addEventListener(
                    "click",
                    function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                            if (window.UI && UI.ErrorMessage) {
                                UI.ErrorMessage(
                                    "❌ Otomatik gönderme bu sürümde DEVRE DIŞI.<br>" +
                                        "Script sadece asker sayılarını kutulara doldurur.<br>" +
                                        "Göndermek için butona kendin bas."
                                );
                            } else {
                                alert(
                                    "❌ Otomatik gönderme bu sürümde DEVRE DIŞI.\n" +
                                        "Script sadece asker sayılarını kutulara doldurur.\n" +
                                        "Göndermek için butona kendin bas."
                                );
                            }
                        } catch (err) {}
                        return false;
                    },
                    true // capture
                );

                // Görsel ipucu
                btn.style.filter = "grayscale(1)";
                btn.title = "Otomatik gönderme kapalı (Scavenger Safe Core)";
                btn.dataset.scavSafePatched = "1";
            });

            // b) Enter ile otomatik gönderimi engelle
            if (!window.SCAVENGER_ENTER_PATCHED) {
                window.SCAVENGER_ENTER_PATCHED = true;
                document.addEventListener(
                    "keydown",
                    function (e) {
                        if (e.key === "Enter") {
                            // Sadece TwCheese/Temizleme ekranındayken kilitleyelim
                            if (location.href.indexOf("mode=scavenge") !== -1) {
                                e.preventDefault();
                                e.stopPropagation();
                                try {
                                    if (window.UI && UI.ErrorMessage) {
                                        UI.ErrorMessage(
                                            "❌ Enter ile gönderme kapalı.<br>" +
                                                "Gönderim için butona kendin basmalısın."
                                        );
                                    } else {
                                        alert(
                                            "❌ Enter ile gönderme kapalı.\n" +
                                                "Gönderim için butona kendin basmalısın."
                                        );
                                    }
                                } catch (err) {}
                                return false;
                            }
                        }
                    },
                    true
                );
            }
        } catch (e) {
            console.log("Safety patch hatası:", e);
        }
    }

    // ASS ve sayfa dinamik olduğu için, safety patch'i birkaç kez deniyoruz
    var tries = 0;
    var maxTries = 30; // ~15 saniye
    var safetyInterval = setInterval(function () {
        applySafety();
        tries++;
        if (tries >= maxTries) {
            clearInterval(safetyInterval);
        }
    }, 500);
})();
