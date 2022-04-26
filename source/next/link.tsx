import { format } from "url";
import React, {
  useMemo,
  useCallback,
  Children,
  PropsWithChildren,
  MouseEvent,
  ReactElement,
} from "react";
import { navigate } from "gatsby";
import { UrlObject } from "../internal/types";

interface Props {
  /**
   * The path or URL to navigate to.
   */
  href: string | UrlObject;

  /**
   * Replace the current history state instead of adding a new url into the stack.
   *
   * @default false
   */
  replace?: boolean;

  onClick?: (event: MouseEvent) => void;
}

/**
 * Navigate between pages without triggering a full page reload.
 */
export default function Link({
  href,
  replace,
  children,
  onClick,
}: PropsWithChildren<Props>): JSX.Element {
  const child = Children.only(children);
  const url = useMemo(() => format(href), [href]);

  const click = useCallback(
    (event: MouseEvent) => {
      if (typeof onClick === "function") {
        onClick(event);
      }

      if (!event.defaultPrevented) {
        event.preventDefault();
        void navigate(url, { replace });
      }
    },
    [url, replace, onClick],
  );

  const isInternal = url.startsWith("/");

  return React.cloneElement(child as ReactElement, {
    href: url,
    onClick: isInternal ? click : onClick,
  });
}
