import os
import cv2
import numpy as np
from PIL import Image

def repair_frame(frame, frame_idx):
    H, W, _ = frame.shape
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    out = frame.copy()
    
    # Floor limit: when bar is off the floor (frame_idx > 35), ignore platform lines below y=820
    y_floor_limit = 820 if frame_idx > 35 else 860
    left_ys = np.where(gray[:y_floor_limit, 158] > 35)[0]
    right_ys = np.where((gray[:y_floor_limit, 560] > 35) | (gray[:y_floor_limit, 561] > 35))[0]
    
    if len(left_ys) == 0 and len(right_ys) == 0:
        return out
        
    yl = float(np.mean(left_ys)) if len(left_ys) else (np.mean(right_ys) if len(right_ys) else 500.0)
    yr = float(np.mean(right_ys)) if len(right_ys) else yl
    if len(left_ys) == 0:
        yl = yr
    
    m = (yr - yl) / (561.0 - 158.0)
    angle = np.arctan(m)
    angle_deg = np.degrees(angle)
    u = np.array([np.cos(angle), np.sin(angle)])
    v = np.array([-np.sin(angle), np.cos(angle)])
    
    span_l = (left_ys.max() - left_ys.min()) if len(left_ys) else 0
    span_r = (right_ys.max() - right_ys.min()) if len(right_ys) else 0
    r_half = 6.0
    
    # 1. Right side repair
    if len(right_ys) > 0:
        p_cut_r = np.array([561.0, yr])
        if span_r > 50:
            # Plate disk outer rim cut off
            p_disk_r = p_cut_r - 10.0 * u
            overlay_r = np.zeros_like(out)
            semi_h = int(round(span_r * 0.52))
            cv2.ellipse(overlay_r, (int(round(p_disk_r[0])), int(round(p_disk_r[1]))),
                        (14, semi_h), angle_deg, -90, 90, (45, 45, 45), -1, lineType=cv2.LINE_AA)
            cv2.ellipse(overlay_r, (int(round(p_disk_r[0])), int(round(p_disk_r[1]))),
                        (14, semi_h), angle_deg, -90, 90, (230, 230, 230), 2, lineType=cv2.LINE_AA)
            mask_r = np.zeros((H, W), dtype=bool)
            mask_r[:, 561:] = True
            out[mask_r & (overlay_r[:, :, 0] > 0)] = overlay_r[mask_r & (overlay_r[:, :, 0] > 0)]
            
            p_sleeve_start = p_cut_r + 4.0 * u
            sleeve_len = 34.0
        else:
            p_sleeve_start = p_cut_r
            sleeve_len = 12.0
            
        p_sleeve_end = p_sleeve_start + sleeve_len * u
        poly_r = np.array([p_sleeve_start - r_half*v, p_sleeve_end - r_half*v, p_sleeve_end + r_half*v, p_sleeve_start + r_half*v], dtype=np.int32)
        cv2.fillPoly(out, [poly_r], (45, 45, 45), lineType=cv2.LINE_AA)
        cv2.line(out, (int(round((p_sleeve_start - r_half*v)[0])), int(round((p_sleeve_start - r_half*v)[1]))),
                      (int(round((p_sleeve_end - r_half*v)[0])), int(round((p_sleeve_end - r_half*v)[1]))), (225, 225, 225), 2, lineType=cv2.LINE_AA)
        cv2.line(out, (int(round((p_sleeve_start + r_half*v)[0])), int(round((p_sleeve_start + r_half*v)[1]))),
                      (int(round((p_sleeve_end + r_half*v)[0])), int(round((p_sleeve_end + r_half*v)[1]))), (225, 225, 225), 2, lineType=cv2.LINE_AA)
        cv2.line(out, (int(round(p_sleeve_start[0])), int(round(p_sleeve_start[1]))),
                      (int(round(p_sleeve_end[0])), int(round(p_sleeve_end[1]))), (120, 120, 120), 1, lineType=cv2.LINE_AA)
        cv2.ellipse(out, (int(round(p_sleeve_end[0])), int(round(p_sleeve_end[1]))),
                    (5, int(r_half)), angle_deg, -90, 90, (45, 45, 45), -1, lineType=cv2.LINE_AA)
        cv2.ellipse(out, (int(round(p_sleeve_end[0])), int(round(p_sleeve_end[1]))),
                    (5, int(r_half)), angle_deg, -90, 90, (225, 225, 225), 2, lineType=cv2.LINE_AA)
                    
        if span_r > 50:
            cv2.ellipse(out, (int(round(p_sleeve_start[0])), int(round(p_sleeve_start[1]))),
                        (3, 11), angle_deg, 0, 360, (50, 50, 50), -1, lineType=cv2.LINE_AA)
            cv2.ellipse(out, (int(round(p_sleeve_start[0])), int(round(p_sleeve_start[1]))),
                        (3, 11), angle_deg, 0, 360, (230, 230, 230), 2, lineType=cv2.LINE_AA)

    # 2. Left side repair
    if len(left_ys) > 0:
        p_cut_l = np.array([158.0, yl])
        if span_l > 50:
            p_disk_l = p_cut_l + 10.0 * u
            overlay_l = np.zeros_like(out)
            semi_h = int(round(span_l * 0.52))
            cv2.ellipse(overlay_l, (int(round(p_disk_l[0])), int(round(p_disk_l[1]))),
                        (14, semi_h), angle_deg, 90, 270, (45, 45, 45), -1, lineType=cv2.LINE_AA)
            cv2.ellipse(overlay_l, (int(round(p_disk_l[0])), int(round(p_disk_l[1]))),
                        (14, semi_h), angle_deg, 90, 270, (230, 230, 230), 2, lineType=cv2.LINE_AA)
            mask_l = np.zeros((H, W), dtype=bool)
            mask_l[:, :158] = True
            out[mask_l & (overlay_l[:, :, 0] > 0)] = overlay_l[mask_l & (overlay_l[:, :, 0] > 0)]
            p_sleeve_start_l = p_cut_l - 4.0 * u
            sleeve_len_l = 34.0
        else:
            p_sleeve_start_l = p_cut_l
            sleeve_len_l = 12.0
            
        p_sleeve_end_l = p_sleeve_start_l - sleeve_len_l * u
        poly_l = np.array([p_sleeve_start_l - r_half*v, p_sleeve_end_l - r_half*v, p_sleeve_end_l + r_half*v, p_sleeve_start_l + r_half*v], dtype=np.int32)
        cv2.fillPoly(out, [poly_l], (45, 45, 45), lineType=cv2.LINE_AA)
        cv2.line(out, (int(round((p_sleeve_start_l - r_half*v)[0])), int(round((p_sleeve_start_l - r_half*v)[1]))),
                      (int(round((p_sleeve_end_l - r_half*v)[0])), int(round((p_sleeve_end_l - r_half*v)[1]))), (225, 225, 225), 2, lineType=cv2.LINE_AA)
        cv2.line(out, (int(round((p_sleeve_start_l + r_half*v)[0])), int(round((p_sleeve_start_l + r_half*v)[1]))),
                      (int(round((p_sleeve_end_l + r_half*v)[0])), int(round((p_sleeve_end_l + r_half*v)[1]))), (225, 225, 225), 2, lineType=cv2.LINE_AA)
        cv2.line(out, (int(round(p_sleeve_start_l[0])), int(round(p_sleeve_start_l[1]))),
                      (int(round(p_sleeve_end_l[0])), int(round(p_sleeve_end_l[1]))), (120, 120, 120), 1, lineType=cv2.LINE_AA)
        cv2.ellipse(out, (int(round(p_sleeve_end_l[0])), int(round(p_sleeve_end_l[1]))),
                    (5, int(r_half)), angle_deg, 90, 270, (45, 45, 45), -1, lineType=cv2.LINE_AA)
        cv2.ellipse(out, (int(round(p_sleeve_end_l[0])), int(round(p_sleeve_end_l[1]))),
                    (5, int(r_half)), angle_deg, 90, 270, (225, 225, 225), 2, lineType=cv2.LINE_AA)

    return out

def process_all_frames():
    # Source clip lives in the gitignored _source/ folder (not deployed).
    video_path = os.path.join('_source', 'viking_snatch_vertical_safe_9x16.mp4')
    out_dir_snatch = os.path.join('public', 'anim', 'viking-snatch')

    os.makedirs(out_dir_snatch, exist_ok=True)
    
    cap = cv2.VideoCapture(video_path)
    n_total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    target_count = 96
    indices = [round(i * (n_total - 1) / (target_count - 1)) for i in range(target_count)]
    
    print(f'Extracting and repairing {target_count} frames from {n_total} video frames...')
    
    for step_i, frame_idx in enumerate(indices):
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if not ret:
            print(f'Failed to read frame {frame_idx}')
            continue
            
        repaired = repair_frame(frame, frame_idx)
        
        # Center into 768x768 canvas
        # Crop y: 271 to 1039 (height 768)
        crop_y = repaired[271:1039, :]
        canvas = np.zeros((768, 768, 3), dtype=np.uint8)
        canvas[:, 24:744] = crop_y
        
        # Compute alpha channel from intensity with noise thresholding
        gray = cv2.cvtColor(canvas, cv2.COLOR_BGR2GRAY)
        alpha = np.where(gray <= 4, 0, np.clip((gray.astype(float) - 4) * 1.2, 0, 255)).astype(np.uint8)
        
        # Zero out RGB where alpha is 0 for optimal compression
        canvas[alpha == 0] = 0
        
        rgb = cv2.cvtColor(canvas, cv2.COLOR_BGR2RGB)
        rgba = np.dstack([rgb, alpha])
        
        im = Image.fromarray(rgba, 'RGBA')
        
        fname = f'f{step_i + 1:03d}.webp'
        im.save(os.path.join(out_dir_snatch, fname), 'WEBP', quality=75, method=4)

        if (step_i + 1) % 12 == 0 or step_i == 0 or step_i == target_count - 1:
            print(f'Processed {step_i + 1}/{target_count} frames -> {fname}')

    cap.release()
    print('All frames processed successfully!')

if __name__ == '__main__':
    process_all_frames()
