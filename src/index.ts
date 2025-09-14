import { type Compiler, RuntimeGlobals } from "@rspack/core";

const pluginName = "RetryChunkLoadPlugin";

export interface RetryChunkLoadPluginOptions {
	/**
	 * Optional identifier for the cache-busting function.
	 * Can be 'default' (`?cache-bust=true`) or 'timestamp' (Date.now()).
	 */
	cacheBust?: "default" | "timestamp";
	/**
	 * Optional key to use for cache busting when `cacheBust` is set.
	 */
	cacheBustKey?: string;
	/**
	 * Optional code to be executed in the browser context if after all retries chunk is not loaded.
	 * if not set - nothing will happen and error will be returned to the chunk loader.
	 */
	lastResortScript?: string;
	/**
	 * Optional value to set the maximum number of retries to load the chunk.
	 * Default is 3.
	 */
	maxRetries?: number;
	/**
	 * Optional value to set the amount of time in milliseconds before trying to load the chunk again.
	 * Default is 100ms.
	 */
	retryDelay?: number;
}

export class RetryChunkLoadPlugin {
	options: RetryChunkLoadPluginOptions;
	constructor(
		options: RetryChunkLoadPluginOptions = {
			maxRetries: 3,
			retryDelay: 100
		}
	) {
		this.options = { ...options };
	}

	apply(compiler: Compiler) {
		const { RuntimeModule } = compiler.webpack;

		class CustomRuntimeModule extends RuntimeModule {
			options: RetryChunkLoadPluginOptions;
			constructor(options: RetryChunkLoadPluginOptions) {
				super("x_ensure_retry");
				this.options = { ...options };
			}

			generate() {
				const getCacheBustString = () => {
					const { cacheBust, cacheBustKey } = this.options;
					// Return empty string if cacheBust is not set
					if (cacheBust !== "default" && cacheBust !== "timestamp") {
						if (cacheBustKey && typeof console !== "undefined") {
							console.warn(
								"[RetryChunkLoadPlugin] 'cacheBustKey' ignored because 'cacheBust' is not set."
							);
						}
						return '""';
					}
					// If cacheBustKey is set, use it
					if (typeof cacheBustKey === "string") {
						return `"${cacheBustKey}=" + ${
							cacheBust === "timestamp" ? `Date.now()` : `true`
						}`;
					}
					// If cacheBustKey is not set, use default values
					else {
						return cacheBust === "timestamp"
							? `Date.now()`
							: `"cache-bust=true"`;
					}
				};

				return `
      if (typeof ${RuntimeGlobals.require} !== "undefined") {
        var originalGet = ${RuntimeGlobals.getChunkScriptFilename};
        var originalEnsure = ${RuntimeGlobals.ensureChunk};
        var queryMap = {};
        var countMap = {};
        ${RuntimeGlobals.getChunkScriptFilename} = function(chunkId) {
          var result = originalGet(chunkId);
          return result + (queryMap.hasOwnProperty(chunkId) ? '?' + queryMap[chunkId] : '');
        };
        ${RuntimeGlobals.ensureChunk} = function(chunkId) {
          var result = originalEnsure(chunkId);
          return result.catch(function(error) {
            var retries = countMap.hasOwnProperty(chunkId) ? countMap[chunkId] : ${
							this.options.maxRetries
						};
            if (retries < 1) {
              error.message = 'Loading chunk ' + chunkId + ' failed after ${
								this.options.maxRetries
							} retries.';
			  ${this.options.lastResortScript ? this.options.lastResortScript : ""}
              throw error;
            }
            return new Promise(function(resolve) {
              var retryAttempt = ${this.options.maxRetries} - retries + 1;
              setTimeout(function() {
                var retryAttemptString = '&r=' + retryAttempt;
                var cacheBust = ${getCacheBustString()};
                var query = cacheBust + retryAttemptString;
                queryMap[chunkId] = query;
                countMap[chunkId] = retries - 1;
                resolve(${RuntimeGlobals.ensureChunk}(chunkId));
              }, ${this.options.retryDelay});
            });
          });
        };
      }
        `;
			}
		}

		compiler.hooks.thisCompilation.tap(pluginName, compilation => {
			compilation.hooks.runtimeRequirementInTree
				.for(RuntimeGlobals.ensureChunkHandlers)
				.tap(pluginName, chunk => {
					if (chunk.canBeInitial()) {
						compilation.addRuntimeModule(
							chunk,
							new CustomRuntimeModule(this.options)
						);
					}
				});
		});
	}
}
