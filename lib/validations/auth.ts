// ── Helpers ────────────────────────────────────────────────────────────────

type Ok<T>  = { ok: true;  value: T };
type Err    = { ok: false; error: string };

function ok<T>(value: T): Ok<T>  { return { ok: true,  value }; }
function fail(msg: string): Err  { return { ok: false, error: msg }; }

// ── Types ──────────────────────────────────────────────────────────────────

export interface SignupBody {
  name:     string;
  email:    string;
  password: string;
  phone?:   string;
}

export interface LoginBody {
  email:    string;
  password: string;
}

// ── Signup ─────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseSignupBody(body: unknown): Ok<SignupBody> | Err {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fail("Request body must be a JSON object");
  }

  const b = body as Record<string, unknown>;

  if (typeof b.name !== "string" || b.name.trim().length < 2) {
    return fail("'name' must be at least 2 characters");
  }
  if (b.name.trim().length > 50) {
    return fail("'name' must not exceed 50 characters");
  }

  if (typeof b.email !== "string" || !EMAIL_RE.test(b.email.trim())) {
    return fail("'email' must be a valid email address");
  }

  if (typeof b.password !== "string" || b.password.length < 8) {
    return fail("'password' must be at least 8 characters");
  }

  const phone =
    b.phone !== undefined && b.phone !== null && b.phone !== ""
      ? b.phone
      : undefined;

  if (phone !== undefined) {
    if (typeof phone !== "string" || phone.trim().length < 7 || phone.trim().length > 20) {
      return fail("'phone' must be between 7 and 20 characters");
    }
  }

  return ok({
    name:     b.name.trim(),
    email:    b.email.trim().toLowerCase(),
    password: b.password,
    ...(phone !== undefined && { phone: (phone as string).trim() }),
  });
}

// ── Login ──────────────────────────────────────────────────────────────────

export function parseLoginBody(body: unknown): Ok<LoginBody> | Err {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fail("Request body must be a JSON object");
  }

  const b = body as Record<string, unknown>;

  if (typeof b.email !== "string" || !EMAIL_RE.test(b.email.trim())) {
    return fail("'email' must be a valid email address");
  }

  if (typeof b.password !== "string" || b.password.length === 0) {
    return fail("'password' is required");
  }

  return ok({
    email:    b.email.trim().toLowerCase(),
    password: b.password,
  });
}
