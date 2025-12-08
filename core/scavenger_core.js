// =====================================================
//  KLANLAR TEMİZLEME ÇEKİRDEĞİ  v2.1
//  - Orijinal TwCheese ASS çekirdeği yüklenir
//  - Otomatik gönderme / Enter ile gönderme KAPALI
//  - "preferences" başlığı Türkçe
//  - "Script created by cheesasaurus" yazısı kaldırılır
//  - Tercihler penceresinde:
//        * Order (sıra) bölümü kaldırılır
//        * Use / Reserved kalır
//        * Birim simgelerinin yanına isimleri eklenir
// =====================================================

(function () {
    if (window.SCAVENGER_CORE_V21_LOADED) {
        if (window.UI && UI.InfoMessage) {
            UI.InfoMessage("Scavenger çekirdeği v2.1 zaten yüklü ✅");
        } else {
            console.log("Scavenger core v2.1 already loaded.");
        }
        return;
    }
    window.SCAVENGER_CORE_V21_LOADED = true;

    // -------------------------------
    // 1. Temizleme ekranına oto yönlendir
    // -------------------------------
    function goToScavengeScreen() {
        var href = window.location.href;
        if (href.indexOf("screen=place") !== -1 && href.indexOf("mode=scavenge") !== -1) {
            return; // zaten temizleme ekranındayız
        }

        var villageMatch = href.match(/village=(\d+)/);
        var villageId = villageMatch ? villageMatch[1] : null;
        if (!villageId) {
            alert("Köy ID'si bulunamadı, lütfen elle İçtima Meydanı > Temizlik ekranına gir.");
            return;
        }

        var target =
            "/game.php?village=" +
            villageId +
            "&screen=place&mode=scavenge&scav_core_start=1";
        window.location.href = target;
    }

    // Eğer başka ekrandaysak önce yönlendir
    goToScavengeScreen();

    // Redirect sonrası tekrar yüklendiğimizde (scav_core_start parametresi) paneli otomatik aç
    if (location.href.indexOf("mode=scavenge") !== -1) {
        // Birkaç ms sonra çalışsın ki sayfa tamamen yüklensin
        setTimeout(function () {
            loadOriginalASSAndPatch();
        }, 400);
    }

    // -------------------------------
    // 2. Orijinal ASS'i yükle + patch
    // -------------------------------
    function loadOriginalASSAndPatch() {
        // Eğer TwCheese zaten yüklüyse tekrar script eklemeye gerek yok
        if (window.TwCheese && window.TwCheese.tools && window.TwCheese.tools.ASS) {
            console.log("TwCheese ASS zaten var, sadece patch uygulanıyor.");
            installSafetyPatches();
            installUiCustomizations();
            return;
        }

        console.log("TwCheese ASS yükleniyor...");

        var s = document.createElement("script");
        s.src =
            "https://cheesasaurus.github.io/twcheese/launch/ASS.js?" +
            Date.now();
        s.onload = function () {
            console.log("TwCheese ASS yüklendi, patchler uygulanıyor.");
            // TwCheese kendi içinde async init yapıyor, bu yüzden
            // patchleri biraz gecikmeli çağırmak güvenli.
            setTimeout(function () {
                installSafetyPatches();
                installUiCustomizations();
            }, 1000);
        };
        s.onerror = function () {
            alert("❌ TwCheese ASS yüklenemedi. İnternet / Github erişimini kontrol et.");
        };
        document.body.appendChild(s);
    }

    // -------------------------------
    // 3. Otomatik gönderme / Enter kilidi
    // -------------------------------
    function installSafetyPatches() {
        try {
            // Butonları kilitle + renklendir
            function patchButtons() {
                var buttons = document.querySelectorAll(".free_send_button");
                buttons.forEach(function (btn) {
                    if (btn.dataset.scavSafePatched === "1") return;

                    btn.addEventListener(
                        "click",
                        function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            alert(
                                "❌ Otomatik gönderme bu sürümde kapalı.\n" +
                                    "Script sadece birlik alanlarını doldurur, göndermeyi sen yaparsın."
                            );
                            return false;
                        },
                        true
                    );

                    btn.style.filter = "grayscale(1)";
                    btn.style.cursor = "not-allowed";
                    btn.title = "Otomatik gönderme kapalı (Scavenger Core v2.1)";
                    btn.dataset.scavSafePatched = "1";
                });
            }

            patchButtons();

            // Yeni seçenek yüklendikçe butonlar tekrar geliyor, bu yüzden arada yoklayalım
            setInterval(patchButtons, 1500);

            // Enter ile gönderme vs. tamamen kilit
            document.addEventListener(
                "keydown",
                function (e) {
                    if (e.key === "Enter") {
                        // Sadece preferences popup içine yazarken enter serbest olsun
                        var active = document.activeElement;
                        var insidePrefs =
                            active &&
                            active.closest &&
                            active.closest(
                                "#twcheese-scavenge-preferences-popup"
                            );
                        if (insidePrefs) return;

                        e.preventDefault();
                        e.stopPropagation();
                        alert(
                            "❌ Enter ile otomatik gönderme devre dışı.\n" +
                                "Göndermek için normal temizleme butonlarını kullan."
                        );
                        return false;
                    }
                },
                true
            );
        } catch (e) {
            console.error("Scavenger safety patch hata:", e);
        }
    }

    // -------------------------------
    // 4. Türkçe başlık + preferences popup düzenleme
    // -------------------------------
    function installUiCustomizations() {
        if (typeof $ === "undefined") {
            console.warn(
                "jQuery ($) yok gibi görünüyor, UI özelleştirmesi atlandı."
            );
            return;
        }

        function tweakHeader() {
            var $h3 = $("#content_value").find("h3").first();
            if (!$h3.length || $h3.data("scav-header-done")) return;

            // '» preferences' linkini Türkçeleştir
            $h3.find("a").each(function () {
                var $a = $(this);
                var text = ($a.text() || "").toLowerCase();
                if (text.indexOf("preferences") !== -1) {
                    $a.text("» Tercihler");
                }
            });

            // 'Script created by cheesasaurus' yazısını kaldır
            $h3.find("span").each(function () {
                var txt = ($(this).text() || "").toLowerCase();
                if (txt.indexOf("cheesasaurus") !== -1) {
                    $(this).remove();
                }
            });

            $h3.data("scav-header-done", true);
        }

        // Birim isimleri
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

        function tweakPreferencesPopup() {
            var $popup = $("#twcheese-scavenge-preferences-popup");
            if (!$popup.length) return;

            var $widget = $popup.find(".twcheese-scavenge-preferences-widget");
            if (!$widget.length || $widget.data("scav-prefs-done")) return;

            // 1) Order bölümünü kaldır
            $widget.find(".troop-order-section").closest("td").remove();

            // 2) Birim simgelerinin yanına isim ekle
            $widget.find(".troops-section tr").each(function () {
                var $row = $(this);
                var $img = $row.find("img[src*='unit_']").first();
                if (!$img.length) return;

                if ($img.next(".scav-unit-name").length) return; // zaten eklenmiş

                var src = $img.attr("src") || "";
                var m = src.match(/unit_([a-zA-Z0-9_]+)\.png/);
                var key = m ? m[1] : null;
                var name = key && UNIT_NAMES_TR[key] ? UNIT_NAMES_TR[key] : "";

                if (name) {
                    var $span = $("<span>")
                        .addClass("scav-unit-name")
                        .text(" " + name);
                    $span.insertAfter($img);
                }
            });

            $widget.data("scav-prefs-done", true);
        }

        // Biraz basic stil dokunuşu
        addScavengerCss(
            ".scav-unit-name{margin-left:4px;font-size:11px;color:#f5e4c6;}" +
                "#twcheese-scavenge-preferences-popup .vis{background:#f3e0c6;}"
        );

        // İlk yüklemede bir kere dene
        setTimeout(function () {
            tweakHeader();
            tweakPreferencesPopup();
        }, 1200);

        // Daha sonra oluşan değişiklikleri yakalamak için observer
        var obs = new MutationObserver(function () {
            tweakHeader();
            tweakPreferencesPopup();
        });

        obs.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function addScavengerCss(cssText) {
        try {
            var style = document.createElement("style");
            style.type = "text/css";
            style.textContent = cssText;
            document.head.appendChild(style);
        } catch (e) {
            console.error("Scavenger CSS eklenemedi:", e);
        }
    }
})();
