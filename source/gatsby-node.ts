/* eslint-disable no-await-in-loop */
import process from "process";
import path from "path";
import fs from "fs/promises";
import { GatsbyNode, Actions } from "gatsby";
import pkgDir from "pkg-dir";
import pMap from "p-map";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import esm = require("esm");
import { GetStaticPaths, GetStaticProps } from "./next";

// eslint-disable-next-line unicorn/prefer-module
const esmRequire = esm(module);

const hasDynamicParameters = (route: string): boolean => route.includes("[");

const insertParameters = (
  route: string,
  parameters: Record<string, string>,
): string => {
  let routeWithParameters = route;

  for (const [name, value] of Object.entries(parameters)) {
    routeWithParameters = routeWithParameters.replace(`[${name}]`, value);
  }

  return routeWithParameters;
};

interface Route {
  pagePath: string;
  pageDataPath: string;
  route: string;
}

const findRoutes = async ({
  basePath,
  pathname = "/",
}: {
  basePath: string;
  pathname?: string;
}): Promise<Route[]> => {
  const routes: Route[] = [];
  const currentPath = path.join(basePath, pathname);
  const files = await fs.readdir(currentPath);

  for (const file of files) {
    const stat = await fs.stat(path.join(currentPath, file));

    if (stat.isDirectory()) {
      const nestedRoutes = await findRoutes({
        basePath,
        pathname: path.join(pathname, file),
      });

      routes.push(...nestedRoutes);

      continue;
    }

    if (file.endsWith(".data.js")) {
      continue;
    }

    const pagePath = path.join(currentPath, file);
    const extension = path.extname(file);
    const pageDataPath = path.join(
      currentPath,
      path.basename(file, extension) + ".data.js",
    );

    const route = path.basename(file, extension);

    routes.push({
      pagePath,
      pageDataPath,
      route: path.join(pathname, route === "index" ? "" : route),
    });
  }

  return routes;
};

const createRoute = async ({
  route,
  createPage,
}: {
  route: Route;
  createPage: Actions["createPage"];
}): Promise<void> => {
  const pageData = esmRequire(route.pageDataPath) as {
    getStaticPaths?: GetStaticPaths;
    getStaticProps: GetStaticProps;
  };

  if (!hasDynamicParameters(route.route)) {
    const { props } = await pageData.getStaticProps({
      params: {},
    });

    createPage({
      component: route.pagePath,
      path: route.route,
      context: props,
    });

    return;
  }

  if (typeof pageData.getStaticPaths !== "function") {
    throw new TypeError(
      `Page ${route.route} is missing a \`getStaticPaths\` function`,
    );
  }

  const { paths } = await pageData.getStaticPaths();

  await pMap(
    paths,
    async (pathContext) => {
      const { props } = await pageData.getStaticProps(pathContext);

      createPage({
        component: route.pagePath,
        path: insertParameters(route.route, pathContext.params),
        context: props,
      });
    },
    {
      concurrency: 50,
    },
  );
};

const dirExists = async (path: string): Promise<boolean> => {
  try {
    await fs.stat(path);
    return true;
  } catch {
    return false;
  }
};

export const createPages: GatsbyNode["createPages"] = async ({
  actions,
  reporter,
}) => {
  const { createPage } = actions;
  const rootPath = await pkgDir(process.cwd());
  const basePath = path.join(rootPath!, "src", "next-pages");
  const basePathExists = await dirExists(basePath);

  if (!basePathExists) {
    reporter.warn(
      "gatsby-plugin-next - `src/next-pages` directory doesn't exist",
    );
    return;
  }

  const routes = await findRoutes({ basePath });

  for (const route of routes) {
    await createRoute({ route, createPage });
  }
};

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({
  actions,
}) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        // eslint-disable-next-line unicorn/prefer-module
        next: path.resolve(__dirname, "next"),
      },
    },
  });
};
