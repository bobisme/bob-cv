assets_dir := "dist/public"
htmx_version := "1.9.5"

default: build

css:
  bun run unocss --out-file={{assets_dir}}/uno.css *.tsx *.template.html

html:
  bun index.tsx

build: css html

watch-build:
  watchexec -e toml,ts,tsx,html,css "just build && nyxt --remote --quit --eval '(reload-current-buffer)'"

test-unit *args='':
  bun test {{args}}
