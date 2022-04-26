export type GetStaticPaths = () => Promise<{
  paths: Array<{
    params: Record<string, string>;
  }>;
}>;

export type GetStaticProps = (context: {
  params: Record<string, string>;
}) => Promise<{
  props: Record<string, unknown>;
}>;
