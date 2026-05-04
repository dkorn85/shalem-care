import { MedplumClient } from "@medplum/core";

let _client: MedplumClient | undefined;

export function getMedplum(): MedplumClient {
  if (!_client) {
    _client = new MedplumClient({
      baseUrl: process.env.NEXT_PUBLIC_MEDPLUM_BASE_URL ?? "http://localhost:8103/",
      clientId: process.env.MEDPLUM_CLIENT_ID,
    });
  }
  return _client;
}
