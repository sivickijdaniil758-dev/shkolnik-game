# Third-party notices

Production dependencies:

- React and React DOM — MIT License, Copyright Meta Platforms, Inc. and affiliates.
- Yandex Games SDK — loaded by the Yandex Games platform and governed by the
  platform terms; it is not copied into this repository.

Development-only dependencies (Vite, ESLint and their transitive packages) are
not shipped as executable libraries in the game ZIP. Their license metadata can
be reproduced with `npm query ':root > *'` and `npm view <package> license`.

The Google Fonts network dependency was removed. The game now uses local system
font fallbacks and does not contact Google at startup.
