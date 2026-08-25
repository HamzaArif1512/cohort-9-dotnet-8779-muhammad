import apiClient from "./apiClient"
import type { AuthUser, ProfileDto } from "@/types"

interface AuthResponseDto {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  refreshTokenExpiresAt: string
}

export const authService = {
  async login(
    email: string,
    password: string,
  ): Promise<AuthUser> {
    const response = await apiClient.post<AuthResponseDto>(
      "/Auth/login",
      {
        email,
        password,
      },
    )

    const {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    } = response.data

    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken)
    localStorage.setItem(
      "accessTokenExpiresAt",
      accessTokenExpiresAt,
    )
    localStorage.setItem(
      "refreshTokenExpiresAt",
      refreshTokenExpiresAt,
    )

    const profileResponse =
      await apiClient.get<ProfileDto>("/Profile")

    const profile = profileResponse.data

return {
  fullName: profile.FullName,
  email: profile.Email,
  role: profile.Role.toLowerCase() === "admin"
    ? "admin"
    : "user",
}
  },

  async register(
    fullName: string,
    email: string,
    password: string,
  ): Promise<void> {
    await apiClient.post("/Auth/register", {
      fullName,
      email,
      password,
    })
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem("refreshToken")

    try {
      if (refreshToken) {
        await apiClient.post("/Auth/logout", {
          refreshToken,
        })
      }
    } finally {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("accessTokenExpiresAt")
      localStorage.removeItem("refreshTokenExpiresAt")
    }
  },
}