# 🎲 FOLDING DICE 3D — 2D Net to 3D Cube Visualizer

An interactive educational web application for visualizing how **up to 6 connected squares** on a 2D surface fold **step-by-step** along their shared hinge creases into a **3D Die (Cube)**—and unfold back out to 2D.

Built with **100% pure vanilla HTML5, CSS3 3D Transforms (`preserve-3d`), and ES6 JavaScript** (zero external dependencies), modeled after the architecture and visual design of `blocks`.

---

## ✨ Key Educational Features

1. **6 Geometric Die Symbols (`+`, `□`, `■`, `○`, `●`, `⚃`)**:
   - Each square face features one of **6 crisp geometric SVG symbols**:
     1. **Plus Sign (`+`)**
     2. **Empty Square (`□`)**
     3. **Filled-in Black Square (`■`)**
     4. **Empty Circle (`○`)**
     5. **Filled-in Black Circle (`●`)**
     6. **Four Dots (`⚃`)** (as in the 4-face of a die)
2. **Interactive 2D Surface Net Builder (Up to 6 Squares)**:
   - Start on a flat 2D grid and click any dashed **`+`** candidate slot around existing squares to attach up to **6 connected squares**.
   - **Delete (`2`)**, **Paint / Symbol (`3`)**, and **Set Base (`4`)** tools let you customize your net and choose which square stays anchored flat on the floor while the others fold up around it.
3. **Slow Step-by-Step 3D Folding & Unfolding**:
   - **Fold Next Step (`→`)**: Slowly folds one square **90°** along its glowing hinge crease into 3D space.
   - **Fold Out Step (`←`)**: Unfolds one square **90°** back out toward the flat 2D surface.
   - **Flatten 2D** & **Auto Fold 3D (`F`)**: Animate the entire folding or unfolding sequence automatically with adjustable speed (**Slow**, **Normal**, **Fast**).
   - **Interactive Step Pills & Scrubber Slider**: Jump to any step (`Step 0` through `Step 5`) or drag the continuous slider to inspect every angle between `0°` and `90°`.
4. **Spatial Reasoning Quiz Mode (`Q`)**:
   - Generates a random valid 6-square 2D net with the **6 geometric symbols (`+`, `□`, `■`, `○`, `●`, `⚃`)** on crisp white squares and asks you to pick which of the **4 3D isometric perspectives (`A`, `B`, `C`, `D`)** can be formed by folding the net.
   - Includes a **💡 Hint: Fold 1 Step** button (or press `→`) so learners can fold the 2D net one square at a time to test their mental model.
5. **Real-Time 3D Face Prediction & Overlap Detection**:
   - Computes the exact 3D orientation frame $(\mathbf{u}, \mathbf{v}, \mathbf{n})$ of every square and labels which 3D cube face (`BOTTOM`, `TOP`, `FRONT`, `BACK`, `LEFT`, `RIGHT`) each square will land on—highlighting any invalid overlapping nets in red.
6. **Full 3D Orbit Camera, ViewCube & Orthogonal Elevations**:
   - Drag to orbit in 3D, scroll to zoom, `Shift` + drag to pan, or click the interactive **3D ViewCube** and view pills (`3D Orbit`, `2D Surface`, `Front`, `Back`, `Left`, `Right`, `Bottom`) and **X-Ray Mode (`X`)**.

---

## 🚀 Running Locally

Open `index.html` directly in any modern browser, or serve the folder with any static HTTP server:

```bash
python3 -m http.server 8080
```
