//  Copyright (C) 2026 Nethesis S.r.l.
//  SPDX-License-Identifier: GPL-3.0-or-later

// Lowercase text without accents, for case and accent insensitive searches.
// For the Latin letters of the site, each character of the result matches the
// character at the same position in the original text, so a match found in
// one can be highlighted in the other.
export const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// The anchor of a color token in the Colors page, such as token-text-placeholder
export const tokenAnchor = (name: string) =>
  `token-${normalize(name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`
