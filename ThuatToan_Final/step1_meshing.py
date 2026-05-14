import os
import json
import numpy as np
from scipy.spatial import Delaunay
import matplotlib.pyplot as plt

class MeshGenerator:
    """
    [MODULE TIỀN XỬ LÝ - PRE-PROCESSING]
    Nhận dữ liệu đầu vào từ cấu hình (config.json) và tiến hành rời rạc hóa 
    không gian liên tục thành các nút (nodes) và phần tử (elements).
    """
    def __init__(self, config, mesh_data=None):
        self.config = config
        self.mesh_data = mesh_data
        
        # Output cốt lõi
        self.nodes = None
        self.elements = None

    def generate(self):
        """Hàm điều hướng: Phân tích config để chọn đúng thuật toán băm lưới"""
        mesh_cfg = self.config['mesh']
        source_type = mesh_cfg.get('mesh_source', 'auto')

        print(f"[*] Meshing Module: Kích hoạt chế độ '{source_type.upper()}'")

        if source_type == 'auto':
            # Lấy thông số hình học từ config
            geom = self.config['geometry']
            sx, sy = geom['start_x'], geom['start_y']
            ex, ey = geom['end_x'], geom['end_y']
            nx, ny = mesh_cfg['nx'], mesh_cfg['ny']
            elem_type = mesh_cfg['element_type']

            if elem_type == "quad":
                self.nodes, self.elements = self._uniform_mesh_quad4(sx, sy, ex, ey, nx, ny)
            elif elem_type == "triangle":
                self.nodes, self.elements = self._uniform_mesh_triangle(sx, sy, ex, ey, nx, ny)
            else:
                raise ValueError(f"Không hỗ trợ element_type: {elem_type}")
                
        elif source_type == 'custom':
            shape_name = mesh_cfg['shape_name']
            if self.mesh_data is None or shape_name not in self.mesh_data:
                raise KeyError(f"Không tìm thấy khối dữ liệu '{shape_name}' trong mesh_data!")
            
            points = self.mesh_data[shape_name]['nodes']
            self.nodes, self.elements = self._delaunay_mesh(points)
            
        else:
            raise ValueError(f"Không hỗ trợ mesh_source: {source_type}")

        print(f"    -> Đã tạo xong lưới: {len(self.nodes)} nodes, {len(self.elements)} elements.")
        return self.nodes, self.elements

    def _uniform_mesh_quad4(self, sx, sy, ex, ey, nx, ny):
        """
        [MỤC ĐÍCH THỰC TẾ]
        Băm tấm vật liệu hình chữ nhật thành mạng lưới các viên gạch tứ giác (Q4).
        """
        # Bước 1: Tạo các mốc tọa độ
        x = np.linspace(sx, ex, nx + 1)
        y = np.linspace(sy, ey, ny + 1)
        
        nodes = []
        nids = np.zeros((ny + 1, nx + 1), dtype=int) # Ma trận lập bản đồ 2D -> 1D
        
        # Bước 2: Tạo danh sách tọa độ các nút
        k = 0
        for i in range(ny + 1):          
            for j in range(nx + 1):      
                nids[i, j] = k           
                nodes.append([x[j], y[i]]) 
                k += 1                   
                
        nodes = np.array(nodes)
        
        # Bước 3: Kết nối 4 nút lại thành 1 phần tử (Ngược chiều kim đồng hồ)
        elements = []
        for i in range(ny):              
            for j in range(nx):          
                n1 = nids[i, j]          
                n2 = nids[i, j + 1]      
                n3 = nids[i + 1, j + 1]  
                n4 = nids[i + 1, j]      
                
                elements.append([n1, n2, n3, n4])
                
        return nodes, np.array(elements)

    def _uniform_mesh_triangle(self, sx, sy, ex, ey, nx, ny):
        """
        [MỤC ĐÍCH THỰC TẾ]
        Tạo lưới phần tử Tam giác 3 nút (CST) bằng cách băm lưới ô vuông trước, 
        sau đó chẻ đôi mỗi ô vuông theo đường chéo.
        """
        # 1. Tái sử dụng hàm tứ giác để lấy tọa độ và cấu trúc Q4
        nodes, quad_elements = self._uniform_mesh_quad4(sx, sy, ex, ey, nx, ny)
        
        tri_elements = []
        
        # 2. Quét qua từng hình tứ giác để chẻ đôi
        for quad in quad_elements:
            n1, n2, n3, n4 = quad
            
            # Tam giác 1: Nửa dưới
            tri_elements.append([n1, n2, n3])
            # Tam giác 2: Nửa trên
            tri_elements.append([n1, n3, n4])
            
        return nodes, np.array(tri_elements)

    def _delaunay_mesh(self, points):
        """
        [MỤC ĐÍCH THỰC TẾ]
        Tự động chăng lưới tam giác tối ưu (tránh dẹt) cho các hình lồi lõm phức tạp.
        """
        nodes = np.array(points)
        tri = Delaunay(nodes)
        elements = tri.simplices
        return nodes, elements

# ==============================================================================
# KHU VỰC TEST ĐỘC LẬP (Chỉ chạy khi gọi trực tiếp lệnh: python meshing.py)
# ==============================================================================
if __name__ == "__main__":
    print("="*50)
    print(" CHẠY BÀI TEST ĐỘC LẬP CHO MODULE MESHING")
    print("="*50)
    
    # [QUAN TRỌNG] Tự động dò đường dẫn tuyệt đối để chống lỗi FileNotFoundError
    current_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(current_dir, 'config.json')
    mesh_data_path = os.path.join(current_dir, 'mesh_data.json')
    
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            test_config = json.load(f)
        with open(mesh_data_path, 'r', encoding='utf-8') as f:
            test_mesh_data = json.load(f)
            
        # 1. Khởi tạo module
        mesher = MeshGenerator(test_config, test_mesh_data)
        
        # 2. Sinh lưới
        nodes, elements = mesher.generate()
        
        # 3. Trực quan hóa nhanh để kiểm tra
        plt.figure(figsize=(10, 6))
        elem_shape = elements.shape[1]
        
        if elem_shape == 3: # Vẽ lưới tam giác
            plt.triplot(nodes[:, 0], nodes[:, 1], elements, 'b-', linewidth=1.0, alpha=0.8)
        elif elem_shape == 4: # Vẽ lưới tứ giác
            for elem in elements:
                poly = np.append(elem, elem[0])
                plt.plot(nodes[poly, 0], nodes[poly, 1], 'b-', linewidth=1.0, alpha=0.8)
                
        plt.plot(nodes[:, 0], nodes[:, 1], 'ro', markersize=3)
        plt.title(f"Test Kết quả Meshing: {test_config['mesh']['mesh_source'].upper()}", fontweight='bold')
        plt.axis('equal')
        plt.grid(True, linestyle=':')
        plt.show()

    except FileNotFoundError as e:
        print(f"[!] Lỗi: Không tìm thấy file JSON. Vui lòng đảm bảo config.json và mesh_data.json nằm cùng thư mục với meshing.py.")
        print(f"    Đường dẫn đang tìm: {config_path}")