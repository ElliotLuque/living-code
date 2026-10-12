-- lualine: options = { theme = "living-code" }
local lc = require("living-code")
local flavor = (vim.g.colors_name or ""):match("^living%-code%-(%w+)$") or lc.config.flavor
local p = lc.palette(flavor)
local c, r = p.colors, p.roles

local function mode(color)
  return {
    a = { fg = r.bg, bg = color, gui = "bold" },
    b = { fg = r.fgAlt, bg = c.surface1 },
    c = { fg = r.fgMuted, bg = r.bgDeep },
  }
end

return {
  normal = mode(c.teal),
  insert = mode(c.amber),
  visual = mode(c.orchid),
  replace = mode(c.flare),
  command = mode(c.steel),
  terminal = mode(c.moss),
  inactive = {
    a = { fg = r.lineNumber, bg = r.bgDeep },
    b = { fg = r.lineNumber, bg = r.bgDeep },
    c = { fg = r.lineNumber, bg = r.bgDeep },
  },
}
