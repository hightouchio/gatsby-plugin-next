import React, { ReactNode } from "react";
import { HelmetProvider, HelmetServerState } from "react-helmet-async";
import { GatsbySSR } from "gatsby";
import ScriptContext, { ScriptProps } from "./internal/script-context";

type ScriptContextType = ScriptProps[];
type HeadContextType = { helmet?: HelmetServerState };

const scriptContexts = new Map<string, ScriptContextType>();
const headContexts = new Map<string, HeadContextType>();

export const onRenderBody: GatsbySSR["onRenderBody"] = ({
  pathname,
  setHeadComponents,
  setHtmlAttributes,
  setBodyAttributes,
}) => {
  const headComponents: ReactNode[] = [];
  const scriptContext = scriptContexts.get(pathname);

  if (Array.isArray(scriptContext)) {
    const scriptComponents = scriptContext.map(
      ({ strategy, onLoad, onError, ...props }, index) => {
        // eslint-disable-next-line react/no-array-index-key
        return <script key={index} {...props} />;
      },
    );

    headComponents.push(...scriptComponents);
  }

  const headContext = headContexts.get(pathname);
  const helmet = headContext?.helmet;

  if (helmet) {
    headComponents.push(
      ...([
        helmet.base.toComponent(),
        helmet.title.toComponent(),
        helmet.meta.toComponent(),
        helmet.link.toComponent(),
        helmet.style.toComponent(),
        helmet.script.toComponent(),
        helmet.noscript.toComponent(),
      ] as unknown as ReactNode[]),
    );

    setHtmlAttributes(helmet.htmlAttributes.toComponent());
    setBodyAttributes(helmet.bodyAttributes.toComponent());
  }

  setHeadComponents(headComponents);
};

export const wrapRootElement: GatsbySSR["wrapRootElement"] = ({
  pathname,
  element,
}) => {
  // Disable the rule about changing context value on every render,
  // because this is SSR and Gatsby is going to render the tree once.
  // eslint-disable-next-line react/jsx-no-constructed-context-values
  const scriptContext: ScriptContextType = [];
  const headContext: HeadContextType = {};

  scriptContexts.set(pathname, scriptContext);
  headContexts.set(pathname, headContext);

  return (
    <HelmetProvider context={headContext}>
      <ScriptContext.Provider value={scriptContext}>
        {element}
      </ScriptContext.Provider>
    </HelmetProvider>
  );
};
