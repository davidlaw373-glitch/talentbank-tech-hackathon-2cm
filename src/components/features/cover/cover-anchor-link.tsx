"use client";

import type { ComponentProps, MouseEvent } from "react";
import Link from "next/link";

type CoverAnchorLinkProps = Omit<
  ComponentProps<typeof Link>,
  "href" | "onClick"
> & {
  href: `#${string}`;
  onNavigate?: () => void;
};

export function CoverAnchorLink({
  href,
  onNavigate,
  ...props
}: CoverAnchorLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const target = document.getElementById(href.slice(1));
    if (!target) return;

    event.preventDefault();
    onNavigate?.();

    if (window.location.hash !== href) {
      window.history.pushState(null, "", href);
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
