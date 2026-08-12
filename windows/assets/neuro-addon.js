((homeArtDataUrl, pageArtDataUrls, iconDataUrls) => {
  const STATE_KEY = "__CODEX_NEURO_DREAM_SKIN_STATE__";
  const BACKDROP_ID = "codex-dream-skin-backdrop";
  const VERSION = __NEURO_DREAM_SKIN_VERSION_JSON__;
  const REVISION = __NEURO_DREAM_SKIN_REVISION_JSON__;

  const previous = window[STATE_KEY];
  if (typeof previous?.cleanup === "function") previous.cleanup();
  const toObjectUrl = (dataUrl) => {
    const comma = dataUrl.indexOf(",");
    const binary = atob(dataUrl.slice(comma + 1));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return URL.createObjectURL(new Blob([bytes], { type: "image/png" }));
  };
  const homeArtUrl = toObjectUrl(homeArtDataUrl);
  const pageArtUrls = Object.fromEntries(
    Object.entries(pageArtDataUrls).map(([page, dataUrl]) => [page, toObjectUrl(dataUrl)]),
  );
  const iconUrls = Object.fromEntries(
    Object.entries(iconDataUrls).map(([icon, dataUrl]) => [icon, toObjectUrl(dataUrl)]),
  );
  const navigationByLabel = {
    "新增任務": "new-task",
    "new task": "new-task",
    "pull request": "pull-requests",
    "pull requests": "pull-requests",
    "網站": "sites",
    "sites": "sites",
    "已排程": "scheduled",
    "scheduled": "scheduled",
    "外掛程式": "plugins",
    "plugins": "plugins",
  };
  const pageNavigation = new Set(["pull-requests", "sites", "scheduled", "plugins"]);
  const statusFromText = (text) => {
    const value = text.trim();
    if (/^(停止|執行中|進行中|正在執行|stop|running|working|executing)(?:\s|[:：…]|$)/i.test(value)) return "running";
    if (/^(已完成|完成|completed|done)(?:\s|[:：…]|$)/i.test(value)) return "success";
    if (/^(失敗|錯誤|failed|error)(?:\s|[:：…]|$)/i.test(value)) return "error";
    if (/(等待授權|需要授權|代我核准|approval required|requires approval)/i.test(value)) return "approval";
    return "";
  };
  const ensure = () => {
    if (window.__CODEX_DREAM_SKIN_DISABLED__) return;
    const root = document.documentElement;
    if (!root) return;
    root.classList.add("codex-dream-skin");
    root.style.setProperty("--dream-art", "var(--dream-skin-art)");
    root.style.setProperty("--dream-home-art", `url("${homeArtUrl}")`);
    for (const [page, url] of Object.entries(pageArtUrls)) {
      root.style.setProperty(`--dream-page-${page}-art`, `url("${url}")`);
    }
    for (const [icon, url] of Object.entries(iconUrls)) {
      root.style.setProperty(`--dream-icon-${icon}`, `url("${url}")`);
    }

    const thread = document.querySelector(".thread-scroll-container");
    const threadHost = thread?.parentElement ?? null;
    for (const candidate of document.querySelectorAll(".dream-thread-host")) {
      if (candidate !== threadHost) candidate.classList.remove("dream-thread-host");
    }
    let backdrop = document.getElementById(BACKDROP_ID);
    if (threadHost) {
      threadHost.classList.add("dream-thread-host");
      if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.id = BACKDROP_ID;
        backdrop.setAttribute("aria-hidden", "true");
      }
      if (backdrop.parentElement !== threadHost) threadHost.prepend(backdrop);
    } else {
      backdrop?.remove();
    }

    const shellMain = document.querySelector('[data-ds-part="main"]') ||
      document.querySelector("main[data-app-shell-main-surface]");
    const home = document.querySelector(
      '[role="main"]:has([data-testid="home-icon"]), ' +
      '[role="main"]:has([class~="group/home-suggestions"]), ' +
      '[role="main"]:has(form[data-composer-placement="home"])',
    );
    for (const candidate of document.querySelectorAll('[role="main"].dream-home')) {
      if (candidate !== home) candidate.classList.remove("dream-home");
    }
    if (home) home.classList.add("dream-home");

    const themedNavigations = new Set();
    for (const button of document.querySelectorAll("aside.app-shell-left-panel button")) {
      const labels = [
        button.getAttribute("aria-label"),
        button.getAttribute("title"),
        ...(button.innerText || "").split("\n"),
      ].filter(Boolean).map((label) => label.trim().toLowerCase());
      const navigation = labels.map((label) => navigationByLabel[label]).find(Boolean);
      if (navigation) {
        if (button.dataset.dreamNav !== navigation) button.dataset.dreamNav = navigation;
        themedNavigations.add(button);
      } else {
        button.removeAttribute("data-dream-nav");
      }
    }
    document.querySelectorAll("[data-dream-nav]").forEach((node) => {
      if (!themedNavigations.has(node)) node.removeAttribute("data-dream-nav");
    });
    const selectedNavigation = document.querySelector('aside.app-shell-left-panel [aria-current="page"]');
    const activePage = pageNavigation.has(selectedNavigation?.dataset.dreamNav)
      ? selectedNavigation.dataset.dreamNav
      : "";
    if (activePage) root.dataset.dreamPage = activePage;
    else delete root.dataset.dreamPage;

    const themedComposerControls = new Set();
    for (const button of document.querySelectorAll(".composer-surface-chrome button")) {
      const label = (button.getAttribute("aria-label") || button.getAttribute("title") || button.innerText || "").trim().toLowerCase();
      const target = button.dataset.composerNavigationTarget;
      const control = target === "add-context" ? "attach"
        : target === "permissions" ? "permissions"
        : target === "reasoning" || button.hasAttribute("data-codex-intelligence-trigger") ? "model"
        : /^(聽寫|dictate)$/.test(label) ? "dictate"
        : /^(停止|stop)$/.test(label) ? "stop"
        : (/^(傳送|送出|send)/.test(label) ||
          (button.classList.contains("bg-token-foreground") && button.classList.contains("size-token-button-composer"))) ? "send"
        : "";
      if (control) {
        if (button.dataset.dreamComposerControl !== control) button.dataset.dreamComposerControl = control;
        themedComposerControls.add(button);
      } else {
        button.removeAttribute("data-dream-composer-control");
      }
    }
    document.querySelectorAll("[data-dream-composer-control]").forEach((node) => {
      if (!themedComposerControls.has(node)) node.removeAttribute("data-dream-composer-control");
    });

    const themedFields = new Set();
    for (const input of document.querySelectorAll('[data-ds-part="main"] input')) {
      const field = input.closest(".no-drag.flex.items-center");
      if (!field) continue;
      const hint = `${input.getAttribute("type") || ""} ${input.getAttribute("placeholder") || ""}`;
      field.dataset.dreamField = /search|搜尋/i.test(hint) ? "search" : "input";
      themedFields.add(field);
    }
    document.querySelectorAll("[data-dream-field]").forEach((node) => {
      if (!themedFields.has(node)) node.removeAttribute("data-dream-field");
    });

    const themedNotices = new Set();
    for (const notice of document.querySelectorAll('aside.app-shell-left-panel [role="status"]')) {
      if (!notice.querySelector("button") || !/(?:使用量|usage)/i.test(notice.innerText || "")) continue;
      notice.dataset.dreamNotice = "usage";
      themedNotices.add(notice);
    }
    for (const notice of document.querySelectorAll('[data-ds-part="main"] aside')) {
      if (!notice.querySelector("button") || !/(?:用量已用完|速率限制|usage.*(?:used up|limit))/i.test(notice.innerText || "")) continue;
      notice.dataset.dreamNotice = "usage-limit";
      themedNotices.add(notice);
    }
    for (const button of document.querySelectorAll("button[aria-label]")) {
      if (!/(?:速率限制.*橫幅|rate limit.*banner)/i.test(button.getAttribute("aria-label") || "")) continue;
      const notice = button.parentElement?.closest(".relative") || button.parentElement;
      if (!notice) continue;
      notice.dataset.dreamNotice = "rate-limit";
      themedNotices.add(notice);
    }
    document.querySelectorAll("[data-dream-notice]").forEach((node) => {
      if (!themedNotices.has(node)) node.removeAttribute("data-dream-notice");
    });

    const themedStatuses = new Set();
    for (const node of document.querySelectorAll('button, [role="status"]')) {
      const labels = [node.getAttribute("aria-label"), node.innerText]
        .filter(Boolean).map((label) => label.trim()).filter((label) => label.length <= 120);
      const status = labels.map(statusFromText).find(Boolean);
      if (status) {
        if (node.dataset.dreamStatus !== status) node.dataset.dreamStatus = status;
        themedStatuses.add(node);
      } else {
        node.removeAttribute("data-dream-status");
      }
    }
    document.querySelectorAll("[data-dream-status]").forEach((node) => {
      if (!themedStatuses.has(node)) node.removeAttribute("data-dream-status");
    });

    const themedSidePanels = new Set();
    for (const panel of document.querySelectorAll(".bg-token-dropdown-background")) {
      if (panel.querySelectorAll(":scope > div > section > header").length < 2 ||
          !panel.closest(".absolute.right-0")) continue;
      panel.dataset.dreamSidePanel = "summary";
      themedSidePanels.add(panel);
    }
    document.querySelectorAll("[data-dream-side-panel]").forEach((node) => {
      if (!themedSidePanels.has(node)) node.removeAttribute("data-dream-side-panel");
    });

    const themedProgress = new Set();
    for (const label of document.querySelectorAll("span.whitespace-nowrap.tabular-nums")) {
      if (!/^(?:步驟|step)\s*\d+\s*[\/／]\s*\d+$/i.test((label.innerText || "").trim())) continue;
      const pill = label.closest("div.rounded-3xl");
      if (!pill) continue;
      pill.dataset.dreamProgress = "running";
      themedProgress.add(pill);
    }
    document.querySelectorAll("[data-dream-progress]").forEach((node) => {
      if (!themedProgress.has(node)) node.removeAttribute("data-dream-progress");
    });

    const themedActivities = new Set();
    for (const activity of document.querySelectorAll('[class~="group/activity-header"]')) {
      const text = (activity.innerText || "").trim();
      const status = statusFromText(text);
      const state = activity.querySelector(".loading-shimmer-pure-text") || status === "running"
        ? "running"
        : status === "error" || /^(?:command|tool|指令|工具).*(?:failed|error|失敗|錯誤)/i.test(text)
        ? "error"
        : "success";
      activity.dataset.dreamActivity = state;
      themedActivities.add(activity);
    }
    document.querySelectorAll("[data-dream-activity]").forEach((node) => {
      if (!themedActivities.has(node)) node.removeAttribute("data-dream-activity");
    });

    if (!shellMain || !document.body) return;
    shellMain.classList.toggle("dream-home-shell", Boolean(home));
  };

  const cleanup = () => {
    document.documentElement?.classList.remove("codex-dream-skin");
    document.documentElement?.style.removeProperty("--dream-art");
    document.documentElement?.style.removeProperty("--dream-home-art");
    document.documentElement?.removeAttribute("data-dream-page");
    for (const page of Object.keys(pageArtUrls)) {
      document.documentElement?.style.removeProperty(`--dream-page-${page}-art`);
    }
    for (const icon of Object.keys(iconUrls)) {
      document.documentElement?.style.removeProperty(`--dream-icon-${icon}`);
    }
    document.querySelectorAll(".dream-home").forEach((node) => node.classList.remove("dream-home"));
    document.querySelectorAll(".dream-home-shell").forEach((node) => node.classList.remove("dream-home-shell"));
    document.querySelectorAll(".dream-thread-host").forEach((node) => node.classList.remove("dream-thread-host"));
    document.querySelectorAll("[data-dream-nav], [data-dream-composer-control], [data-dream-field], [data-dream-notice], [data-dream-status], [data-dream-side-panel], [data-dream-progress], [data-dream-activity]").forEach((node) => {
      node.removeAttribute("data-dream-nav");
      node.removeAttribute("data-dream-composer-control");
      node.removeAttribute("data-dream-field");
      node.removeAttribute("data-dream-notice");
      node.removeAttribute("data-dream-status");
      node.removeAttribute("data-dream-side-panel");
      node.removeAttribute("data-dream-progress");
      node.removeAttribute("data-dream-activity");
    });
    document.getElementById(BACKDROP_ID)?.remove();
    const state = window[STATE_KEY];
    state?.observer?.disconnect();
    if (state?.timer) clearInterval(state.timer);
    if (state?.scheduler?.timeout) clearTimeout(state.scheduler.timeout);
    if (state?.homeArtUrl) URL.revokeObjectURL(state.homeArtUrl);
    for (const url of Object.values(state?.pageArtUrls || {})) URL.revokeObjectURL(url);
    for (const url of Object.values(state?.iconUrls || {})) URL.revokeObjectURL(url);
    delete window[STATE_KEY];
    return true;
  };

  const scheduler = { timeout: null };
  const scheduleEnsure = () => {
    if (scheduler.timeout) clearTimeout(scheduler.timeout);
    scheduler.timeout = setTimeout(() => {
      scheduler.timeout = null;
      ensure();
    }, 180);
  };
  const observer = new MutationObserver(scheduleEnsure);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-current", "aria-label", "title", "data-composer-navigation-target"],
  });
  const timer = setInterval(ensure, 5000);
  window[STATE_KEY] = {
    ensure, cleanup, observer, timer, scheduler, homeArtUrl, pageArtUrls, iconUrls,
    version: VERSION, revision: REVISION,
  };
  ensure();
  const base = window.__CODEX_DREAM_SKIN_STATE__;
  return {
    installed: true,
    version: base?.version ?? VERSION,
    themeId: base?.themeId ?? null,
    revision: base?.revision ?? REVISION,
    neuroRevision: REVISION,
  };
})(__NEURO_HOME_ART_JSON__, __NEURO_PAGE_ARTS_JSON__, __NEURO_ICONS_JSON__)
