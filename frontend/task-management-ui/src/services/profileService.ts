import type { ProfileDto } from "@/types"

const MOCK_PROFILE: ProfileDto = {
  FullName: "Jordan Lee",
  Email: "jordan.lee@example.com",
  Role: "user",
  CreatedAt: "2024-03-12T09:14:22Z",
}

// Replace body with:
//   const res = await fetch("/api/profile", { credentials: "include" })
//   if (!res.ok) throw new Error("Failed to load profile")
//   return res.json() as Promise<ProfileDto>
export async function getProfile(): Promise<ProfileDto> {
  await new Promise((r) => setTimeout(r, 900))
  return MOCK_PROFILE
}
