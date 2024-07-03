// fixtures/index.ts

import { test as base } from "@playwright/test";
import LoginPage from "../poms/login";
import { TaskPage } from "../poms/tasks";
import { CommentPage } from "../poms/comment";

interface ExtendedFixtures {
    loginPage: LoginPage;
    taskPage: TaskPage;
    commentPage: CommentPage;
}

export const test = base.extend<ExtendedFixtures>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },
    taskPage: async ({ page }, use) => {
        const taskPage = new TaskPage(page);
        await use(taskPage);
    },
    commentPage: async ({ page }, use) => {
        const commentPage = new CommentPage(page);
        await use(commentPage);
    },
});