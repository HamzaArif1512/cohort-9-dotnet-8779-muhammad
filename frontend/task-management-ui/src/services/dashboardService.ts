import apiClient from "./apiClient"
import type {
  UserDashboardDto,
  AdminDashboardDto,
} from "@/types"

export async function getUserDashboard(): Promise<UserDashboardDto> {
  const response = await apiClient.get<UserDashboardDto>(
    "/Dashboard/user",
  )

  return response.data
}

export async function getAdminDashboard(): Promise<AdminDashboardDto> {
  const response = await apiClient.get<AdminDashboardDto>(
    "/Dashboard/admin",
  )

  return response.data
}