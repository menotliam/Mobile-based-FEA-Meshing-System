import numpy as np
import json
import os

def get_D_matrix(config):
    """
    [BƯỚC 2] Nhận cục 'config' và tự động tính Ma trận Đàn hồi D.
    """
    # File step tự động bóc tách dữ liệu nó cần từ config
    E = config['material']['E']
    nu = config['material']['nu']
    
    coef = E / (1.0 - nu**2)
    D = coef * np.array([
        [1.0,  nu,   0.0],
        [nu,   1.0,  0.0],
        [0.0,  0.0,  (1.0 - nu) / 2.0]
    ])
    return D

# ==========================================
# KHU VỰC CHẠY TEST ĐỘC LẬP
# ==========================================
if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(current_dir, 'config.json')
    
    with open(config_path, 'r', encoding='utf-8') as f:
        test_config = json.load(f)
        
    print("="*50)
    print(" BƯỚC 2: MA TRẬN ĐÀN HỒI D")
    print("="*50)
    D_matrix = get_D_matrix(test_config)
    np.set_printoptions(formatter={'float': '{: 0.2e}'.format})
    print(D_matrix)