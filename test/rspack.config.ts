import * as path from "path";
import { HtmlRspackPlugin } from "@rspack/core";
import { RetryChunkLoadPlugin } from "../src";

export default {
	mode: "development",
	resolve: { extensions: [".ts"] },
	output: { path: path.join(__dirname, "dist") },
	entry: {
		main: "./test/fixture/index.mjs"
	},
	plugins: [
		new HtmlRspackPlugin(),
		new RetryChunkLoadPlugin({
			retryDelay: 500,
			maxRetries: 3,
			cacheBust: "timestamp",
			lastResortScript: "alert('I am definitely a last resort');"
		})
	]
};
