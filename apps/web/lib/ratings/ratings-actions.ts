"use server";

import { revalidatePath } from "next/cache";
import { createRating } from "./ratings-store";
import { recordAction } from "../undo/undo";

type Result = { ok: true; ratingId: string } | { ok: false; error: string };

export async function submitRating(input: {
  ratedPersonId: string;
  raterId: string;
  raterType: "klient" | "person";
  stars: number;
  text?: string;
  tags?: string[];
  shiftId?: string;
}): Promise<Result> {
  if (input.stars < 1 || input.stars > 5) {
    return { ok: false, error: "Sternewertung muss zwischen 1 und 5 liegen." };
  }

  const rating = createRating({
    ratedPersonId: input.ratedPersonId,
    rater: { id: input.raterId, type: input.raterType },
    stars: input.stars as 1 | 2 | 3 | 4 | 5,
    text: input.text?.trim() || undefined,
    tags: input.tags ?? [],
    shiftId: input.shiftId,
  });

  recordAction({
    actor: input.raterId,
    description: `${input.stars}-Sterne-Bewertung abgegeben`,
    category: "other",
    inverse: { type: "noop", reason: "Bewertungen sind authentische Rückmeldung — nicht rückgängig" },
  });

  revalidatePath("/klient/bewertung");
  revalidatePath("/profil");
  revalidatePath("/admin/disposition");

  return { ok: true, ratingId: rating.id };
}
