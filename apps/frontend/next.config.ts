import withNextIntl from "next-intl/plugin";
import path from "path";

export default withNextIntl("./i18n/request.ts")({
  transpilePackages: ["@repo/ui"],
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  images: {
    loader: "custom",
    loaderFile: "./imageLoader.ts",
  },
});
