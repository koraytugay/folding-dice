# 🎲 Folding Dice Quiz — 2D Net to 3D Cube Spatial Reasoning

An interactive 2D-to-3D spatial reasoning quiz application built with **pure vanilla HTML5, CSS3 3D transforms, and ES6 JavaScript** (zero external dependencies).

## ✨ Features

- **Random 2D Cube Net Generator**: Generates random valid 6-square cube nets from all **11 hexomino cube nets** (with random 2D rotations and reflections).
- **6 Geometric Die Symbols**:
  - `+` Plus sign
  - `□` Empty square
  - `■` Filled black square
  - `○` Empty circle
  - `●` Filled black circle
  - `⚃` Four dots
- **4 3D Perspective Options (`A`, `B`, `C`, `D`)**: Choose which 3D isometric die can be formed by folding the flat 2D net (with symbols on the outside).
- **Non-Folding 2D Visual Hints**:
  - **📐 Corner Hint**: Highlights the **3 directional lines** (**Cyan**, **Amber**, **Pink**) and glowing corner vertex dots that meet at the 3D corner.
  - **🎨 Opposite Pairs**: Color-codes the 3 pairs of opposite faces (`OPP A`, `OPP B`, `OPP C`) that fold to opposite sides of the cube and can never touch.
  - **🔗 Zip Edges**: Highlights matching open perimeter edges (`E1 ↔ E1`, `E2 ↔ E2`, etc.) that zip together when folded.
  - **❌ Eliminate 1**: Crosses out an impossible 3D option and explains why it cannot be formed.
- **Post-Solve 3D Fold Celebration & Step-by-Step Replay**: Selecting the correct option automatically folds the 2D net into the 3D cube and aligns the camera with the winning perspective, unlocking the step-by-step folding scrubber.

## 🚀 Running Locally

Open `index.html` directly in any modern browser, or serve the folder locally:

```bash
python3 -m http.server 8080
```
