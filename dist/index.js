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
  { label: "News", href: "https://palengke.es/philippines-news", actionKey: "news", icon: "news" },
  { label: "Chat", href: "https://palengke.es/global-chat", actionKey: "chat", icon: "chat" },
  { label: "Wishlist", href: "https://palengke.es/settings/profile", actionKey: "wishlist", icon: "heart" },
  { label: "Notifications", href: "https://palengke.es/settings/profile", actionKey: "notifications", icon: "bell" },
  { label: "Account", href: "https://palengke.es/settings/profile", actionKey: "account", icon: "account" },
];

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
    case "account":
      return React.createElement(
        "span",
        { className: "palengke-global-header__account-mark", "aria-hidden": "true" },
        "P",
      );
    default:
      return null;
  }
}

function renderLink(link) {
  return React.createElement(
    "a",
    {
      className: "palengke-global-header__tool-link",
      href: link.href,
      key: `${link.appKey || link.label}:${link.href}`,
      target: link.external ? "_blank" : undefined,
      rel: link.external ? "noreferrer" : undefined,
    },
    link.label,
  );
}

function renderFeatureAction(action) {
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
  const brandContent = React.createElement(
    React.Fragment,
    null,
    React.createElement(PalengkeWordmark, null),
  );
  const brand = React.createElement(
    "a",
    { "aria-label": "Palengke.es", className: "palengke-global-header__brand", href: homeHref },
    brandContent,
  );

  return React.createElement(
    "header",
    { className: classNames("palengke-global-header", sticky && "palengke-global-header--sticky") },
    React.createElement("div", { className: "palengke-global-header__brand-row" }, brand),
    React.createElement(
      "nav",
      { className: "palengke-global-header__tools", "aria-label": "Palengke tools" },
      defaultTools.map((link) => renderLink(link)),
    ),
    React.createElement(
      "div",
      { className: "palengke-global-header__actions", "aria-label": "Palengke features" },
      defaultFeatureActions.map((action) => renderFeatureAction(action)),
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
