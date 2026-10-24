import { _electron as electron, expect } from "@playwright/test";
import { mkdtemp, rm, mkdir } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const profile = await mkdtemp(path.join(os.tmpdir(), "putkege-desktop-test-"));
const packaged = process.argv.includes("--packaged");
if (packaged && process.platform !== "win32")
  throw Error("Run the packaged Windows smoke test on Windows.");
let app;
const launch = () =>
  electron.launch({
    cwd: root,
    executablePath: packaged
      ? path.join(root, "release", "win-unpacked", "Put-k-EGE.exe")
      : undefined,
    args: [
      ...(packaged ? [] : [root]),
      `--user-data-dir=${profile}`,
      ...(process.platform === "linux"
        ? [
            "--no-sandbox",
            ...(process.env.PUTKEGE_TEST_GUI
              ? []
              : ["--ozone-platform=headless"]),
          ]
        : []),
    ],
    timeout: 60000,
  });
try {
  app = await launch();
  let page = await app.firstWindow();
  await page.waitForURL("study://app/index.html");
  await expect(
    page.getByRole("heading", { name: "Твой путь начинается здесь." }),
  ).toBeVisible();
  expect(await page.evaluate(() => typeof window.require)).toBe("undefined");
  expect(await page.evaluate(() => window.isSecureContext)).toBe(true);
  // Bundled lessons remain available with network access disabled.
  await page.context().setOffline(true);
  await page
    .getByRole("link", { name: "Начать обучение", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Причастный оборот", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Посмотреть пример" }).click();
  await expect(page.locator("mark")).toHaveText("лежащая на столе");
  await page.goto("study://app/index.html#/essay");
  await page
    .getByRole("textbox", { name: "Текст сочинения" })
    .fill("Это черновик в настольном приложении.");
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("dark-world-progress-v1")).essay,
      ),
    )
    .toBe("Это черновик в настольном приложении.");
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Текст сочинения" }),
  ).toHaveValue("Это черновик в настольном приложении.");
  // Persist across a full Electron process restart, not just a page reload.
  await app.close();
  app = await launch();
  page = await app.firstWindow();
  await page.goto("study://app/index.html#/essay");
  await expect(
    page.getByRole("textbox", { name: "Текст сочинения" }),
  ).toHaveValue("Это черновик в настольном приложении.");
  await page.goto("study://app/index.html#/map");
  await expect(page.locator(".topic-card")).toHaveCount(13);
  await mkdir(path.join(root, "test-results"), { recursive: true });
  await page.screenshot({
    path: path.join(root, "test-results", "desktop-smoke.png"),
  });
  console.log(
    "PASS: desktop start, secure isolated renderer, offline lesson, hash navigation, draft persisted after process restart, 13 map topics.",
  );
} finally {
  await app?.close();
  await rm(profile, { recursive: true, force: true });
}
