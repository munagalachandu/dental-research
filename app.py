"""
Dental CBCT Analysis Backend
pip install flask flask-cors inference opencv-python numpy pillow
python app.py
"""

from flask import Flask, request, jsonify
import numpy as np
import cv2
import base64
import io
import traceback
from PIL import Image
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
# ── CORS — manually on every response (most reliable approach) ────────

@app.errorhandler(Exception)
def handle_exception(e):
    traceback.print_exc()
    resp = jsonify({"error": str(e)})
    resp.status_code = 500
    return resp



# ── Config ────────────────────────────────────────────────────────────
ROBOFLOW_API_KEY = "luFuyH88RAQnCmLZoWCp"
BONE_MODEL_ID    = "tooth2-5fhs5/2"   # ← update to your real model ID
NERVE_MODEL_ID   = "nervecanal/6"
BASE_PIXEL_SIZE  = 0.0825
DEFAULT_ZOOM     = 0.78

_bone_model  = None
_nerve_model = None

def get_bone_model():
    global _bone_model
    if _bone_model is None:
        from inference import get_model
        _bone_model = get_model(model_id=BONE_MODEL_ID, api_key=ROBOFLOW_API_KEY)
    return _bone_model

def get_nerve_model():
    global _nerve_model
    if _nerve_model is None:
        from inference import get_model
        _nerve_model = get_model(model_id=NERVE_MODEL_ID, api_key=ROBOFLOW_API_KEY)
    return _nerve_model

# ── Implant Catalog ───────────────────────────────────────────────────
IMPLANT_CATALOG = {
    "Straumann": [
        (3.5,8),(3.5,10),(3.5,12),(3.5,14),(3.5,16),(3.5,18),
        (3.75,6),(3.75,8),(3.75,10),(3.75,12),(3.75,14),(3.75,16),(3.75,18),
        (4.0,6),(4.0,8),(4.0,10),(4.0,12),(4.0,14),(4.0,16),(4.0,18),
        (4.5,6),(4.5,8),(4.5,10),(4.5,12),(4.5,14),(4.5,16),(4.5,18),
    ],
    "Nobel Biocare": [
        (3.0,10),(3.0,11.5),(3.0,13),(3.0,15),
        (3.5,8.5),(3.5,10),(3.5,11.5),(3.5,13),(3.5,15),(3.5,18),
        (4.3,8.5),(4.3,10),(4.3,11.5),(4.3,13),(4.3,15),(4.3,18),
        (5.0,8.5),(5.0,10),(5.0,11.5),(5.0,13),(5.0,15),(5.0,18),
        (5.5,7),(5.5,10),(5.5,11.5),(5.5,13),(5.5,15),
    ],
    "Noris": [
        (3.3,8),(3.3,10),(3.3,11.5),(3.3,13),(3.3,16),
        (3.75,6),(3.75,8),(3.75,10),(3.75,11.5),(3.75,13),(3.75,16),
        (4.2,6),(4.2,8),(4.2,10),(4.2,11.5),(4.2,13),(4.2,16),
        (5.0,6),(5.0,8),(5.0,10),(5.0,11.5),(5.0,13),(5.0,16),
        (6.0,6),(6.0,8),(6.0,10),(6.0,11.5),(6.0,13),(6.0,16),
    ],
    "Osstem": [
        (3.0,10),(3.0,11.5),(3.0,13),(3.0,15),
        (3.5,8.5),(3.5,10),(3.5,11.5),(3.5,13),(3.5,15),(3.5,18),
        (4.3,8.5),(4.3,10),(4.3,11.5),(4.3,13),(4.3,15),(4.3,18),
        (5.0,8.5),(5.0,10),(5.0,11.5),(5.0,13),(5.0,15),(5.0,18),
        (5.5,7),(5.5,10),(5.5,11.5),(5.5,13),(5.5,15),
    ],
}

# ── Helpers ───────────────────────────────────────────────────────────

def decode_image(file_storage):
    data = file_storage.read()
    img  = Image.open(io.BytesIO(data)).convert("RGB")
    return np.array(img)

def encode_image(img_rgb):
    bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
    _, buf = cv2.imencode(".jpg", bgr, [cv2.IMWRITE_JPEG_QUALITY, 90])
    return "data:image/jpeg;base64," + base64.b64encode(buf).decode()

def run_yolo(model, img_rgb, confidence=0.11):
    h, w = img_rgb.shape[:2]
    mask = np.zeros((h, w), dtype=np.uint8)
    try:
        pil = Image.fromarray(img_rgb)
        res = model.infer(pil, confidence=confidence, overlap=0.5)[0]
        for pred in res.predictions:
            if pred.points:
                pts = np.array([[int(p.x), int(p.y)] for p in pred.points], dtype=np.int32)
                cv2.fillPoly(mask, [pts], 1)
        print(f"  YOLO: {len(res.predictions)} predictions")
    except Exception as e:
        print(f"  YOLO error (continuing): {e}")
    return mask

def polygon_from_mask(mask):
    contours, _ = cv2.findContours(mask.astype(np.uint8),
                                   cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None
    return max(contours, key=cv2.contourArea).reshape(-1, 2)

def calc_height(polygon):
    pts    = polygon.astype(np.float32)
    center = np.mean(pts, axis=0)
    pc     = pts - center
    cov    = np.cov(pc.T)
    eigvals, eigvecs = np.linalg.eig(cov)
    axis   = eigvecs[:, np.argmax(eigvals)].real
    projs  = pc @ axis
    p1     = center + axis * float(np.min(projs))
    p2     = center + axis * float(np.max(projs))
    top, bottom = (p1, p2) if p1[1] < p2[1] else (p2, p1)
    return float(np.linalg.norm(bottom - top)), top, bottom

def calc_width_at(mask, top, bottom, mm_to_px, offset_mm):
    h_vec  = (bottom - top).astype(float)
    h_unit = h_vec / np.linalg.norm(h_vec)
    point  = top + h_unit * (offset_mm * mm_to_px)
    cx, cy = int(round(point[0])), int(round(point[1]))
    perp   = np.array([-h_unit[1], h_unit[0]])
    pts    = []
    for t in np.linspace(-600, 600, 2400):
        x = int(round(cx + perp[0] * t))
        y = int(round(cy + perp[1] * t))
        if 0 <= x < mask.shape[1] and 0 <= y < mask.shape[0] and mask[y, x] == 1:
            pts.append((x, y))
    if len(pts) < 2:
        return 0.0, None, None
    lp = np.array(pts[0], dtype=float)
    rp = np.array(pts[-1], dtype=float)
    return float(np.linalg.norm(rp - lp)), lp, rp

def find_best_implant(imp_w, imp_h):
    best, best_err = None, float("inf")
    for company, sizes in IMPLANT_CATALOG.items():
        for dia, length in sizes:
            if dia <= imp_w and length <= imp_h:
                err = abs(dia - imp_w) + abs(length - imp_h)
                if err < best_err:
                    best_err = err
                    best = {"company": company, "diameter": dia, "length": length}
    return best

COLORS = {
    "bone":   (72, 199, 116),
    "nerve":  (255, 214, 10),
    "height": (255, 87, 87),
    "w2":     (87, 181, 255),
    "w6":     (255, 160, 87),
    "w8":     (200, 87, 255),
}

def draw_label(img, text, pt, color):
    x, y = int(pt[0]), int(pt[1])
    (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
    cv2.rectangle(img, (x-2, y-th-4), (x+tw+2, y+2), (0,0,0), -1)
    cv2.putText(img, text, (x, y), cv2.FONT_HERSHEY_SIMPLEX, 0.45, color, 1, cv2.LINE_AA)

# ── Endpoints ─────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/api/analyze", methods=["POST", "OPTIONS"])
def analyze():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image in request"}), 400

        mode     = request.form.get("mode", "segment")
        zoom     = float(request.form.get("zoom", DEFAULT_ZOOM) or DEFAULT_ZOOM)
        px_to_mm = BASE_PIXEL_SIZE * zoom
        mm_to_px = 1.0 / px_to_mm

        print(f"\n→ mode={mode}  zoom={zoom}  px_to_mm={px_to_mm:.4f}")

        img_rgb = decode_image(request.files["image"])
        overlay = img_rgb.copy()
        print(f"  image shape: {img_rgb.shape}")

        bone_mask  = run_yolo(get_bone_model(),  img_rgb, confidence=0.15)
        nerve_mask = run_yolo(get_nerve_model(), img_rgb, confidence=0.11)

        bone_polygon = polygon_from_mask(bone_mask)
        print(f"  bone polygon: {'found' if bone_polygon is not None else 'NOT FOUND'}")
        print(f"  nerve pixels: {int(np.sum(nerve_mask))}")

        nerve_contours, _ = cv2.findContours(nerve_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if nerve_contours:
            lowest = max(nerve_contours, key=lambda c: np.mean(c[:, 0, 1]))
            cv2.polylines(overlay, [lowest], True, COLORS["nerve"], 2)

        result = {"mode": mode}

        if mode == "segment":
            if bone_polygon is not None:
                fill = overlay.copy()
                cv2.fillPoly(fill, [bone_polygon], COLORS["bone"])
                cv2.addWeighted(fill, 0.25, overlay, 0.75, 0, overlay)
                cv2.polylines(overlay, [bone_polygon], True, COLORS["bone"], 2)
            result["detected_bone"]  = bone_polygon is not None
            result["detected_nerve"] = int(np.sum(nerve_mask)) > 0
            result["image"] = encode_image(overlay)

        elif mode == "measure":
            if bone_polygon is None:
                return jsonify({"error": "Bone not detected in this image"}), 400
            h_px, top, bottom = calc_height(bone_polygon)
            height_mm = h_px * px_to_mm
            widths = {}
            for off, col_key in [(2,"w2"), (6,"w6"), (8,"w8")]:
                w_px, lp, rp = calc_width_at(bone_mask, top, bottom, mm_to_px, off)
                wmm = round(w_px * px_to_mm, 2)
                widths[f"w{off}mm"] = wmm
                if lp is not None:
                    cv2.line(overlay, tuple(lp.astype(int)), tuple(rp.astype(int)), COLORS[col_key], 2)
                    draw_label(overlay, f"W@{off}mm={wmm}mm", (lp[0], lp[1]-8), COLORS[col_key])
            ys, _ = np.where(nerve_mask == 1)
            crest_to_nerve = None
            if len(ys) > 0:
                ntop_y = float(np.min(ys))
                crest_to_nerve = round(abs(ntop_y - top[1]) * px_to_mm, 2)
                nv_pt = np.array([top[0], ntop_y])
                cv2.line(overlay, tuple(top.astype(int)), tuple(nv_pt.astype(int)), COLORS["nerve"], 2)
                draw_label(overlay, f"C→N={crest_to_nerve}mm", (top[0]+5, (top[1]+ntop_y)/2), COLORS["nerve"])
            cv2.polylines(overlay, [bone_polygon], True, COLORS["bone"], 2)
            cv2.line(overlay, tuple(top.astype(int)), tuple(bottom.astype(int)), COLORS["height"], 2)
            draw_label(overlay, f"H={height_mm:.2f}mm", (top[0]+5, top[1]+16), COLORS["height"])
            result.update({
                "image": encode_image(overlay),
                "height_mm": round(height_mm, 2),
                "widths_mm": widths,
                "crest_to_nerve_mm": crest_to_nerve,
            })

        elif mode == "recommend":
            if bone_polygon is None:
                return jsonify({"error": "Bone not detected in this image"}), 400
            h_px, top, bottom = calc_height(bone_polygon)
            height_mm = h_px * px_to_mm
            w2_px, lp2, rp2 = calc_width_at(bone_mask, top, bottom, mm_to_px, 2)
            width_mm  = w2_px * px_to_mm
            imp_width = round(max(width_mm - 3, 0), 2)
            ys, _ = np.where(nerve_mask == 1)
            if len(ys) > 0:
                ntop_y     = float(np.min(ys))
                imp_height = round(max(abs(ntop_y - top[1]) * px_to_mm - 2, 0), 2)
            else:
                imp_height = round(height_mm, 2)
            recommendation = find_best_implant(imp_width, imp_height)
            cv2.polylines(overlay, [bone_polygon], True, COLORS["bone"], 2)
            if lp2 is not None:
                cv2.line(overlay, tuple(lp2.astype(int)), tuple(rp2.astype(int)), COLORS["w2"], 2)
                draw_label(overlay, f"W={width_mm:.1f}mm", lp2, COLORS["w2"])
            cv2.line(overlay, tuple(top.astype(int)), tuple(bottom.astype(int)), COLORS["height"], 2)
            draw_label(overlay, f"H={height_mm:.1f}mm", (top[0]+5, top[1]+16), COLORS["height"])
            result.update({
                "image": encode_image(overlay),
                "bone_height_mm":    round(height_mm, 2),
                "bone_width_mm":     round(width_mm, 2),
                "implant_width_mm":  imp_width,
                "implant_height_mm": imp_height,
                "recommendation":    recommendation,
            })

        else:
            return jsonify({"error": f"Unknown mode: {mode}"}), 400

        print("  ✓ done")
        return jsonify(result)

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
