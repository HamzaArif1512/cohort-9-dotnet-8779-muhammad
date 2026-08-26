import apiClient from "./apiClient"
import type { ProfileDto } from "@/types"

export async function getProfile(): Promise<ProfileDto> {
  const response = await apiClient.get<ProfileDto>("/Profile")

  return response.data
}