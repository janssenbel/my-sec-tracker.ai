import os
import struct
import zlib
import math

def create_png(width, height, get_pixel_func):
    """Creates a PNG file buffer with RGBA pixels."""
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        for x in range(width):
            r, g, b, a = get_pixel_func(x, y, width, height)
            raw_data.extend([int(r), int(g), int(b), int(a)])

    compressed = zlib.compress(bytes(raw_data), 9)

    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = zlib.crc32(c) & 0xffffffff
        return struct.pack('>I', len(data)) + c + struct.pack('>I', crc)

    png_bytes = bytearray(b'\x89PNG\r\n\x1a\n')
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png_bytes.extend(chunk(b'IHDR', ihdr_data))
    png_bytes.extend(chunk(b'IDAT', compressed))
    png_bytes.extend(chunk(b'IEND', b''))
    return bytes(png_bytes)

def render_icon_pixel(x, y, width, height):
    # Normalized coordinates 0 to 1
    nx = x / width
    ny = y / height

    # 1. Background gradient matching header & app theme:
    # Top-left to bottom-right: Vibrant Blue (#2563eb) -> Deep Blue (#1e3a8a) -> Dark Navy (#0f172a)
    t = (nx + ny) / 2.0
    # Start: (37, 99, 235) Blue 600
    # Mid: (30, 58, 138) Blue 900
    # End: (15, 23, 42) Slate 900
    if t < 0.5:
        sub_t = t / 0.5
        bg_r = 37 * (1 - sub_t) + 30 * sub_t
        bg_g = 99 * (1 - sub_t) + 58 * sub_t
        bg_b = 235 * (1 - sub_t) + 138 * sub_t
    else:
        sub_t = (t - 0.5) / 0.5
        bg_r = 30 * (1 - sub_t) + 15 * sub_t
        bg_g = 58 * (1 - sub_t) + 23 * sub_t
        bg_b = 138 * (1 - sub_t) + 42 * sub_t

    # Rounded squircle mask for outer corners (subtle rounded app icon style)
    # Distance from center
    cx, cy = 0.5, 0.5
    dx = abs(nx - cx)
    dy = abs(ny - cy)

    # Ambient radial light in the center behind the building
    dist_c = math.sqrt((nx - 0.5)**2 + (ny - 0.45)**2)
    glow = max(0.0, 1.0 - dist_c / 0.45)
    bg_r = min(255, bg_r + glow * 35)
    bg_g = min(255, bg_g + glow * 50)
    bg_b = min(255, bg_b + glow * 65)

    # Let's draw the SEC Corporate Building (matching the Building2 header icon):
    # Center: x around 0.5
    # Triangular roof pediment: y from 0.18 to 0.28, base from x=0.22 to x=0.78
    in_building = False
    col_r, col_g, col_b = 255, 255, 255
    building_alpha = 0.0

    # Triangular roof / pediment
    pediment_top_y = 0.18
    pediment_bottom_y = 0.28
    pediment_left_x = 0.20
    pediment_right_x = 0.80

    if pediment_top_y <= ny <= pediment_bottom_y:
        slope_progress = (ny - pediment_top_y) / (pediment_bottom_y - pediment_top_y)
        half_width = 0.30 * slope_progress
        if abs(nx - 0.5) <= half_width:
            in_building = True
            # Subtle gradient on pediment
            col_r, col_g, col_b = 240, 248, 255
            building_alpha = 1.0

    # Architrave / Entablature beam under roof: y 0.28 to 0.32, x 0.18 to 0.82
    if 0.28 <= ny <= 0.32 and 0.18 <= nx <= 0.82:
        in_building = True
        col_r, col_g, col_b = 219, 234, 254  # Ice blue / white
        building_alpha = 1.0

    # 4 Classical Columns:
    # Columns vertical range: y 0.32 to 0.62
    # 4 columns centered around: x = 0.27, 0.42, 0.58, 0.73, width = 0.07 each
    col_centers = [0.26, 0.42, 0.58, 0.74]
    col_width = 0.065
    if 0.32 <= ny <= 0.62:
        for cc in col_centers:
            if abs(nx - cc) <= col_width / 2.0:
                in_building = True
                # Highlight on column left edge
                edge_t = (nx - (cc - col_width/2.0)) / col_width
                if edge_t < 0.3:
                    col_r, col_g, col_b = 255, 255, 255
                elif edge_t < 0.7:
                    col_r, col_g, col_b = 224, 242, 254
                else:
                    col_r, col_g, col_b = 186, 230, 253
                building_alpha = 1.0

    # Base steps / Foundation:
    # Step 1: y 0.62 to 0.66, x 0.16 to 0.84
    if 0.62 <= ny <= 0.66 and 0.16 <= nx <= 0.84:
        in_building = True
        col_r, col_g, col_b = 219, 234, 254
        building_alpha = 1.0

    # Step 2: y 0.66 to 0.70, x 0.12 to 0.88
    if 0.66 <= ny <= 0.70 and 0.12 <= nx <= 0.88:
        in_building = True
        col_r, col_g, col_b = 191, 219, 254
        building_alpha = 1.0

    # Golden Compliance Shield Emblem in the center between columns (y 0.38 to 0.56, x 0.45 to 0.55)
    # Shield shape:
    if 0.38 <= ny <= 0.56 and abs(nx - 0.5) <= 0.075:
        # Check shield curve
        sy = (ny - 0.38) / 0.18
        allowed_w = 0.075 * (1.0 if sy < 0.6 else (1.0 - (sy - 0.6) / 0.4))
        if abs(nx - 0.5) <= allowed_w:
            in_building = True
            # Gold color for the SEC shield: Amber 400 (#fbbf24) to Gold (#f59e0b)
            col_r, col_g, col_b = 251, 191, 36
            building_alpha = 1.0

    # SEC Letters banner at bottom: y 0.75 to 0.88
    # Let's draw block letter silhouettes for "S E C"
    # S: x around 0.28 to 0.38, y 0.74 to 0.86
    # E: x around 0.45 to 0.55, y 0.74 to 0.86
    # C: x around 0.62 to 0.72, y 0.74 to 0.86
    is_text = False
    # Letter S
    if 0.74 <= ny <= 0.86:
        # S: x in [0.28, 0.38]
        if 0.28 <= nx <= 0.38:
            py = (ny - 0.74) / 0.12
            px = (nx - 0.28) / 0.10
            # top bar, mid bar, bottom bar, top-left, bottom-right
            if py <= 0.22 or (0.40 <= py <= 0.60) or py >= 0.78:
                is_text = True
            elif py < 0.40 and px <= 0.28:
                is_text = True
            elif py > 0.60 and px >= 0.72:
                is_text = True

        # Letter E: x in [0.45, 0.55]
        if 0.45 <= nx <= 0.55:
            py = (ny - 0.74) / 0.12
            px = (nx - 0.45) / 0.10
            # left spine, top bar, mid bar, bottom bar
            if px <= 0.28 or py <= 0.22 or (0.42 <= py <= 0.58 and px <= 0.85) or py >= 0.78:
                is_text = True

        # Letter C: x in [0.62, 0.72]
        if 0.62 <= nx <= 0.72:
            py = (ny - 0.74) / 0.12
            px = (nx - 0.62) / 0.10
            # top bar, bottom bar, left spine
            if px <= 0.28 or py <= 0.22 or py >= 0.78:
                is_text = True

    if is_text:
        col_r, col_g, col_b = 255, 255, 255
        building_alpha = 1.0

    # Composite building over background
    final_r = bg_r * (1.0 - building_alpha) + col_r * building_alpha
    final_g = bg_g * (1.0 - building_alpha) + col_g * building_alpha
    final_b = bg_b * (1.0 - building_alpha) + col_b * building_alpha

    return (final_r, final_g, final_b, 255)

def main():
    os.makedirs('/app/applet/public', exist_ok=True)
    
    sizes = [
        (512, 512, '/app/applet/public/pwa-512x512.png'),
        (512, 512, '/app/applet/public/pwa-maskable-512x512.png'),
        (192, 192, '/app/applet/public/pwa-192x192.png'),
        (180, 180, '/app/applet/public/apple-touch-icon.png'),
        (64, 64, '/app/applet/public/favicon-64x64.png'),
        (32, 32, '/app/applet/public/favicon.png'),
    ]

    for w, h, outpath in sizes:
        print(f"Generating {outpath} ({w}x{h})...")
        png_data = create_png(w, h, render_icon_pixel)
        with open(outpath, 'wb') as f:
            f.write(png_data)
        print(f"Saved {outpath} ({len(png_data)} bytes)")

if __name__ == '__main__':
    main()
