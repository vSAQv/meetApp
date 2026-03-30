import { requestJson } from './http'

export type RegisterRequest = {
  username: string
  email: string
  password: string
  dateOfBirth: string // YYYY-MM-DD
  gender: string
  lookingForGender: string
}

export type LoginRequest = {
  username: string
  password: string
}

export type AuthResponse = {
  accessToken: string
  emailVerified: boolean
  emailVerificationToken: string | null
}

export type VerifyEmailRequest = { token: string }

export type RequestPasswordResetRequest = { email: string }

export type PasswordResetResponse = { resetToken: string }

export type ResetPasswordRequest = { token: string; newPassword: string }

export async function register(req: RegisterRequest): Promise<AuthResponse> {
  return requestJson('/api/auth/register', { method: 'POST', body: JSON.stringify(req) })
}

export async function login(req: LoginRequest): Promise<AuthResponse> {
  return requestJson('/api/auth/login', { method: 'POST', body: JSON.stringify(req) })
}

export async function verifyEmail(token: string, body: VerifyEmailRequest): Promise<AuthResponse> {
  void token
  return requestJson('/api/auth/verify-email', { method: 'POST', body: JSON.stringify(body) })
}

export async function requestPasswordReset(req: RequestPasswordResetRequest): Promise<PasswordResetResponse> {
  return requestJson('/api/auth/request-password-reset', { method: 'POST', body: JSON.stringify(req) })
}

export async function resetPassword(req: ResetPasswordRequest): Promise<void> {
  return requestJson('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(req) })
}

