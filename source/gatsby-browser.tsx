import React from "react";
import { GatsbyBrowser } from "gatsby";
import { HelmetProvider } from "react-helmet-async";
import ScriptContext from "./internal/script-context";

export const wrapRootElement: GatsbyBrowser["wrapRootElement"] = ({
  element,
}) => (
  <HelmetProvider>
    <ScriptContext.Provider value={undefined}>{element}</ScriptContext.Provider>
  </HelmetProvider>
);
