"""
FastAPI 应用启动脚本
"""

import uvicorn
import os
import sys
import pathlib

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent.parent))

from src.mocker.main import app

# 开发环境配置
if __name__ == "__main__":
    uvicorn.run(
        "mocker.run:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # 开发模式启用热重载
        log_level="info"
    )