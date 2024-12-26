// @ts-check
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.get("/test_fixture_async_mjs.js", (request, response, next) => {
	if (request.query["r"] === "3") {
		next();
	} else {
		response.status(500).send("fail");
	}
});

app.use(express.static(path.join(__dirname, "dist")));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
