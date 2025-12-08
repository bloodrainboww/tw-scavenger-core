// =====================================================
//  TW SCAVENGER CORE v3.0 (SAFE + ÖZEL PANEL)
//  - TwCheese ASS yüklenir (hesaplama, dağıtım ondan)
//  - Otomatik gönderme YOK, Enter ile gönderme YOK
//  - Temizleme ekranına otomatik yönlendirir
//  - Sağ üstte bize ait gri bir "Temizleme Paneli" açar
//    (şimdilik tasarım + temel kontroller, ileride işlev ekleyeceğiz)
// =====================================================

(function () {
    "use strict";

    // Aynı sekmede ikinci kez çalışmasın
    if (window.SCAVENGER_CORE_LOADED) {
        try {
            if (window.UI && window.UI.InfoMessage) {
                window.UI.InfoMessage("Scavenger çekirdeği zaten aktif ✅");
            } else {
                console.log("Scavenger core zaten yüklü.");
            }
        } catch (e) {}
        return;
    }
    window.SCAVENGER_CORE_LOADED = true;
    console.log("Scavenger Core v3.0 başlatılıyor...");

    // ---------------------------------------
    // 1. Temizleme ekranına otomatik git
    // ---------------------------------------
    function goToScavengeScreen() {
        var href = window.location.href;
        if (href.indexOf("screen=place") !== -1 && href.indexOf("mode=scavenge") !== -1) {
            return; // zaten temizleme ekranındayız
        }
        var m = href.match(/village=(\d+)/);
        var villageId = m ? m[1] : null;
        if (!villageId) {
            alert("Köy ID'si bulunamadı. Lütfen İçtima Meydanı > Temizlik ekranına elle gir.");
            return;
        }
        var target =
            "/game.php?village=" +
            villageId +
            "&screen=place&mode=scavenge&scav_core_start=1";
        window.location.href = target;
    }

    goToScavengeScreen();

    // Temizlik ekranındaysak ASS'i yükle
    if (location.href.indexOf("mode=scavenge") !== -1) {
        setTimeout(function () {
            loadASSAndInit();
        }, 400);
    }

    // ---------------------------------------
    // 2. Orijinal ASS'i yükle
    // ---------------------------------------
    function loadASSAndInit() {
        if (window.TwCheese && window.TwCheese.tools && window.TwCheese.tools.ASS) {
            console.log("TwCheese ASS zaten yüklü, patch + panel uygulanıyor.");
            setTimeout(afterAssReady, 800);
            return;
        }

        console.log("TwCheese ASS yükleniyor...");
        var s = document.createElement("script");
        s.src = "https://cheesasaurus.github.io/twcheese/launch/ASS.js?" + Date.now();
        s.onload = function () {
            console.log("TwCheese ASS yüklendi.");
            setTimeout(afterAssReady, 1000);
        };
        s.onerror = function () {
            alert("❌ TwCheese ASS yüklenemedi (Github erişimi?).");
        };
        document.body.appendChild(s);
    }

    function afterAssReady() {
        installSafetyPatches();
        createCustomPanel();
        showStartupMessage();
    }

    // ---------------------------------------
    // 3. Güvenlik: otomatik gönderme / Enter kilidi
    // ---------------------------------------
    function installSafetyPatches() {
        // Tüm free_send_button'ları kilitle (görseli bozmadan)
        function patchButtonsOnce() {
            var btns = document.querySelectorAll(".free_send_button");
            btns.forEach(function (btn) {
                if (btn.dataset.scavSafePatched === "1") return;

                btn.addEventListener(
                    "click",
                    function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        alert(
                            "❌ Otomatik gönderme bu çekirdekte KAPALI.\n" +
                            "Script sadece asker sayılarını kutulara yerleştirir.\n" +
                            "Göndermek için temizleme butonuna kendin bas."
                        );
                        return false;
                    },
                    true
                );

                btn.style.filter = "grayscale(1)";
                btn.style.cursor = "not-allowed";
                btn.title = "Otomatik gönderme kapalı (Scavenger Core v3.0)";
                btn.dataset.scavSafePatched = "1";
            });
        }

        patchButtonsOnce();
        // Dinamik içerik için ara ara uygula
        setInterval(patchButtonsOnce, 1500);

        // Enter ile gönderme kilidi
        document.addEventListener(
            "keydown",
            function (e) {
                if (e.key === "Enter") {
                    var active = document.activeElement;
                    // Tercihler popup'ında form doldururken enter serbest
                    var insidePrefs =
                        active &&
                        active.closest &&
                        active.closest("#twcheese-scavenge-preferences-popup");
                    if (insidePrefs) return;

                    e.preventDefault();
                    e.stopPropagation();
                    alert(
                        "❌ Enter ile otomatik gönderme kapalı.\n" +
                        "Göndermek için temizleme butonlarını kullan."
                    );
                    return false;
                }
            },
            true
        );
    }

    // ---------------------------------------
    // 4. ÖZEL TEMİZLEME PANELİ (tasarım)
    // ---------------------------------------
    function createCustomPanel() {
        try {
            if (document.getElementById("tw-scav-panel")) return;

            var panel = document.createElement("div");
            panel.id = "tw-scav-panel";

            // Panel konum & stil
            panel.style.position = "fixed";
            panel.style.top = "80px";
            panel.style.right = "20px";
            panel.style.background = "#2b2b2b";
            panel.style.border = "1px solid #555";
            panel.style.borderRadius = "10px";
            panel.style.padding = "10px 12px";
            panel.style.zIndex = "99999";
            panel.style.color = "#f1f1f1";
            panel.style.fontFamily = "Verdana,Arial,sans-serif";
            panel.style.fontSize = "11px";
            panel.style.width = "260px";
            panel.style.boxShadow = "0 0 10px rgba(0,0,0,0.6)";

            // Unit icon base
            var imgBase = window.image_base || "";
            function unitIcon(u) {
                return imgBase
                    ? '<img src="' +
                          imgBase +
                          "unit/unit_" +
                          u +
                          '.png" style="width:16px;height:16px;vertical-align:middle;margin-right:3px;">'
                    : "";
            }

            panel.innerHTML =
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">' +
                    '<div style="font-weight:bold;font-size:12px;">Temizleme Paneli (Core)</div>' +
                    '<button id="tw-scav-close" style="background:none;border:none;color:#aaa;font-size:13px;cursor:pointer;">✕</button>' +
                "</div>" +
                '<div style="font-size:10px;line-height:1.4;margin-bottom:6px;color:#d9d9d9;">' +
                    "<b>Not:</b> Otomatik gönderme <b style='color:#ff8080;'>KAPALI</b>. Script sadece asker kutularını doldurur." +
                "</div>" +
                '<div style="margin-bottom:6px;padding:5px;border-radius:6px;background:#3a3a3a;">' +
                    '<div style="font-size:10px;margin-bottom:3px;color:#e0e0e0;">Kullanılacak Birimler (şimdilik sadece görünüm):</div>' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;row-gap:3px;column-gap:6px;font-size:10px;">' +
                        '<label style="display:flex;align-items:center;gap:3px;">' +
                            '<input type="checkbox" checked data-unit="spear" style="margin:0;">' +
                            unitIcon("spear") +
                            "<span>Mızrakçı</span>" +
                        "</label>" +
                        '<label style="display:flex;align-items:center;gap:3px;">' +
                            '<input type="checkbox" checked data-unit="sword" style="margin:0;">' +
                            unitIcon("sword") +
                            "<span>Kılıç</span>" +
                        "</label>" +
                        '<label style="display:flex;align-items:center;gap:3px;">' +
                            '<input type="checkbox" checked data-unit="axe" style="margin:0;">' +
                            unitIcon("axe") +
                            "<span>Balta</span>" +
                        "</label>" +
                        '<label style="display:flex;align-items:center;gap:3px;">' +
                            '<input type="checkbox" checked data-unit="archer" style="margin:0;">' +
                            unitIcon("archer") +
                            "<span>Okçu</span>" +
                        "</label>" +
                        '<label style="display:flex;align-items:center;gap:3px;">' +
                            '<input type="checkbox" checked data-unit="light" style="margin:0;">' +
                            unitIcon("light") +
                            "<span>Hafif Atlı</span>" +
                        "</label>" +
                        '<label style="display:flex;align-items:center;gap:3px;">' +
                            '<input type="checkbox" checked data-unit="marcher" style="margin:0;">' +
                            unitIcon("marcher") +
                            "<span>Atlı Okçu</span>" +
                        "</label>" +
                        '<label style="display:flex;align-items:center;gap:3px;">' +
                            '<input type="checkbox" checked data-unit="heavy" style="margin:0;">' +
                            unitIcon("heavy") +
                            "<span>Ağır Atlı</span>" +
                        "</label>" +
                        '<label style="display:flex;align-items:center;gap:3px;">' +
                            '<input type="checkbox" checked data-unit="knight" style="margin:0;">' +
                            unitIcon("knight") +
                            "<span>Şövalye</span>" +
                        "</label>" +
                    "</div>" +
                "</div>" +
                '<div style="margin-bottom:6px;padding:5px;border-radius:6px;background:#3a3a3a;">' +
                    '<div style="font-size:10px;margin-bottom:3px;color:#e0e0e0;">Hedef Süre (ileride):</div>' +
                    '<input type="text" id="tw-scav-target-time" value="02:00" ' +
                        'style="width:60px;text-align:center;font-size:11px;border-radius:4px;border:1px solid #555;background:#222;color:#eee;">' +
                    "<span style='font-size:10px;margin-left:4px;color:#ccc;'>sa:dk</span>" +
                "</div>" +
                '<button id="tw-scav-open-ass-prefs" ' +
                    'style="width:100%;padding:5px 0;border-radius:6px;border:1px solid #888;background:#444;color:#f1f1f1;font-size:11px;cursor:pointer;">' +
                    "TwCheese Tercihlerini Aç" +
                "</button>" +
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

            // TwCheese preferences açma (sadece linke tıklar)
            var openPrefsBtn = document.getElementById("tw-scav-open-ass-prefs");
            if (openPrefsBtn) {
                openPrefsBtn.addEventListener("click", function () {
                    try {
                        // Başlıktaki "preferences" linkine tıkla
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
            console.log("Custom panel oluşturulurken hata:", e);
        }
    }

    // ---------------------------------------
    // 5. Başlangıçta bilgi mesajı
    // ---------------------------------------
    function showStartupMessage() {
        try {
            if (window.UI && window.UI.SuccessMessage) {
                window.UI.SuccessMessage(
                    "✅ Scavenger Core v3.0 aktif.<br>" +
                    "Otomatik gönderme ve Enter ile gönderme kapalı.<br>" +
                    "TwCheese ASS hesaplama yapar, script sadece input doldurur."
                );
            } else {
                console.log("Scavenger Core v3.0 aktif (safe mode).");
            }
        } catch (e) {}
    }
})();
