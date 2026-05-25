const fs = require("fs");

const file = "dist/assets/index-CsMSNR1v.js";
let source = fs.readFileSync(file, "utf8");

const palette =
  'const Jr={change:{main:"#f97316",pale:"#fff7ed",line:"#fed7aa"},delivery:{main:"#2563eb",pale:"#eff6ff",line:"#bfdbfe"},member:{main:"#16a34a",pale:"#f0fdf4",line:"#bbf7d0"},middleware:{main:"#7c3aed",pale:"#f5f3ff",line:"#ddd6fe"},issue:{main:"#dc2626",pale:"#fef2f2",line:"#fecaca"},milestone:{main:"#0f766e",pale:"#f0fdfa",line:"#99f6e4"}};';

const normalize =
  'function Vc(a){return Jr[a]?a:a==="delivery_delete"?"delivery":a==="change_delete"?"change":a==="member_add"||a==="member_update"?"member":a==="middleware_update"?"middleware":a==="issue_update"?"issue":"milestone"}';

if (!source.includes(palette)) {
  throw new Error("lifecycle palette marker not found");
}

if (!source.includes(normalize)) {
  source = source.replace(palette, palette + normalize);
}

source = source
  .replaceAll("Jr[v.eventType].main", "Jr[Vc(v.eventType)].main")
  .replaceAll("Jr[v.eventType].line", "Jr[Vc(v.eventType)].line")
  .replaceAll("Jr[v.eventType].pale", "Jr[Vc(v.eventType)].pale")
  .replaceAll('Hu(v.eventType))', 'Hu(Vc(v.eventType))||"里程碑")')
  .replaceAll("v.content.slice(0,54)", '(v.content||"").slice(0,54)');

fs.writeFileSync(file, source, "utf8");
console.log("patched lifecycle runtime");
