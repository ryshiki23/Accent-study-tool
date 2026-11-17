/** URL の ?u=<22 文字> を読む。不正なら null（SPEC 8.3） */
export function readUserId(): string | null {
  const u = new URLSearchParams(window.location.search).get('u')
  return u && /^[A-Za-z0-9_-]{22}$/.test(u) ? u : null
}
