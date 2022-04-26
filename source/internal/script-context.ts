import { createContext, ScriptHTMLAttributes } from "react";

export interface ScriptProps extends ScriptHTMLAttributes<HTMLScriptElement> {
  /**
   * The loading strategy of the script.
   *
   * - `beforeInteractive` - Load script before the page becomes interactive by injecting it into `<head>` during SSR.
   * - `afterInteractive` - Load script immediately after the page becomes interactive.
   * - `lazyOnload` - Load script during browser idle time.
   */
  strategy?: "beforeInteractive" | "afterInteractive" | "lazyOnload";

  /**
   * Callback, which is executed after script is loaded.
   *
   * *Note:* It can't be used with `beforeInteractive` strategy.
   */
  onLoad: () => void;

  /**
   * Callback, which is executed when script has failed to load.
   *
   * *Note:* It can't be used with `beforeInteractive` strategy.
   */
  onError: () => void;
}

type Props = undefined | ScriptProps[];

// eslint-disable-next-line @typescript-eslint/naming-convention
const ScriptContext = createContext<Props>(undefined);

export default ScriptContext;
