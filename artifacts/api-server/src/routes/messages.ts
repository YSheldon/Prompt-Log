import { Router, type IRouter } from "express";
import { eq, asc, sql } from "drizzle-orm";
import { db, messagesTable, sessionsTable } from "@workspace/db";
import {
  ListMessagesParams,
  CreateMessageParams,
  CreateMessageBody,
  DeleteMessageParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/sessions/:id/messages", async (req, res): Promise<void> => {
  const params = ListMessagesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.sessionId, params.data.id))
    .orderBy(asc(messagesTable.createdAt));

  res.json(messages);
});

router.post("/sessions/:id/messages", async (req, res): Promise<void> => {
  const params = CreateMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [message] = await db
    .insert(messagesTable)
    .values({
      sessionId: params.data.id,
      role: parsed.data.role,
      content: parsed.data.content,
    })
    .returning();

  await db
    .update(sessionsTable)
    .set({ messageCount: sql`${sessionsTable.messageCount} + 1` })
    .where(eq(sessionsTable.id, params.data.id));

  res.status(201).json(message);
});

router.delete("/messages/:id", async (req, res): Promise<void> => {
  const params = DeleteMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [message] = await db
    .delete(messagesTable)
    .where(eq(messagesTable.id, params.data.id))
    .returning();

  if (!message) {
    res.status(404).json({ error: "Message not found" });
    return;
  }

  await db
    .update(sessionsTable)
    .set({ messageCount: sql`GREATEST(${sessionsTable.messageCount} - 1, 0)` })
    .where(eq(sessionsTable.id, message.sessionId));

  res.sendStatus(204);
});

export default router;
