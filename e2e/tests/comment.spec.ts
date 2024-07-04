import { test } from "../fixtures";
import { BrowserContext, Page, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import LoginPage from "../poms/login";
// import { CommentPage } from "../poms/comment";
import { TASKS_TABLE_SELECTORS, CREATE_COMMENT_SELECTORS, NAVBAR_SELECTORS } from "../constants/selectors";

import { COMMON_TEXTS } from "../constants/texts";

test.describe("Task Details Page", () => {
    let taskName: string,
        commentDescription: string,
        loginPage: LoginPage,
        newUserPage: Page,
        newUserContext: BrowserContext;
    // newCommentPage: CommentPage;

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
        // newCommentPage = new CommentPage(newUserPage);
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

        await test.step("Step 4: Assert comment to be visible for the assignee user", async () => {
            // newCommentPage.verifyComment({ taskName, commentDescription });
            await newUserPage.getByText(taskName).click();
            await expect(newUserPage.getByTestId(CREATE_COMMENT_SELECTORS.taskCommentContent)).toHaveText(commentDescription);
            await newUserPage.getByTestId(NAVBAR_SELECTORS.todosPageLink).click();
            await expect(newUserPage.getByRole("row", { name: taskName }).getByRole('cell', { name: '1' })).toBeVisible()
        });
        await newUserPage.close();
        await newUserContext.close();
    });

    test("should be able to add a new comment as an assignee of a task", async ({
        page,
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
        await test.step("Step 3: Add a comment and verify", async () => {
            // newCommentPage.addCommentAndVerify({ commentDescription, taskName })
            await newUserPage.getByText(taskName).click();
            await newUserPage.getByTestId(CREATE_COMMENT_SELECTORS.commentsTextField).click();
            await newUserPage.getByTestId(CREATE_COMMENT_SELECTORS.commentsTextField).fill(commentDescription);
            await newUserPage.getByTestId(CREATE_COMMENT_SELECTORS.commentsSubmitButton).click();
            await expect(newUserPage.getByTestId(CREATE_COMMENT_SELECTORS.taskCommentContent)).toBeVisible();
            await newUserPage.getByTestId(NAVBAR_SELECTORS.todosPageLink).click();
            await expect(newUserPage.getByRole("row", { name: taskName }).getByRole('cell', { name: '1' })).toBeVisible()
        });
        await test.step("Step 4: Visit dashboard as creator", () => newUserPage.goto("/"));
        await test.step("Step 5: Assert comment to be visible for the creator", async () => {
            commentPage.verifyComment({ taskName, commentDescription });
        });
        await newUserPage.close();
        await newUserContext.close();
    });
});