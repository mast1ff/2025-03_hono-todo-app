import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import { eq } from "drizzle-orm";
import { IndexTemplate } from "./templates";
import { HelloTemplate } from "./templates/hello";
import { TodoTemplate } from "./templates/todo";

const Todo = sqliteTable("todos", (column) => ({
  id: column.integer().primaryKey({ autoIncrement: true }),
  title: column.text().notNull(),
  done: column.integer({ mode: "boolean" }).notNull().default(false),
}));

type TodoType = typeof Todo.$inferSelect;

const app = new Hono<{
  Variables: {
    db: LibSQLDatabase;
  };
}>();

app.use((c, next) => {
  const client = createClient({ url: "file:local.db" });
  const db = drizzle(client);
  c.set("db", db);
  return next();
});

app.get("/", (c) => {
  return c.html(<IndexTemplate />);
});

app.get("/hello", (c) => {
  const name = c.req.query("name");
  return c.html(<HelloTemplate name={name} />);
});

app.get("/todo", async (c) => {
  const db = c.get("db");
  const showDone = c.req.query("show_done") === "true";
  let todos: TodoType[];
  if (showDone) {
    todos = await db.select().from(Todo);
  } else {
    todos = await db.select().from(Todo).where(eq(Todo.done, false));
  }

  return c.html(<TodoTemplate showDone={showDone} todos={todos} />);
});

app.post("/todo", async (c) => {
  const db = c.get("db");
  const payload = await c.req.parseBody();
  await db.insert(Todo).values({ title: payload.title as string });
  const showDone = payload.show_done === "true";
  return c.redirect(`/todo?show_done=${showDone}`);
});

app.post("/todo/:id/update", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");
  const payload = await c.req.parseBody();
  await db
    .update(Todo)
    .set({ done: payload.done === "true" })
    .where(eq(Todo.id, Number(id)));

  const showDone = payload.show_done === "true";
  return c.redirect(`/todo?show_done=${showDone}`);
});

app.post("/todo/:id/delete", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");
  await db.delete(Todo).where(eq(Todo.id, Number(id)));

  const payload = await c.req.parseBody();
  const showDone = payload.show_done === "true";
  return c.redirect(`/todo?show_done=${showDone}`);
});

serve({
  fetch: app.fetch,
  port: 3000,
});
