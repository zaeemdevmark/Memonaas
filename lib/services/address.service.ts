import prisma from "@/lib/prisma";
import { withTransaction } from "@/lib/db";
import type { AddressDTO } from "@/lib/types/address";
import type { AddressBody } from "@/lib/validations/address";

export class AddressError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "AddressError";
  }
}

type AddressRow = {
  id: string; label: string | null; fullName: string; phone: string;
  street: string; city: string; province: string; postalCode: string;
  country: string; isDefault: boolean;
};

function serialize(a: AddressRow): AddressDTO {
  return {
    id:         a.id,
    label:      a.label,
    fullName:   a.fullName,
    phone:      a.phone,
    street:     a.street,
    city:       a.city,
    province:   a.province,
    postalCode: a.postalCode,
    country:    a.country,
    isDefault:  a.isDefault,
  };
}

const SELECT = {
  id: true, label: true, fullName: true, phone: true,
  street: true, city: true, province: true, postalCode: true,
  country: true, isDefault: true,
} as const;

export async function getAddresses(customerId: string): Promise<AddressDTO[]> {
  const rows = await prisma.address.findMany({
    where:   { customerId },
    select:  SELECT,
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  return rows.map(serialize);
}

export async function createAddress(customerId: string, data: AddressBody): Promise<AddressDTO> {
  return withTransaction(async (tx) => {
    const count     = await tx.address.count({ where: { customerId } });
    const isDefault = data.isDefault || count === 0;

    if (isDefault) {
      await tx.address.updateMany({ where: { customerId }, data: { isDefault: false } });
    }

    const addr = await tx.address.create({
      data: {
        customerId,
        label:      data.label,
        fullName:   data.fullName,
        phone:      data.phone,
        street:     data.street,
        city:       data.city,
        province:   data.province,
        postalCode: data.postalCode,
        country:    data.country,
        isDefault,
      },
      select: SELECT,
    });
    return serialize(addr);
  });
}

export async function updateAddress(customerId: string, id: string, data: AddressBody): Promise<AddressDTO> {
  const existing = await prisma.address.findUnique({ where: { id }, select: { customerId: true } });
  if (!existing || existing.customerId !== customerId) throw new AddressError("Address not found", 404);

  return withTransaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({ where: { customerId }, data: { isDefault: false } });
    }

    const addr = await tx.address.update({
      where: { id },
      data: {
        label:      data.label,
        fullName:   data.fullName,
        phone:      data.phone,
        street:     data.street,
        city:       data.city,
        province:   data.province,
        postalCode: data.postalCode,
        country:    data.country,
        isDefault:  data.isDefault,
      },
      select: SELECT,
    });
    return serialize(addr);
  });
}

export async function deleteAddress(customerId: string, id: string): Promise<void> {
  const existing = await prisma.address.findUnique({
    where:  { id },
    select: { customerId: true, isDefault: true },
  });
  if (!existing || existing.customerId !== customerId) throw new AddressError("Address not found", 404);

  await prisma.address.delete({ where: { id } });

  if (existing.isDefault) {
    const next = await prisma.address.findFirst({
      where:   { customerId },
      orderBy: { createdAt: "asc" },
      select:  { id: true },
    });
    if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }
}

export async function setDefaultAddress(customerId: string, id: string): Promise<AddressDTO> {
  const existing = await prisma.address.findUnique({ where: { id }, select: { customerId: true } });
  if (!existing || existing.customerId !== customerId) throw new AddressError("Address not found", 404);

  return withTransaction(async (tx) => {
    await tx.address.updateMany({ where: { customerId }, data: { isDefault: false } });
    const addr = await tx.address.update({
      where:  { id },
      data:   { isDefault: true },
      select: SELECT,
    });
    return serialize(addr);
  });
}
