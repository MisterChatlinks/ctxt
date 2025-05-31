import * as openpgp from 'openpgp';

export async function encryptPayload(payload: string, apiKey: string): Promise<string> {
  return await openpgp.encrypt({
    message: await openpgp.createMessage({ text: payload }),
    passwords: [apiKey],
    format: 'armored',
  });
}
