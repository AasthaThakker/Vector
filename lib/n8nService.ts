/**
 * n8n Workflow Automation Service
 *
 * Integrates with n8n via webhooks to trigger automated workflows:
 *
 * Workflow 1: Return Request Processing
 *   - Trigger: webhook from Next.js when return is created
 *   - Actions: Fetch return data, calculate trust score,
 *     decide approve or manual review, update MongoDB
 *
 * Workflow 2: AI Analysis Trigger
 *   - Call /api/ai/analyze endpoint
 *   - Store results in MongoDB
 *
 * Workflow 3: Send Notification
 *   - Send email or system notification to customer
 *
 * Workflow 4: Update Automation Logs
 *   - Log all workflow actions for audit trail
 */

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "";

export interface N8NPayload {
  returnId: string;
  userId: string;
  productId: string;
  imageUrl: string;
  description: string;
}

export async function triggerReturnWorkflow(payload: N8NPayload): Promise<boolean> {
  if (!N8N_WEBHOOK_URL) {
    console.warn("[n8n] N8N_WEBHOOK_URL not configured. Skipping webhook trigger.");
    return false;
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
        source: "return_management_app",
      }),
    });

    if (!response.ok) {
      console.error("[n8n] Webhook trigger failed:", response.statusText);
      return false;
    }

    console.log("[n8n] Workflow triggered successfully for return:", payload.returnId);
    return true;
  } catch (error) {
    console.error("[n8n] Error triggering webhook:", error);
    return false;
  }
}
