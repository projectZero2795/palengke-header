"use client";

import React from "react";

const defaultTools = [
  { label: "Palengke", href: "https://palengke.es", appKey: "palengke" },
  { label: "Jobs", href: "https://jobs.palengke.es", appKey: "jobs" },
  { label: "Home", href: "https://home.palengke.es", appKey: "home" },
  { label: "Guide", href: "https://guide.palengke.es", appKey: "guide" },
  { label: "PDF", href: "https://pdf-spanish-to-english.palengke.es", appKey: "pdf" },
  { label: "CV", href: "https://cv-creator.palengke.es", appKey: "cv" },
];

const defaultAdminTabs = [
  { label: "Palengke", href: "https://palengke.es/admin", appKey: "palengke" },
  { label: "Jobs", href: "https://jobs.palengke.es/admin", appKey: "jobs" },
  { label: "Home", href: "https://home.palengke.es/admin", appKey: "home" },
];

const defaultFeatureActions = [
  { label: "Admin", href: "https://palengke.es/admin", actionKey: "admin", icon: "shield" },
  {
    label: "News",
    href: "https://palengke.es/philippines-news",
    actionKey: "news",
    icon: "news",
    menuItems: [
      {
        label: "Philippines news",
        description: "Top 10 latest headlines",
        href: "https://palengke.es/philippines-news",
        flag: "🇵🇭",
      },
      {
        label: "Spanish news",
        description: "Top 10 latest headlines",
        href: "https://palengke.es/spanish-news",
        flag: "🇪🇸",
      },
    ],
  },
  { label: "Messages", href: "https://palengke.es?openPrivateChats=1", actionKey: "private-chat", icon: "chat" },
  { label: "Wishlist", href: "https://palengke.es/settings/profile", actionKey: "wishlist", icon: "heart" },
  { label: "Notifications", href: "https://palengke.es/settings/profile", actionKey: "notifications", icon: "bell" },
];

const defaultAuthActions = [
  { label: "Sign in", href: "https://palengke.es/#login", actionKey: "signin", style: "secondary" },
  { label: "Sign up", href: "https://palengke.es/#signup", actionKey: "signup", style: "primary" },
];

const headerTokenStorageKey = "palengke_access_token";
const headerAccountStorageKey = "palengke_account";
const headerSharedAuthSeenStorageKey = "palengke_shared_auth_seen";
const headerAdminImpersonationStorageKey = "palengke_admin_impersonation";
const headerAuthChangedEventName = "palengke-auth-changed";
const headerOpenAuthEventName = "palengke:open-auth";
const headerThemeStorageKey = "palengke_theme";

const notificationTokenStorageKey = "palengke_access_token";
const notificationAuthChangedEventName = "palengke-auth-changed";
const notificationChangedEventName = "palengke-notifications-changed";
const notificationApiBase = "https://palengke.es/api/backend";

function readCookieValue(name) {
  if (typeof document === "undefined") return "";
  const prefix = `${name}=`;
  const raw = document.cookie
    .split("; ")
    .find((item) => item.startsWith(prefix))
    ?.slice(prefix.length);
  return raw ? decodeURIComponent(raw) : "";
}

function readNotificationToken() {
  if (typeof window === "undefined") return "";
  const cookieToken = readCookieValue(notificationTokenStorageKey);
  if (cookieToken) {
    try {
      window.localStorage.setItem(notificationTokenStorageKey, cookieToken);
    } catch {
      // Ignore private-mode storage errors.
    }
    return cookieToken;
  }
  try {
    return window.localStorage.getItem(notificationTokenStorageKey) || "";
  } catch {
    return "";
  }
}

async function notificationApiFetch(path, init = {}, token) {
  const response = await fetch(`${notificationApiBase}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || "Notifications request failed");
  }
  return payload;
}

function notificationHref(notification) {
  if (!notification) return "";
  if (notification.href) return notification.href;
  if (notification.url) return notification.url;
  if (notification.link) return notification.link;
  const threadID = notification.thread?.id || notification.thread_id || notification.chat_thread_id;
  if (threadID) return `https://palengke.es/global-chat?thread=${encodeURIComponent(threadID)}`;
  return "https://palengke.es/settings/profile";
}

function NotificationMenu({ action }) {
  const menuRef = React.useRef(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [token, setToken] = React.useState("");
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState("");

  const loadNotifications = React.useCallback(async () => {
    const nextToken = readNotificationToken();
    setToken(nextToken);
    if (!nextToken) {
      setNotifications([]);
      setStatus("");
      return;
    }
    setLoading(true);
    try {
      const payload = await notificationApiFetch("/me/notifications", {}, nextToken);
      setNotifications(Array.isArray(payload) ? payload : []);
      setStatus("");
    } catch {
      setNotifications([]);
      setStatus("Could not load notifications. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadNotifications();
    function handleRefresh() {
      void loadNotifications();
    }
    window.addEventListener(notificationAuthChangedEventName, handleRefresh);
    window.addEventListener(notificationChangedEventName, handleRefresh);
    window.addEventListener("focus", handleRefresh);
    const interval = window.setInterval(handleRefresh, 15000);
    return () => {
      window.removeEventListener(notificationAuthChangedEventName, handleRefresh);
      window.removeEventListener(notificationChangedEventName, handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      window.clearInterval(interval);
    };
  }, [loadNotifications]);

  React.useEffect(() => {
    function handleClick(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function markRead(notification) {
    if (!token || !notification?.id) return;
    await notificationApiFetch(`/me/notifications/${notification.id}/read`, { method: "POST", body: "{}" }, token).catch(() => undefined);
    setNotifications((existing) => existing.filter((item) => item.id !== notification.id));
  }

  async function clearNotifications() {
    if (!token) return;
    await notificationApiFetch("/me/notifications/read", { method: "POST", body: "{}" }, token).catch(() => undefined);
    setNotifications([]);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(notificationChangedEventName));
    }
  }

  async function openNotification(notification) {
    const href = notificationHref(notification);
    if (notification?.id) {
      await markRead(notification);
    }
    setIsOpen(false);
    if (href && typeof window !== "undefined") {
      window.location.href = href;
    }
  }

  function toggleOpen() {
    setIsOpen((value) => {
      const next = !value;
      if (next) void loadNotifications();
      return next;
    });
  }

  return React.createElement(
    "div",
    { className: "notification-menu", key: `${action.actionKey}:${action.href}`, ref: menuRef },
    React.createElement(
      "button",
      {
        "aria-expanded": isOpen,
        "aria-haspopup": "menu",
        "aria-label": "Notifications",
        className: classNames(
          "notification-menu__trigger",
          "palengke-global-header__feature-button",
          "palengke-global-header__feature-button--notifications",
        ),
        onClick: toggleOpen,
        title: action.label,
        type: "button",
      },
      renderIcon(action.icon),
      notifications.length > 0 ? React.createElement("span", null, notifications.length) : null,
    ),
    isOpen
      ? React.createElement(
          "div",
          { className: "notification-menu__dropdown", role: "menu" },
          React.createElement(
            "div",
            { className: "notification-menu__header" },
            React.createElement("strong", null, "Notifications"),
            token && notifications.length > 0
              ? React.createElement(
                  "button",
                  { className: "notification-menu__clear-notifications", onClick: clearNotifications, type: "button" },
                  "Clear",
                )
              : null,
          ),
          !token
            ? React.createElement(
                "div",
                { className: "notification-menu__empty" },
                React.createElement("p", null, "Sign in to see your notifications."),
                React.createElement("a", { className: "notification-menu__signin", href: "https://palengke.es/#login" }, "Sign in"),
              )
            : loading
              ? React.createElement("p", null, "Loading notifications…")
              : notifications.length > 0
                ? notifications.map((notification) =>
                    React.createElement(
                      "div",
                      {
                        className: classNames("notification-menu__item", notification.is_error && "notification-menu__item--error"),
                        key: notification.id || `${notification.title}:${notification.body}`,
                      },
                      React.createElement(
                        "button",
                        { className: "notification-menu__item-main", onClick: () => openNotification(notification), role: "menuitem", type: "button" },
                        renderIcon(notification.is_error ? "shield" : "bell"),
                        React.createElement(
                          "span",
                          null,
                          React.createElement("b", null, notification.title || "Notification"),
                          notification.body || "Open notification",
                        ),
                      ),
                      notification.is_error
                        ? React.createElement(
                            "button",
                            {
                              "aria-label": `Clear ${notification.title || "notification"}`,
                              className: "notification-menu__clear-one",
                              onClick: () => markRead(notification),
                              title: "Clear",
                              type: "button",
                            },
                            "×",
                          )
                        : null,
                    ),
                  )
                : React.createElement("p", null, status || "No new notifications."),
        )
      : null,
  );
}


function safeHeaderLocalStorageGet(key) {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function safeHeaderLocalStorageSet(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors in private browsing.
  }
}

function safeHeaderLocalStorageRemove(key) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage errors in private browsing.
  }
}

function readHeaderCookieValue(name) {
  if (typeof document === "undefined") return "";
  const prefix = `${name}=`;
  const raw = document.cookie
    .split("; ")
    .find((item) => item.startsWith(prefix))
    ?.slice(prefix.length);
  return raw ? decodeURIComponent(raw) : "";
}

function headerCookieDomainPart() {
  if (typeof window === "undefined") return "";
  const hostname = window.location.hostname.toLowerCase();
  if (hostname === "palengke.es" || hostname.endsWith(".palengke.es")) return "; Domain=.palengke.es";
  return "";
}

function headerCookieSecurePart() {
  if (typeof window === "undefined") return "";
  return window.location.protocol === "https:" ? "; Secure" : "";
}

function readHeaderStoredToken() {
  if (typeof window === "undefined") return "";
  const sharedToken = readHeaderCookieValue(headerTokenStorageKey);
  if (sharedToken) {
    safeHeaderLocalStorageSet(headerTokenStorageKey, sharedToken);
    safeHeaderLocalStorageSet(headerSharedAuthSeenStorageKey, "1");
    return sharedToken;
  }
  const localToken = safeHeaderLocalStorageGet(headerTokenStorageKey);
  if (localToken && safeHeaderLocalStorageGet(headerSharedAuthSeenStorageKey) === "1") {
    clearHeaderLocalAuthSession();
    return "";
  }
  return localToken;
}

function clearHeaderSharedAuthToken() {
  if (typeof document === "undefined") return;
  const expires = `${headerTokenStorageKey}=; Path=/; Max-Age=0; SameSite=Lax${headerCookieSecurePart()}`;
  document.cookie = `${expires}${headerCookieDomainPart()}`;
  document.cookie = expires;
}

function clearHeaderLocalAuthSession() {
  safeHeaderLocalStorageRemove(headerTokenStorageKey);
  safeHeaderLocalStorageRemove(headerAccountStorageKey);
  safeHeaderLocalStorageRemove(headerAdminImpersonationStorageKey);
}

function clearHeaderStoredAuthSession() {
  clearHeaderLocalAuthSession();
  clearHeaderSharedAuthToken();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(headerAuthChangedEventName));
  }
}

function syncHeaderSharedAuthLogout() {
  if (typeof window === "undefined") return false;
  const hasLocalToken = Boolean(safeHeaderLocalStorageGet(headerTokenStorageKey));
  const sharedAuthWasSeen = safeHeaderLocalStorageGet(headerSharedAuthSeenStorageKey) === "1";
  if (!hasLocalToken || !sharedAuthWasSeen || readHeaderCookieValue(headerTokenStorageKey)) return false;
  clearHeaderLocalAuthSession();
  return true;
}

function normalizeHeaderAccount(value) {
  if (!value) return null;
  if (value.user) return { user: value.user, profile: value.profile || null };
  if (value.display_name || value.email || value.phone || value.id) return { user: value, profile: null };
  return null;
}

function readHeaderStoredAccount() {
  if (typeof window === "undefined") return null;
  if (!readHeaderStoredToken()) return null;
  const raw = safeHeaderLocalStorageGet(headerAccountStorageKey);
  if (!raw) return null;
  try {
    return normalizeHeaderAccount(JSON.parse(raw));
  } catch {
    return null;
  }
}

function controlledHeaderAccount(config) {
  if (!config) return undefined;
  const hasControlledAccount = Object.prototype.hasOwnProperty.call(config, "account") ||
    Object.prototype.hasOwnProperty.call(config, "user") ||
    Object.prototype.hasOwnProperty.call(config, "profile");
  if (!hasControlledAccount) return undefined;
  if (Object.prototype.hasOwnProperty.call(config, "account")) return normalizeHeaderAccount(config.account);
  if (!config.user) return null;
  return { user: config.user, profile: config.profile || null };
}

function headerAccountDisplayName(account) {
  return account?.profile?.shop_name || account?.user?.display_name || account?.user?.email || account?.user?.phone || "Palengke";
}

function headerAccountContactLabel(account) {
  return account?.profile?.contact_email || account?.user?.contact_email || account?.user?.email || account?.user?.phone || headerAccountDisplayName(account);
}

function headerAccountAvatarUrl(account) {
  return account?.profile?.avatar_url || account?.user?.avatar_url || account?.user?.photo_url || account?.user?.picture || "";
}

function headerAccountInitials(account) {
  const label = headerAccountDisplayName(account);
  return String(label)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "P";
}

function headerPalengkeHref(path) {
  if (/^https?:\/\//i.test(path)) return path;
  return `https://palengke.es${path.startsWith("/") ? path : `/${path}`}`;
}

function headerAuthHref(mode, config) {
  if (mode === "register") return config?.signupHref || "https://palengke.es/#signup";
  return config?.loginHref || "https://palengke.es/#login";
}

function openHeaderAuth(mode, config, currentApp) {
  if (typeof config?.onLogin === "function") {
    config.onLogin(mode);
    return;
  }
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(headerOpenAuthEventName, { detail: { authMode: mode, mode } }));
  if (currentApp === "palengke" && window.location.pathname !== "/") {
    window.location.href = headerAuthHref(mode, config);
  }
}

function readHeaderTheme() {
  if (typeof window === "undefined") return "dark";
  return safeHeaderLocalStorageGet(headerThemeStorageKey) === "light" ? "light" : "dark";
}

function applyHeaderTheme(theme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function renderAccountItem({ href, onClick, label, glyph, danger = false }) {
  const props = {
    className: classNames("account-menu__item", danger && "account-menu__item--danger"),
    onClick,
    role: "menuitem",
  };
  const children = [
    React.createElement("span", { "aria-hidden": "true", className: "account-menu__item-icon", key: "icon" }, glyph),
    React.createElement("span", { key: "label" }, label),
  ];
  if (href) {
    return React.createElement("a", { ...props, href, key: `${label}:${href}` }, children);
  }
  return React.createElement("button", { ...props, key: label, type: "button" }, children);
}

function HeaderAccountMenu({ config = {}, currentApp, appLinks = defaultTools, featureActions = defaultFeatureActions, showCurrentAppLink = true }) {
  const menuRef = React.useRef(null);
  const controlledAccountValue = controlledHeaderAccount(config);
  const isControlled = controlledAccountValue !== undefined;
  const [storedAccount, setStoredAccount] = React.useState(() => readHeaderStoredAccount());
  const [isOpen, setIsOpen] = React.useState(false);
  const [theme, setTheme] = React.useState("dark");
  const account = isControlled ? controlledAccountValue : storedAccount;

  React.useEffect(() => {
    const nextTheme = readHeaderTheme();
    setTheme(nextTheme);
    applyHeaderTheme(nextTheme);
  }, []);

  React.useEffect(() => {
    if (isControlled) return undefined;
    function loadAccount() {
      if (syncHeaderSharedAuthLogout()) {
        setStoredAccount(null);
        setIsOpen(false);
        return;
      }
      setStoredAccount(readHeaderStoredAccount());
    }
    function handleVisibilityChange() {
      if (!document.hidden) loadAccount();
    }
    loadAccount();
    window.addEventListener(headerAuthChangedEventName, loadAccount);
    window.addEventListener("focus", loadAccount);
    window.addEventListener("pageshow", loadAccount);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const interval = window.setInterval(loadAccount, 5000);
    return () => {
      window.removeEventListener(headerAuthChangedEventName, loadAccount);
      window.removeEventListener("focus", loadAccount);
      window.removeEventListener("pageshow", loadAccount);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(interval);
    };
  }, [isControlled]);

  React.useEffect(() => {
    function handleClick(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function logout() {
    clearHeaderStoredAuthSession();
    setStoredAccount(null);
    setIsOpen(false);
    config?.onLogout?.();
  }

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    safeHeaderLocalStorageSet(headerThemeStorageKey, nextTheme);
    applyHeaderTheme(nextTheme);
    setTheme(nextTheme);
  }

  const displayName = account ? headerAccountDisplayName(account) : "Menu";
  const contactLabel = account ? headerAccountContactLabel(account) : "Sign in, switch apps, and open shortcuts";
  const avatarUrl = account ? headerAccountAvatarUrl(account) : "";
  const initials = account ? headerAccountInitials(account) : "";
  const profileSlug = account?.profile?.slug;
  const isAdmin = Boolean(account?.user?.admin_role);
  const menuAppLinks = (appLinks || defaultTools).filter((link) => {
    if (link.hide) return false;
    if (!showCurrentAppLink && currentApp && link.appKey === currentApp) return false;
    return true;
  });
  const newsAction = (featureActions || defaultFeatureActions).find((action) => action.actionKey === "news");
  const newsItems = newsAction?.menuItems || [
    {
      label: "Philippines news",
      description: "Top 10 latest headlines",
      href: "https://palengke.es/philippines-news",
      flag: "🇵🇭",
    },
    {
      label: "Spanish news",
      description: "Top 10 latest headlines",
      href: "https://palengke.es/spanish-news",
      flag: "🇪🇸",
    },
  ];

  const appItems = menuAppLinks.map((link) => {
    const isCurrent = Boolean(currentApp && link.appKey === currentApp);
    return renderAccountItem({
      href: link.href,
      label: isCurrent ? `${link.label} · current` : link.label,
      glyph: isCurrent ? "●" : "↗",
    });
  });

  const shortcutItems = (featureActions || defaultFeatureActions)
    .filter((action) => action.actionKey !== "news")
    .filter((action) => action.actionKey !== "admin" || isAdmin)
    .map((action) =>
      renderAccountItem({
        href: action.href,
        label: action.label,
        glyph: action.actionKey === "admin"
          ? "✓"
          : action.actionKey === "private-chat"
            ? "💬"
            : action.actionKey === "wishlist"
              ? "♡"
              : action.actionKey === "notifications"
                ? "🔔"
                : "↗",
      }),
    );

  const newsLinks = newsItems.map((item) =>
    renderAccountItem({
      href: item.href,
      label: item.label,
      glyph: item.flag || "📰",
    }),
  );

  const accountItems = [];
  if (account) {
    if (profileSlug) {
      accountItems.push(renderAccountItem({ href: headerPalengkeHref(`/s/${profileSlug}`), label: "Visit profile", glyph: "👤" }));
      accountItems.push(renderAccountItem({ href: headerPalengkeHref(`/s/${profileSlug}#feed-composer`), label: "Post feed", glyph: "📰" }));
      accountItems.push(renderAccountItem({ href: headerPalengkeHref("/settings/profile"), label: "Settings", glyph: "⚙" }));
    } else {
      accountItems.push(renderAccountItem({ href: headerPalengkeHref("/settings/profile?upgrade=seller"), label: "Become seller", glyph: "🏪" }));
      accountItems.push(renderAccountItem({ href: headerPalengkeHref("/settings/profile"), label: "Settings", glyph: "⚙" }));
    }
    if (isAdmin) {
      accountItems.push(renderAccountItem({ href: headerPalengkeHref("/admin"), label: "Admin", glyph: "✓" }));
      accountItems.push(renderAccountItem({ href: headerPalengkeHref("/admin/tickets"), label: "Tickets", glyph: "☑" }));
      accountItems.push(renderAccountItem({ href: headerPalengkeHref("/admin?section=stats"), label: "Stats", glyph: "▥" }));
    }
    if (profileSlug) {
      accountItems.push(renderAccountItem({ href: headerPalengkeHref("/#post"), label: "Post product", glyph: "+" }));
    }
    accountItems.push(renderAccountItem({ label: theme === "dark" ? "Light mode" : "Dark mode", glyph: theme === "dark" ? "☀" : "☾", onClick: toggleTheme }));
    accountItems.push(renderAccountItem({ label: "Logout", glyph: "↪", onClick: logout, danger: true }));
  }

  function renderMenuSection(title, children) {
    const childArray = React.Children.toArray(children).filter(Boolean);
    if (!childArray.length) return null;
    return React.createElement(
      "div",
      { className: "account-menu__section", key: title },
      React.createElement("strong", { className: "account-menu__section-title" }, title),
      childArray,
    );
  }

  return React.createElement(
    "div",
    { className: "account-menu", ref: menuRef },
    React.createElement(
      "button",
      {
        "aria-expanded": isOpen,
        "aria-haspopup": "menu",
        "aria-label": `Account menu for ${displayName}`,
        className: classNames("account-menu__trigger", !account && "account-menu__trigger--menu"),
        onClick: () => setIsOpen((value) => !value),
        title: displayName,
        type: "button",
      },
      account
        ? avatarUrl
          ? React.createElement("img", { alt: "", src: avatarUrl })
          : React.createElement("span", null, initials)
        : React.createElement(
            "span",
            { className: "account-menu__hamburger", "aria-hidden": "true" },
            React.createElement("span", null),
            React.createElement("span", null),
            React.createElement("span", null),
          ),
    ),
    isOpen
      ? React.createElement(
          "div",
          { className: "account-menu__dropdown", role: "menu" },
          React.createElement(
            "div",
            { className: "account-menu__header" },
            React.createElement("strong", null, displayName),
            React.createElement("span", null, contactLabel),
          ),
          !account
            ? React.createElement(
                "div",
                { className: "account-menu__auth-actions" },
                React.createElement(
                  "button",
                  { className: "account-menu__auth-button secondary", onClick: () => openHeaderAuth("login", config, currentApp), type: "button" },
                  "Sign in",
                ),
                React.createElement(
                  "button",
                  {
                    className: "account-menu__auth-button",
                    "data-onboarding": "signup-button",
                    onClick: () => openHeaderAuth("register", config, currentApp),
                    type: "button",
                  },
                  "Sign up",
                ),
              )
            : null,
          renderMenuSection("Apps", appItems),
          renderMenuSection("News", newsLinks),
          renderMenuSection("Shortcuts", shortcutItems),
          account ? renderMenuSection("Account", accountItems) : null,
        )
      : null,
  );
}

function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}

function iconPath(pathProps, key) {
  return React.createElement("path", { ...pathProps, key });
}

function renderIcon(icon) {
  const common = {
    "aria-hidden": "true",
    fill: "none",
    height: 19,
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    viewBox: "0 0 24 24",
    width: 19,
  };
  switch (icon) {
    case "shield":
      return React.createElement(
        "svg",
        common,
        iconPath({ d: "M12 3 5 6v5c0 4.4 2.8 8.4 7 10 4.2-1.6 7-5.6 7-10V6l-7-3Z" }, "shield"),
        iconPath({ d: "m9 12 2 2 4-5" }, "check"),
      );
    case "news":
      return React.createElement(
        "svg",
        common,
        iconPath({ d: "M4 5h12a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2V5Z" }, "paper"),
        iconPath({ d: "M8 9h6" }, "line1"),
        iconPath({ d: "M8 13h6" }, "line2"),
        iconPath({ d: "M20 8v9a2 2 0 0 1-2 2" }, "fold"),
      );
    case "chat":
      return React.createElement(
        "svg",
        common,
        iconPath({ d: "M21 12a8 8 0 0 1-8 8H8l-5 3 1.8-5.4A8 8 0 1 1 21 12Z" }, "bubble"),
        iconPath({ d: "M9 12h.01" }, "dot1"),
        iconPath({ d: "M12 12h.01" }, "dot2"),
        iconPath({ d: "M15 12h.01" }, "dot3"),
      );
    case "heart":
      return React.createElement(
        "svg",
        common,
        iconPath({ d: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" }, "heart"),
      );
    case "bell":
      return React.createElement(
        "svg",
        common,
        iconPath({ d: "M10.3 21a2 2 0 0 0 3.4 0" }, "clapper"),
        iconPath({ d: "M4 17h16a1 1 0 0 0 .7-1.7C19.4 14 18 12.5 18 8a6 6 0 0 0-12 0c0 4.5-1.4 6-2.7 7.3A1 1 0 0 0 4 17Z" }, "bell"),
      );
    default:
      return null;
  }
}

function renderLink(link, currentApp) {
  const isCurrent = Boolean(currentApp && link.appKey === currentApp);
  return React.createElement(
    "a",
    {
      "aria-current": isCurrent ? "page" : undefined,
      className: classNames("palengke-global-header__tool-link", isCurrent && "is-active"),
      href: link.href,
      key: `${link.appKey || link.label}:${link.href}`,
      target: link.external ? "_blank" : undefined,
      rel: link.external ? "noreferrer" : undefined,
    },
    link.label,
  );
}

function renderAuthAction(action) {
  return React.createElement(
    "a",
    {
      className: classNames(
        "topbar-signin",
        action.style === "secondary" && "secondary",
        `palengke-global-header__auth-link--${action.actionKey}`,
      ),
      href: action.href,
      key: `${action.actionKey}:${action.href}`,
    },
    action.label,
  );
}

function renderDefaultActions({ account, currentApp, appLinks, showCurrentAppLink }) {
  return React.createElement(
    HeaderAccountMenu,
    {
      appLinks,
      config: account || {},
      currentApp,
      featureActions: defaultFeatureActions,
      key: "palengke-account-menu",
      showCurrentAppLink,
    },
  );
}

function NewsMenu({ action }) {
  const menuRef = React.useRef(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const menuItems = action.menuItems || [
    {
      label: "Philippines news",
      description: "Top 10 latest headlines",
      href: "https://palengke.es/philippines-news",
      flag: "🇵🇭",
    },
    {
      label: "Spanish news",
      description: "Top 10 latest headlines",
      href: "https://palengke.es/spanish-news",
      flag: "🇪🇸",
    },
  ];

  React.useEffect(() => {
    function handleClick(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return React.createElement(
    "div",
    { className: "news-menu", key: `${action.actionKey}:${action.href}`, ref: menuRef },
    React.createElement(
      "button",
      {
        "aria-expanded": isOpen,
        "aria-haspopup": "menu",
        "aria-label": "Open news menu",
        className: classNames(
          "topbar-icon-button",
          "topbar-icon-button--news",
          "palengke-global-header__feature-button",
          "palengke-global-header__feature-button--news",
        ),
        onClick: () => setIsOpen((value) => !value),
        title: action.label,
        type: "button",
      },
      renderIcon(action.icon),
      React.createElement("span", { className: "palengke-global-header__feature-label" }, action.label),
    ),
    isOpen
      ? React.createElement(
          "div",
          { className: "news-menu__dropdown", role: "menu" },
          React.createElement("strong", null, "News"),
          menuItems.map((item) =>
            React.createElement(
              "a",
              {
                href: item.href,
                key: `${item.label}:${item.href}`,
                onClick: () => setIsOpen(false),
                role: "menuitem",
              },
              React.createElement("span", { "aria-hidden": "true", className: "news-menu__flag" }, item.flag),
              React.createElement(
                "span",
                null,
                React.createElement("b", null, item.label),
                item.description,
              ),
            ),
          ),
        )
      : null,
  );
}

function renderFeatureAction(action) {
  if (action.actionKey === "news") {
    return React.createElement(NewsMenu, { action, key: `${action.actionKey}:${action.href}` });
  }
  if (action.actionKey === "notifications") {
    return React.createElement(NotificationMenu, { action, key: `${action.actionKey}:${action.href}` });
  }

  return React.createElement(
    "a",
    {
      "aria-label": action.label,
      className: classNames(
        "palengke-global-header__feature-button",
        `palengke-global-header__feature-button--${action.actionKey}`,
      ),
      href: action.href,
      key: `${action.actionKey}:${action.href}`,
      title: action.label,
    },
    renderIcon(action.icon),
    React.createElement("span", { className: "palengke-global-header__feature-label" }, action.label),
  );
}

export function PalengkeWordmark({ className = "", label = "Palengke.es" } = {}) {
  return React.createElement(
    "span",
    { className: classNames("palengke-global-header__wordmark", className), "aria-label": label },
    React.createElement("span", null, "Palengke"),
    React.createElement("span", { className: "palengke-global-header__domain" }, ".es"),
  );
}

export function PalengkeHeader({
  account = null,
  actions = null,
  appLinks = defaultTools,
  brandProps = {},
  className = "",
  currentApp,
  homeHref = "https://palengke.es",
  nav = null,
  productHref,
  productLabel,
  showCurrentAppLink = true,
  sticky = true,
}) {
  const brandIsButton = typeof brandProps.onClick === "function";
  const brandContent = React.createElement(
    React.Fragment,
    null,
    React.createElement(PalengkeWordmark, null),
    productLabel
      ? React.createElement(
          "span",
          {
            className: "palengke-global-header__product",
            "data-href": productHref || undefined,
          },
          productLabel,
        )
      : null,
  );
  const brand = React.createElement(
    brandIsButton ? "button" : "a",
    {
      ...brandProps,
      "aria-label": brandProps["aria-label"] || "Palengke.es",
      className: classNames("palengke-global-header__brand", brandProps.className),
      href: brandIsButton ? undefined : brandProps.href || homeHref,
      type: brandIsButton ? "button" : undefined,
    },
    brandContent,
  );
  const tools = (appLinks || defaultTools).filter((link) => {
    if (link.hide) {
      return false;
    }
    if (!showCurrentAppLink && currentApp && link.appKey === currentApp) {
      return false;
    }
    return true;
  });
  const currentTool = tools.find((link) => currentApp && link.appKey === currentApp);

  return React.createElement(
    "header",
    { "aria-label": "Palengke ecosystem header", className: classNames("palengke-global-header", sticky && "palengke-global-header--sticky", className) },
    React.createElement(
      "div",
      { className: "palengke-global-header__brand-row" },
      brand,
      currentTool
        ? React.createElement("span", { className: "palengke-global-header__current-chip" }, currentTool.label)
        : null,
    ),
    React.createElement(
      "nav",
      { className: "palengke-global-header__tools", "aria-label": "Palengke tools" },
      nav || tools.map((link) => renderLink(link, currentApp)),
    ),
    React.createElement(
      "div",
      { className: "palengke-global-header__actions", "aria-label": "Palengke features" },
      renderDefaultActions({ account, actions, currentApp, appLinks: tools, showCurrentAppLink }),
    ),
  );
}

export const palengkeHeaderTools = defaultTools;

export function PalengkeAdminTabs({ currentApp, tabs = defaultAdminTabs } = {}) {
  return React.createElement(
    "nav",
    { className: "palengke-admin-tabs", "aria-label": "Palengke admin apps" },
    tabs.map((tab) => {
      const isCurrent = Boolean(currentApp && tab.appKey === currentApp);
      return React.createElement(
        "a",
        {
          className: classNames("palengke-admin-tabs__link", isCurrent && "is-active"),
          href: tab.href,
          key: `${tab.appKey || tab.label}:${tab.href}`,
          "aria-current": isCurrent ? "page" : undefined,
        },
        tab.label,
      );
    }),
  );
}

export const palengkeAdminTabs = defaultAdminTabs;
