type Ok<T> = { ok: true;  value: T };
type Err   = { ok: false; error: string };

function ok<T>(v: T): Ok<T>    { return { ok: true,  value: v }; }
function fail(msg: string): Err { return { ok: false, error: msg }; }

function str(
  raw:   unknown,
  field: string,
  min:   number,
  max:   number,
  optional = false,
): string | null | Err {
  if (raw === undefined || raw === null || raw === "") {
    if (optional) return null;
    return fail(`'${field}' is required`);
  }
  if (typeof raw !== "string") return fail(`'${field}' must be a string`);
  const v = raw.trim();
  if (v.length < min) return fail(`'${field}' must be at least ${min} character${min > 1 ? "s" : ""}`);
  if (v.length > max) return fail(`'${field}' must not exceed ${max} characters`);
  return v;
}

export interface UpdateProfileBody {
  name:  string;
  phone: string | null;
}

export function parseUpdateProfileBody(body: unknown): { ok: true; value: UpdateProfileBody } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fail("Request body must be a JSON object");
  }
  const b = body as Record<string, unknown>;

  const name  = str(b.name,  "name",  2, 100);
  if (typeof name !== "string") return name as Err;

  const phone = str(b.phone, "phone", 7, 20, true);
  if (phone !== null && typeof phone !== "string") return phone as Err;

  return ok({ name, phone: typeof phone === "string" ? phone : null });
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword:     string;
}

export function parseChangePasswordBody(body: unknown): { ok: true; value: ChangePasswordBody } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fail("Request body must be a JSON object");
  }
  const b = body as Record<string, unknown>;

  const currentPassword = str(b.currentPassword, "currentPassword", 1, 200);
  if (typeof currentPassword !== "string") return currentPassword as Err;

  const newPassword = str(b.newPassword, "newPassword", 8, 200);
  if (typeof newPassword !== "string") return newPassword as Err;

  return ok({ currentPassword, newPassword });
}
