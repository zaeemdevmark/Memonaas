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

export interface AddressBody {
  label:      string | null;
  fullName:   string;
  phone:      string;
  street:     string;
  city:       string;
  province:   string;
  postalCode: string;
  country:    string;
  isDefault:  boolean;
}

function parseAddressBody(body: unknown): Ok<AddressBody> | Err {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fail("Request body must be a JSON object");
  }
  const b = body as Record<string, unknown>;

  const label    = str(b.label,    "label",    1, 50, true);
  if (label !== null && typeof label !== "string") return label as Err;

  const fullName = str(b.fullName, "fullName", 2, 100);
  if (typeof fullName !== "string") return fullName as Err;

  const phone    = str(b.phone,    "phone",    7, 20);
  if (typeof phone !== "string") return phone as Err;

  const street   = str(b.street,   "street",   3, 200);
  if (typeof street !== "string") return street as Err;

  const city     = str(b.city,     "city",     2, 100);
  if (typeof city !== "string") return city as Err;

  const province = str(b.province, "province", 0, 100, true);
  if (province !== null && typeof province !== "string") return province as Err;

  const postalCode = str(b.postalCode, "postalCode", 0, 10, true);
  if (postalCode !== null && typeof postalCode !== "string") return postalCode as Err;

  const country  = str(b.country,  "country",  2, 100, true);
  if (country !== null && typeof country !== "string") return country as Err;

  return ok({
    label:      typeof label      === "string" ? label      : null,
    fullName,
    phone,
    street,
    city,
    province:   typeof province   === "string" ? province   : "",
    postalCode: typeof postalCode === "string" ? postalCode : "",
    country:    typeof country    === "string" ? country    : "Pakistan",
    isDefault:  Boolean(b.isDefault),
  });
}

export const parseCreateAddressBody = parseAddressBody;
export const parseUpdateAddressBody = parseAddressBody;
