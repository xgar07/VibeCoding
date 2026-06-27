/**
 * Maps raw Supabase error messages/codes to friendly Indonesian messages.
 * Call with the error object returned from supabase.auth.* methods.
 */
export const mapAuthError = (error) => {
  if (!error) return null
  const msg = error.message?.toLowerCase() ?? ''
  const status = error.status

  // Network / connectivity
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch') || status === 0) {
    return 'Gagal terhubung ke server. Periksa koneksi internet.'
  }

  // Rate limiting
  if (msg.includes('rate limit') || msg.includes('email rate limit') || status === 429) {
    return 'Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit.'
  }

  // Email not confirmed / verified
  if (
    msg.includes('email not confirmed') ||
    msg.includes('not confirmed') ||
    msg.includes('email_not_confirmed')
  ) {
    return 'EMAIL_NOT_CONFIRMED'  // special sentinel — caller handles this case
  }

  // Invalid credentials
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Email atau password salah.'
  }

  // Already registered
  if (msg.includes('already registered') || msg.includes('user already registered')) {
    return 'Akun dengan email ini sudah terdaftar.'
  }

  // Weak / short password
  if (msg.includes('password should be') || msg.includes('weak password') || msg.includes('should be at least')) {
    return 'Password minimal 6 karakter.'
  }

  // Invalid email format
  if (msg.includes('invalid email') || msg.includes('unable to validate email')) {
    return 'Format email tidak valid.'
  }

  // User not found
  if (msg.includes('user not found')) {
    return 'Akun tidak ditemukan.'
  }

  // Token / session expired
  if (msg.includes('token') && (msg.includes('expired') || msg.includes('invalid'))) {
    return 'Sesi kamu telah kedaluwarsa. Silakan login ulang.'
  }

  // Fallback
  return 'Terjadi kesalahan. Silakan coba lagi.'
}
