import * as github from "@actions/github";
import { config } from "./config";

type Conclusion = "success" | "failure" | "neutral" | "cancelled" | "timed_out" | "action_required" | undefined;

async function createCheckWithAnnotations(summary: string, conclusion: Conclusion, octokit: github.GitHub) {
    const checkRequest = {
        ...github.context.repo,
        head_sha: github.context.sha,
        name: "Storyshots",
        conclusion,
        output: {
            title: "Jest Test Results",
            summary,
        },
    };

    try {
        await octokit.checks.create(checkRequest);
    } catch (error) {
        throw new Error(
            `Request to create annotations failed - request: ${JSON.stringify(checkRequest)} - error: ${error.message} `
        );
    }
}

interface TestInfo {
    time: string;
    passed: number;
    failed: number;
    total: number;
    conclusion: Conclusion;
}

export async function publishTestResults(testInformation: TestInfo) {
    const { time, passed, failed, total, conclusion } = testInformation;

    const octokit = new github.GitHub(config.accessToken);
    const summary =
        "#### These are all the test results I was able to find from your jest-junit reporter\n" +
        `**${total}** tests were completed in **${time}s** with **${passed}** passed ✔ and **${failed}** failed ✖ tests.`;

    await createCheckWithAnnotations(summary, conclusion, octokit);
}
