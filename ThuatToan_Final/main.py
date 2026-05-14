import os
import json
import numpy as np

# Import các step module
from step1_meshing import MeshGenerator
from step2_get_D_matrix import get_D_matrix
from step3_get_dN_nat import compute_dN_nat, get_gauss_points
from step5_assemble_global import assemble_K_global
from step6_solve_system import apply_bcs_and_solve
from step7_plot_results import plot_fea_results

def load_config():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(current_dir, 'config.json')
    with open(config_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def main():
    # MỞ KHÓA HIỂN THỊ: linewidth=300 để ma trận dài không bị gãy dòng
    np.set_printoptions(precision=3, suppress=True, threshold=np.inf, linewidth=300, formatter={'float': '{: 0.3e}'.format})

    print("="*80)
    print("                 HỆ THỐNG MÔ PHỎNG FEA - TỰ ĐỘNG TOÀN DIỆN")
    print("="*80)

    config = load_config()

    # =========================================================
    # BƯỚC 1: CHIA LƯỚI (MESHING)
    # =========================================================
    print("\n" + "="*40 + " BƯỚC 1: MESHING " + "="*40)
    mesh_path = os.path.join(os.path.dirname(__file__), 'mesh_data.json')
    with open(mesh_path, 'r', encoding='utf-8') as f:
        mesh_data = json.load(f)
        
    mesher = MeshGenerator(config, mesh_data)
    nodes, elements = mesher.generate()
    print(f"Tổng số nút: {len(nodes)} | Tổng số phần tử: {len(elements)}")

    # =========================================================
    # BƯỚC 2: MA TRẬN VẬT LIỆU D
    # =========================================================
    print("\n" + "="*40 + " BƯỚC 2: D MATRIX " + "="*40)
    D = get_D_matrix(config)
    print("Ma trận Đàn hồi (Ứng suất phẳng):")
    print(D)

    # =========================================================
    # BƯỚC 3: ĐIỂM GAUSS & ĐẠO HÀM HÀM DẠNG dN_nat (IN TOÀN BỘ)
    # =========================================================
    print("\n" + "="*40 + " BƯỚC 3: GAUSS & dN_nat " + "="*40)
    gauss_points, weights = get_gauss_points(config)
    print(f"Sử dụng Tích phân Gauss bậc: {config['numerical_integration']['order']}\n")
    
    # Đã gỡ bỏ giới hạn [0:1], bây giờ nó sẽ in đủ cả 4 điểm!
    for i, ((xi, eta), w) in enumerate(zip(gauss_points, weights)):
        dN_nat = compute_dN_nat(xi, eta)
        print(f"--- Ma trận dN_nat (2x4) tại điểm Gauss #{i+1} (xi={xi:.3f}, eta={eta:.3f}) ---")
        print(dN_nat)
        print("")

    # =========================================================
    # BƯỚC 4 & 5: LẮP RÁP MA TRẬN TOÀN CỤC K_global
    # =========================================================
    print("="*40 + " BƯỚC 4 & 5: K_global ASSEMBLY " + "="*40)
    K_global = assemble_K_global(nodes, elements, D, config)
    print(f"KÍCH THƯỚC MA TRẬN K_global TOÀN HỆ THỐNG: {K_global.shape[0]} hàng x {K_global.shape[1]} cột")
    print(K_global)

    # =========================================================
    # BƯỚC 6: ÁP ĐIỀU KIỆN BIÊN VÀ GIẢI HỆ (SOLVE)
    # =========================================================
    print("\n" + "="*40 + " BƯỚC 6: APPLY BCs & SOLVE " + "="*40)
    
    U_global, F_global = apply_bcs_and_solve(K_global, nodes, config)
    
    print("\n[+] KẾT QUẢ CHUYỂN VỊ (U):")
    # Tái cấu trúc mảng 1D thành mảng 2D (mỗi hàng là 1 nút, cột 1 là u, cột 2 là v)
    U_formatted = U_global.reshape(-1, 2)
    
    print("Nút | Chuyển vị UX (m) | Chuyển vị UY (m)")
    print("-" * 45)
    for i, (ux, uy) in enumerate(U_formatted):
        print(f" {i:2d} |  {ux: 1.4e}   |  {uy: 1.4e}")

    # =========================================================
    # BƯỚC 7: TRỰC QUAN HÓA (VISUALIZATION)
    # =========================================================
    print("\n" + "="*40 + " BƯỚC 7: PLOT RESULTS " + "="*40)
    print("Đang khởi động Matplotlib để vẽ đồ họa mô phỏng...")
    
    # Bạn có thể điều chỉnh scale_factor tùy ý (ví dụ: 50, 100, 500)
    plot_fea_results(nodes, elements, U_global, config, scale_factor=200.0)

    print("\n" + "="*80)
    print("MÔ PHỎNG HOÀN TẤT!")
    print("="*80)

if __name__ == "__main__":
    main()