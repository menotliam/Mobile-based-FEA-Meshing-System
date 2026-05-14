import numpy as np
import json
import os

def get_gauss_points(config):
    """
    Dựa vào 'order' trong config để trả về danh sách các điểm (xi, eta) 
    và trọng số (weights) tương ứng.
    """
    order = config['numerical_integration']['order']
    
    if order == 2:
        # Bậc 2: 4 điểm Gauss tại (+/- 1/sqrt(3))
        val = 1.0 / np.sqrt(3.0)
        points = [
            (-val, -val), (val, -val), (val, val), (-val, val)
        ]
        weights = [1.0, 1.0, 1.0, 1.0]
        return points, weights
    else:
        # Bạn có thể mở rộng cho bậc 1 hoặc bậc 3 tại đây
        raise ValueError(f"Chưa hỗ trợ tích phân bậc {order}")

def compute_dN_nat(xi, eta):
    """
    Tính ma trận đạo hàm dN_nat 2x4 tại một điểm xi, eta cụ thể.
    """
    dN_dxi = np.array([
        -(1.0 - eta) / 4.0, (1.0 - eta) / 4.0, (1.0 + eta) / 4.0, -(1.0 + eta) / 4.0
    ])
    dN_deta = np.array([
        -(1.0 - xi) / 4.0, -(1.0 + xi) / 4.0, (1.0 + xi) / 4.0, (1.0 - xi) / 4.0
    ])
    return np.vstack((dN_dxi, dN_deta))

# ==========================================
# TEST ĐỘC LẬP TỪ CONFIG
# ==========================================
if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Đã bổ sung encoding='utf-8' để tránh lỗi cp1252
    with open(os.path.join(current_dir, 'config.json'), 'r', encoding='utf-8') as f:
        config = json.load(f)

    print("="*50)
    print(" BƯỚC 3: TRUY XUẤT ĐẠO HÀM TẠI CÁC ĐIỂM GAUSS")
    print("="*50)

    points, weights = get_gauss_points(config)
    
    for i, (xi, eta) in enumerate(points):
        dN = compute_dN_nat(xi, eta)
        print(f"\n[ Điểm Gauss #{i+1} ] tọa độ: ({xi:.4f}, {eta:.4f})")
        print(dN)