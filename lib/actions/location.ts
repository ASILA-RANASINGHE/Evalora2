"use server";

import { prisma } from "@/lib/prisma";

export interface LocationResult {
  name: string;
  latitude: number;
  longitude: number;
  description: string | null;
  category: string | null;
}

/**
 * Search for a historical location by name (case-insensitive partial match).
 * Returns the first matching location or null.
 */
export async function searchLocation(
  query: string
): Promise<LocationResult | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const location = await prisma.location.findFirst({
    where: {
      name: { contains: trimmed, mode: "insensitive" },
    },
    select: {
      name: true,
      latitude: true,
      longitude: true,
      description: true,
      category: true,
    },
  });

  return location;
}
