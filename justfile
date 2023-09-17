assets_dir := "dist/public"
htmx_version := "1.9.5"

default: build

css:
  bun run unocss --out-file={{assets_dir}}/uno.css *.tsx *.template.html

html:
  bun index.tsx

build: css html

test-unit *args='':
  bun test {{args}}
