// ============================================
// BISTRO U DUDKA — OBJEDNÁVKOVÝ SYSTÉM (zabezpečená verze)
// ============================================
//
// Nastav ve ⚙️ Project Settings → Script Properties:
//   ADMIN_PASSWORD = heslo, kterým se přihlašuješ do příjmu objednávek
//   ADMIN_KEY      = U2pevyjBPETPQ97YYz5jN4OFYrWpZcnA  (nebo vlastní náhodný řetězec)
//
// Proč: heslo se ověřuje jen tady na serveru (sem nikdo zvenčí nevidí).
// ADMIN_KEY se klientovi vrátí AŽ po správném přihlášení a bez něj server
// odmítne vrátit objednávky nebo cokoliv měnit — dřív to šlo úplně bez hesla.

var SHEET_NAME = "Objednávky";

function props() {
  return PropertiesService.getScriptProperties();
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function checkKey(e) {
  var key = (e.parameter && e.parameter.key) || "";
  var expected = props().getProperty("ADMIN_KEY") || "";
  return !!expected && key === expected;
}

// ====== TEST — spusť ručně pro ověření ======
function testPost() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log("Tabulka: " + ss.getName() + " | URL: " + ss.getUrl());
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    Logger.log("Sheet vytvořen");
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "Čas", "Stav", "Způsob", "Jméno", "Telefon", "Ulice", "PSČ", "Položky", "Poznámka", "Doprava Kč", "Obal Kč", "Celkem Kč"]);
    sheet.getRange(1, 1, 1, 13).setFontWeight("bold");
  }
  var now = new Date();
  var cas = Utilities.formatDate(now, "Europe/Prague", "dd.MM.yyyy HH:mm:ss");
  sheet.appendRow(["TEST-OK", cas, "Nová", "Osobní odběr", "Testovací zákazník", "777000111", "", "", "1× Dürüm Klasický — 150 Kč", "", 0, 10, 160]);
  Logger.log("Zapsáno!");
}

// ====== PŘÍJEM OBJEDNÁVKY OD ZÁKAZNÍKA (POST) — veřejné, ale ověřené ======
function doPost(e) {
  try {
    var enabled = props().getProperty("ordersEnabled");
    if (enabled === "false") {
      return out({ ok: false, error: "Objednávky jsou momentálně pozastaveny." });
    }

    var data = JSON.parse(e.postData.contents);

    // --- základní validace vstupu, aby se nedaly poslat nesmyslné/škodlivé objednávky ---
    var name = String(data.name || "").trim();
    var phone = String(data.phone || "").trim();
    var items = Array.isArray(data.items) ? data.items : [];
    var total = Number(data.total);

    if (!name || name.length > 120) return out({ ok: false, error: "Neplatné jméno." });
    if (phone.replace(/\D/g, "").length < 9) return out({ ok: false, error: "Neplatný telefon." });
    if (!items.length) return out({ ok: false, error: "Košík je prázdný." });
    if (!isFinite(total) || total <= 0 || total > 20000) {
      return out({ ok: false, error: "Neplatná celková částka." });
    }
    if (data.mode === "delivery" && !String(data.street || "").trim()) {
      return out({ ok: false, error: "Chybí adresa pro dovoz." });
    }

    // --- ochrana proti rychlému opakovanému odeslání (dvojklik / spam) ---
    var cache = CacheService.getScriptCache();
    var dupKey = "ord_" + phone + "_" + Utilities.base64Encode(
      Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, String(data.itemsText || "").substring(0, 500))
    );
    if (cache.get(dupKey)) {
      return out({ ok: false, error: "Tuto objednávku jsme už přijali, díky." });
    }
    cache.put(dupKey, "1", 60);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "ID", "Čas", "Stav", "Způsob", "Jméno", "Telefon",
        "Ulice", "PSČ", "Položky", "Poznámka",
        "Doprava Kč", "Obal Kč", "Celkem Kč"
      ]);
      sheet.getRange(1, 1, 1, 13).setFontWeight("bold");
    }

    var now = new Date();
    var id = "OBJ-" + Utilities.formatDate(now, "Europe/Prague", "HHmm") + "-" + Math.floor(Math.random() * 900 + 100);
    var cas = Utilities.formatDate(now, "Europe/Prague", "dd.MM.yyyy HH:mm:ss");
    var zpusob = data.mode === "delivery" ? "Dovoz" : "Osobní odběr";

    sheet.appendRow([
      id, cas, "Nová", zpusob,
      name, phone,
      String(data.street || ""), String(data.psc || ""),
      String(data.itemsText || ""), String(data.note || ""),
      Number(data.deliveryFee) || 0, Number(data.obalFee) || 0, total
    ]);

    return out({ ok: true, id: id });

  } catch (err) {
    return out({ ok: false, error: err.toString() });
  }
}

// ====== ČTENÍ + SPRÁVA (GET) ======
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action.toString() : "";

  // --- přihlášení: heslo se ověří JEN TADY, nikdy v HTML na webu ---
  if (action === "login") {
    var pwd = e.parameter.pwd || "";
    var expected = props().getProperty("ADMIN_PASSWORD") || "";
    if (expected && pwd === expected) {
      return out({ ok: true, key: props().getProperty("ADMIN_KEY") });
    }
    return out({ ok: false, error: "Špatné heslo" });
  }

  // --- veřejné, bez osobních údajů: jen true/false pro banner na webu ---
  if (action === "orderStatus") {
    var status = props().getProperty("ordersEnabled");
    var isEnabled = status !== "false";
    return out({ ok: true, enabled: isEnabled });
  }

  // --- od tohoto místa dál je vše chráněné klíčem z přihlášení ---
  if (action === "orders") {
    if (!checkKey(e)) return out({ ok: false, error: "unauthorized" });
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() <= 1) {
      return out({ orders: [] });
    }
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var orders = [];
    var today = new Date();
    var todayDay = today.getDate();
    var todayMonth = today.getMonth();
    var todayYear = today.getFullYear();

    for (var i = 1; i < data.length; i++) {
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j];
      }
      var cas = row["Čas"];
      var isToday = false;
      if (cas instanceof Date) {
        isToday = cas.getDate() === todayDay && cas.getMonth() === todayMonth && cas.getFullYear() === todayYear;
      } else {
        var s = (cas || "").toString();
        isToday = s.indexOf(todayDay + ".") === 0 || s.indexOf("0" + todayDay + ".") === 0;
        if (isToday) {
          var parts = s.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
          if (parts) {
            isToday = parseInt(parts[1]) === todayDay && parseInt(parts[2]) === (todayMonth + 1) && parseInt(parts[3]) === todayYear;
          }
        }
      }
      if (isToday) {
        if (row["Čas"] instanceof Date) {
          row["Čas"] = Utilities.formatDate(row["Čas"], "Europe/Prague", "dd.MM.yyyy HH:mm:ss");
        }
        orders.push(row);
      }
    }
    return out({ orders: orders });
  }

  if (action === "status") {
    if (!checkKey(e)) return out({ ok: false, error: "unauthorized" });
    var id = e.parameter.id || "";
    var newStatus = e.parameter.status || "";
    var ss2 = SpreadsheetApp.getActiveSpreadsheet();
    var sheet2 = ss2.getSheetByName(SHEET_NAME);
    if (sheet2 && id && newStatus) {
      var data2 = sheet2.getDataRange().getValues();
      for (var k = 1; k < data2.length; k++) {
        if (data2[k][0] === id) {
          sheet2.getRange(k + 1, 3).setValue(newStatus);
          break;
        }
      }
    }
    return out({ ok: true });
  }

  if (action === "toggleOrders") {
    if (!checkKey(e)) return out({ ok: false, error: "unauthorized" });
    var enabled = e.parameter.enabled === "true";
    props().setProperty("ordersEnabled", enabled ? "true" : "false");
    return out({ ok: true, enabled: enabled });
  }

  return out({ ok: true, status: "bistro running" });
}
