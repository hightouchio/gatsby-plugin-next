import { format } from "url";
import React, { useMemo, ComponentType, FC } from "react";
import { useLocation } from "@reach/router";
import { navigate } from "gatsby";
import queryString, { ParsedQuery } from "query-string";
import { UrlObject } from "../internal/types";

/**
 * Object containing data about the current page and navigation methods.
 */
export interface NextRouter {
  /**
   * The path (including the query and a hash) shown in the browser.
   */
  asPath: string;

  /**
   * The query string parsed to an object.
   *
   * @default {}
   */
  query: ParsedQuery;

  /**
   * Navigate to a page.
   */
  push: (url: UrlObject | string) => void;

  /**
   * Navigate to page without adding a new URL entry into the `history` stack.
   */
  replace: (url: UrlObject | string) => void;

  /**
   * Navigate back in history.
   */
  back: () => void;

  /**
   * Reload the current URL.
   */
  reload: () => void;
}

/**
 * React hook that returns a `router` object.
 */
export const useRouter = (): NextRouter => {
  const location = useLocation();

  const router = useMemo(
    () => ({
      query: queryString.parse(location.search),
      asPath: location.href.replace(location.origin, ""),
      push(url: string | UrlObject) {
        void navigate(format(url));
      },
      replace(url: string | UrlObject) {
        void navigate(format(url), {
          replace: true,
        });
      },
      back() {
        window.history.back();
      },
      reload() {
        window.location.reload();
      },
    }),
    [location],
  );

  return router;
};

/**
 * Returns Higher-Order-Component that injects a `router` object as a prop.
 */
export function withRouter<Props>(
  Component: ComponentType<Props>,
): FC<Props & { router: NextRouter }> {
  return (props) => {
    const router = useRouter();

    return <Component {...props} router={router} />;
  };
}
