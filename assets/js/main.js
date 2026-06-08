/* =========================================================
   RussellxAI — site interactions (vanilla, no dependencies)
   ========================================================= */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- year stamp ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- nav: scrolled state + progress bar ---------- */
  var nav = document.getElementById("nav");
  var progress = document.getElementById("progress");
  var heroInner = document.querySelector(".hero__inner");
  var phGlow = document.querySelector(".page-header__glow");
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle("scrolled", y > 24);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
    if (!reduceMotion) {
      var vh = window.innerHeight;
      if (heroInner && y < vh) {
        heroInner.style.transform = "translateY(" + (y * 0.16).toFixed(1) + "px)";
        heroInner.style.opacity = Math.max(0, 1 - y / (vh * 0.82)).toFixed(3);
      }
      if (phGlow && y < vh) {
        phGlow.style.transform = "translateY(" + (y * 0.28).toFixed(1) + "px)";
      }
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- smooth anchor scroll (with reduced-motion respect) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal:not(.in)");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- count-up stats ---------- */
  function formatNum(n, opts) {
    var v = Math.round(n);
    if (opts.format === "comma") v = v.toLocaleString("en-US");
    return (opts.prefix || "") + v + (opts.suffix || "");
  }
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var opts = {
      prefix: el.getAttribute("data-prefix") || "",
      suffix: el.getAttribute("data-suffix") || "",
      format: el.getAttribute("data-format") || ""
    };
    if (reduceMotion) { el.textContent = formatNum(target, opts); return; }
    var dur = 1600, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(target * eased, opts);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatNum(target, opts);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- contact form -> compose email to RussellxAI ---------- */
  var form = document.getElementById("contactForm");
  var ok = document.getElementById("formOk");
  if (form) {
    // If a real Formspree endpoint is configured, let it submit normally.
    var action = form.getAttribute("action") || "";
    var formspreeReady = action.indexOf("formspree.io") !== -1 && action.indexOf("your-form-id") === -1;
    form.addEventListener("submit", function (e) {
      if (formspreeReady) return; // real backend handles it
      e.preventDefault();
      var el = form.elements;
      var name = ((el["name"] && el["name"].value) || "").trim();
      var emailEl = el["email"];
      var email = ((emailEl && emailEl.value) || "").trim();
      if (!email) { if (emailEl) emailEl.focus(); return; }
      var business = ((el["business"] && el["business"].value) || "").trim();
      var area = ((el["area"] && el["area"].value) || "").trim();
      var message = ((el["message"] && el["message"].value) || "").trim();
      var subject = "RussellxAI — " + (name || "New inquiry") + (business ? " (" + business + ")" : "");
      var bodyLines = [
        "Name: " + name,
        "Email: " + email,
        business ? "Business: " + business : "",
        area ? "Most time going to: " + area : "",
        "",
        message
      ].filter(Boolean);
      var href = "mailto:RussellxAI@gmail.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(bodyLines.join("\n"));
      if (ok) ok.classList.add("show");
      window.location.href = href;
    });
  }

  /* ---------- hero: animated neural-network canvas ---------- */
  var canvas = document.getElementById("heroCanvas");
  if (canvas && canvas.getContext && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, nodes = [], raf = null, mouse = { x: -999, y: -999 };

    function resize() {
      var rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }
    function build() {
      var count = Math.max(26, Math.min(64, Math.floor((W * H) / 22000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.6 + 1
        });
      }
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      var linkDist = Math.min(170, W / 6);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        // gentle pull toward mouse
        var dxm = mouse.x - n.x, dym = mouse.y - n.y;
        var dm = Math.sqrt(dxm * dxm + dym * dym);
        if (dm < 140) { n.x += dxm * 0.0015 * (1 - dm / 140); n.y += dym * 0.0015 * (1 - dm / 140); }
      }
      for (i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var a = nodes[i], b = nodes[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            var alpha = (1 - d / linkDist) * 0.45;
            ctx.strokeStyle = "rgba(255,34,51," + alpha.toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      ctx.shadowColor = "rgba(255,34,51,0.85)";
      for (i = 0; i < nodes.length; i++) {
        var p = nodes[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.shadowBlur = 9;
        ctx.fillStyle = "rgba(255,77,91,0.95)";
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(frame);
    }
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150);
    });
    canvas.addEventListener("pointermove", function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener("pointerleave", function () { mouse.x = -999; mouse.y = -999; });

    // Pause when hero off-screen (saves battery)
    if ("IntersectionObserver" in window) {
      var hero = canvas.closest(".hero");
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { if (!raf) raf = requestAnimationFrame(frame); }
          else { if (raf) { cancelAnimationFrame(raf); raf = null; } }
        });
      }, { threshold: 0 }).observe(hero);
    }
    resize();
  }
})();
