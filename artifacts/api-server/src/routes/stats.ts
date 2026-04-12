import { Router, type IRouter } from "express";
import { db, sessionsTable, messagesTable } from "@workspace/db";
import { count, eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const [sessionCount] = await db.select({ count: count() }).from(sessionsTable);
  const [messageCount] = await db.select({ count: count() }).from(messagesTable);
  const [userCount] = await db
    .select({ count: count() })
    .from(messagesTable)
    .where(eq(messagesTable.role, "user"));
  const [assistantCount] = await db
    .select({ count: count() })
    .from(messagesTable)
    .where(eq(messagesTable.role, "assistant"));

  const totalSessions = sessionCount?.count ?? 0;
  const totalMessages = messageCount?.count ?? 0;
  const avgMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0;

  res.json({
    totalSessions,
    totalMessages,
    totalUserMessages: userCount?.count ?? 0,
    totalAssistantMessages: assistantCount?.count ?? 0,
    avgMessagesPerSession: Math.round(avgMessagesPerSession * 10) / 10,
  });
});

router.get("/stats/recent", async (_req, res): Promise<void> => {
  const sessions = await db
    .select()
    .from(sessionsTable)
    .orderBy(desc(sessionsTable.updatedAt))
    .limit(5);

  res.json(sessions);
});

export default router;
