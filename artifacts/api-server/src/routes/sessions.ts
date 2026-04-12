import { Router, type IRouter } from "express";
import { eq, desc, ilike, sql, and } from "drizzle-orm";
import { db, sessionsTable, messagesTable } from "@workspace/db";
import {
  ListSessionsQueryParams,
  CreateSessionBody,
  GetSessionParams,
  UpdateSessionParams,
  UpdateSessionBody,
  DeleteSessionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/sessions", async (req, res): Promise<void> => {
  const parsed = ListSessionsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { search, tag } = parsed.data;

  const conditions = [];
  if (search) {
    conditions.push(ilike(sessionsTable.title, `%${search}%`));
  }
  if (tag) {
    conditions.push(ilike(sessionsTable.tags, `%${tag}%`));
  }

  const sessions = conditions.length > 0
    ? await db.select().from(sessionsTable).where(and(...conditions)).orderBy(desc(sessionsTable.updatedAt))
    : await db.select().from(sessionsTable).orderBy(desc(sessionsTable.updatedAt));

  res.json(sessions);
});

router.post("/sessions", async (req, res): Promise<void> => {
  const parsed = CreateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [session] = await db.insert(sessionsTable).values({
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    tags: parsed.data.tags ?? null,
    messageCount: 0,
  }).returning();

  res.status(201).json(session);
});

router.get("/sessions/:id", async (req, res): Promise<void> => {
  const params = GetSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, params.data.id));
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  res.json(session);
});

router.patch("/sessions/:id", async (req, res): Promise<void> => {
  const params = UpdateSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof sessionsTable.$inferInsert> = {};
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.tags !== undefined) updateData.tags = parsed.data.tags;

  const [session] = await db
    .update(sessionsTable)
    .set(updateData)
    .where(eq(sessionsTable.id, params.data.id))
    .returning();

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  res.json(session);
});

router.delete("/sessions/:id", async (req, res): Promise<void> => {
  const params = DeleteSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(messagesTable).where(eq(messagesTable.sessionId, params.data.id));
  const [session] = await db.delete(sessionsTable).where(eq(sessionsTable.id, params.data.id)).returning();

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
