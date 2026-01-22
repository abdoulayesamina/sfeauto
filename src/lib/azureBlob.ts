// src/lib/azureBlob.ts
import {
  BlobServiceClient,
  BlobSASPermissions,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob"

function mustEnv(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`${name} manquant`)
  return v
}

function parseConnString(conn: string) {
  const parts = conn.split(";").map(s => s.trim()).filter(Boolean)
  const dict: Record<string, string> = {}

  for (const p of parts) {
    const idx = p.indexOf("=")
    if (idx > 0) dict[p.slice(0, idx)] = p.slice(idx + 1)
  }

  const accountName = dict["AccountName"]
  const accountKey = dict["AccountKey"]
  const endpointSuffix = dict["EndpointSuffix"] || "core.windows.net"

  if (!accountName || !accountKey) {
    throw new Error("ConnectionString Azure invalide (AccountName/AccountKey manquants)")
  }

  return { accountName, accountKey, endpointSuffix }
}

export function getContainerClient() {
  const conn = mustEnv("AZURE_STORAGE_CONNECTION_STRING")
  const containerName = process.env.AZURE_BLOB_CONTAINER || "interventions"
  const service = BlobServiceClient.fromConnectionString(conn)
  return service.getContainerClient(containerName)
}

export function getSasUrlForBlob(blobName: string) {
  const conn = mustEnv("AZURE_STORAGE_CONNECTION_STRING")
  const containerName = process.env.AZURE_BLOB_CONTAINER || "interventions"
  const ttl = Number(process.env.AZURE_SAS_TTL_MINUTES || "15")

  const { accountName, accountKey } = parseConnString(conn)
  const credential = new StorageSharedKeyCredential(accountName, accountKey)

  const now = new Date()
  const expiresOn = new Date(now.getTime() + ttl * 60 * 1000)

  const sas = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn: new Date(now.getTime() - 60 * 1000), // tolérance horloge
      expiresOn,
    },
    credential
  ).toString()

  const baseUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`
  return `${baseUrl}?${sas}`
}
