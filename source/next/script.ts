import { useEffect, useContext } from "react";
import ScriptContext, { ScriptProps } from "../internal/script-context";

// Browser resolves `src` attribute of <script> element to an absolute URL,
// so we need this function to compare `src` values after <script> is added to DOM
const resolveUrl = (url: string): string => {
  return url.startsWith("/") ? window.location.origin + url : url;
};

const findScript = (
  src: string | undefined,
  source: string | undefined,
): HTMLScriptElement | undefined => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const scripts = Array.from(
    document.querySelectorAll("head > script"),
  ) as HTMLScriptElement[];

  for (const script of scripts) {
    if (typeof src === "string" && script.src === resolveUrl(src)) {
      return script;
    }

    if (typeof source === "string" && script.textContent === source) {
      return script;
    }
  }

  // Make TS and XO happy
  return undefined;
};

const getSourceFromProps = (
  dangerouslySetInnerHTML: ScriptProps["dangerouslySetInnerHTML"],
  children: ScriptProps["children"],
): string | undefined => {
  if (dangerouslySetInnerHTML) {
    return dangerouslySetInnerHTML.__html || "";
  }

  if (Array.isArray(children)) {
    return children.join("");
  }

  if (typeof children === "string") {
    return children;
  }

  // Make TS and XO happy
  return undefined;
};

const loadScript = ({
  src,
  strategy,
  dangerouslySetInnerHTML,
  children,
  onLoad,
  onError,
  ...props
}: ScriptProps): void => {
  const source = getSourceFromProps(dangerouslySetInnerHTML, children);
  const existingScript = findScript(src, source);

  if (existingScript) {
    return;
  }

  const script = document.createElement("script");

  if (strategy !== "beforeInteractive") {
    if (typeof onLoad === "function") {
      script.addEventListener("load", onLoad);
    }

    if (typeof onError === "function") {
      script.addEventListener("error", onError);
    }
  }

  if (typeof src === "string") {
    script.src = src;
  }

  if (typeof source === "string") {
    if (dangerouslySetInnerHTML) {
      script.innerHTML = source;
    } else {
      script.textContent = source;
    }
  }

  for (const [prop, value] of Object.entries(props)) {
    script.setAttribute(prop, value);
  }

  const head = document.querySelector("head");
  head?.append(script);
};

const loadLazyScript = (props: ScriptProps): void => {
  if (document.readyState === "complete") {
    requestIdleCallback(() => {
      loadScript(props);
    });

    return;
  }

  window.addEventListener("load", () => {
    requestIdleCallback(() => {
      loadScript(props);
    });
  });
};

/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/ban-types */
/**
 * Load external scripts that aren't compiled as part of your bundle.
 */
export default function Script(props: ScriptProps): JSX.Element | null {
  const { strategy = "afterInteractive" } = props;

  const ssrContext = useContext(ScriptContext);
  const isSsr = Array.isArray(ssrContext);

  // If this component is rendering on the server, add this script to SSR context,
  // which will be later added to <head> when Gatsby generates the output HTML
  if (isSsr && strategy === "beforeInteractive") {
    ssrContext.push(props);
  }

  useEffect(() => {
    const { src, dangerouslySetInnerHTML, children } = props;

    if (strategy === "beforeInteractive") {
      const source = getSourceFromProps(dangerouslySetInnerHTML, children);
      const isLoaded = Boolean(findScript(src, source));

      // When there's a script added at SSR stage to a page user just navigated to,
      // it won't be loaded, because Gatsby doesn't update <head> contents, so
      // this script needs to be loaded manually
      if (!isLoaded) {
        loadScript(props);
        return;
      }
    }

    if (strategy === "afterInteractive") {
      loadScript(props);
    }

    if (strategy === "lazyOnload") {
      loadLazyScript(props);
    }
  }, [strategy, props]);

  return null;
}
/* eslint-enable */
