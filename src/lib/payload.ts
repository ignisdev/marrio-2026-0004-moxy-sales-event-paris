import configPromise from "@payload-config";
import { getPayload } from "payload";

export function getPayloadClient() {
  return getPayload({ config: configPromise });
}
