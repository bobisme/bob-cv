import * as elements from "typed-html";
// css
import "@unocss/reset/sanitize/sanitize.css";
import "@unocss/reset/sanitize/assets.css";
import { program } from "commander";
import toml from "toml";
import dateFormat from "dateformat";

type Position = {
  name: string;
  start: Date;
};

type Company = {
  name: string;
  start: Date;
  end: Date;
  positions: Position[];
};

export const Position = (attrs: Position, _: string[]): string => (
  <div class="position">
    <span class="name">{attrs.name}</span>
    <span class="pos-start">{dateFormat(attrs.start, "mmmm dS, yyyy")}</span>
  </div>
);

export const Company = (attrs: Company, _: string[]): string => (
  <div class="company">
    <span class="comp-name h6">{attrs.name}</span>
    <span class="comp-start h6">
      {dateFormat(attrs.start, "mmmm dS, yyyy")}
    </span>
    <span class="comp-end h6">{dateFormat(attrs.end, "mmmm dS, yyyy")}</span>
    {attrs.positions.map((pos) => (
      <Position {...pos} />
    ))}
  </div>
);

const PAGE_TEMPLATE = await Bun.file("page.template.html").text();

export const Page = (
  attrs: elements.Children & elements.Attributes,
  contents: string[],
): string => {
  return PAGE_TEMPLATE.replace("${children}", contents.join("\n"));
};

type Data = {
  companies: Company[];
};

async function loadData(path: string): Promise<Data> {
  let data = toml.parse(await Bun.file(path).text());
  for (let company of data.companies) {
    if (Object.hasOwn(company, "start")) {
      company.start = new Date(Date.parse(company.start));
    }
    for (let position of company.positions) {
      if (Object.hasOwn(position, "start")) {
        position.start = new Date(Date.parse(position.start));
      }
    }
  }
  data.companies.sort((a: Company, b: Company) => a.start < b.start);
  console.log(data);
  return data;
}

async function main() {
  program
    .name("bob-cv")
    .description("render static elements for a CV page")
    .version("mysterybox")
    .option("--out-file <string>", "output index.html path", "dist/index.html")
    .option("--cv-data <string>", "input data.toml", "data.toml");
  program.parse();
  const opts = program.opts();

  const data = await loadData(opts.cvData);

  let page = Page(
    {},
    data.companies.map((company) => <Company {...company} />),
  );
  Bun.write(opts.outFile, page);
}

main();
