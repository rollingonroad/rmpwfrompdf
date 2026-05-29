import { decryptPDF } from '@pdfsmaller/pdf-decrypt';

export async function removePdfPassword(
  pdfBytes: Uint8Array,
  password: string
): Promise<Uint8Array> {
  return await decryptPDF(pdfBytes, password);
}