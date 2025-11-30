"""
FastAPI 应用启动脚本
"""

import uvicorn
import pathlib
import sys

# 添加项目根目录到 Python 路径
root_path = str(pathlib.Path(__file__).parent.parent.parent)
if root_path not in sys.path:
    sys.path.insert(0, root_path)

# 开发环境配置
if __name__ == "__main__":
    uvicorn.run(
        "mocker.main:app",
        host="0.0.0.0",
        port=9000,
        reload=True,  # 开发模式启用热重载
        log_level="info",
        reload_dirs=["./src"]
    )
