import { defineConfig } from "unocss";

export default defineConfig({
  rules: [["m-1", { margin: "1px" }]],
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
