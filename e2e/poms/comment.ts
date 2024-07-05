import { Page, expect } from "@playwright/test";
import {
    NAVBAR_SELECTORS,
    CREATE_COMMENT_SELECTORS
} from "../constants/selectors";

interface CreateNewCommentProps {
    taskName: string;
    commentDescription: string;
}

export default class CommentPage {
    constructor(private page: Page) { }

    addCommentAndVerify = async ({
        taskName,
        commentDescription
    }: CreateNewCommentProps): Promise<void> => {
        await this.page.getByText(taskName).click();
        await this.page.getByTestId(CREATE_COMMENT_SELECTORS.commentsTextField).click();
        await this.page.getByTestId(CREATE_COMMENT_SELECTORS.commentsTextField).fill(commentDescription);
        await this.page.getByTestId(CREATE_COMMENT_SELECTORS.commentsSubmitButton).click();
        await expect(this.page.getByTestId(CREATE_COMMENT_SELECTORS.taskCommentContent)).toBeVisible();
        await this.navigateToTodosPageAndVerifyTask(taskName);
    }

    verifyComment = async ({
        taskName,
        commentDescription
    }: CreateNewCommentProps): Promise<void> => {
        await this.page.getByText(taskName).click();
        await expect(this.page.getByTestId(CREATE_COMMENT_SELECTORS.taskCommentContent)).toHaveText(commentDescription);
        await this.navigateToTodosPageAndVerifyTask(taskName);
    }

    private navigateToTodosPageAndVerifyTask = async (taskName: string): Promise<void> => {
        await this.page.getByTestId(NAVBAR_SELECTORS.todosPageLink).click();
        await expect(this.page.getByRole("row", { name: taskName }).getByRole('cell', { name: '1' })).toBeVisible();
    }
}
