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
  { label: "Chat", href: "https://palengke.es/global-chat", actionKey: "chat", icon: "chat" },
  { label: "Wishlist", href: "https://palengke.es/settings/profile", actionKey: "wishlist", icon: "heart" },
  { label: "Notifications", href: "https://palengke.es/settings/profile", actionKey: "notifications", icon: "bell" },
];

const defaultAuthActions = [
  { label: "Sign in", href: "https://palengke.es/#login", actionKey: "signin", style: "secondary" },
  { label: "Sign up", href: "https://palengke.es/#signup", actionKey: "signup", style: "primary" },
];


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

function renderDefaultActions({ actions, currentApp }) {
  if (actions && currentApp === "palengke") {
    return actions;
  }

  return React.createElement(
    React.Fragment,
    null,
    defaultFeatureActions.map((action) => renderFeatureAction(action)),
    actions || defaultAuthActions.map((action) => renderAuthAction(action)),
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

  return React.createElement(
    "header",
    { "aria-label": "Palengke ecosystem header", className: classNames("palengke-global-header", sticky && "palengke-global-header--sticky", className) },
    React.createElement("div", { className: "palengke-global-header__brand-row" }, brand),
    React.createElement(
      "nav",
      { className: "palengke-global-header__tools", "aria-label": "Palengke tools" },
      nav || tools.map((link) => renderLink(link, currentApp)),
    ),
    React.createElement(
      "div",
      { className: "palengke-global-header__actions", "aria-label": "Palengke features" },
      renderDefaultActions({ actions, currentApp }),
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
