# gatsby-plugin-next

> Gatsby plugin for incremental migration to Next.js by polyfilling Next.js APIs.

## Highlights

- Polyfills `next/head`, `next/link`, `next/router` and `next/script`.
- Adds support for Next.js routing.
- Data fetching via `getStaticPaths` and `getStaticProps` APIs.
- Exposes TypeScript types that match Next.js ones.

## Install

```
$ npm install --save-dev gatsby-plugin-next
```

## Usage

Add `gatsby-plugin-next` to `gatsby-config.js`:

```diff
module.exports = {
	plugins: [
+		'gatsby-plugin-next'
	]
};
```

## API

### next/head

Append elements to `<head>` of the page.

How to migrate:

```jsx
// Before
import { Helmet } from "react-helmet";

export default function MyPage() {
	return (
		<Helmet>
			<title>This is my website</title>
		</Helmet>
	);
}

// After
import Head from "next/head";

export default function MyPage() {
	return (
		<Head>
			<title>This is my website</title>
		</Head>
	);
}
```

Learn more in [Next.js documentation](https://nextjs.org/docs/api-reference/next/head).

### next/link

Navigate between pages without triggering a full page reload.

_Note:_ This component doesn't prefetch the next page on hover, because it doesn't use Gatsby's `Link` component and Gatsby doesn't expose an API to trigger prefetching.

#### href

Type: `string` or [`UrlObject`](https://nodejs.org/api/url.html#url_url_strings_and_url_objects).

```jsx
import Link from "next/link";

export default function MyPage() {
	return (
		<Link href="/my/other/page">
			<a>Go to my other page</a>
		</Link>
	);
}
```

#### replace

Type: `boolean`\
Default: `false`

Replace the current history state instead of adding a new url into the stack.

```jsx
import Link from "next/link";

export default function MyPage() {
	return (
		<Link href="/my/other/page" replace>
			<a>Replace this page with the other one</a>
		</Link>
	);
}
```

How to migrate:

```jsx
// Before
import { Link } from "gatsby";

export default function MyPage() {
	return <Link to="/my/other/page">Go to my other page</Link>;
}

// After
import Link from "next/link";

export default function MyPage() {
	return <Link href="/my/other/page">
		<a>Go to my other page</a>
	</Link>;
}
```

Learn more in [Next.js documentation](https://nextjs.org/docs/api-reference/next/link).

### next/router

#### useRouter

React hook that returns a [`router`](#router-object) object.

```jsx
import { useRouter } from "next/router";

export default function MyPage() {
	const router = useRouter();

	return <button onClick={() => router.push("/other/page")}>Push me</button>;
}
```

How to migrate:

```jsx
// Before
import { navigate } from "gatsby";
import { useLocation } from "@reach/router";

export default function MyPage() {
	const location = useLocation();

	// Get current pathname
	const pathname = location.pathname;

	// Get query object
	const query = new URLSearchParams(location.search);

	// Navigate programmatically
	const goToOtherPage = () => {
		navigate("/other/page");
	};

	// Navigate programmatically without adding a new history entry
	const replaceWithOtherPage = () => {
		navigate("/other/page", { replace: true });
	};

	return <SomeComponents />;
};

// After
import { useRouter } from "next/router";

export default function MyPage() {
	const router = useRouter();

	// Get current pathname
	const pathname = router.asPath;

	// Get query object
	const query = router.query;

	// Navigate programmatically
	const goToOtherPage = () => {
		router.push("/other/page");
	};

	// Navigate programmatically without adding a new history entry
	const replaceWithOtherPage = () => {
		router.replace("/other/page");
	};

	return <SomeComponents />;
};
```

Learn more in [Next.js documentation](https://nextjs.org/docs/api-reference/next/router#userouter).

#### `router` object

##### asPath

The path (including the query and a hash) shown in the browser.

```js
const router = useRouter();
router.asPath; //=> /my/page
```

##### query

The query string parsed to an object.

```js
const router = useRouter();
router.query; //=> { "queryParameter": "hello" }
```

##### push(url)

Navigate to a page.

###### url

Type: `string` or [`UrlObject`](https://nodejs.org/api/url.html#url_url_strings_and_url_objects).

```js
const router = useRouter();

// String
router.push("/my/page");

// URL object
router.push({
	pathname: "/my/page",
});
```

##### replace(url)

Navigate to page without adding a new URL entry into the `history` stack.

API is the same as `push`.

##### back()

Navigate back in history.

```js
const router = useRouter();
router.back();
```

##### reload()

Reload the current URL.

```js
const router = useRouter();
router.reload();
```

Learn more in [Next.js documentation](https://nextjs.org/docs/api-reference/next/router#router-object).

#### withRouter

Returns Higher-Order-Component that injects a [`router` object](#router-object) as a prop.

```jsx
import React from "react";
import { withRouter } from "next/router";

class MyPage extends React.Component {
	render() {
		const { router } = this.props;

		return <p>{router.pathname}</p>;
	}
}

export default withRouter(MyPage);
```

Learn more in [Next.js documentation](https://nextjs.org/docs/api-reference/next/router#withrouter).

#### TypeScript

`next/router` exposes `NextRouter` type in case you need to use [`withRouter`](#withrouter) in a TypeScript codebase.

```tsx
import { withRouter, NextRouter } from "next/router";

interface WithRouterProps {
	router: NextRouter;
}

interface MyComponentProps extends WithRouterProps {}

class MyPage extends React.Component<MyComponentProps> {
	render() {
		const { router } = this.props;

		return <p>{router.pathname}</p>;
	}
}

export default withRouter(MyPage);
```

Learn more in [Next.js documentation](https://nextjs.org/docs/api-reference/next/router#typescript).

### next/script

Load external scripts that aren't compiled as part of your bundle.

#### src

Type: `string`

A path string specifying the URL of an external script. This can be either an absolute external URL or an internal path.

#### strategy

Type: `string`\
Default: `afterInteractive`

The loading strategy of the script.

- `beforeInteractive` - Load script before the page becomes interactive by injecting it into `<head>` during SSR.
- `afterInteractive` - Load script immediately after the page becomes interactive.
- `lazyOnload` - Load script during browser idle time.

#### onLoad

Type: `function`

Callback, which is executed after script is loaded.

_Note:_ It can't be used with `beforeInteractive` strategy.

#### onError

Type: `function`

Callback, which is executed when script has failed to load.

_Note:_ It can't be used with `beforeInteractive` strategy.

```jsx
import Script from "next/script";

export default function MyPage() {
	return (
		<>
			<Script src="/external-script.js" />
			<Script
				src="https://plausible.io/js/script.js"
				data-domain="mydomain.com"
			/>
		</>
	);
}
```

Learn more in [Next.js documentation](https://nextjs.org/docs/api-reference/next/script).

### Data Fetching

This plugin lets you incrementally migrate data fetching from Gatsby APIs to Next.js ones.
All pages in `src/next-pages` directory (you need to create it yourself) can use Next.js APIs like `getStaticProps` to fetch data, while pages in `src/pages` will continue to fetch data via Gatsby's GraphQL layer.
Files in `src/next-pages` use Next.js-style routing, like `[id].js`, with support for nested routes like `deeply/nested/posts/[id].js`.

Each page in `src/next-pages` requires two files:

- `posts.js` - Exports a React component to render the page.
- `posts.data.js` - Exports `getStaticProps` to fetch the data, which will be passed to component exported from `posts.js`.

For example:

**posts.js**

```jsx
import React from "react";
import Link from "next/link";

export default function Posts({ pageContext: { posts } }) {
	return (
		<ul>
			{posts.map((post) => (
				<li key={post.id}>
					<Link href={`/posts/${post.id}`}>
						<a>{post.title}</a>
					</Link>
				</li>
			))}
		</ul>
	);
}
```

_Note:_ When you will switch to the actual Next.js, don't forget to remove `pageContext`, as this is a variable specific to Gatsby.

```diff
-export default function Posts({ pageContext: { posts } }) {
+export default function Posts({ posts }) {
```

**posts.data.js**

```js
import fetch from "node-fetch";

export async function getStaticProps() {
	const response = await fetch("https://my-headless-cms.com/posts");
	const posts = await response.json();
	//=> [{ "id": 1, "title": "Post title", "body": "..." }, ...]

	return {
		props: { posts },
	};
}
```

With the files above, Gatsby will generate `/posts` page with a list of posts from `getStaticProps` function. You can fetch data in any way you need, since it's just a regular function executed at build-time.

Now we need to add a page for displaying each post by creating a `/posts/[id]` route:

```diff
src/next-pages/
	- posts.js
	- posts.data.js
+	- posts/
+		- [id].js
+		- [id].data.js
```

**[id].js**

```jsx
import React from "react";

export default function Post({ pageContext: { post } }) {
	return (
		<div>
			<h1>{post.title}</h1>
			<p>{post.body}</p>
		</div>
	);
}
```

Since we need to generate pages for all posts at build-time, we can use `getStaticPaths` function for providing a list of parameters to generate this page for.
Then, `getStaticProps` function will be executed for each set of parameters and generate a separate page. For example, `/posts/1`, `/posts/2` and so on.

**[id.data.js]**

```js
import fetch from "node-fetch";

export async function getStaticPaths() {
	const response = await fetch("https://my-headless-cms.com/posts");
	const posts = await response.json();

	return {
		paths: posts.map((post) => ({
			id: post.id,
		})),
	};
}

export async function getStaticProps({ params }) {
	const response = await fetch(
		`https://my-headless-cms.com/posts/${params.id}`,
	);

	const post = await response.json();

	return {
		props: { post },
	};
}
```

Done!

When you've migrated all data fetching to these APIs and you're ready to switch to Next.js:

1. Move all files in `src/next-pages` into `pages` directory used by Next.js (`src/pages` is also supported).
2. Move all code from `*.data.js` files into pages themselves.
3. Delete `src/next-pages`.

Congratulations, you're running Next.js now.

#### API

##### getStaticPaths()

Define this function when page has dynamic segments (e.g. `[id].js`) and return a list of parameters for each page.

```js
export async function getStaticPaths() {
	return {
		paths: [
			{
				params: { id: 1 },
			},
			{
				params: { id: 2 },
			},
			// and so on
		],
	};
}
```

**Note:** Only `paths` is used by this plugin, `fallback` is ignored.

Learn more in [Next.js documentation](https://nextjs.org/docs/api-reference/data-fetching/get-static-paths).

##### getStaticProps(context)

Define this function to fetch data and return `props` object to pass to the component rendering this page.

###### context

Type: `object`

Context object which includes `params` object returned from `getStaticPaths` for this page.

```js
export async function getStaticProps({ params }) {
	const post = await fetchPostById();

	return {
		props: { post },
	};
}
```

Learn more in [Next.js documentation](https://nextjs.org/docs/api-reference/data-fetching/get-static-props).

**Note:** Only `props` is used by this plugin, other keys supported in the actual `getStaticPaths` in Next.js are ignored.
