import type { RequestHandler } from "express";
import { z } from "zod";
import { db } from "../utils/db";
import { unprocessable } from "../utils/errors";
import type { AuthedRequest } from "../types";

export const getProfile: RequestHandler = async (req, res, next) => {
  try {
    const ar = req as AuthedRequest;
    if (!ar.user) return next();
    const { data: profile } = await db()
      .from("profiles")
      .select("id, display_name, created_at")
      .eq("id", ar.user.id)
      .maybeSingle();

    res.json({
      id: ar.user.id,
      email: ar.user.email,
      displayName: profile?.display_name ?? null,
      role: ar.user.role,
      createdAt: profile?.created_at ?? null,
    });
  } catch (err) {
    next(err);
  }
};

const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(100),
});

export const updateProfile: RequestHandler = async (req, res, next) => {
  try {
    const ar = req as AuthedRequest;
    if (!ar.user) return next();
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) return next(unprocessable("Invalid display name.", parsed.error.issues));
    // Upsert the profile row. Only the display name is client-editable.
    const { data, error } = await db()
      .from("profiles")
      .upsert(
        { id: ar.user.id, display_name: parsed.data.displayName },
        { onConflict: "id" }
      )
      .select("id, display_name, created_at")
      .single();
    if (error) return next(error);
    res.json({
      id: ar.user.id,
      email: ar.user.email,
      displayName: data.display_name,
      role: ar.user.role,
      createdAt: data.created_at,
    });
  } catch (err) {
    next(err);
  }
};
