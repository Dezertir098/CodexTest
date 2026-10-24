import { test, expect } from "@playwright/test";
test("полный урок: ошибка, помощь, новое решение, сохранение после перезапуска", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Начать обучение", exact: true })
    .click();
  await page.getByRole("button", { name: "Посмотреть пример" }).click();
  await expect(page.locator("mark")).toHaveText("лежащая на столе");
  await page.getByRole("button", { name: "Как решать самому" }).click();
  await page.getByRole("button", { name: "Попробовать вместе" }).click();
  await page
    .getByRole("textbox", { name: "Последовательность цифр" })
    .fill("1");
  await page.getByRole("button", { name: "Проверить ответ" }).click();
  await expect(
    page.getByText("Посмотрим, где возникла трудность."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Не понял", exact: true }).click();
  await page.getByRole("button", { name: "Покажи другой пример" }).click();
  await expect(
    page.getByText(/Освещённая солнцем комната казалась просторнее. Оборот/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Закрыть помощь" }).click();
  await page.getByRole("button", { name: "Завершить практику" }).click();
  await page.getByRole("button", { name: "Продолжить урок" }).click();
  await page
    .getByRole("textbox", { name: "Последовательность цифр" })
    .fill("12");
  await page.getByRole("button", { name: "Проверить ответ" }).click();
  await expect(page.getByText("Верно. Разберём почему.")).toBeVisible();
  await page.getByRole("button", { name: "Следующее задание" }).click();
  await page
    .getByRole("button", {
      name: "А Освещённая солнцем комната казалась просторнее.",
    })
    .click();
  await page.getByRole("button", { name: "Проверить ответ" }).click();
  await page.getByRole("button", { name: "Следующее задание" }).click();
  for (const word of ["освещённая", "холодной", "луной"])
    await page.getByRole("button", { name: word, exact: true }).click();
  await page.getByRole("button", { name: "Проверить ответ" }).click();
  await page.getByRole("button", { name: "Следующее задание" }).click();
  await page.getByRole("button", { name: "Запятая 1" }).click();
  await page.getByRole("button", { name: "Запятая 2" }).click();
  await page.getByRole("button", { name: "Проверить ответ" }).click();
  await page.getByRole("button", { name: "Завершить практику" }).click();
  await page.getByRole("button", { name: "Продолжить урок" }).click();
  await page
    .getByRole("button", {
      name: "Оборот стоит после определяемого существительного и заканчивается до сказуемого.",
    })
    .click();
  await page.getByRole("button", { name: "Проверить объяснение" }).click();
  await page
    .getByRole("button", { name: "Завершить урок", exact: true })
    .click();
  await expect(page.getByText("Теперь у тебя есть опора.")).toBeVisible();
  await page.reload();
  await page.goto("/statistics");
  await expect(page.locator(".history-row")).toContainText(
    "Причастные обороты",
  );
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("dark-world-progress-v1")!).completed,
    ),
  ).toContain("participles");
});
test("сочинение, настройки и данные сохраняются", async ({ page }) => {
  await page.goto("/essay");
  await page
    .getByRole("textbox", { name: "Текст сочинения" })
    .fill(
      "Забота о других меняет общий мир.\nАвтор показывает силу доброго поступка.",
    );
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Текст сочинения" }),
  ).toHaveValue(/Забота о других/);
  await page.getByRole("button", { name: "Формальная самопроверка" }).click();
  await expect(page.getByText("Что удалось проверить")).toBeVisible();
  await page.goto("/settings");
  await page.getByLabel("Показывать персонажей").uncheck();
  await page.getByLabel("Размер учебного текста").selectOption("22");
  await page.reload();
  await expect(page.getByLabel("Показывать персонажей")).not.toBeChecked();
  await expect(page.getByLabel("Размер учебного текста")).toHaveValue("22");
  await page.getByRole("button", { name: "Сбросить прогресс" }).click();
  await page.getByRole("button", { name: "Отмена", exact: true }).click();
  await expect(page.getByLabel("Размер учебного текста")).toHaveValue("22");
});
test("пробная работа: ответы, флаги, таймер и результат", async ({ page }) => {
  await page.goto("/exam");
  await page.getByRole("button", { name: "Начать учебную работу" }).click();
  await page
    .getByRole("textbox", { name: "Последовательность цифр" })
    .fill("12");
  await page
    .getByRole("button", { name: "Вернуться позже", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Последовательность цифр" }),
  ).toHaveValue("12");
  await expect(
    page.getByRole("button", { name: "Снять отметку" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Не понял", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Завершить работу", exact: true })
    .click();
  await page.getByRole("button", { name: "Да, завершить" }).click();
  await expect(
    page.getByRole("heading", { name: "1 из 26 учебных баллов" }),
  ).toBeVisible();
  await page.reload();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("dark-world-progress-v1")!).attempts
          .length,
    ),
  ).toBe(26);
});
test("мобильные страницы без горизонтальной прокрутки и ошибок JS", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const path of [
    "/",
    "/map",
    "/library",
    "/practice",
    "/errors",
    "/essay",
    "/statistics",
    "/settings",
    "/exam",
  ]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Открыть меню" }).click();
  await page
    .getByRole("link", { name: "Библиотека теории", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Сначала понять. Потом запомнить." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("импорт и экспорт, защита от повреждённого файла", async ({ page }) => {
  await page.goto("/settings");
  const original = await page.evaluate(() =>
    localStorage.getItem("dark-world-progress-v1")!,
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Экспорт", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("put-k-ege-progress.json");
  await page.getByLabel("Файл прогресса").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":1}'),
  });
  await expect(page.getByRole("status")).toContainText("Неверный формат");
  expect(
    await page.evaluate(() => localStorage.getItem("dark-world-progress-v1")),
  ).toBe(original);
  const data = JSON.parse(original);
  data.essay = "Импортированный черновик.";
  data.completed = ["participles"];
  page.once("dialog", (d) => d.accept());
  await page.getByLabel("Файл прогресса").setInputFiles({
    name: "good.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(data)),
  });
  await expect(page.getByRole("status")).toContainText("Прогресс восстановлен");
  await page.goto("/essay");
  await expect(
    page.getByRole("textbox", { name: "Текст сочинения" }),
  ).toHaveValue("Импортированный черновик.");
});
test("истёкший таймер завершает работу и не дублирует ответы", async ({
  page,
}) => {
  await page.goto("/exam");
  await page.getByRole("button", { name: "Начать учебную работу" }).click();
  await page.evaluate(() => {
    const p = JSON.parse(localStorage.getItem("dark-world-progress-v1")!);
    p.exam.started = Date.now() - 7200000;
    p.exam.deadline = Date.now() - 1000;
    localStorage.setItem("dark-world-progress-v1", JSON.stringify(p));
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "0 из 26 учебных баллов" }),
  ).toBeVisible();
  await page.reload();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("dark-world-progress-v1")!).attempts
          .length,
    ),
  ).toBe(26);
});
test("испорченное сохранение не перезаписывается молча", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("dark-world-progress-v1", "BROKEN"),
  );
  await page.reload();
  await expect(page.getByRole("alert")).toContainText(
    "Исходные данные пока не перезаписаны",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("dark-world-progress-v1")),
  ).toBe("BROKEN");
});
test("диагностика, помощь и разные форматы заданий", async ({ page }) => {
  await page.goto("/diagnostic");
  await page.getByRole("button", { name: "Начать диагностику" }).click();
  await page.getByRole("button", { name: "Не понял", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("dialog").press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/practice?topic=agreement");
  await page.getByRole("button", { name: "Начать тренировку" }).click();
  for (let i = 0; i < 5; i++) {
    if (await page.locator(".matching").count()) {
      for (let n = 0; n < 3; n++)
        await page
          .locator(".matching select")
          .nth(n)
          .selectOption(String(n + 1));
      await page.getByRole("button", { name: "Проверить ответ" }).click();
      await expect(page.getByText("Верно. Разберём почему.")).toBeVisible();
      break;
    }
    await page.locator(".answers button").first().click();
    await page.getByRole("button", { name: "Проверить ответ" }).click();
    await page.getByRole("button", { name: "Следующее задание" }).click();
  }
  await expect(page.locator(".matching")).toBeVisible();
});
