const modules = import.meta.glob("../assets/icons/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});

const toName = (path: string): string =>
  path.slice(path.lastIndexOf("/") + 1, -4);

const byName = new Map<string, string>(
  Object.entries(modules).map(
    ([path, svg]: readonly [string, unknown]): readonly [string, string] => [
      toName(path),
      svg as string,
    ],
  ),
);

const getIcon = (name: string): string => byName.get(name) ?? "";

export { getIcon };
