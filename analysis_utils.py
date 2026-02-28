import numpy as np
import cv2

# ---------------------------------------------------
# LOWEST CONTOUR MASK
# Finds the lowest contour (highest mean Y) and
# returns BOTH the polygon and a clean single-contour
# mask. Use this mask for all width calculations.
# ---------------------------------------------------
def lowest_contour_mask(full_mask):
    """
    Returns (polygon, clean_mask) for the lowest contour only.
    polygon   — (N,2) array of points for PCA height
    clean_mask — binary mask filled from that contour only
    """
    contours, _ = cv2.findContours(
        full_mask.astype(np.uint8),
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )
    if not contours:
        return None, None

    # Pick the lowest contour (deepest in image = highest mean Y)
    lowest = max(contours, key=lambda c: np.mean(c[:, :, 1]))

    polygon = lowest.reshape(-1, 2)

    # Build a clean mask containing ONLY this contour
    clean_mask = np.zeros_like(full_mask)
    cv2.fillPoly(clean_mask, [lowest], 1)

    return polygon, clean_mask


# ---------------------------------------------------
# PCA HEIGHT
# ---------------------------------------------------
def calc_ogheight(polygon):
    pts = polygon.astype(np.float32)
    center = np.mean(pts, axis=0)
    pts_centered = pts - center

    cov = np.cov(pts_centered.T)
    eigvals, eigvecs = np.linalg.eig(cov)
    axis = eigvecs[:, np.argmax(eigvals)]

    projections = pts_centered @ axis
    min_proj, max_proj = np.min(projections), np.max(projections)

    p1 = center + axis * min_proj
    p2 = center + axis * max_proj

    # Ensure crest is the "top" (lower Y = higher in image)
    if p1[1] < p2[1]:
        top, bottom = p1, p2
    else:
        top, bottom = p2, p1

    height_px = np.linalg.norm(bottom - top)
    return height_px, top, bottom


# ---------------------------------------------------
# WIDTH AT OFFSET
# Pass the clean single-contour mask here, NOT the
# full bone mask, so the scan only hits that segment.
# ---------------------------------------------------
def calc_ogwidth(mask, top, bottom, mm_to_px, offset_mm=2):
    h_vec = bottom - top
    h_unit = h_vec / np.linalg.norm(h_vec)

    offset_px = offset_mm * mm_to_px
    point_on_height = top + h_unit * offset_px
    cx, cy = int(point_on_height[0]), int(point_on_height[1])

    p_vec = np.array([-h_unit[1], h_unit[0]])

    pts = []
    for t in np.linspace(-500, 500, 2000):
        x = int(cx + p_vec[0] * t)
        y = int(cy + p_vec[1] * t)
        if 0 <= x < mask.shape[1] and 0 <= y < mask.shape[0]:
            if mask[y, x] == 1:
                pts.append((x, y))

    if len(pts) < 2:
        return 0, None, None

    left_pt  = np.array(pts[0])
    right_pt = np.array(pts[-1])
    width_px = np.linalg.norm(right_pt - left_pt)

    return width_px, left_pt, right_pt


# ---------------------------------------------------
# IMPLANT CATALOG
# ---------------------------------------------------
def load_implant_catalog():
    return {

        "Straumann": [
            (3.5, 8),  (3.5, 10), (3.5, 12), (3.5, 14), (3.5, 16), (3.5, 18),
            (3.75, 6), (3.75, 8), (3.75, 10),(3.75, 12),(3.75, 14),(3.75, 16),(3.75, 18),
            (4.0, 6),  (4.0, 8),  (4.0, 10), (4.0, 12), (4.0, 14), (4.0, 16), (4.0, 18),
            (4.5, 6),  (4.5, 8),  (4.5, 10), (4.5, 12), (4.5, 14), (4.5, 16), (4.5, 18),
        ],

        "Nobel Biocare": [
            (3.0, 10), (3.0, 11.5),(3.0, 13), (3.0, 15),
            (3.5, 8.5),(3.5, 10), (3.5, 11.5),(3.5, 13), (3.5, 15), (3.5, 18),
            (4.3, 8.5),(4.3, 10), (4.3, 11.5),(4.3, 13), (4.3, 15), (4.3, 18),
            (5.0, 8.5),(5.0, 10), (5.0, 11.5),(5.0, 13), (5.0, 15), (5.0, 18),
            (5.5, 7),  (5.5, 10), (5.5, 11.5),(5.5, 13), (5.5, 15),
        ],

        "Noris": [
            (3.3, 8),  (3.3, 10), (3.3, 11.5),(3.3, 13), (3.3, 16),
            (3.75, 6), (3.75, 8), (3.75, 10), (3.75, 11.5),(3.75, 13),(3.75, 16),
            (4.2, 6),  (4.2, 8),  (4.2, 10),  (4.2, 11.5),(4.2, 13), (4.2, 16),
            (5.0, 6),  (5.0, 8),  (5.0, 10),  (5.0, 11.5),(5.0, 13), (5.0, 16),
            (6.0, 6),  (6.0, 8),  (6.0, 10),  (6.0, 11.5),(6.0, 13), (6.0, 16),
        ],

        "Osstem": [
            (3.0, 10), (3.0, 11.5),(3.0, 13), (3.0, 15),
            (3.5, 8.5),(3.5, 10), (3.5, 11.5),(3.5, 13), (3.5, 15), (3.5, 18),
            (4.3, 8.5),(4.3, 10), (4.3, 11.5),(4.3, 13), (4.3, 15), (4.3, 18),
            (5.0, 8.5),(5.0, 10), (5.0, 11.5),(5.0, 13), (5.0, 15), (5.0, 18),
            (5.5, 7),  (5.5, 10), (5.5, 11.5),(5.5, 13), (5.5, 15),
        ],
    }


# ---------------------------------------------------
# IMPLANT RECOMMENDATION
# ---------------------------------------------------
def recommend_implant(section_height_mm,
                      section_width_mm,
                      nerve_mask,
                      top,
                      bottom,
                      PX_TO_MM,
                      MM_TO_PX,
                      implant_catalog):

    implant_width_mm = max(section_width_mm - 3, 0)

    ys, xs = np.where(nerve_mask == 1)

    if len(ys) > 0:
        height_vec  = bottom - top
        height_unit = height_vec / np.linalg.norm(height_vec)

        nerve_points  = np.column_stack((xs, ys))
        projections   = (nerve_points - top) @ height_unit
        positive_proj = projections[projections > 0]

        if len(positive_proj) > 0:
            nerve_proj        = np.min(positive_proj)
            safe_proj         = nerve_proj - (2 * MM_TO_PX)
            implant_height_px = max(safe_proj, 0)
            implant_height_mm = implant_height_px * PX_TO_MM
        else:
            implant_height_mm = section_height_mm
    else:
        implant_height_mm = section_height_mm

    implant_height_mm = max(implant_height_mm, 0)

    best_match = None
    best_error = float("inf")

    for company, implants in implant_catalog.items():
        for dia, length in implants:
            if dia <= implant_width_mm and length <= implant_height_mm:
                error = abs(dia - implant_width_mm) + abs(length - implant_height_mm)
                if error < best_error:
                    best_error = error
                    best_match = (company, dia, length)

    return implant_width_mm, implant_height_mm, best_match
