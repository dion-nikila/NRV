import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("https://nrv.example/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the NRV studio site", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>NRV — Software, resolved<\/title>/i);
  assert.match(html, /Software built around/i);
  assert.match(html, /What we build\./i);
  assert.match(html, /Built to be precise\./i);
  assert.match(html, /Tools are choices, not trophies\./i);
  assert.match(html, /Made for the messy middle\./i);
  assert.match(html, /How we work\./i);
  assert.match(html, /Bring us the rough sketch\./i);
  assert.match(html, /hello@nrv\.studio/i);
  assert.match(html, /\/og\.png/i);
  assert.doesNotMatch(html, /codex-preview|Building your site|react-loading-skeleton/i);
});

test("keeps the finished brand system and restrained component suite wired", async () => {
  const [page, layout, globals, site, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/components/NRVSite.jsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<NRVSite \/>/);
  assert.match(layout, /NRV — Software, resolved/);
  assert.match(layout, /\/og\.png/);
  assert.match(globals, /--paper:\s*#cbab70/i);
  assert.match(globals, /--ink:\s*#16241f/i);
  assert.match(globals, /--teal:\s*#2b6b6d/i);
  assert.match(globals, /prefers-reduced-motion:\s*reduce/i);

  for (const component of [
    "Cubes",
    "LetterGlitch",
    "PillNav",
  ]) {
    assert.match(site, new RegExp(`import ${component} from`));
  }

  assert.doesNotMatch(site, /import (LogoLoop|MagicBento) from/);
  assert.match(site, /TypeScript[\s\S]*React[\s\S]*Next\.js[\s\S]*Cloudflare/);

  assert.match(packageJson, /"gsap":/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await Promise.all([
    access(new URL("../public/nrv-mark.svg", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
    assert.rejects(access(new URL("../app/_sites-preview", import.meta.url))),
  ]);

  assert.ok(projectRoot);
});
