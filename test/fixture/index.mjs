async function run() {
	await import("./async.mjs");
	await import("./async_with_last_resort.mjs");
}

run();
