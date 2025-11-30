"""
FastAPI 应用启动脚本
"""

import uvicorn
import os
from .main import app

# 开发环境配置
if __name__ == "__main__":
    uvicorn.run(
        "mocker.run:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # 开发模式启用热重载
        log_level="info"
    )