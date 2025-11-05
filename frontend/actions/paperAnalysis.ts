export async function submitPaperAnalysis(opts: {
  file?: File | Blob | null;
  filename?: string | null;
  rawSummary?: string | null;
  baseUrl?: string | null; // optional override of backend origin
}) {
  const { file, filename, rawSummary, baseUrl } = opts;

  const formData = new FormData();

  if (file) {
    // If caller passed a File use it as-is; if it's a Blob provide a filename
    if (file instanceof File) {
      formData.append("file", file, file.name);
    } else {
      formData.append("file", file, filename || "summary.txt");
    }
  } else if (rawSummary && rawSummary.trim().length > 0) {
    const blob = new Blob([rawSummary], { type: "text/plain" });
    formData.append("file", blob, "summary.txt");
  }

  const url = "http://127.0.0.1:5000" + "/api/paper-analysis";

  const resp = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const json = await resp.json().catch(() => null);

  if (!resp.ok) {
    const message = json?.error || `Request failed with status ${resp.status}`;
    const err: any = new Error(message);
    err.status = resp.status;
    err.payload = json;
    throw err;
  }

  return json;
}
