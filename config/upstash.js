import { Client as WorkflowClient } from "@upstash/workflow";
import { QSTASH_URL, QSTASH_TOKEN, SERVER_URL } from "./env.js";

export const workflowClient = new WorkflowClient({
  baseUrl: QSTASH_URL,
  token: QSTASH_TOKEN,
});

// await workflowClient.publishJSON({
//   url: `${SERVER_URL}/api/v1/workflow/subscription/reminder`,
//   body: {
//     subscriptionId: subscription._id.toString(),
//   },
// });