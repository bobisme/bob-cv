assets_dir := "dist"
htmx_version := "1.9.5"

default: build

css:
  cp latex.css {{assets_dir}}/
  bun run unocss --out-file={{assets_dir}}/uno.css *.tsx *.template.html

fonts:
  mkdir -p {{assets_dir}}/fonts
  cp fonts/* {{assets_dir}}/fonts

html:
  bun index.tsx

build: css html fonts

zip:
  cd dist && zip -r ../dist.zip *

watch-build:
  watchexec -e toml,ts,tsx,html,css "just build && nyxt --remote --quit --eval '(reload-current-buffer)'"

test-unit *args='':
  bun test {{args}}
