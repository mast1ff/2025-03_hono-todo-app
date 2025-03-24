import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import { eq } from "drizzle-orm";

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
  return c.html(
    <>
      <h1>Hello, World!</h1>

      <ul>
        <li>
          <a href="/hello">Hello</a>
        </li>
        <li>
          <a href="/todo">Todo</a>
        </li>
      </ul>
    </>
  );
});

app.get("/hello", (c) => {
  const name = c.req.query("name");
  return c.html(
    <>
      <h1>{name ? `Hello, ${name}!` : "What's your name?"}</h1>
      <form action="/hello" method="get">
        <input type="text" name="name" required value={name} />
        <input type="submit" value="Greet" />
      </form>
    </>
  );
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

  return c.html(
    <>
      <h1>Todo List</h1>

      <p>
        {todos.length === 0 ? "No todos yet." : <>{todos.length} todos.</>}
        <br />
        {showDone ? (
          <a href="/todo?show_done=false">Hide done</a>
        ) : (
          <a href="/todo?show_done=true">Show done</a>
        )}
      </p>

      <table>
        <thead>
          <tr>
            <th>Done</th>
            <th>Title</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {todos.length === 0 ? (
            <tr>
              <td colSpan="3">No todos yet.</td>
            </tr>
          ) : (
            todos.map((todo) => (
              <tr>
                <td>
                  <form
                    method="post"
                    action={`/todo/${todo.id}/update`}
                    style="display: inline"
                  >
                    <input
                      type="hidden"
                      name="show_done"
                      value={String(showDone)}
                    />
                    <input
                      type="hidden"
                      name="done"
                      value={todo.done ? "false" : "true"}
                    />
                    <input
                      type="submit"
                      value={todo.done ? "Undone" : "Done"}
                    />
                  </form>
                </td>
                <td>{todo.done ? <s>{todo.title}</s> : todo.title}</td>
                <td>
                  <form
                    method="post"
                    action={`/todo/${todo.id}/delete`}
                    style="display: inline"
                  >
                    <input
                      type="hidden"
                      name="show_done"
                      value={String(showDone)}
                    />
                    <input type="submit" value="Delete" />
                  </form>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <form method="post" action="/todo">
        <input type="hidden" name="show_done" value={String(showDone)} />
        <input type="text" name="title" required />
        <input type="submit" value="Add" />
      </form>
    </>
  );
});

serve({
  fetch: app.fetch,
  port: 3000,
});
