import numpy as np
import matplotlib.pyplot as plt

def plot_fea_results(nodes, elements, U_global, config, scale_factor=100.0):
    """
    [BƯỚC 7] Trực quan hóa kết quả Mô phỏng (Post-processing).
    Vẽ lưới ban đầu và lưới sau biến dạng lên cùng một biểu đồ.
    
    Input:
        nodes: Tọa độ gốc.
        elements: Bảng kết nối.
        U_global: Vector chuyển vị (2N).
        config: Để đọc điều kiện biên vẽ mũi tên/ngàm.
        scale_factor: Hệ số phóng đại để mắt người nhìn thấy biến dạng.
    """
    # 1. Tái cấu trúc U_global thành mảng Nx2 và cộng vào tọa độ gốc
    U_formatted = U_global.reshape(-1, 2)
    deformed_nodes = nodes + U_formatted * scale_factor

    plt.figure(figsize=(12, 6))
    
    # 2. Vẽ Lưới Ban Đầu (Màu xám, nét đứt) và Lưới Biến Dạng (Màu xanh, nét liền)
    for elem in elements:
        if len(elem) == 4: # Chỉ xử lý phần tử Q4
            # Nối nút cuối với nút đầu để khép kín hình tứ giác
            poly = np.append(elem, elem[0])
            
            # Vẽ lưới gốc
            plt.plot(nodes[poly, 0], nodes[poly, 1], 'k--', alpha=0.3, linewidth=1)
            # Vẽ lưới biến dạng
            plt.plot(deformed_nodes[poly, 0], deformed_nodes[poly, 1], 'b-', linewidth=1.5, alpha=0.8)

    # 3. Vẽ các Nút (Nodes)
    plt.plot(nodes[:, 0], nodes[:, 1], 'ko', markersize=2, alpha=0.5, label='Original Nodes')
    plt.plot(deformed_nodes[:, 0], deformed_nodes[:, 1], 'bo', markersize=3, label='Deformed Nodes')

    # 4. Vẽ Điều Kiện Biên (Ngàm và Lực) lên vị trí ban đầu
    bc_config = config['boundary_conditions']
    
    # Vẽ Ngàm (Tam giác đỏ)
    for fix in bc_config.get('fix_nodes', []):
        if fix['target'] == 'x_equal':
            val = fix['value']
            for coord in nodes:
                if abs(coord[0] - val) < 1e-6:
                    plt.plot(coord[0], coord[1], 'r^', markersize=10) # Tam giác đỏ tượng trưng cho ngàm

    # Vẽ Lực (Mũi tên đỏ)
    for load in bc_config.get('point_loads', []):
        if load['target'] == 'coordinate':
            target = np.array(load['value'])
            force = np.array(load['force'])
            # Chuẩn hóa độ dài mũi tên để vẽ cho đẹp
            force_dir = force / np.linalg.norm(force) * (nodes[:,0].max() * 0.1) 
            
            for coord in nodes:
                if np.linalg.norm(coord - target) < 1e-6:
                    plt.arrow(coord[0], coord[1], force_dir[0], force_dir[1], 
                              head_width=0.2, head_length=0.3, fc='red', ec='red', linewidth=2)

    # 5. Căn chỉnh đồ họa
    plt.title(f"KẾT QUẢ MÔ PHỎNG FEA (Hệ số phóng đại biến dạng: {scale_factor}x)", fontweight='bold', fontsize=14)
    plt.xlabel("Trục X (m)")
    plt.ylabel("Trục Y (m)")
    plt.axis('equal') # Giữ đúng tỷ lệ thực tế
    plt.grid(True, linestyle=':', alpha=0.7)
    
    # Tạo ghi chú (Legend) tùy chỉnh
    import matplotlib.patches as mpatches
    import matplotlib.lines as mlines
    orig_patch = mlines.Line2D([], [], color='k', linestyle='--', label='Ban đầu')
    def_patch = mlines.Line2D([], [], color='b', linestyle='-', label='Biến dạng')
    fix_patch = mlines.Line2D([], [], color='r', marker='^', linestyle='None', markersize=10, label='Ngàm (Fixed)')
    plt.legend(handles=[orig_patch, def_patch, fix_patch], loc='best')

    plt.tight_layout()
    plt.show()