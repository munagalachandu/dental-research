"""
Dental CBCT Analysis Backend
pip install flask flask-cors inference opencv-python numpy pillow
python app.py
"""

import os
os.environ["ROBOFLOW_API_KEY"] = "luFuyH88RAQnCmLZoWCp"

from flask import Flask, request, jsonify
import numpy as np
import cv2
import base64
import io
import traceback
from PIL import Image
from inference import get_model
from werkzeug.exceptions import HTTPException
from concurrent.futures import ThreadPoolExecutor

from analysis_utils import (
    lowest_contour_mask,
    calc_ogheight,
    calc_ogwidth,
    load_implant_catalog,
    recommend_implant,
)

app = Flask(__name__)
implant_catalog = load_implant_catalog()

# ─────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────
@app.after_request
def cors(response):
    response.headers["Access-Control-Allow-Origin"]  = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

@app.errorhandler(Exception)
def handle_exception(e):
    if isinstance(e, HTTPException):
        return jsonify({"error": e.description}), e.code
    traceback.print_exc()
    return jsonify({"error": str(e)}), 500

@app.route("/")
def home():
    return "CBCT API Running"

@app.route("/favicon.ico")
def favicon():
    return "", 204

@app.route("/api/<path:dummy>", methods=["OPTIONS"])
def preflight(dummy):
    return "", 204

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
BONE_MODEL_ID   = "tooth2-5fhs5/2"
NERVE_MODEL_ID  = "nervecanal/6"
BASE_PIXEL_SIZE = 0.0825
DEFAULT_ZOOM    = 0.78

_bone_model  = None
_nerve_model = None

def get_bone_model():
    global _bone_model
    if _bone_model is None:
        _bone_model = get_model(model_id=BONE_MODEL_ID)
    return _bone_model

def get_nerve_model():
    global _nerve_model
    if _nerve_model is None:
        _nerve_model = get_model(model_id=NERVE_MODEL_ID)
    return _nerve_model

# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────
def decode_image(file_storage):
    data = file_storage.read()
    img  = Image.open(io.BytesIO(data)).convert("RGB")
    return np.array(img)

def encode_image(img_rgb):
    bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
    _, buf = cv2.imencode(".jpg", bgr, [cv2.IMWRITE_JPEG_QUALITY, 92])
    return "data:image/jpeg;base64," + base64.b64encode(buf).decode()

def run_yolo_cloud(model, img_rgb, confidence=0.11):
    h, w = img_rgb.shape[:2]
    mask = np.zeros((h, w), dtype=np.uint8)
    try:
        pil = Image.fromarray(img_rgb)
        res = model.infer(pil, confidence=confidence, overlap=0.5)[0]
        for pred in res.predictions:
            if pred.points:
                pts = np.array([[int(p.x), int(p.y)] for p in pred.points], dtype=np.int32)
                cv2.fillPoly(mask, [pts], 1)
    except Exception as e:
        print("YOLO error:", e)
    return mask

def draw_label(img, text, pt, color, font_scale=0.45, thickness=1):
    """Draw text with a dark background for readability."""
    pt = (int(pt[0]), int(pt[1]))
    (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)
    cv2.rectangle(img, (pt[0] - 2, pt[1] - th - 4), (pt[0] + tw + 2, pt[1] + 2), (0, 0, 0), -1)
    cv2.putText(img, text, pt, cv2.FONT_HERSHEY_SIMPLEX, font_scale, color, thickness, cv2.LINE_AA)

def midpoint(a, b):
    return ((a[0] + b[0]) // 2, (a[1] + b[1]) // 2)

# ─────────────────────────────────────────────
# ANALYZE
# ─────────────────────────────────────────────
@app.route("/api/analyze", methods=["POST"])
def analyze():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image in request"}), 400

        mode = request.form.get("mode", "segment")
        zoom = float(request.form.get("zoom", DEFAULT_ZOOM) or DEFAULT_ZOOM)

        PX_TO_MM = BASE_PIXEL_SIZE * zoom
        MM_TO_PX = 1.0 / PX_TO_MM

        img_rgb = decode_image(request.files["image"])
        overlay = img_rgb.copy()

        print(f"mode={mode}  zoom={zoom}  PX_TO_MM={PX_TO_MM:.5f}")

        with ThreadPoolExecutor() as executor:
            bone_future  = executor.submit(run_yolo_cloud, get_bone_model(),  img_rgb, 0.15)
            nerve_future = executor.submit(run_yolo_cloud, get_nerve_model(), img_rgb, 0.11)
            bone_mask_full = bone_future.result()
            nerve_mask     = nerve_future.result()

        bone_polygon, bone_mask = lowest_contour_mask(bone_mask_full)

        if bone_polygon is None:
            return jsonify({"error": "Bone not detected"}), 400

        nerve_detected = int(np.sum(nerve_mask)) > 0

        # ═══════════════════════════════════════
        # SEGMENT MODE
        # Shows: bone outline (green) + nerve outline (yellow)
        # ═══════════════════════════════════════
        if mode == "segment":
            # Bone outline
            cv2.polylines(overlay, [bone_polygon], True, (0, 255, 0), 2)

            # Nerve lowest contour
            nerve_contours, _ = cv2.findContours(
                nerve_mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )
            if nerve_contours:
                lowest_nerve = max(nerve_contours, key=lambda c: np.mean(c[:, :, 1]))
                cv2.polylines(overlay, [lowest_nerve], True, (255, 220, 0), 2)

            # Legend
            draw_label(overlay, "Bone",       (10, 20), (0, 255, 0))
            draw_label(overlay, "Nerve Canal",(10, 42), (255, 220, 0))

            return jsonify({
                "mode":           mode,
                "detected_bone":  True,
                "detected_nerve": nerve_detected,
                "image":          encode_image(overlay),
            })

        # ═══════════════════════════════════════
        # MEASURE MODE
        # Shows:
        #   RED   — full PCA height line (top → bottom)
        #   CYAN  — width at 2 mm
        #   GREEN — width at 6 mm
        #   ORANGE— width at 8 mm
        #   YELLOW dashed outline — bone contour
        # ═══════════════════════════════════════
        if mode == "measure":
            height_px, top, bottom = calc_ogheight(bone_polygon)

            w2_px, l2, r2 = calc_ogwidth(bone_mask, top, bottom, MM_TO_PX, 2)
            w6_px, l6, r6 = calc_ogwidth(bone_mask, top, bottom, MM_TO_PX, 6)
            w8_px, l8, r8 = calc_ogwidth(bone_mask, top, bottom, MM_TO_PX, 8)

            # Bone outline (faint yellow)
            cv2.polylines(overlay, [bone_polygon.astype(int)], True, (200, 200, 0), 1)

            # Full height line — RED
            cv2.line(overlay, tuple(top.astype(int)), tuple(bottom.astype(int)), (255, 60, 60), 2)
            draw_label(overlay,
                       f"H={height_px*PX_TO_MM:.1f}mm",
                       (int(top[0]) + 6, int(top[1]) + 4),
                       (255, 60, 60))

            # Width @ 2mm — CYAN
            if l2 is not None and r2 is not None:
                cv2.line(overlay, tuple(l2.astype(int)), tuple(r2.astype(int)), (0, 220, 255), 2)
                mp = midpoint(l2.astype(int), r2.astype(int))
                draw_label(overlay, f"W2={w2_px*PX_TO_MM:.1f}mm", (mp[0] - 30, mp[1] - 6), (0, 220, 255))

            # Width @ 6mm — GREEN
            if l6 is not None and r6 is not None:
                cv2.line(overlay, tuple(l6.astype(int)), tuple(r6.astype(int)), (0, 230, 100), 2)
                mp = midpoint(l6.astype(int), r6.astype(int))
                draw_label(overlay, f"W6={w6_px*PX_TO_MM:.1f}mm", (mp[0] - 30, mp[1] - 6), (0, 230, 100))

            # Width @ 8mm — ORANGE
            if l8 is not None and r8 is not None:
                cv2.line(overlay, tuple(l8.astype(int)), tuple(r8.astype(int)), (255, 160, 30), 2)
                mp = midpoint(l8.astype(int), r8.astype(int))
                draw_label(overlay, f"W8={w8_px*PX_TO_MM:.1f}mm", (mp[0] - 30, mp[1] - 6), (255, 160, 30))

            return jsonify({
                "mode":      mode,
                "image":     encode_image(overlay),
                "height_mm": round(float(height_px * PX_TO_MM), 2),
                "widths_mm": {
                    "w2mm": round(float(w2_px * PX_TO_MM), 2),
                    "w6mm": round(float(w6_px * PX_TO_MM), 2),
                    "w8mm": round(float(w8_px * PX_TO_MM), 2),
                },
                "crest_to_nerve_mm": None,
            })

        # ═══════════════════════════════════════
        # RECOMMEND MODE
        # Shows:
        #   YELLOW outline — bone contour
        #   YELLOW dashed  — nerve canal outline
        #   MAGENTA line   — implant height (crest → 2mm above nerve)
        #   CYAN line      — implant width (bone width − 3mm)
        # ═══════════════════════════════════════
        if mode == "recommend":
            height_px, top, bottom = calc_ogheight(bone_polygon)
            width_px, l2, r2 = calc_ogwidth(bone_mask, top, bottom, MM_TO_PX, 2)

            section_height_mm = float(height_px * PX_TO_MM)
            section_width_mm  = float(width_px  * PX_TO_MM)

            implant_w, implant_h, best = recommend_implant(
                section_height_mm,
                section_width_mm,
                nerve_mask,
                top,
                bottom,
                PX_TO_MM,
                MM_TO_PX,
                implant_catalog,
            )

            # Bone outline (faint yellow)
            cv2.polylines(overlay, [bone_polygon.astype(int)], True, (200, 200, 0), 1)

            # Nerve canal outline (yellow)
            nerve_contours, _ = cv2.findContours(
                nerve_mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )
            if nerve_contours:
                lowest_nerve = max(nerve_contours, key=lambda c: np.mean(c[:, :, 1]))
                cv2.polylines(overlay, [lowest_nerve], True, (255, 220, 0), 2)

            # ── Implant HEIGHT line: crest → 2mm above nerve ──
            # Recompute the safe endpoint (same logic as recommend_implant)
            ys, xs = np.where(nerve_mask == 1)
            if len(ys) > 0:
                height_vec  = bottom - top
                height_unit = height_vec / np.linalg.norm(height_vec)
                nerve_points  = np.column_stack((xs, ys))
                projections   = (nerve_points - top) @ height_unit
                positive_proj = projections[projections > 0]
                if len(positive_proj) > 0:
                    nerve_proj    = np.min(positive_proj)
                    safe_proj     = max(nerve_proj - (2 * MM_TO_PX), 0)
                    implant_end   = top + height_unit * safe_proj
                else:
                    implant_end = bottom
            else:
                implant_end = bottom

            # Draw MAGENTA implant height line
            cv2.line(overlay,
                     tuple(top.astype(int)),
                     tuple(implant_end.astype(int)),
                     (255, 0, 220), 3)
            draw_label(overlay,
                       f"Impl H={implant_h:.1f}mm",
                       (int(top[0]) + 6, int(top[1]) + 4),
                       (255, 0, 220))

            # ── Implant WIDTH line: centred at 2mm depth, width = bone_w - 3mm ──
            if l2 is not None and r2 is not None:
                # Centre of the 2mm width scan
                cx = (l2[0] + r2[0]) / 2
                cy = (l2[1] + r2[1]) / 2

                # Width direction (perpendicular to height axis)
                height_vec  = bottom - top
                height_unit = height_vec / np.linalg.norm(height_vec)
                perp = np.array([-height_unit[1], height_unit[0]])

                half_w = (implant_w / 2) * MM_TO_PX
                iw_l = np.array([cx - perp[0] * half_w, cy - perp[1] * half_w])
                iw_r = np.array([cx + perp[0] * half_w, cy + perp[1] * half_w])

                # Draw CYAN implant width line
                cv2.line(overlay,
                         tuple(iw_l.astype(int)),
                         tuple(iw_r.astype(int)),
                         (0, 220, 255), 3)
                mp = midpoint(iw_l.astype(int), iw_r.astype(int))
                draw_label(overlay,
                           f"Impl W={implant_w:.1f}mm",
                           (mp[0] - 36, mp[1] - 6),
                           (0, 220, 255))

            # Legend
            draw_label(overlay, "Implant Height", (10, 20),  (255, 0, 220))
            draw_label(overlay, "Implant Width",  (10, 42),  (0, 220, 255))
            draw_label(overlay, "Nerve Canal",    (10, 64),  (255, 220, 0))

            recommendation = None
            if best:
                recommendation = {"company": best[0], "diameter": best[1], "length": best[2]}

            return jsonify({
                "mode":              mode,
                "image":             encode_image(overlay),
                "bone_height_mm":    round(section_height_mm, 2),
                "bone_width_mm":     round(section_width_mm,  2),
                "implant_width_mm":  round(implant_w, 2),
                "implant_height_mm": round(implant_h, 2),
                "recommendation":    recommendation,
            })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("Starting Flask...")

    port = int(os.environ.get("PORT", 5000))  # Render gives PORT
    app.run(host="0.0.0.0", port=port, debug=False)
