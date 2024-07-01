// poms/tasks.ts

import { Page, expect } from "@playwright/test";

export class TaskPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    createTaskAndVerify = async ({ taskName }: { taskName: string }) => {
        await this.page.getByTestId("navbar-add-todo-link").click();
        await this.page.getByTestId("form-title-field").fill(taskName);

        await this.page.locator(".css-2b097c-container").click();
        await this.page
            .locator(".css-26l3qy-menu")
            .getByText("Oliver Smith")
            .click();
        await this.page.getByTestId("form-submit-button").click();
        const taskInDashboard = this.page
            .getByTestId("tasks-pending-table")
            .getByRole("row", {
                name: new RegExp(taskName, "i"),
            });
        await taskInDashboard.scrollIntoViewIfNeeded();
        await expect(taskInDashboard).toBeVisible();
    };
}