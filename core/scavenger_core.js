// =====================================================
//  TW SCAVENGER SAFE CORE + PANEL v3.1
//  - Orijinal Another Scavenging Script (ASS) yüklenir
//  - Otomatik gönderme ve Enter ile gönderme KAPALI
//  - Saldırı / savunma butonlarına script TIKLAMIYOR
//  - Sadece ASS'in input doldurma özellikleri kalır
//  - Temizleme ekranında sağ üstte gri, modern bir
//    "Temizleme Paneli" açılır (bizim panelimiz).
// =====================================================

(function () {
    "use strict";

    // Aynı sekmede ikinci kez çalışmasın
    if (window.SCAVENGER_CORE_SAFE_LOADED) {
        try {
            if (window.UI && window.UI.InfoMessage) {
                UI.InfoMessage("Scavenger Safe Core zaten yüklü ✅");
            } else {
                console.log("Scavenger Safe Core zaten yüklü.");
            }
        } catch (e) {}
        return;
    }
    window.SCAVENGER_CORE_SAFE_LOADED = true;

    console.log("Scavenger Safe Core + Panel v3.1 başlatılıyor...");

    // Yardımcı: şu an temizleme ekranında mıyız?
    function isScavengeScreen() {
        var href = location.href;
        return href.indexOf("screen=place") !== -1 && href.indexOf("mode=scavenge") !== -1;
    }

    // -------------------------------
    // 1) Orijinal ASS'i yükle
    // -------------------------------
    try {
        var s = document.createElement("script");
        s.src = "https://cheesasaurus.github.io/twcheese/launch/ASS.js?" + Date.now();
        s.onload = function () {
            console.log("TwCheese ASS yüklendi (Safe Core).");

            // ASS yüklendikten kısa süre sonra paneli kur
            if (isScavengeScreen()) {
                setTimeout(createScavengerPanel, 800);
            }
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
                                    "❌ Otomatik gönderme bu çekirdekte DEVRE DIŞI.<br>" +
                                        "Script sadece asker sayılarını kutulara doldurur.<br>" +
                                        "Göndermek için butona kendin bas."
                                );
                            } else {
                                alert(
                                    "❌ Otomatik gönderme bu çekirdekte DEVRE DIŞI.\n" +
                                        "Script sadece asker sayılarını kutulara doldurur.\n" +
                                        "Göndermek için butona kendin bas."
                                );
                            }
                        } catch (err) {}
                        return false;
                    },
                    true // capture
                );

                // Görsel ipucu (hafif gri ton)
                btn.style.filter = "grayscale(1)";
                btn.style.cursor = "not-allowed";
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
                            // Sadece temizleme ekranında iken enter kilidi
                            if (isScavengeScreen()) {
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

    // =====================================================
    // 3) ÖZEL TEMİZLEME PANELİ (bizim gri panel)
    // =====================================================

    function createScavengerPanel() {
        try {
            if (!isScavengeScreen()) return;
            if (document.getElementById("tw-scav-panel")) return;

            var panel = document.createElement("div");
            panel.id = "tw-scav-panel";

            // Panel konum & görünüm
            panel.style.position = "fixed";
            panel.style.top = "80px";
            panel.style.right = "20px";
            panel.style.background = "#333333";
            panel.style.border = "1px solid #555";
            panel.style.borderRadius = "10px";
            panel.style.padding = "10px 12px";
            panel.style.zIndex = "99999";
            panel.style.color = "#f1f1f1";
            panel.style.fontFamily = "Verdana,Arial,sans-serif";
            panel.style.fontSize = "11px";
            panel.style.width = "280px";
            panel.style.boxShadow = "0 0 10px rgba(0,0,0,0.6)";

            // Icon base
            var imgBase = window.image_base || "";
            function unitIcon(u) {
                if (!imgBase) return "";
                return (
                    '<span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:4px;background:#262626;margin-right:3px;">' +
                    '<img src="' +
                    imgBase +
                    "unit/unit_" +
                    u +
                    '.png" style="width:16px;height:16px;display:block;">' +
                    "</span>"
                );
            }

            panel.innerHTML =
                // Başlık
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">' +
                    '<div style="font-weight:bold;font-size:12px;">Temizleme Paneli</div>' +
                    '<button id="tw-scav-close" ' +
                        'style="background:none;border:none;color:#aaa;font-size:13px;cursor:pointer;">✕</button>' +
                "</div>" +

                // Bilgi
                '<div style="font-size:10px;line-height:1.4;margin-bottom:6px;color:#d9d9d9;">' +
                    "<b>Not:</b> Otomatik gönderme ve Enter ile gönderme <b style='color:#ff8080;'>KAPALI</b>.<br>" +
                    "Bu panel şimdilik sadece <b>seçim ve görünüm</b> içindir, ASS hesaplama işini yapmaya devam eder." +
                "</div>" +

                // Süre alanı
                '<div style="margin-bottom:6px;padding:6px;border-radius:6px;background:#3a3a3a;text-align:center;">' +
                    '<div style="font-size:10px;margin-bottom:3px;color:#e0e0e0;">Hedef Süre (ileride kullanılacak):</div>' +
                    '<input type="text" id="tw-scav-target-time" value="02:00" ' +
                        'style="width:70px;text-align:center;font-size:11px;border-radius:4px;' +
                               'border:1px solid #555;background:#222;color:#eee;margin-bottom:3px;">' +
                    "<div style='font-size:9px;color:#bfbfbf;'>sa:dk formatında örn: 01:30</div>" +
                "</div>" +

                // Birim seçimi (2 kolon, ikon + isim + tik)
                '<div style="margin-bottom:6px;padding:6px;border-radius:6px;background:#3a3a3a;">' +
                    '<div style="font-size:10px;margin-bottom:3px;color:#e0e0e0;">Kullanılacak Birimler:</div>' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;column-gap:8px;row-gap:4px;">' +

                        // Sol sütun
                        '<label style="display:flex;align-items:center;gap:4px;">' +
                            '<input type="checkbox" checked data-unit="spear" style="margin:0;">' +
                            unitIcon("spear") +
                            "<span>Mızrakçı</span>" +
                        "</label>" +

                        '<label style="display:flex;align-items:center;gap:4px;">' +
                            '<input type="checkbox" checked data-unit="sword" style="margin:0;">' +
                            unitIcon("sword") +
                            "<span>Kılıç</span>" +
                        "</label>" +

                        '<label style="display:flex;align-items:center;gap:4px;">' +
                            '<input type="checkbox" checked data-unit="axe" style="margin:0;">' +
                            unitIcon("axe") +
                            "<span>Balta</span>" +
                        "</label>" +

                        '<label style="display:flex;align-items:center;gap:4px;">' +
                            '<input type="checkbox" checked data-unit="archer" style="margin:0;">' +
                            unitIcon("archer") +
                            "<span>Okçu</span>" +
                        "</label>" +

                        '<label style="display:flex;align-items:center;gap:4px;">' +
                            '<input type="checkbox" checked data-unit="light" style="margin:0;">' +
                            unitIcon("light") +
                            "<span>Hafif Atlı</span>" +
                        "</label>" +

                        '<label style="display:flex;align-items:center;gap:4px;">' +
                            '<input type="checkbox" checked data-unit="marcher" style="margin:0;">' +
                            unitIcon("marcher") +
                            "<span>Atlı Okçu</span>" +
                        "</label>" +

                        '<label style="display:flex;align-items:center;gap:4px;">' +
                            '<input type="checkbox" checked data-unit="heavy" style="margin:0;">' +
                            unitIcon("heavy") +
                            "<span>Ağır Atlı</span>" +
                        "</label>" +

                        '<label style="display:flex;align-items:center;gap:4px;">' +
                            '<input type="checkbox" checked data-unit="knight" style="margin:0;">' +
                            unitIcon("knight") +
                            "<span>Şövalye</span>" +
                        "</label>" +

                    "</div>" +
                    '<div style="font-size:9px;color:#bfbfbf;margin-top:4px;">' +
                        "Seçimler şimdilik görsel, ileride dağıtım mantığına bağlanacak." +
                    "</div>" +
                "</div>" +

                // TwCheese preferences kısayolu
                '<button id="tw-scav-open-ass-prefs" ' +
                    'style="width:100%;padding:6px 0;border-radius:6px;border:1px solid #888;' +
                           'background:#444;color:#f1f1f1;font-size:11px;cursor:pointer;">' +
                    "TwCheese Tercihlerini Aç" +
                "</button>" +

                // İmza
                '<div style="font-size:9px;opacity:0.7;text-align:right;margin-top:6px;color:#c8c8c8;">' +
                    "BloodRainBoww × ChatGPT" +
                "</div>";

            document.body.appendChild(panel);

            // Kapatma
            var closeBtn = document.getElementById("tw-scav-close");
            if (closeBtn) {
                closeBtn.addEventListener("click", function () {
                    panel.style.display = "none";
                });
            }

            // TwCheese preferences açma (sadece linke tıklar, kendi paneline dokunmuyoruz)
            var openPrefsBtn = document.getElementById("tw-scav-open-ass-prefs");
            if (openPrefsBtn) {
                openPrefsBtn.addEventListener("click", function () {
                    try {
                        var links = document.querySelectorAll("#content_value h3 a, h3 a");
                        var found = false;
                        links.forEach(function (a) {
                            var txt = (a.textContent || "").toLowerCase();
                            if (txt.indexOf("preferences") !== -1 || txt.indexOf("tercihler") !== -1) {
                                a.click();
                                found = true;
                            }
                        });
                        if (!found) {
                            alert("TwCheese tercih bağlantısı bulunamadı. Yine de ASS paneli aktif olmalı.");
                        }
                    } catch (e) {
                        alert("Tercihler açılırken bir hata oluştu.");
                    }
                });
            }

        } catch (e) {
            console.log("Scavenger panel oluşturulurken hata:", e);
        }
    }

})();
