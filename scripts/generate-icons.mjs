import sharp from "sharp";
import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a0812"/>
      <stop offset="100%" stop-color="#2d1020"/>
    </linearGradient>
    <!-- Main drupelet: pink highlight to deep raspberry -->
    <radialGradient id="drp" cx="32%" cy="28%" r="72%">
      <stop offset="0%" stop-color="#ffcce0"/>
      <stop offset="30%" stop-color="#ff6b9d"/>
      <stop offset="100%" stop-color="#8c0a3c"/>
    </radialGradient>
    <!-- Side/edge drupelet: slightly darker -->
    <radialGradient id="drpDk" cx="32%" cy="28%" r="72%">
      <stop offset="0%" stop-color="#ffaacf"/>
      <stop offset="35%" stop-color="#d63b6e"/>
      <stop offset="100%" stop-color="#6a0830"/>
    </radialGradient>
  </defs>

  <!-- Background with rounded corners -->
  <rect width="512" height="512" rx="110" fill="url(#bg)"/>

  <!-- Soft ambient glow behind the fruit -->
  <ellipse cx="256" cy="308" rx="145" ry="155" fill="#d63b6e" opacity="0.10"/>

  <!-- ===== RASPBERRY FRUIT ===== -->

  <!-- Row 1 — top, 2 drupelets -->
  <circle cx="241" cy="200" r="31" fill="url(#drp)"/>
  <circle cx="273" cy="200" r="31" fill="url(#drp)"/>

  <!-- Row 2 — 4 drupelets -->
  <circle cx="202" cy="244" r="31" fill="url(#drpDk)"/>
  <circle cx="241" cy="244" r="31" fill="url(#drp)"/>
  <circle cx="273" cy="244" r="31" fill="url(#drp)"/>
  <circle cx="312" cy="244" r="31" fill="url(#drpDk)"/>

  <!-- Row 3 — 5 drupelets, widest row -->
  <circle cx="183" cy="286" r="31" fill="url(#drpDk)"/>
  <circle cx="222" cy="286" r="31" fill="url(#drp)"/>
  <circle cx="261" cy="286" r="31" fill="url(#drp)"/>
  <circle cx="300" cy="286" r="31" fill="url(#drp)"/>
  <circle cx="339" cy="286" r="31" fill="url(#drpDk)"/>

  <!-- Row 4 — 4 drupelets -->
  <circle cx="202" cy="326" r="31" fill="url(#drpDk)"/>
  <circle cx="241" cy="326" r="31" fill="url(#drp)"/>
  <circle cx="273" cy="326" r="31" fill="url(#drp)"/>
  <circle cx="312" cy="326" r="31" fill="url(#drpDk)"/>

  <!-- Row 5 — 3 drupelets -->
  <circle cx="222" cy="364" r="29" fill="url(#drp)"/>
  <circle cx="257" cy="364" r="29" fill="url(#drp)"/>
  <circle cx="292" cy="364" r="29" fill="url(#drpDk)"/>

  <!-- Row 6 — bottom, 2 drupelets -->
  <circle cx="238" cy="399" r="27" fill="url(#drp)"/>
  <circle cx="274" cy="399" r="27" fill="url(#drp)"/>

  <!-- ===== SPECULAR HIGHLIGHTS on each drupelet ===== -->
  <!-- Row 1 -->
  <circle cx="233" cy="191" r="10" fill="white" opacity="0.55"/>
  <circle cx="265" cy="191" r="10" fill="white" opacity="0.55"/>
  <!-- Row 2 -->
  <circle cx="194" cy="235" r="9"  fill="white" opacity="0.45"/>
  <circle cx="233" cy="235" r="9"  fill="white" opacity="0.45"/>
  <circle cx="265" cy="235" r="9"  fill="white" opacity="0.45"/>
  <circle cx="304" cy="235" r="9"  fill="white" opacity="0.45"/>
  <!-- Row 3 -->
  <circle cx="175" cy="277" r="9"  fill="white" opacity="0.40"/>
  <circle cx="214" cy="277" r="9"  fill="white" opacity="0.40"/>
  <circle cx="253" cy="277" r="9"  fill="white" opacity="0.40"/>
  <circle cx="292" cy="277" r="9"  fill="white" opacity="0.40"/>
  <circle cx="331" cy="277" r="9"  fill="white" opacity="0.40"/>
  <!-- Row 4 -->
  <circle cx="194" cy="317" r="9"  fill="white" opacity="0.40"/>
  <circle cx="233" cy="317" r="9"  fill="white" opacity="0.40"/>
  <circle cx="265" cy="317" r="9"  fill="white" opacity="0.40"/>
  <circle cx="304" cy="317" r="9"  fill="white" opacity="0.40"/>
  <!-- Row 5 -->
  <circle cx="214" cy="355" r="8"  fill="white" opacity="0.38"/>
  <circle cx="249" cy="355" r="8"  fill="white" opacity="0.38"/>
  <circle cx="284" cy="355" r="8"  fill="white" opacity="0.38"/>
  <!-- Row 6 -->
  <circle cx="230" cy="391" r="8"  fill="white" opacity="0.38"/>
  <circle cx="266" cy="391" r="8"  fill="white" opacity="0.38"/>

  <!-- ===== LEAVES (sepals / calyx) at top ===== -->
  <!-- Center sepal -->
  <path d="M257 176 C253 158 249 138 257 118 C265 138 261 158 257 176Z"
        fill="#3a8c30" opacity="0.95"/>
  <!-- Left sepal -->
  <path d="M236 181 C217 165 209 144 216 124 C229 132 235 152 236 181Z"
        fill="#4aaa38" opacity="0.90"/>
  <!-- Right sepal -->
  <path d="M278 181 C297 165 305 144 298 124 C285 132 279 152 278 181Z"
        fill="#4aaa38" opacity="0.90"/>
  <!-- Far-left sepal -->
  <path d="M218 189 C196 178 186 157 194 138 C206 144 215 163 218 189Z"
        fill="#3a8c30" opacity="0.80"/>
  <!-- Far-right sepal -->
  <path d="M296 189 C318 178 328 157 320 138 C308 144 299 163 296 189Z"
        fill="#3a8c30" opacity="0.80"/>

  <!-- Stem -->
  <line x1="257" y1="118" x2="257" y2="96"
        stroke="#5ab84a" stroke-width="7" stroke-linecap="round"/>
</svg>`;

for (const size of [192, 512]) {
  const outputPath = path.join(__dirname, `../public/icon-${size}.png`);
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(outputPath);
  console.log(`Generated icon-${size}.png`);
}

// Also generate apple-touch-icon (180x180)
const appleOutputPath = path.join(__dirname, "../public/apple-touch-icon.png");
await sharp(Buffer.from(svg))
  .resize(180, 180)
  .png()
  .toFile(appleOutputPath);
console.log("Generated apple-touch-icon.png");

console.log("All icons generated!");
