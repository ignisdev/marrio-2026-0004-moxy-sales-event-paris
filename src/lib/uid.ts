import { customAlphabet } from "nanoid";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const createUid = customAlphabet(alphabet, 16);

export function generateParticipantUid() {
  return createUid();
}
