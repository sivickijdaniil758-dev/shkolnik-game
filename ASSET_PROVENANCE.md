# Asset provenance and release gate

## Generated artwork

On 2026-11-10 the project owner confirmed in the project conversation that the
game pictures were generated for this project with ChatGPT/OpenAI. This statement
covers the raster artwork in `src/assets/`, including backgrounds, the hero and
character portraits. The `.webp` portraits are optimized derivatives of those
generated images.

The owner should retain the original ChatGPT generation conversations and source
files with the release records. OpenAI's terms govern the relationship between
the user and OpenAI, while the project owner remains responsible for checking
that outputs do not reproduce protected third-party characters, brands, real
people or other material. This provenance record is not a guarantee that no
third-party rights exist.

The generated Web Audio sound effects in `src/utils/sounds.js`, CSS artwork and
repository SVG UI icons are source-code assets covered by the repository license,
subject to the project owner's confirmation that no third-party work was copied.

## Yandex Games icon generated on 2026-11-11

`release-assets/yandex-icon-512.png` was generated specifically for this project
with OpenAI image generation. It depicts an original blue school backpack, a
cream squared-paper notebook with a red numeral 5, and a green chalkboard. The
prompt required no logos, trademarks, real people, characters or copied game UI.
The final release file is a 512 × 512 PNG prepared for the Yandex Games catalog.

## Menu music replaced on 2026-11-10

`src/assets/audio/menu-theme.mp3` is now **Back to school**, by **lorenzobuczek**,
downloaded using the official Pixabay download button on 2026-11-10.

- Track: https://pixabay.com/music/modern-classical-back-to-school-147750/
- Published on Pixabay: 2023-04-27; track ID: 147750.
- License: Pixabay Content License, https://pixabay.com/service/terms/ (section 5;
  page last updated 2026-10-20, checked 2026-11-10).
- Summary: https://pixabay.com/service/license-summary/
- Download filename: `lorenzobuczek-back-to-school-147750.mp3`.
- The in-game copy was transcoded on 2026-11-11 from the downloaded 256 kbps
  MP3 to a 96 kbps stereo MP3 to reduce loading time. Its SHA-256 is
  `3d708ffb81b0491e5a7de14f8e587b8b73dbe270e55aa4373f19961aa5f733ee`.
- Used as background music within the game; do not redistribute or sell it as a
  standalone music download. This asset is excluded from the repository MIT license.
- Commercial use and adaptation are permitted subject to the license restrictions;
  the platform does not guarantee clearance of all possible third-party rights.
- No separate license certificate was issued during this download. These records
  document the source and terms observed, not an independent rights guarantee.

The old recording identified by the owner as the NetMinusa instrumental of
«Учат в школе» has been replaced and is no longer included in new builds. It may
remain in Git history and older deployments; those are not cleared for release.

Do not place school emblems, real pupils or teachers, celebrity likenesses,
trademarks, copyrighted characters or identifiable real-person photographs in
replacement artwork without the necessary permission.
