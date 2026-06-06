import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-analytics.js";
import { getDatabase, ref, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
try {
  getAnalytics(app);
} catch (error) {
  console.warn("Analytics not available in this environment", error);
}
const database = getDatabase(app);

window.saveContactSupportMessage = async function saveContactSupportMessage(contactData) {
  const safeData = {
    name: contactData.name || "",
    email: contactData.email || "",
    topic: contactData.topic || "",
    message: contactData.message || "",
    page: window.location.href,
    userAgent: navigator.userAgent,
    createdAt: serverTimestamp()
  };
  await push(ref(database, "contactSupportMessages"), safeData);
};

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
const PHONE = "888-XX-XXXX";
const PHONE_HREF = "tel:888XXXXXXX";

function toast(message) {
  const toastBox = $("#toast");
  if (!toastBox) return;
  toastBox.textContent = message;
  toastBox.classList.add("show");
  window.setTimeout(() => toastBox.classList.remove("show"), 2600);
}

function bindNavigation() {
  const hamburger = $("#hamburger");
  const navLinks = $("#navLinks");
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("active");
    hamburger.setAttribute("aria-expanded", String(isOpen));
  });

  $$("a", navLinks).forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });
}

function bindTheme() {
  const themeToggle = $("#themeToggle");
  if (!themeToggle) return;

  const applyTheme = (theme) => {
    const dark = theme === "dark";
    document.body.classList.toggle("dark", dark);
    themeToggle.textContent = dark ? "☀️" : "🌙";
    themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  };

  applyTheme(localStorage.getItem("fixx-theme") || "light");
  themeToggle.addEventListener("click", () => {
    const next = document.body.classList.contains("dark") ? "light" : "dark";
    localStorage.setItem("fixx-theme", next);
    applyTheme(next);
    toast(next === "dark" ? "Dark mode enabled" : "Light mode enabled");
  });
}

function bindFaq() {
  $$(".faq-q").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      if (!item) return;
      const isActive = item.classList.toggle("active");
      button.setAttribute("aria-expanded", String(isActive));
    });
  });
}

function bindAuthModal() {
  const modal = $("#signinModal");
  const openButton = $("#openSignin");
  const inlineOpen = $("#openSigninInline");
  const closeButton = $("#closeSignin");
  const tabSignup = $("#tabSignup");
  const tabSignin = $("#tabSignin");
  const panelSignup = $("#panelSignup");
  const panelSignin = $("#panelSignin");
  const goSignin = $("#goSignin");
  const goSignup = $("#goSignup");

  if (!modal || !tabSignup || !tabSignin || !panelSignup || !panelSignin) return;

  function showTab(tab) {
    const signup = tab === "signup";
    tabSignup.classList.toggle("active", signup);
    tabSignin.classList.toggle("active", !signup);
    tabSignup.setAttribute("aria-selected", String(signup));
    tabSignin.setAttribute("aria-selected", String(!signup));
    panelSignup.classList.toggle("hidden", !signup);
    panelSignin.classList.toggle("hidden", signup);
  }

  function openSignup() {
    showTab("signup");
    modal.classList.add("active");
    const nameInput = $("#suName");
    if (nameInput) nameInput.focus();
  }

  if (openButton) openButton.addEventListener("click", openSignup);
  if (inlineOpen) inlineOpen.addEventListener("click", openSignup);
  if (closeButton) closeButton.addEventListener("click", () => modal.classList.remove("active"));
  if (goSignin) goSignin.addEventListener("click", () => showTab("signin"));
  if (goSignup) goSignup.addEventListener("click", () => showTab("signup"));
  tabSignup.addEventListener("click", () => showTab("signup"));
  tabSignin.addEventListener("click", () => showTab("signin"));

  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.classList.remove("active");
  });

  const signupForm = $("#signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!signupForm.checkValidity()) {
        toast("Please complete all signup fields correctly.");
        return;
      }
      toast("Account created successfully.");
      modal.classList.remove("active");
      signupForm.reset();
    });
  }

  const signinForm = $("#signinForm");
  if (signinForm) {
    signinForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!signinForm.checkValidity()) {
        toast("Please enter your email and password.");
        return;
      }
      toast("Signed in successfully.");
      modal.classList.remove("active");
      signinForm.reset();
    });
  }
}

function bindContactForm() {
  const contactForm = $("#contactForm");
  if (!contactForm) return;

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      toast("Please complete all contact fields.");
      return;
    }

    const button = contactForm.querySelector('button[type="submit"]');
    const oldText = button ? button.textContent : "";
    if (button) {
      button.disabled = true;
      button.textContent = "Sending...";
    }

    const formData = new FormData(contactForm);
    const contactData = {
      name: formData.get("name"),
      email: formData.get("email"),
      topic: formData.get("topic"),
      message: formData.get("message")
    };

    try {
      await window.saveContactSupportMessage(contactData);
      toast("Message sent successfully.");
      contactForm.reset();
    } catch (error) {
      console.error("Firebase contact form error:", error);
      toast("Message could not be sent. Please try again.");
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = oldText;
      }
    }
  });
}

const chatReplies = {
  "Printer offline": "Restart the printer and router, confirm Wi-Fi, clear the print queue, and set the correct default printer.",
  "Wi-Fi setup": "Keep the printer near the router, use the same network as your device, confirm the password, and try 2.4 GHz if setup fails.",
  "Driver help": "Use the official manufacturer website, match the exact model, and choose the correct operating system version.",
  "Ink toner": "Check supply levels, reseat the cartridge, verify compatibility, and run the cleaning cycle from printer settings.",
  "Paper jam": "Power off first, gently remove jammed paper, inspect the rear access panel, and reload the tray without overfilling.",
  "Scanner issue": "Confirm scanner drivers, app permissions, selected scanner device, and document placement on glass or ADF."
};

function bindChat() {
  const chatButton = $("#chatButton");
  const chatWindow = $("#chatWindow");
  const closeChat = $("#closeChat");
  const chatBody = $("#chatBody");
  const replies = $("#chatReplies");

  if (!chatButton || !chatWindow || !chatBody || !replies) return;

  chatButton.addEventListener("click", () => {
    const open = chatWindow.classList.toggle("active");
    chatButton.setAttribute("aria-expanded", String(open));
  });

  if (closeChat) {
    closeChat.addEventListener("click", () => {
      chatWindow.classList.remove("active");
      chatButton.setAttribute("aria-expanded", "false");
    });
  }

  replies.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-reply]");
    if (!button) return;

    const topic = button.dataset.reply;
    const answer = chatReplies[topic] || "Choose a topic and we will show the next step.";
    chatBody.insertAdjacentHTML("beforeend", `<div class="bubble user">${topic}</div><div class="bubble">${answer}</div><div class="bubble lead-cta"><strong>Need guided help?</strong><a class="chat-call-btn" href="${PHONE_HREF}">📞 Call ${PHONE}</a></div>`);
    chatBody.scrollTop = chatBody.scrollHeight;
  });
}

function bindBackTop() {
  const backTop = $("#backTop");
  if (!backTop) return;

  window.addEventListener("scroll", () => {
    backTop.classList.toggle("visible", window.scrollY > 650);
  });

  backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function bindReveal() {
  const reveals = $$(".reveal");
  if (!reveals.length) return;

  if (!("IntersectionObserver" in window)) {
    reveals.forEach((element) => element.classList.add("active"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  reveals.forEach((element) => observer.observe(element));
}

bindNavigation();
bindTheme();
bindFaq();
bindAuthModal();
bindContactForm();
bindChat();
bindBackTop();
bindReveal();
