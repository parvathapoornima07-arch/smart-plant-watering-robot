import type { RequestHandler } from "express";
import { db } from "../utils/db";
import { unprocessable } from "../utils/errors";
import { contactSchema } from "../schemas/contact.schema";
import type { ContactMessageRow } from "../types";

export const submitContact: RequestHandler = async (req, res, next) => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) return next(unprocessable("Invalid contact submission.", parsed.error.issues));

    const { error } = await db()
      .from("contact_messages")
      .insert({
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
      })
      .select("*")
      .single<ContactMessageRow>();
    if (error) return next(error);

    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
};
