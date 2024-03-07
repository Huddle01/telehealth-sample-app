import { Redis } from "@upstash/redis";

if (
  !process.env.NEXT_PUBLIC_ROOM_DB_URL ||
  !process.env.NEXT_PUBLIC_ROOM_DB_TOKEN ||
  !process.env.NEXT_PUBLIC_STUDIO_DB_URL ||
  !process.env.NEXT_PUBLIC_STUDIO_DB_TOKEN
) {
  throw new Error("REDIS_URL or REDIS_TOKEN is null for DB");
}

export const roomDB = new Redis({
  url: process.env.NEXT_PUBLIC_ROOM_DB_URL,
  token: process.env.NEXT_PUBLIC_ROOM_DB_TOKEN,
});

export const studioDB = new Redis({
  url: process.env.NEXT_PUBLIC_STUDIO_DB_URL,
  token: process.env.NEXT_PUBLIC_STUDIO_DB_TOKEN,
});
