local M = {}

M.flavors = { "night", "signal", "frost", "paper" }

M.config = {
  flavor = "night",
  light_flavor = "paper",
  transparent = false,
  italic_comments = true,
  dim_inactive = false,
  on_highlights = nil,
}

function M.setup(opts)
  M.config = vim.tbl_deep_extend("force", M.config, opts or {})
end

function M.palette(flavor)
  return require("living-code.palettes." .. (flavor or M.config.flavor))
end

function M.load(flavor)
  local name = flavor and ("living-code-" .. flavor) or "living-code"
  flavor = flavor or (vim.o.background == "light" and M.config.light_flavor or M.config.flavor)
  local p = M.palette(flavor)

  if vim.g.colors_name then vim.cmd("hi clear") end
  if vim.fn.exists("syntax_on") == 1 then vim.cmd("syntax reset") end
  vim.o.termguicolors = true
  vim.o.background = p.light and "light" or "dark"
  vim.g.colors_name = name

  local hl = require("living-code.highlights").get(p, M.config)
  if M.config.on_highlights then M.config.on_highlights(hl, p) end
  for group, spec in pairs(hl) do
    vim.api.nvim_set_hl(0, group, spec)
  end
  for i, c in ipairs(p.ansi) do
    vim.g["terminal_color_" .. (i - 1)] = c
  end
end

return M
