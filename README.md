# rspack-retry-chunk-load-plugin

[![npm version](https://badge.fury.io/js/rspack-retry-chunk-load-plugin.svg)](http://badge.fury.io/js/rspack-retry-chunk-load-plugin)
[![GitHub issues](https://img.shields.io/github/issues/khodorammar/rspack-retry-chunk-load-plugin.svg)](https://github.com/khodorammar/rspack-retry-chunk-load-plugin/issues)
[![GitHub stars](https://img.shields.io/github/stars/khodorammar/rspack-retry-chunk-load-plugin.svg)](https://github.com/khodorammar/rspack-retry-chunk-load-plugin/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/khodorammar/rspack-retry-chunk-load-plugin/master/LICENSE)

A rspack plugin to retry loading of async chunks that failed to load

Inspired by [webpack-retry-load-plugin](https://github.com/mattlewis92/webpack-retry-chunk-load-plugin)

## Usage

```javascript
// rspack.config.js
import { RetryChunkLoadPlugin } from "rspack-retry-chunk-load-plugin";

plugins: [
	new RetryChunkLoadPlugin({
    /**
     * Optional identifier for the cache-busting function. Can be 'default' (`?cache-bust=true`) or 'timestamp' (Date.now()).
     */
    cacheBust: "timestamp";
    /**
     * Optional value to set the maximum number of retries to load the chunk.
     * Default is 3.
     */
    maxRetries: 3;
    /**
     * Optional value to set the amount of time in milliseconds before trying to load the chunk again.
     * Default is 100ms.
     */
    retryDelay: 100;
	})
];
```

## License

MIT
