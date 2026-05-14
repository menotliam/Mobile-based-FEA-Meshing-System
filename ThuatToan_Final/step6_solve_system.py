import numpy as np

def apply_bcs_and_solve(K_global, nodes, config):
    """
    [BƯỚC 6] Áp đặt điều kiện biên (Ngàm, Lực) và giải hệ phương trình.
    Sử dụng phương pháp "Zeroing out" (Xóa hàng, xóa cột) như trong config.
    """
    num_nodes = len(nodes)
    total_dof = 2 * num_nodes
    
    # Khởi tạo Vector lực Toàn cục (F_global) toàn số 0
    F_global = np.zeros(total_dof)
    
    # Copy ma trận K để không làm hỏng ma trận gốc (dùng để tính phản lực sau này)
    K_modified = K_global.copy()
    
    bc_config = config['boundary_conditions']
    
    # ==========================================
    # 1. ĐẶT LỰC NÚT (Point Loads)
    # ==========================================
    for load in bc_config.get('point_loads', []):
        if load['target'] == 'coordinate':
            target_coord = np.array(load['value'])
            force_val = load['force']
            
            # Tìm Nút có tọa độ trùng (hoặc gần nhất) với tọa độ target
            distances = np.linalg.norm(nodes - target_coord, axis=1)
            node_id = np.argmin(distances)
            
            # Đập lực vào Vector F_global
            F_global[2*node_id] += force_val[0]     # Lực theo phương X
            F_global[2*node_id + 1] += force_val[1] # Lực theo phương Y
            print(f" -> [Lực] Áp lực {force_val} N vào Nút #{node_id} (Tọa độ: {nodes[node_id]})")

    # ==========================================
    # 2. ĐẶT NGÀM (Fix Nodes) - Phương pháp Zeroing Out
    # ==========================================
    fixed_dofs = []
    
    for fix in bc_config.get('fix_nodes', []):
        if fix['target'] == 'x_equal':
            val = fix['value']
            dofs_to_fix = fix['dof']
            
            # Quét qua toàn bộ nút, tìm các nút nằm trên mép x = val
            for node_id, coord in enumerate(nodes):
                if abs(coord[0] - val) < 1e-6:
                    if "u" in dofs_to_fix:
                        fixed_dofs.append(2*node_id)     # Khóa chuyển vị X
                    if "v" in dofs_to_fix:
                        fixed_dofs.append(2*node_id + 1) # Khóa chuyển vị Y
                        
    print(f" -> [Ngàm] Đã khóa chặt các Bậc tự do (DOF) sau: {fixed_dofs}")

    # Thuật toán Zeroing out: Gán hàng và cột bằng 0, đường chéo bằng 1, F tương ứng bằng 0
    for dof in fixed_dofs:
        K_modified[dof, :] = 0.0
        K_modified[:, dof] = 0.0
        K_modified[dof, dof] = 1.0
        F_global[dof] = 0.0

    # ==========================================
    # 3. GIẢI HỆ PHƯƠNG TRÌNH TUYẾN TÍNH K * U = F
    # ==========================================
    print(" -> Đang giải hệ phương trình...")
    U_global = np.linalg.solve(K_modified, F_global)
    
    return U_global, F_global