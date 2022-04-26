/* eslint-disable @typescript-eslint/ban-types */
import { ParsedUrlQueryInput } from "querystring";

export interface UrlObject {
  auth?: string | null;
  hash?: string | null;
  host?: string | null;
  hostname?: string | null;
  href?: string | null;
  path?: string | null;
  pathname?: string | null;
  protocol?: string | null;
  search?: string | null;
  slashes?: boolean | null;
  port?: string | number | null;
  query?: string | null | ParsedUrlQueryInput;
}
