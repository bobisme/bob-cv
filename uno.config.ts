import { defineConfig } from "unocss";

const scale = (n: number): number => {
  return Math.pow(1.25, n);
};

export default defineConfig({
  rules: [
    ["m-1", { margin: "1px" }],
    [
      /^fs-(\d+)$/,
      ([, d]) => {
        let n = Number.parseInt(d);
        return { "font-size": `${scale(n)}rem` };
      },
    ],
    [
      /^fs--(\d+)$/,
      ([, d]) => {
        let n = Number.parseInt(d);
        return { "font-size": `${scale(-n)}rem` };
      },
    ],
  ],
  shortcuts: [
    {
      btn: "py-2 px-4 font-semibold rounded-lg shadow-md",
    },
    {
      "fancy-btn":
        "[&_.hx-ind]:hidden [&.htmx-request_.hx-ind]:block [&.htmx-request_button]:hidden",
    },
  ],
  preflights: [],
});
