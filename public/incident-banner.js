/**
 * Zavro Incident Banner — standalone script
 * Works on any website (plain HTML, React, or any other frontend).
 *
 * Usage:
 *   <script src="https://status.zavrobot.tech/incident-banner.js"></script>
 *
 * On load it fetches https://status.zavrobot.tech/api/banner. If there are
 * active incidents it injects a fixed banner at the top of the page with a
 * close (✕) button that persists the dismissed state to localStorage.
 */
(function () {
  "use strict";

  var BANNER_DISMISSED_KEY = "zavroBannerClosed";
  var BANNER_ID = "zavro-incident-banner";
  var STATUS_BASE = "https://status.zavrobot.tech";

  var SEVERITY_COLORS = {
    critical: "#ed4245",
    major: "#e67e22",
    minor: "#faa61a",
  };

  function getSeverityColor(incidents) {
    var order = ["critical", "major", "minor"];
    for (var i = 0; i < order.length; i++) {
      for (var j = 0; j < incidents.length; j++) {
        if (incidents[j].severity === order[i]) {
          return SEVERITY_COLORS[order[i]];
        }
      }
    }
    return SEVERITY_COLORS.minor;
  }

  function injectStyles(borderColor) {
    if (document.getElementById(BANNER_ID + "-styles")) return;
    var style = document.createElement("style");
    style.id = BANNER_ID + "-styles";
    style.textContent =
      "#" + BANNER_ID + " {" +
        "position: fixed;" +
        "top: 0;" +
        "left: 0;" +
        "right: 0;" +
        "z-index: 9999;" +
        "background-color: #2b2d31;" +
        "border-left: 4px solid " + borderColor + ";" +
        "box-shadow: 0 2px 12px rgba(0,0,0,0.6);" +
        "padding: 12px 20px;" +
        "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;" +
        "box-sizing: border-box;" +
      "}" +
      "#" + BANNER_ID + " .zb-inner {" +
        "max-width: 860px;" +
        "margin: 0 auto;" +
        "position: relative;" +
        "padding-right: 28px;" +
      "}" +
      "#" + BANNER_ID + " .zb-title {" +
        "font-weight: bold;" +
        "color: #ffffff;" +
        "font-size: 15px;" +
        "margin: 0 0 2px 0;" +
      "}" +
      "#" + BANNER_ID + " .zb-subtitle {" +
        "color: #b9bbbe;" +
        "font-size: 13px;" +
        "margin: 0 0 8px 0;" +
      "}" +
      "#" + BANNER_ID + " .zb-list {" +
        "list-style: none;" +
        "padding: 0;" +
        "margin: 0;" +
        "display: flex;" +
        "flex-wrap: wrap;" +
        "gap: 6px;" +
      "}" +
      "#" + BANNER_ID + " .zb-link {" +
        "color: #00aff4;" +
        "text-decoration: none;" +
        "background-color: rgba(0,175,244,0.1);" +
        "padding: 2px 10px;" +
        "border-radius: 4px;" +
        "font-size: 14px;" +
        "display: inline-block;" +
        "transition: background-color 0.15s;" +
      "}" +
      "#" + BANNER_ID + " .zb-link:hover {" +
        "background-color: rgba(0,175,244,0.2);" +
      "}" +
      "#" + BANNER_ID + " .zb-close {" +
        "position: absolute;" +
        "top: 50%;" +
        "right: 0;" +
        "transform: translateY(-50%);" +
        "background: none;" +
        "border: none;" +
        "color: #b9bbbe;" +
        "cursor: pointer;" +
        "font-size: 18px;" +
        "line-height: 1;" +
        "padding: 4px;" +
      "}" +
      "#" + BANNER_ID + " .zb-close:hover {" +
        "color: #ffffff;" +
      "}";
    document.head.appendChild(style);
  }

  function createBanner(data) {
    var incidents = Array.isArray(data.incidents) ? data.incidents : [];
    var borderColor = getSeverityColor(incidents);

    injectStyles(borderColor);

    // Capture any pre-existing body padding so we can restore it on dismiss
    var originalPaddingTop = document.body.style.paddingTop || "";

    // Save the original top values of any fixed top elements
    var movedElements = [];

    var banner = document.createElement("div");
    banner.id = BANNER_ID;

    var inner = document.createElement("div");
    inner.className = "zb-inner";

    // Close button
    var closeBtn = document.createElement("button");
    closeBtn.className = "zb-close";
    closeBtn.setAttribute("aria-label", "Dismiss incident banner");
    closeBtn.textContent = "\u2715"; // ✕
    closeBtn.addEventListener("click", function () {
      banner.style.display = "none";
      document.body.style.paddingTop = originalPaddingTop;

      // Restore moved elements
      movedElements.forEach(function (item) {
        item.element.style.top = item.originalTop;
    });
  
      try {
        localStorage.setItem(BANNER_DISMISSED_KEY, "true");
      } catch (e) {}
    });

    // Title
    var title = document.createElement("p");
    title.className = "zb-title";
    title.textContent = "Zavro Bot \uD83D\uDEA8"; // 🚨

    // Subtitle
    var subtitle = document.createElement("p");
    subtitle.className = "zb-subtitle";
    subtitle.textContent = "Active Incidents";

    // Incident list
    var list = document.createElement("ul");
    list.className = "zb-list";

    incidents.forEach(function (incident) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.className = "zb-link";
      a.href = STATUS_BASE + "/incidents/" + incident._id;
      a.textContent = incident.title;
      li.appendChild(a);
      list.appendChild(li);
    });

    inner.appendChild(closeBtn);
    inner.appendChild(title);
    inner.appendChild(subtitle);
    inner.appendChild(list);
    banner.appendChild(inner);

    // Insert before any existing first child so it sits at the very top
    document.body.insertBefore(banner, document.body.firstChild);

    // Push page content down after layout is complete
requestAnimationFrame(function () {
  var height = banner.offsetHeight;
  var existing = parseInt(originalPaddingTop) || 0;

  document.body.style.paddingTop = (existing + height) + "px";

  // Move any fixed elements that are attached to the top
 document.querySelectorAll("*").forEach(function (el) {
  // Don't move the banner itself
  if (el === banner) return;

  var style = window.getComputedStyle(el);

  if (
    style.position === "fixed" &&
    parseInt(style.top || "0", 10) === 0
  ) {
    movedElements.push({
      element: el,
      originalTop: el.style.top
    });

    el.style.top = height + "px";
  }
});
});
  }

  function init() {
    try {
      if (localStorage.getItem(BANNER_DISMISSED_KEY) === "true") return;
    } catch (e) {}

    fetch(STATUS_BASE + "/api/banner")
      .then(function (res) {
        if (!res.ok) {
          console.error("Banner API responded with " + res.status + " " + res.statusText + " (" + STATUS_BASE + "/api/banner)");
          return null;
        }
        return res.json();
      })
      .then(function (data) {
        if (data && data.active && Array.isArray(data.incidents) && data.incidents.length > 0) {
          createBanner(data);
        }
      })
      .catch(function (err) {
        console.error("Banner fetch error:", err);
      });
  }

  // Run after the DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
