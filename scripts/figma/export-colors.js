// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: GPL-3.0-or-later

// Figma plugin code that exports the color variables of the Nebula Figma file
// (collections "Primitive" and "Semantic colors"), read only.
//
// It is not run by Node: pass it to the use_figma tool of the Figma MCP
// server, on file ZRZzzlqb9GfB9Xdz6iGufh, save the returned JSON to a file
// and import it with:
//
//   node scripts/import-colors.mjs <file>
//
// Each primitive is [name, hex]; each semantic token is
// [name, light reference, light hex, dark reference, dark hex, description].
// A reference is the name of the variable the token points to, prefixed by
// its collection ("Primitive:Gray/400"), or null for a raw color.

const hex = (c) => {
  const h = (x) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, '0')
  const a = c.a === undefined || c.a >= 0.999 ? '' : h(c.a)
  return '#' + h(c.r) + h(c.g) + h(c.b) + a
}
const collections = await figma.variables.getLocalVariableCollectionsAsync()
const byId = {}
for (const c of collections) byId[c.id] = c

// follows aliases until a color, in the given mode
const resolve = async (value, modeName) => {
  let ref = null
  let v = value
  for (let i = 0; i < 10 && v && v.type === 'VARIABLE_ALIAS'; i++) {
    const target = await figma.variables.getVariableByIdAsync(v.id)
    const col = byId[target.variableCollectionId]
    ref = (col ? col.name + ':' : '') + target.name
    const mode = col.modes.find((m) => m.name === modeName) ?? col.modes[0]
    v = target.valuesByMode[mode.modeId]
  }
  return { ref, hex: v && typeof v === 'object' && 'r' in v ? hex(v) : String(v) }
}

const out = { primitives: [], semantic: [] }
const prim = collections.find((c) => c.name === 'Primitive')
for (const id of prim.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id)
  if (v.resolvedType !== 'COLOR') continue
  const r = await resolve(v.valuesByMode[prim.modes[0].modeId], prim.modes[0].name)
  out.primitives.push([v.name, r.hex])
}
const sem = collections.find((c) => c.name === 'Semantic colors')
const light = sem.modes.find((m) => m.name === 'Light')
const dark = sem.modes.find((m) => m.name === 'Dark')
for (const id of sem.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id)
  if (v.resolvedType !== 'COLOR') continue
  const l = await resolve(v.valuesByMode[light.modeId], 'Light')
  const d = await resolve(v.valuesByMode[dark.modeId], 'Dark')
  out.semantic.push([v.name, l.ref, l.hex, d.ref, d.hex, v.description || ''])
}
return out
