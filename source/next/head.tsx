import React, { ReactNode } from "react";
import { Helmet } from "react-helmet-async";

interface Props {
  children?: ReactNode | undefined;
}

/**
 * Append elements to `<head>` of the page.
 */
export default function Head({ children }: Props): JSX.Element {
  return <Helmet>{children}</Helmet>;
}
