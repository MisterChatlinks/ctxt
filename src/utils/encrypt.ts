import { encrypt, createMessage } from "openpgp"; 

export async function encryptPayload(payload: string, apiKey: string): Promise<string> {
  return await encrypt({
    message: await createMessage({ text: payload }),
    passwords: [apiKey],
    format: 'armored',
  });
}
