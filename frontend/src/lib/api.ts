// Base URL configuration - connects to FastAPI locally by default
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/**
 * Triggers a new agent workflow and returns a job ID
 */
export async function startWorkflow(command: string) {
  const response = await fetch(`${API_BASE}/workflows/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ command }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to start workflow");
  }
  
  return response.json();
}

/**
 * Subscribes to real-time agent thought streaming (Server-Sent Events)
 */
export function streamWorkflowTrace(jobId: string, onMessage: (data: any) => void, onError?: (err: any) => void) {
  const source = new EventSource(`${API_BASE}/workflows/${jobId}/stream`);
  
  source.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.error("Failed to parse SSE trace event", e);
    }
  };
  
  if (onError) {
    source.onerror = onError;
  }
  
  return source;
}
