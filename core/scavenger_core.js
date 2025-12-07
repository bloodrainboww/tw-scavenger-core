// ==========================================
//  TW SCAVENGER SAFE CORE v2.0
//  - TwCheese ASS altyapısı
//  - Sadece input doldurur, GÖNDERMEZ
//  - Enter ile gönderme yok
//  - Küçük "Safe Mod" paneli
// ==========================================

(function () {
    "use strict";

    // Aynı sekmede ikinci kez çalışmasını engelle
    if (window.SCAVENGER_CORE_LOADED) {
        try {
            if (window.UI && UI.InfoMessage) {
                UI.InfoMessage("Scavenger Safe Core zaten aktif ✅");
            } else {
                console.log("Scavenger Safe Core zaten aktif ✅");
            }
        } catch (e) {}
        return;
    }
    window.SCAVENGER_CORE_LOADED = true;

    console.log("✅ Scavenger Safe Core başlatılıyor...");

    // ============================
    // 1) TwCheese ASS yükle
    // ============================
    (function loadAss() {
        try {
            var s = document.createElement("script");
            s.src = "https://cheesasaurus.github.io/twcheese/launch/ASS.js?" + Date.now();
            s.onload = function () {
                console.log("✅ TwCheese ASS yüklendi (launch/ASS.js).");
            };
            s.onerror = function () {
                console.log("❌ TwCheese ASS yüklenemedi.");
                try {
                    if (window.UI && UI.ErrorMessage) {
                        UI.ErrorMessage("❌ TwCheese ASS yüklenemedi.");
                    }
                } catch (e) {}
            };
            document.body.appendChild(s);
        } catch (e) {
            console.log("ASS yükleme hatası:", e);
        }
    })();

    // ============================
    // 2) Güvenlik Freni:
    //    - free_send_button clicklerini kes
    //    - Enter ile otomatik gönderimi engelle
    // ============================
    function applySafetyPatch() {
        try {
            // Gönderme butonlarını KİLİTLE (ama görünüşlerini bozma)
            var sendButtons = document.querySelectorAll(".free_send_button");
            sendButtons.forEach(function (btn) {
                // Capture fazında olayı yakala ve bitir
                btn.addEventListener(
                    "click",
                    function (e) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        try {
                            if (window.UI && UI.ErrorMessage) {
                                UI.ErrorMessage(
                                    "❌ Otomatik gönderme bu sürümde KAPALI.<br/>" +
                                    "Script sadece askerleri kutulara yerleştirir.<br/>" +
                                    "Göndermek için butona kendin basmalısın."
                                );
                            } else {
                                alert(
                                    "❌ Otomatik gönderme kapalı.\n" +
                                    "Script sadece askerleri kutulara yerleştirir.\n" +
                                    "Göndermek için butona kendin bas."
                                );
                            }
                        } catch (err) {}
                        return false;
                    },
                    true // capture
                );

                // Görseli bozma, sadece tooltip ekle
                btn.title = "Otomatik gönderme kapalı (Scavenger Safe Mod)";
            });

            // Enter ile gönderme / submit davranışını da engelle
            // Sadece içerik alanı / temizleme paneli civarında
            document.addEventListener(
                "keydown",
                function (e) {
                    if (e.key === "Enter") {
                        if (e.target && e.target.closest("#content_value, .scavenge-option")) {
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            try {
                                if (window.UI && UI.ErrorMessage) {
                                    UI.ErrorMessage(
                                        "❌ Enter ile otomatik gönderme KAPALI.<br/>" +
                                        "Göndermek için butona kendin bas."
                                    );
                                }
                            } catch (err) {}
                            return false;
                        }
                    }
                },
                true // capture
            );
        } catch (e) {
            console.log("Güvenlik yaması sırasında hata:", e);
        }
    }

    // Güvenlik frenini birkaç kez dene (sayfa dinamik olduğu için)
    (function scheduleSafetyPatch() {
        var tries = 0;
        var maxTries = 20; // ~10 saniye (500ms aralıkla)

        var intervalId = setInterval(function () {
            tries++;
            applySafetyPatch();
            if (tries >= maxTries) {
                clearInterval(intervalId);
            }
        }, 500);
    })();

    // ============================
    // 3) Küçük Safe Mod Paneli
    // ============================
    function createSafePanel() {
        try {
            if (document.getElementById("scav-safe-panel")) {
                return;
            }

            var panel = document.createElement("div");
            panel.id = "scav-safe-panel";
            panel.style.position = "fixed";
            panel.style.right = "20px";
            panel.style.bottom = "20px";
            panel.style.background = "rgba(20,20,20,0.92)";
            panel.style.border = "1px solid #555";
            panel.style.borderRadius = "8px";
            panel.style.padding = "8px 10px";
            panel.style.fontSize = "11px";
            panel.style.color = "#eee";
            panel.style.zIndex = "99999";
            panel.style.maxWidth = "230px";
            panel.style.boxShadow = "0 0 8px rgba(0,0,0,0.6)";
            panel.style.fontFamily = "Verdana,Arial,sans-serif";

            panel.innerHTML =
                '<div style="font-weight:bold; font-size:12px; margin-bottom:4px; color:#ffd077;">' +
                    'Temizleme Safe Mod v2.0' +
                "</div>" +
                '<div style="margin-bottom:4px; line-height:1.4;">' +
                    '<span style="color:#7cff7c;">•</span> Otomatik <b>Gönderme</b>: <b style="color:#ff8080;">KAPALI</b><br/>' +
                    '<span style="color:#7cff7c;">•</span> <b>Enter</b> ile gönderme: <b style="color:#ff8080;">KAPALI</b><br/>' +
                    '<span style="color:#7cff7c;">•</span> Script yalnızca <b>asker sayılarını doldurur</b>.' +
                "</div>" +
                '<div style="font-size:10px; opacity:0.7; margin-top:3px; text-align:right;">' +
                    "BloodRainBoww × ChatGPT" +
                "</div>";

            document.body.appendChild(panel);
        } catch (e) {
            console.log("Safe panel oluşturulurken hata:", e);
        }
    }

    // Paneli biraz gecikmeli oluştur (oyun arayüzü otursun)
    setTimeout(createSafePanel, 1500);

    // ============================
    // 4) İlk bilgi mesajı
    // ============================
    (function showStartupMessage() {
        try {
            if (window.UI && UI.SuccessMessage) {
                UI.SuccessMessage(
                    "✅ Scavenger Safe Core Aktif.<br/>" +
                    "Otomatik gönderme ve Enter ile gönderme KAPALI.<br/>" +
                    "Script sadece temizleme inputlarını doldurur."
                );
            } else {
                console.log(
                    "✅ Scavenger Safe Core aktif. Otomatik gönderme ve Enter ile gönderme kapalı."
                );
            }
        } catch (e) {}
    })();

})();
