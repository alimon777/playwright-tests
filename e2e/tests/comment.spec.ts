import { test } from "../fixtures";
import { BrowserContext, Page, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import LoginPage from "../poms/login";
import CommentPage from "../poms/comment";
import { TASKS_TABLE_SELECTORS } from "../constants/selectors";

import { COMMON_TEXTS } from "../constants/texts";

test.describe("Task Details Page", () => {
    let taskName: string,
        commentDescription: string,
        loginPage: LoginPage,
        newUserPage: Page,
        newUserContext: BrowserContext,
        newCommentPage: CommentPage;

    test.beforeEach(async ({ page, taskPage, browser }) => {

        taskName = faker.word.words({ count: 5 });
        commentDescription = faker.word.words({ count: 5 });

        await test.step("Step 1: Go to dashboard", () => page.goto("/"));
        await test.step("Step 2: Create task for standard user and verify", () =>
            taskPage.createTaskAndVerify({
                taskName,
                userName: COMMON_TEXTS.standardUserName,
            })
        );

        newUserContext = await browser.newContext({ storageState: { cookies: [], origins: [] }, });
        newUserPage = await newUserContext.newPage();
        loginPage = new LoginPage(newUserPage);
        newCommentPage = new CommentPage(newUserPage);
    });

    test.afterEach(async ({ page, taskPage }) => {

        const completedTaskInDashboard = page.getByTestId(TASKS_TABLE_SELECTORS.completedTasksTable).getByRole("row", { name: taskName });

        await test.step("Go to dashboard", () =>
            page.goto("/")
        );

        await test.step("Mark task as completed", () =>
            taskPage.markTaskAsCompletedAndVerify({ taskName })
        );

        await test.step("Delete completed task", () =>
            completedTaskInDashboard.getByTestId(TASKS_TABLE_SELECTORS.deleteTaskButton).click()
        );

        await test.step("Assert deleted task has been removed from the dashboard", async () => {
            await expect(completedTaskInDashboard).toBeHidden();
            await expect(page.getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable).getByRole("row", { name: taskName })).toBeHidden();
        });
        await newUserPage.close();
        await newUserContext.close();
    });

    test("should be able to add a new comment as a creator of a task", async ({
        commentPage
    }) => {

        await test.step("Step 1: Add a comment and verify", () =>
            commentPage.addCommentAndVerify({ commentDescription, taskName })
        );

        await test.step("Step 2: Visit login page as assignee", () => newUserPage.goto("/"));
        await test.step("Step 3: Login as assignee", () =>
            loginPage.loginAndVerifyUser({
                email: process.env.STANDARD_EMAIL!,
                password: process.env.STANDARD_PASSWORD!,
                username: COMMON_TEXTS.standardUserName,
            })
        );

        await test.step("Step 4: Assert comment to be visible for the assignee user", () =>
            newCommentPage.verifyComment({ taskName, commentDescription })
        );
    });

    test("should be able to add a new comment as an assignee of a task", async ({
        commentPage
    }) => {

        await test.step("Step 1: Visit login page as assignee", () => newUserPage.goto("/"));
        await test.step("Step 2: Login as assignee", () =>
            loginPage.loginAndVerifyUser({
                email: process.env.STANDARD_EMAIL!,
                password: process.env.STANDARD_PASSWORD!,
                username: COMMON_TEXTS.standardUserName,
            })
        );

        await test.step("Step 3: Add a comment and verify", () =>
            newCommentPage.addCommentAndVerify({ taskName, commentDescription })
        );

        await test.step("Step 4: Assert comment to be visible for the creator", async () =>
            commentPage.verifyComment({ taskName, commentDescription })
        );

    });
});