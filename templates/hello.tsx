export const HelloTemplate = ({ name }: { name: string | undefined }) => {
  return (
    <>
      <h1>{name ? `Hello, ${name}!` : "What's your name?"}</h1>
      <form action="/hello" method="get">
        <input type="text" name="name" required value={name} />
        <input type="submit" value="Greet" />
      </form>
    </>
  );
};
