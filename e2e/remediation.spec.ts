import { test, expect } from "@playwright/test";

const REMEDIATION_URL =
    "https://raw.githubusercontent.com/js-recon/js-recon-rules/main/remediation.json";

const MOCK_REMEDIATION = {
    detect_hardcoded_secrets:
        "Revoke and rotate the exposed secret immediately, then remove it from the bundle.",
};

test.beforeEach(async ({ page }) => {
    await page.route(REMEDIATION_URL, (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(MOCK_REMEDIATION),
        }),
    );
});

test("shows remediation text for a known rule ID", async ({ page }) => {
    await page.goto("/remediation");
    await page
        .getByRole("textbox", { name: "Rule ID" })
        .fill("detect_hardcoded_secrets");
    await expect(
        page.getByRole("heading", { name: "detect_hardcoded_secrets" }),
    ).toBeVisible();
    await expect(
        page.getByText("Revoke and rotate the exposed secret immediately"),
    ).toBeVisible();
});

test("shows the generic fallback for an unknown rule ID", async ({ page }) => {
    await page.goto("/remediation");
    await page
        .getByRole("textbox", { name: "Rule ID" })
        .fill("this_id_does_not_exist");
    await expect(
        page.getByRole("heading", { name: "Not found" }),
    ).toBeVisible();
    await expect(
        page.getByText("No specific remediation found for this rule ID"),
    ).toBeVisible();
});
