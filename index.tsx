import * as elements from "typed-html";
// css
import "@unocss/reset/sanitize/sanitize.css";
import "@unocss/reset/sanitize/assets.css";
import { program } from "commander";
import toml from "toml";
import dateFormat from "dateformat";
import { marked } from "marked";
import { hyphenateSync } from "hyphen/en";

type Notable = {
  tags: string[];
  desc: string;
};
type Position = {
  name: string;
  start?: Date;
  notables: Notable[];
};

type Company = {
  name: string;
  start: Date;
  end: Date;
  positions: Position[];
};

type Education = {
  tags: string[];
  name: string;
  sub?: string;
  location?: string;
  start?: Date;
  end?: Date;
  desc: string;
};

export const Notable = (attrs: Notable, contents: string[]): string => (
  <li class="notable" data-tags={attrs.tags?.join(",")}>
    {contents}
  </li>
);

const parseDesc = (desc: string): string => {
  // eliminate orphans
  for (let i = desc.length - 1; i > 0; i -= 1) {
    if (desc.charAt(i) === " ") {
      desc = [desc.slice(0, i), "&nbsp;", desc.slice(i + 1)].join("");
      break;
    }
  }
  return marked.parse(hyphenateSync(desc));
};

export const Position = (attrs: Position, _: string[]): string => {
  return (
    <div class="position">
      <h3 class="name">{attrs.name}</h3>
      {attrs.start ? (
        <span class="pos-start">{dateFormat(attrs.start, "mmm yyyy")}</span>
      ) : (
        ""
      )}
      <ul class="notables">
        {attrs.notables.map((note) => (
          <Notable {...note}>{parseDesc(note.desc)}</Notable>
        ))}
      </ul>
    </div>
  );
};

export const Company = (attrs: Company, _: string[]): string => {
  let start = dateFormat(attrs.start, "mmm yyyy");
  let end = dateFormat(attrs.end, "mmm yyyy");
  return (
    <div class="company">
      <h2 class="comp-name inline-block">{attrs.name}</h2>
      &mdash;
      {/* prettier refuses to leave the spaces alone */}
      {`<span class="comp-start">${start}</span>&ndash;<span class="comp-end">${end}</span>`}
      {attrs.positions.map((pos) => (
        <Position {...pos} />
      ))}
    </div>
  );
};

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
  // console.log(data);
  // for (let company of data.companies) {
  //   if (Object.hasOwn(company, "start")) {
  //     company.start = new Date(Date.parse(company.start));
  //   }
  //   for (let position of company.positions) {
  //     if (Object.hasOwn(position, "start")) {
  //       position.start = new Date(Date.parse(position.start));
  //     }
  //   }
  // }
  data.companies.sort((a: Company, b: Company) => a.end <= b.end);
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
