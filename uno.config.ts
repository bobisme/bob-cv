import { defineConfig } from "unocss";
import presetUno from "@unocss/preset-uno";
import presetIcons from "@unocss/preset-icons/browser";

const scale = (n: number): number => {
  return Math.pow(1.25, n);
};

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons(),
    // presetIcons({
    //   // collections: {
    //   //   carbon: () =>
    //   //     import("@iconify-json/carbon/icons.json").then((i) => i.default),
    //   // },
    // }),
  ],
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
