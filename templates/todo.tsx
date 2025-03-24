type TodoTemplateProps = {
  showDone: boolean;
  todos: { id: number; title: string; done: boolean }[];
};

export const TodoTemplate = ({ showDone, todos }: TodoTemplateProps) => {
  return (
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
              // biome-ignore lint/correctness/useJsxKeyInIterable:
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
};
