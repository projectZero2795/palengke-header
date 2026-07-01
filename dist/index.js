import React from "react";

const defaultTools = [
  { label: "Palengke", href: "https://palengke.es", appKey: "palengke" },
  { label: "Jobs", href: "https://jobs.palengke.es", appKey: "jobs" },
  { label: "Home", href: "https://home.palengke.es", appKey: "home" },
  { label: "Guide", href: "https://guide.palengke.es", appKey: "guide" },
  { label: "CV", href: "https://cv.palengke.es", appKey: "cv" }
];

function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}

function renderLink(link, currentApp) {
  const isCurrent = Boolean(currentApp && link.appKey === currentApp);
  return React.createElement(
    "a",
    {
      className: classNames("palengke-global-header__tool-link", isCurrent && "is-active"),
      href: link.href,
      key: ,
      "aria-current": isCurrent ? "page" : undefined,
      target: link.external ? "_blank" : undefined,
      rel: link.external ? "noreferrer" : undefined
    },
    link.label
  );
}

export function PalengkeWordmark({ className = "", label = "Palengke.es" } = {}) {
  return React.createElement(
    "span",
    { className: classNames("brand-wordmark palengke-global-header__wordmark", className), "aria-label": label },
    React.createElement("span", null, "Palengke"),
    React.createElement("span", { className: "brand-wordmark__domain palengke-global-header__domain" }, ".es")
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
  sticky = true
}) {
  const brandContent = React.createElement(
    React.Fragment,
    null,
    React.createElement(PalengkeWordmark, null),
    productLabel
      ? React.createElement(
          "span",
          { className: "brand-product palengke-global-header__product" },
          productLabel
        )
      : null
  );
  const brandClassName = classNames("brand palengke-global-header__brand", brandProps.className);
  const brandHref = productHref || homeHref;
  const brand = brandProps.onClick
    ? React.createElement(
        "button",
        { ...brandProps, className: brandClassName, type: brandProps.type || "button" },
        brandContent
      )
    : React.createElement(
        "a",
        { ...brandProps, className: brandClassName, href: brandHref },
        brandContent
      );

  return React.createElement(
    "header",
    { className: classNames("topbar palengke-global-header", sticky && "palengke-global-header--sticky", className) },
    React.createElement("div", { className: "palengke-global-header__brand-row" }, brand),
    nav || React.createElement(
      "nav",
      { className: "palengke-global-header__tools", "aria-label": "Palengke tools" },
      appLinks.filter((link) => !link.hide).map((link) => renderLink(link, currentApp))
    ),
    actions ? React.createElement("div", { className: "topbar-actions palengke-global-header__actions" }, actions) : null
  );
}

export const palengkeHeaderTools = defaultTools;
