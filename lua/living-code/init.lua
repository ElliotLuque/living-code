-- Living Code for Neovim.
-- Palettes in lua/living-code/palettes/ are generated; this file is hand-written.
local M = {}

M.flavors = { "night", "signal", "frost", "paper" }

M.config = {
  flavor = "night", -- night | signal | frost | paper
  light_flavor = "paper", -- used by :colorscheme living-code when background=light
  transparent = false,
  italic_comments = true,
  dim_inactive = false,
  ---@type fun(hl: table<string, table>, p: table)|nil
  on_highlights = nil,
}

function M.setup(opts)
  M.config = vim.tbl_deep_extend("force", M.config, opts or {})
end

---@param flavor? string
function M.palette(flavor)
  return require("living-code.palettes." .. (flavor or M.config.flavor))
end

--- Load a flavor. Without an argument (`:colorscheme living-code`) the flavor
--- follows 'background': config.flavor when dark, config.light_flavor when light.
---@param flavor? string
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
