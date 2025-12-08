// =====================================================
//  KLANLAR TEMİZLEME ÇEKİRDEĞİ  v2.1 (VANILLA UI FIX)
//  - TwCheese ASS çekirdeğini yükler
//  - Otomatik gönderme / Enter ile gönderme KAPALI
//  - Başlık: "» preferences" -> "» Tercihler"
//  - "Script created by cheesasaurus" kaldırılır
//  - Tercihler popup'ında:
//        * Order bölümü kaldırılır
//        * Use / Reserved kalır
//        * Birim simgeleri yanına Türkçe isim eklenir
// =====================================================

(function () {
    "use strict";

    if (window.SCAVENGER_CORE_V21_LOADED) {
        try {
            if (window.UI && window.UI.InfoMessage) {
                window.UI.InfoMessage("Scavenger çekirdeği v2.1 zaten yüklü ✅");
            } else {
                console.log("Scavenger core v2.1 already loaded.");
            }
        } catch (e) {}
        return;
    }
    window.SCAVENGER_CORE_V21_LOADED = true;

    console.log("Scavenger core v2.1 başlatılıyor...");

    // ---------------------------------------
    // 1. Temizleme ekranına otomatik git
    // ---------------------------------------
    function goToScavengeScreen() {
        var href = window.location.href;
        if (href.indexOf("screen=place") !== -1 && href.indexOf("mode=scavenge") !== -1) {
            return;
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

    // Başka ekrandaysak önce yönlendir
    goToScavengeScreen();

    // Temizlik ekranındaysak ASS'i yükle
    if (location.href.indexOf("mode=scavenge") !== -1) {
        setTimeout(function () {
            loadASSAndPatch();
        }, 400);
    }

    // ---------------------------------------
    // 2. Orijinal ASS'i yükle + güvenlik + UI
    // ---------------------------------------
    function loadASSAndPatch() {
        if (window.TwCheese && window.TwCheese.tools && window.TwCheese.tools.ASS) {
            console.log("TwCheese ASS zaten yüklü; patch uygulanıyor.");
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
        startHeaderInterval();
        startPrefsInterval();
        showInfoPanel();
        showStartupMessage();
    }

    // ---------------------------------------
    // 3. Otomatik gönderme / Enter kilidi
    // ---------------------------------------
    function installSafetyPatches() {
        function patchButtonsOnce() {
            var buttons = document.querySelectorAll(".free_send_button");
            buttons.forEach(function (btn) {
                if (btn.dataset.scavSafePatched === "1") return;

                btn.addEventListener(
                    "click",
                    function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        alert(
                            "❌ Otomatik gönderme bu sürümde KAPALI.\n" +
                            "Script sadece asker sayılarını input kutularına yazar.\n" +
                            "Göndermek için temizleme butonuna kendin bas."
                        );
                        return false;
                    },
                    true
                );

                btn.style.filter = "grayscale(1)";
                btn.style.cursor = "not-allowed";
                btn.title = "Otomatik gönderme kapalı (Scavenger v2.1)";
                btn.dataset.scavSafePatched = "1";
            });
        }

        patchButtonsOnce();
        setInterval(patchButtonsOnce, 1500);

        document.addEventListener(
            "keydown",
            function (e) {
                if (e.key === "Enter") {
                    var active = document.activeElement;
                    var insidePrefs =
                        active &&
                        active.closest &&
                        active.closest("#twcheese-scavenge-preferences-popup");
                    if (insidePrefs) return;

                    e.preventDefault();
                    e.stopPropagation();
                    alert(
                        "❌ Enter ile otomatik gönderme devre dışı.\n" +
                        "Göndermek için temizleme butonlarını kullan."
                    );
                    return false;
                }
            },
            true
        );
    }

    // ---------------------------------------
    // 4. Başlıkta TR'ye çevirme / imzayı silme
    // ---------------------------------------
    function tweakHeaderDom() {
        try {
            var h3s = document.querySelectorAll("#content_value h3, #contentContainer h3, h3");
            if (!h3s.length) return;

            h3s.forEach(function (h3) {
                if (h3.dataset.scavHeaderDone === "1") return;

                // preferences linkini bul
                var links = h3.querySelectorAll("a");
                links.forEach(function (a) {
                    var txt = (a.textContent || "").toLowerCase();
                    if (txt.indexOf("preferences") !== -1) {
                        a.textContent = "» Tercihler";
                    }
                });

                // script created by yazısını kaldır
                var spans = h3.querySelectorAll("span");
                spans.forEach(function (sp) {
                    var t = (sp.textContent || "").toLowerCase();
                    if (t.indexOf("script created by") !== -1 || t.indexOf("cheesasaurus") !== -1) {
                        sp.remove();
                    }
                });

                h3.dataset.scavHeaderDone = "1";
            });
        } catch (e) {
            console.log("Header tweak hatası:", e);
        }
    }

    function startHeaderInterval() {
        tweakHeaderDom();
        var tries = 0;
        var maxTries = 40; // ~20 sn
        var id = setInterval(function () {
            tweakHeaderDom();
            tries++;
            if (tries >= maxTries) clearInterval(id);
        }, 500);
    }

    // ---------------------------------------
    // 5. Prefs popup: Order kaldır + isim ekle
    // ---------------------------------------
    var UNIT_NAMES_TR = {
        spear: "Mızrakçı",
        sword: "Kılıç",
        axe: "Balta",
        archer: "Okçu",
        spy: "Casus",
        light: "Hafif Atlı",
        marcher: "Atlı Okçu",
        heavy: "Ağır Atlı",
        knight: "Şövalye",
        ram: "Koçbaşı",
        catapult: "Mancınık",
        snob: "Asil",
        militia: "Milis"
    };

    function tweakPrefsDom() {
        try {
            var popup = document.getElementById("twcheese-scavenge-preferences-popup");
            if (!popup) return;

            // Order bölümünü kaldır
            var orderSections = popup.querySelectorAll(".troop-order-section");
            orderSections.forEach(function (tbl) {
                var td = tbl.closest("td");
                if (td) td.remove();
            });

            // Birim isimlerini ekle
            var troopSectionTables = popup.querySelectorAll(".troops-section");
            troopSectionTables.forEach(function (tbl) {
                var imgs = tbl.querySelectorAll("img[src*='unit_']");
                imgs.forEach(function (img) {
                    if (img.nextElementSibling && img.nextElementSibling.classList.contains("scav-unit-name")) {
                        return; // zaten eklenmiş
                    }
                    var src = img.getAttribute("src") || "";
                    var m = src.match(/unit_([a-zA-Z0-9_]+)\.png/);
                    var key = m ? m[1] : null;
                    if (!key) return;
                    var name = UNIT_NAMES_TR[key];
                    if (!name) return;
                    var span = document.createElement("span");
                    span.className = "scav-unit-name";
                    span.textContent = " " + name;
                    span.style.marginLeft = "4px";
                    span.style.fontSize = "11px";
                    span.style.color = "#2b1a07";
                    img.insertAdjacentElement("afterend", span);
                });
            });
        } catch (e) {
            console.log("Prefs tweak hatası:", e);
        }
    }

    function startPrefsInterval() {
        tweakPrefsDom();
        var tries = 0;
        var maxTries = 80; // ~40 sn
        var id = setInterval(function () {
            tweakPrefsDom();
            tries++;
            if (tries >= maxTries) clearInterval(id);
        }, 500);
    }

    // ---------------------------------------
    // 6. Sağ altta küçük bilgi paneli
    // ---------------------------------------
    function showInfoPanel() {
        try {
            if (document.getElementById("scav-safe-panel")) return;

            var panel = document.createElement("div");
            panel.id = "scav-safe-panel";
            panel.style.position = "fixed";
            panel.style.right = "20px";
            panel.style.bottom = "20px";
            panel.style.background = "rgba(20,20,20,0.94)";
            panel.style.border = "1px solid #555";
            panel.style.borderRadius = "8px";
            panel.style.padding = "8px 10px";
            panel.style.fontSize = "11px";
            panel.style.color = "#eee";
            panel.style.zIndex = "99999";
            panel.style.maxWidth = "240px";
            panel.style.boxShadow = "0 0 8px rgba(0,0,0,0.6)";
            panel.style.fontFamily = "Verdana,Arial,sans-serif";

            panel.innerHTML =
                '<div style="font-weight:bold;font-size:12px;margin-bottom:4px;color:#ffd077;">' +
                'Temizleme Çekirdeği v2.1' +
                "</div>" +
                '<div style="line-height:1.4;margin-bottom:4px;">' +
                '<span style="color:#7cff7c;">•</span> Otomatik <b>Gönderme</b>: <b style="color:#ff8080;">KAPALI</b><br/>' +
                '<span style="color:#7cff7c;">•</span> <b>Enter</b> ile gönderme: <b style="color:#ff8080;">KAPALI</b><br/>' +
                '<span style="color:#7cff7c;">•</span> Script sadece <b>asker kutularını doldurur</b>.' +
                "</div>" +
                '<div style="font-size:10px;opacity:0.7;text-align:right;margin-top:3px;">' +
                "BloodRainBoww × ChatGPT" +
                "</div>";

            document.body.appendChild(panel);
        } catch (e) {
            console.log("Info panel hatası:", e);
        }
    }

    function showStartupMessage() {
        try {
            if (window.UI && window.UI.SuccessMessage) {
                UI.SuccessMessage(
                    "✅ Scavenger çekirdeği v2.1 aktif.<br>" +
                    "Otomatik gönderme ve Enter ile gönderme devre dışı.<br>" +
                    "Script sadece temizleme inputlarını doldurur."
                );
            } else {
                console.log("Scavenger core v2.1 aktif (güvenli mod).");
            }
        } catch (e) {}
    }
})();
