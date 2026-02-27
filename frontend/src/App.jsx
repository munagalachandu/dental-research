import { useState, useRef, useCallback } from "react";

const API = "http://localhost:5000/api";

const C = {
  bg:      "#06080b",
  surface: "#0b1018",
  panel:   "#0f1823",
  border:  "#162030",
  border2: "#1e3048",
  accent:  "#00d4ff",
  green:   "#3ddc84",
  yellow:  "#ffd60a",
  red:     "#ff5757",
  purple:  "#c857ff",
  orange:  "#ff9340",
  text:    "#dce8f4",
  muted:   "#4e6e8a",
  dim:     "#1e3048",
};

const S = {
  root: {
    fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif",
    background: C.bg,
    minHeight: "100vh",
    color: C.text,
    overflowX: "hidden",
    width: "100%",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 56px",
    height: 64,
    borderBottom: `1px solid ${C.border}`,
    background: "rgba(6,8,11,0.9)",
    backdropFilter: "blur(16px)",
    position: "sticky",
    top: 0,
    zIndex: 200,
    width: "100%",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
  },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 9,
    background: `linear-gradient(135deg, ${C.accent} 0%, #0055ff 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 17,
    flexShrink: 0,
    boxShadow: `0 0 18px rgba(0,212,255,0.3)`,
  },
  logoText: {
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: "0.06em",
    color: C.text,
  },
  logoSub: {
    fontSize: 10,
    color: C.muted,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  navRight: { display: "flex", alignItems: "center", gap: 20 },
  navLink: {
    fontSize: 13,
    color: C.muted,
    cursor: "pointer",
    letterSpacing: "0.04em",
    transition: "color 0.15s",
    textDecoration: "none",
  },
  tryBtn: {
    padding: "9px 22px",
    borderRadius: 8,
    border: "none",
    background: `linear-gradient(135deg, ${C.accent}, #0066ff)`,
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.06em",
    boxShadow: `0 0 20px rgba(0,212,255,0.25)`,
    transition: "opacity 0.15s, transform 0.15s",
    fontFamily: "inherit",
  },
};

function HomePage({ onTry }) {
  return (
    <div style={{ width: "100%" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        html, body, #root { width: 100%; margin: 0; padding: 0; overflow-x: hidden; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow {
          0%,100% { opacity: 0.4; }
          50%      { opacity: 0.8; }
        }
        .fu  { animation: fadeUp 0.7s ease both; }
        .fu2 { animation: fadeUp 0.7s 0.15s ease both; }
        .fu3 { animation: fadeUp 0.7s 0.3s ease both; }
        .fu4 { animation: fadeUp 0.7s 0.45s ease both; }
      `}</style>

      <section style={{
        width: "100%",
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "80px 56px",
        textAlign: "center",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }} />
        <div style={{
          position: "absolute", top: "20%", right: "15%",
          width: 500, height: 500, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)`,
          animation: "glow 4s ease-in-out infinite",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", left: "10%",
          width: 350, height: 350, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0,102,255,0.05) 0%, transparent 70%)`,
          animation: "glow 6s 1s ease-in-out infinite",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 760, position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="fu" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 14px", borderRadius: 20, marginBottom: 32,
            background: "rgba(0,212,255,0.07)",
            border: `1px solid rgba(0,212,255,0.2)`,
            fontSize: 11, color: C.accent, letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: C.accent, display: "inline-block",
              animation: "glow 1.5s ease-in-out infinite",
            }} />
            Research Project · CBCT Imaging × AI
          </div>

          <h1 className="fu2" style={{
            fontSize: "clamp(42px, 6vw, 80px)",
            fontWeight: 700, lineHeight: 1.05,
            letterSpacing: "-0.03em", marginBottom: 28,
            color: C.text,
          }}>
            AI-Powered{" "}
            <span style={{
              background: `linear-gradient(90deg, ${C.accent} 0%, #4488ff 50%, ${C.purple} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Dental Implant</span>
            {" "}Planning
          </h1>

          <p className="fu3" style={{
            fontSize: 18, color: C.muted, lineHeight: 1.75,
            maxWidth: 580, marginBottom: 48,
          }}>
            We explored how AI can assist dentists in analyzing CBCT cross-sections —
            automatically segmenting bone structure, identifying nerve canals, computing
            precise measurements, and recommending the optimal implant.
          </p>

          <div className="fu4" style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={onTry}
              style={{ ...S.tryBtn, padding: "13px 32px", fontSize: 14, borderRadius: 10 }}
              onMouseEnter={e => { e.target.style.opacity = "0.88"; e.target.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.target.style.opacity = "1"; e.target.style.transform = "translateY(0)"; }}
            >
              Try the Model →
            </button>
            <a href="#about" style={{
              padding: "13px 32px", borderRadius: 10,
              border: `1px solid ${C.border2}`,
              color: C.muted, fontSize: 14, fontWeight: 500,
              cursor: "pointer", textDecoration: "none",
              transition: "border-color 0.15s, color 0.15s",
              display: "inline-flex", alignItems: "center",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.text; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border2; e.currentTarget.style.color = C.muted; }}
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      <div style={{
        width: "100%",
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        background: C.surface,
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "0 56px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
        }}>
          {[
            { n: "2",     unit: "YOLO Models",   d: "Bone + nerve canal" },
            { n: "3",     unit: "Width Points",   d: "at 2mm, 6mm, 8mm" },
            { n: "4",     unit: "Implant Brands", d: "Straumann, Nobel, Noris, Osstem" },
            { n: "±0.1mm",unit: "Accuracy",       d: "pixel-level precision" },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "32px 24px",
              borderRight: i < 3 ? `1px solid ${C.border}` : "none",
            }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: C.accent, lineHeight: 1, marginBottom: 4 }}>{s.n}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{s.unit}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      <section id="about" style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 56px", width: "100%" }}>
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.16em", color: C.accent, textTransform: "uppercase", marginBottom: 12 }}>
           
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            From CBCT slice to implant plan{" "}
            <span style={{ color: C.muted, fontWeight: 400 }}>in seconds</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
          {[
            {
              step: "01", color: C.green, icon: "🧬",
              title: "Upload CBCT Cross-Section",
              desc: "Provide a cross-sectional CBCT image of the jaw region along with the zoom/magnification factor. The system normalizes pixel dimensions to real-world millimetres.",
            },
            {
              step: "02", color: C.accent, icon: "🤖",
              title: "AI Segmentation",
              desc: "Two independent YOLO models run in parallel — one trained on bone tissue (cortical + cancellous), the other on the inferior alveolar nerve canal. Each produces a precise polygon mask.",
            },
            {
              step: "03", color: C.purple, icon: "📐",
              title: "Measurements",
              desc: "PCA-based height along the bone's principal axis. Perpendicular width scans at 2 mm, 6 mm, and 8 mm from the alveolar crest. Exact crest-to-nerve-canal distance.",
            },
          ].map((c, i) => (
            <div key={i} style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderLeft: i === 0 ? `3px solid ${c.color}` : `1px solid ${C.border}`,
              padding: "36px 32px",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: c.color, marginBottom: 16, opacity: 0.7 }}>{c.step}</div>
              <div style={{ fontSize: 28, marginBottom: 16 }}>{c.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: C.text }}>{c.title}</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{c.desc}</div>
            </div>
          ))}
        </div>

        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderTop: "none",
          padding: "36px 32px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: C.orange, marginBottom: 16, opacity: 0.7 }}>04</div>
            <div style={{ fontSize: 28, marginBottom: 16 }}>🎯</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Implant Recommendation</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
              Applies clinical rules: implant diameter = bone width − 3 mm buccal clearance;
              implant length = crest-to-nerve distance − 2 mm safety margin.
              Matches against a catalog of real implants from four major manufacturers.
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { brand: "Straumann",     range: "Ø 3.5–4.5 mm · L 6–18 mm",  color: "#2196F3" },
              { brand: "Nobel Biocare", range: "Ø 3.0–5.5 mm · L 7–18 mm",  color: "#9C27B0" },
              { brand: "Noris Medical", range: "Ø 3.3–6.0 mm · L 6–16 mm",  color: "#4CAF50" },
              { brand: "Osstem",        range: "Ø 3.0–5.5 mm · L 7–18 mm",  color: "#FF9800" },
            ].map(b => (
              <div key={b.brand} style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: C.panel,
                borderRadius: 8,
                border: `1px solid ${C.border}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 3, height: 28, borderRadius: 2, background: b.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{b.brand}</span>
                </div>
                <span style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>{b.range}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{
        width: "100%",
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 56px" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.16em", color: C.accent, textTransform: "uppercase", marginBottom: 12 }}>
        
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 48 }}>Built with</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            {[
              { name: "YOLO (Roboflow)", role: "Segmentation models", icon: "👁" },
              { name: "OpenCV",          role: "Mask processing",      icon: "📷" },
              { name: "NumPy / PCA",     role: "Measurements",         icon: "📐" },
              { name: "Flask",           role: "API backend",           icon: "🐍" },
              { name: "React",           role: "Frontend UI",           icon: "⚛️" },
            ].map(t => (
              <div key={t.name} style={{
                background: C.panel,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "20px",
              }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{t.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 56px", textAlign: "center", width: "100%" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.16em", color: C.accent, textTransform: "uppercase", marginBottom: 20 }}>
          
        </div>
        <h2 style={{ fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 20, lineHeight: 1.1 }}>
          See it in action
        </h2>
        <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.7, maxWidth: 480, margin: "0 auto 40px" }}>
          Upload any CBCT cross-sectional image and get instant bone analysis,
          measurements, and implant recommendations.
        </p>
        <button
          onClick={onTry}
          style={{ ...S.tryBtn, padding: "15px 40px", fontSize: 15, borderRadius: 12, boxShadow: `0 0 40px rgba(0,212,255,0.3)` }}
          onMouseEnter={e => { e.target.style.opacity = "0.88"; e.target.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.target.style.opacity = "1"; e.target.style.transform = "translateY(0)"; }}
        >
          Open the Analyzer →
        </button>
      </section>

      <footer style={{
        width: "100%",
        borderTop: `1px solid ${C.border}`,
        padding: "24px 56px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
        color: C.muted,
        fontSize: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ ...S.logoMark, width: 24, height: 24, fontSize: 12 }}>🦷</div>
          <span>OsteoScan AI · Research Demo</span>
        </div>
        <span>Not intended for clinical use</span>
      </footer>
    </div>
  );
}

function AnalyzerPage({ onHome }) {
  const [image, setImage]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [zoom, setZoom]         = useState("0.78");
  const [mode, setMode]         = useState("segment");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState(null);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImage(file);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const run = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("image", image);
      fd.append("mode", mode);
      fd.append("zoom", zoom || "0.78");
      const res  = await fetch(`${API}/analyze`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const modes = [
    { id: "segment",   icon: "🧬", title: "Segmentation",  sub: "Bone + nerve canal outlines",          color: C.green  },
    { id: "measure",   icon: "📐", title: "Measurements",  sub: "Height, widths @2/6/8mm, crest→nerve", color: C.accent },
    { id: "recommend", icon: "🎯", title: "Implant Rec.",  sub: "Best-fit from 4 brand catalogs",       color: C.purple },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%" }}>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fu { animation: fadeUp 0.4s ease both; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div style={{
        width: "100%",
        padding: "16px 40px",
        borderBottom: `1px solid ${C.border}`,
        background: C.surface,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={onHome} style={{
            background: "none", border: `1px solid ${C.border2}`,
            color: C.muted, borderRadius: 8, padding: "7px 14px",
            cursor: "pointer", fontSize: 12, fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 6,
            transition: "color 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.color = C.text}
            onMouseLeave={e => e.currentTarget.style.color = C.muted}
          >
            ← Back
          </button>
          <div style={{ width: 1, height: 24, background: C.border }} />
          <div style={{ fontSize: 13, color: C.muted }}>
            <span style={{ color: C.accent, fontWeight: 600 }}>OsteoScan AI</span>
            &nbsp;/&nbsp;Analyzer
          </div>
        </div>
        <div style={{
          fontSize: 11, color: C.muted,
          border: `1px solid ${C.border}`,
          borderRadius: 20, padding: "4px 12px",
          letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          Research Preview
        </div>
      </div>

      <div style={{
        flex: 1,
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto",
        padding: "36px 40px 60px",
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: 24,
        alignItems: "start",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>
              CBCT Analyzer
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>
              Upload a cross-sectional jaw image and choose an analysis mode
            </div>
          </div>

          <div
            style={{
              border: `2px dashed ${dragging ? C.accent : C.border2}`,
              borderRadius: 14,
              background: dragging ? `rgba(0,212,255,0.04)` : C.surface,
              minHeight: preview ? "auto" : 200,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s",
              overflow: "hidden", position: "relative",
            }}
            onClick={() => fileRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])} />
            {preview ? (
              <>
                <img src={preview} alt="preview" style={{ width: "100%", maxHeight: 300, objectFit: "contain", display: "block", borderRadius: 12, background: "#0b1018" }} />
                <div style={{
                  position: "absolute", bottom: 12, right: 12,
                  background: "rgba(6,8,11,0.85)", border: `1px solid ${C.border2}`,
                  borderRadius: 8, padding: "6px 12px",
                  fontSize: 11, color: C.muted, backdropFilter: "blur(8px)",
                }}>
                  Click to change image
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 14, opacity: 0.5 }}>🩻</div>
                <div style={{ fontSize: 15, color: C.muted, marginBottom: 6 }}>Drop your CBCT image here</div>
                <div style={{ fontSize: 12, color: C.dim }}>or click to browse · PNG, JPG supported</div>
              </div>
            )}
          </div>

          {error && (
            <div style={{
              background: "rgba(255,87,87,0.07)",
              border: `1px solid rgba(255,87,87,0.3)`,
              borderRadius: 10, padding: "14px 18px",
              color: C.red, fontSize: 13,
            }}>
              ⚠ {error}
            </div>
          )}

          {result?.image && (
            <div className="fu">
              <div style={{ fontSize: 11, color: C.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
                Analysis Result
              </div>
              <img src={result.image} alt="result" style={{
                width: "100%", maxHeight: 320, objectFit: "contain",
                borderRadius: 12, border: `1px solid ${C.border2}`,
                display: "block", background: "#0b1018",
              }} />
              {mode === "segment" && (
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {[
                    { label: "Bone",        ok: result.detected_bone,  color: C.green  },
                    { label: "Nerve Canal", ok: result.detected_nerve, color: C.yellow },
                  ].map(ch => (
                    <span key={ch.label} style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "5px 12px", borderRadius: 20,
                      fontSize: 11, fontWeight: 600,
                      background: ch.ok ? "rgba(61,220,132,0.1)" : "rgba(255,87,87,0.1)",
                      color: ch.ok ? ch.color : C.red,
                      border: `1px solid ${(ch.ok ? ch.color : C.red)}33`,
                    }}>
                      {ch.ok ? "✓" : "✗"} {ch.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 24 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.14em", color: C.muted, textTransform: "uppercase", marginBottom: 10 }}>
              Zoom Factor
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="number" step="0.01" min="0.1" max="5"
                value={zoom}
                onChange={(e) => setZoom(e.target.value)}
                style={{
                  flex: 1, background: C.panel,
                  border: `1px solid ${C.border2}`,
                  borderRadius: 8, color: C.text, fontSize: 15,
                  padding: "9px 12px", fontFamily: "inherit", outline: "none",
                  fontWeight: 600,
                }}
                placeholder="0.78"
              />
              <span style={{ fontSize: 12, color: C.muted }}>×</span>
            </div>
            <div style={{ fontSize: 10, color: C.dim, marginTop: 6 }}>Default 0.78 · px → mm scale</div>
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.14em", color: C.muted, textTransform: "uppercase", marginBottom: 12 }}>
              Analysis Mode
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "12px 14px",
                    borderRadius: 9,
                    border: `1px solid ${mode === m.id ? m.color : C.border}`,
                    background: mode === m.id ? `${m.color}12` : "transparent",
                    color: mode === m.id ? m.color : C.muted,
                    cursor: "pointer", fontSize: 13, fontFamily: "inherit",
                    fontWeight: mode === m.id ? 600 : 400,
                    transition: "all 0.15s", textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{m.icon}</span>
                  <span style={{ lineHeight: 1.3 }}>
                    {m.title}
                    <span style={{ fontSize: 10, opacity: 0.7, display: "block" }}>{m.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={!image || loading}
            onClick={run}
            style={{
              padding: "14px",
              borderRadius: 10, border: "none",
              background: !image || loading ? C.dim : `linear-gradient(135deg, ${C.accent}, #0066ff)`,
              color: !image || loading ? C.muted : "#fff",
              fontSize: 13, fontWeight: 700,
              fontFamily: "inherit", letterSpacing: "0.06em",
              cursor: !image || loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: !image || loading ? "none" : `0 0 20px rgba(0,212,255,0.2)`,
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 16, height: 16,
                  border: "2px solid rgba(255,255,255,0.2)",
                  borderTopColor: "#fff", borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }} />
                Analyzing…
              </>
            ) : "▶  Run Analysis"}
          </button>

          {result && (
            <div className="fu" style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 12, overflow: "hidden",
            }}>
              <div style={{
                padding: "14px 16px",
                borderBottom: `1px solid ${C.border}`,
                fontSize: 10, letterSpacing: "0.14em",
                color: C.muted, textTransform: "uppercase",
              }}>
                {mode === "segment" ? "Detection" : mode === "measure" ? "Measurements" : "Bone Data"}
              </div>

              {mode === "segment" && (
                <>
                  <MetRow label="Bone"        val={result.detected_bone  ? "Detected" : "Not found"} dot={C.green}  col={result.detected_bone  ? C.green  : C.red} />
                  <MetRow label="Nerve Canal" val={result.detected_nerve ? "Detected" : "Not found"} dot={C.yellow} col={result.detected_nerve ? C.yellow : C.red} />
                  <div style={{ padding: "12px 16px" }}>
                    <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.7 }}>
                      <span style={{ color: C.green }}>●</span> Green — bone &nbsp;
                      <span style={{ color: C.yellow }}>●</span> Yellow — nerve canal
                    </div>
                  </div>
                </>
              )}

              {mode === "measure" && (
                <>
                  <MetRow label="Bone Height"   val={`${result.height_mm} mm`}                                              dot={C.red}    col={C.red}    />
                  <MetRow label="Width @ 2mm"   val={result.widths_mm?.w2mm != null ? `${result.widths_mm.w2mm} mm` : "—"} dot={C.accent} col={C.accent} />
                  <MetRow label="Width @ 6mm"   val={result.widths_mm?.w6mm != null ? `${result.widths_mm.w6mm} mm` : "—"} dot={C.orange} col={C.orange} />
                  <MetRow label="Width @ 8mm"   val={result.widths_mm?.w8mm != null ? `${result.widths_mm.w8mm} mm` : "—"} dot={C.purple} col={C.purple} />
                  <MetRow label="Crest → Nerve" val={result.crest_to_nerve_mm != null ? `${result.crest_to_nerve_mm} mm` : "No nerve"} dot={C.yellow} col={C.yellow} />
                </>
              )}

              {mode === "recommend" && (
                <>
                  <MetRow label="Bone Height"   val={`${result.bone_height_mm} mm`}    dot={C.red}    col={C.red}    />
                  <MetRow label="Bone Width"    val={`${result.bone_width_mm} mm`}     dot={C.accent} col={C.accent} />
                  <MetRow label="Avail. Width"  val={`${result.implant_width_mm} mm`}  dot={C.green}  col={C.green}  />
                  <MetRow label="Avail. Height" val={`${result.implant_height_mm} mm`} dot={C.green}  col={C.green}  />
                </>
              )}
            </div>
          )}

          {mode === "recommend" && result?.recommendation && (
            <div className="fu" style={{
              background: "rgba(0,212,255,0.05)",
              border: `1px solid rgba(0,212,255,0.25)`,
              borderRadius: 12, padding: "18px",
            }}>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", color: C.accent, textTransform: "uppercase", marginBottom: 10 }}>
                Recommended Implant
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{result.recommendation.company}</div>
              <div style={{ fontSize: 13, color: C.muted }}>
                Ø <span style={{ color: C.accent, fontWeight: 600 }}>{result.recommendation.diameter} mm</span>
                &nbsp;×&nbsp;
                <span style={{ color: C.accent, fontWeight: 600 }}>{result.recommendation.length} mm</span> length
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}`, fontSize: 10, color: C.muted, lineHeight: 1.6 }}>
                3mm buccal clearance · 2mm nerve safety margin
              </div>
            </div>
          )}

          {mode === "recommend" && result && !result.recommendation && (
            <div style={{
              background: "rgba(255,87,87,0.07)",
              border: `1px solid rgba(255,87,87,0.3)`,
              borderRadius: 10, padding: "14px", color: C.red, fontSize: 12,
            }}>
              No suitable implant found for the measured bone dimensions.
            </div>
          )}

          {result && (
            <div style={{
              fontSize: 10, color: C.dim, lineHeight: 1.6,
              padding: "12px 14px", background: C.panel,
              border: `1px solid ${C.border}`, borderRadius: 8,
            }}>
              💡 Switch mode and re-run for different analysis output
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetRow({ label, val, dot, col }) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "11px 16px",
      borderBottom: `1px solid ${C.border}`,
      gap: 8,
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: C.muted }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0 }} />
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 700, color: col || C.text, fontVariantNumeric: "tabular-nums" }}>{val}</span>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <div style={S.root}>
      <nav style={S.nav}>
        <div style={S.logo} onClick={() => setPage("home")}>
          <div style={S.logoMark}>🦷</div>
          <div>
            <div style={S.logoText}>OsteoScan AI</div>
            <div style={S.logoSub}>Research Demo</div>
          </div>
        </div>
        <div style={S.navRight}>
          <span
            style={{ ...S.navLink, color: page === "home" ? C.text : C.muted }}
            onClick={() => setPage("home")}
            onMouseEnter={e => e.target.style.color = C.text}
            onMouseLeave={e => e.target.style.color = page === "home" ? C.text : C.muted}
          >
            Home
          </span>
          <a
            href="#about"
            style={S.navLink}
            onClick={() => setPage("home")}
            onMouseEnter={e => e.target.style.color = C.text}
            onMouseLeave={e => e.target.style.color = C.muted}
          >
            About
          </a>
          <button
            style={S.tryBtn}
            onClick={() => setPage("analyzer")}
            onMouseEnter={e => { e.target.style.opacity = "0.88"; }}
            onMouseLeave={e => { e.target.style.opacity = "1"; }}
          >
            Try Now →
          </button>
        </div>
      </nav>

      {page === "home"     && <HomePage     onTry={() => setPage("analyzer")} />}
      {page === "analyzer" && <AnalyzerPage onHome={() => setPage("home")} />}
    </div>
  );
}