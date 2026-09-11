import { z } from "zod";

const resultSchema = z.object({
  pass: z.boolean(),
});

export async function revisarImagen(
  imageBase64: string,
  mediaType: string,
  webhookUrl: string
): Promise<{ pass: boolean }> {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, mediaType }),
      signal: AbortSignal.timeout(10_000), // no colgarse si Make no responde
    });

    if (!res.ok) {
      console.error(`Make respondió ${res.status} al revisar imagen`);
      return { pass: true }; // fail-open
    }

    return resultSchema.parse(await res.json());
  } catch (err) {
    console.error("Error llamando al webhook de Make:", err);
    return { pass: true }; // fail-open: no bloquear la denuncia por un problema externo
  }
}
