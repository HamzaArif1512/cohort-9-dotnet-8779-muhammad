import apiClient from "./apiClient"

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  refreshTokenExpiresAt: string
}


export interface ProfileResponse {
  id: string
  fullName: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

export async function login(
  credentials: LoginRequest,
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    "/Auth/login",
    credentials,
  )

  localStorage.setItem("accessToken", response.data.accessToken)
  localStorage.setItem("refreshToken", response.data.refreshToken)
  
  return response.data
}

export async function getProfile(): Promise<ProfileResponse> {
const response = await apiClient.get<ProfileResponse>("/Auth/profile")
return response.data
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post("/Auth/logout", { refreshToken })
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
}