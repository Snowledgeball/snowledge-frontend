import withNextIntl from "next-intl/plugin";

export default withNextIntl("./i18n/request.ts")({
  transpilePackages: ["@repo/ui"],
  output: "standalone",
  images: {
    loader: "custom",
    loaderFile: "./imageLoader.ts",
  },
});
