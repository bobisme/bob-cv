import * as elements from "typed-html";
// css
import "@unocss/reset/sanitize/sanitize.css";
import "@unocss/reset/sanitize/assets.css";
import { program } from "commander";
import toml from "toml";
import dateFormat from "dateformat";
import { marked } from "marked";
import { hyphenateSync } from "hyphen/en";
import { NodeHtmlMarkdown } from "node-html-markdown";
import tipograph from "tipograph";

const SOFT_HYPHEN = "\u00AD";

type Notable = {
  tags: string[];
  desc: string;
};

type NotablesSection = {
  title?: string;
  notables: Notable[];
};

type Position = {
  name: string;
  desc?: string;
  start?: Date;
  end?: Date;
  sections?: NotablesSection[];
  notables?: Notable[];
};

type Company = {
  name: string;
  desc?: string;
  location?: string;
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
  let out = desc.trim();
  // eliminate orphans
  for (let i = out.length - 1; i > 0; i -= 1) {
    if (out.charAt(i) === " ") {
      out = [out.slice(0, i), "&nbsp;", out.slice(i + 1)].join("");
      break;
    }
  }
  out = hyphenateSync(out);
  // strip soft hyphens from last 2 words
  for (let i = out.length - 1; i > 0; i -= 1) {
    if (out.charAt(i) === " ") {
      out = [
        out.slice(0, i + 1),
        out.slice(i + 1).replace(SOFT_HYPHEN, ""),
      ].join("");
      break;
    }
  }
  out = marked.parse(out);
  return out;
};

export const PositionHeader = (attrs: Position, _: string[]): string => {
  if (!attrs.name) return "";
  return (
    <h3 class="name inline-block">
      {attrs.name}
      {attrs.start ? (
        <span class="pos-start font-normal fs-0 italic">
          &mdash; {dateFormat(attrs.start, "mmm yyyy")}
        </span>
      ) : (
        ""
      )}
    </h3>
  );
};

export const Position = (attrs: Position, _: string[]): string => {
  return (
    <div class="position">
      <PositionHeader {...attrs} />
      {attrs.desc
        ? [
            <span class="pos-desc fs-0">{parseDesc(attrs.desc)}</span>,
            <h4>Projects</h4>,
          ]
        : ""}
      {attrs.sections
        ? attrs.sections.map((sec) => (
            <div class="section">
              <h5>{sec.title}</h5>
              <ul class="notables">
                {sec.notables.map((note) => (
                  <Notable {...note}>{parseDesc(note.desc)}</Notable>
                ))}
              </ul>
            </div>
          ))
        : ""}
      {attrs.notables ? (
        <ul class="notables">
          {attrs.notables.map((note) => (
            <Notable {...note}>{parseDesc(note.desc)}</Notable>
          ))}
        </ul>
      ) : (
        ""
      )}
    </div>
  );
};

export const Company = (attrs: Company, _: string[]): string => {
  let start = dateFormat(attrs.start, "mmm yyyy");
  let end = dateFormat(attrs.end, "mmm yyyy");
  return (
    <div class="company">
      <h2 class="comp-name mb-0">{attrs.name}</h2>
      {/* prettier refuses to leave the spaces alone */}
      {`<span class="comp-start">${start}</span>&ndash;<span class="comp-end">${end}</span>`}
      {attrs.location ? (
        <span class="location italic">&mdash; {attrs.location}</span>
      ) : (
        ""
      )}
      {attrs.desc ? <div class="fart">{parseDesc(attrs.desc)}</div> : ""}
      {attrs.positions.map((pos) => (
        <Position {...pos} />
      ))}
    </div>
  );
};

export const Education = (attrs: Education, _: string[]): string => {
  return (
    <div class="edu">
      <h3 class="fs-0 mb-0 leading-tight">{attrs.name}</h3>
      <div>
        <span class="mb-0 leading-tight">
          {dateFormat(attrs.end, "mmm yyyy")} &mdash; {attrs.location}
        </span>
        {attrs.sub ? <span class="fs-0 italic">&mdash;{attrs.sub}</span> : ""}
      </div>
      {attrs.desc ? <div class="">{parseDesc(attrs.desc)}</div> : ""}
    </div>
  );
};

const PAGE_TEMPLATE = await Bun.file("page.template.html").text();

export const Page = (
  _attrs: elements.Children & elements.Attributes,
  contents: string[],
): string => {
  return PAGE_TEMPLATE.replace("${children}", contents.join("\n"));
};

type Data = {
  companies: Company[];
  education: Education[];
};

async function loadData(path: string): Promise<Data> {
  let data = toml.parse(await Bun.file(path).text());
  data.companies.sort((a: Company, b: Company) => a.end <= b.end);
  return data;
}

async function main() {
  program
    .name("bob-cv")
    .description("render static elements for a CV page")
    .version("mysterybox")
    .option("--out-file <string>", "output index.html path", "dist/index.html")
    .option("--cv-data <string>", "input data.toml", "data.toml")
    .option("--md-out-file <string>", "output resume.md", `dist/resume.md`);
  program.parse();
  const opts = program.opts();

  const data = await loadData(opts.cvData);

  let inner: string[] = [
    data.companies.map((company) => <Company {...company} />),
    [<h2>Education</h2>],
    data.education.map((edu) => <Education {...edu} />),
  ].flat();

  let page = Page({}, inner);
  let typo = tipograph({
    format: "html",
  });

  page = typo(page);
  Bun.write(opts.outFile, page);

  let md = NodeHtmlMarkdown.translate(inner.join(" "), {});
  Bun.write(opts.mdOutFile, md);
}

main();
