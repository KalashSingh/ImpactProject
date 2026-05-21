"""
SentinelX - Secure File Wipe Module
Overwrites demo files with random data before deletion (demo-grade secure wipe).
This ONLY affects the demo_sensitive_files/ directory.
"""

import os
import random
import string
from pathlib import Path


def wipe_demo_files(folder_path: str) -> dict:
    """
    Securely wipes all files in demo_sensitive_files/ directory.
    Process:
      1. Overwrite file contents with random data (3 passes)
      2. Delete the file
    Returns dict with list of wiped files.
    """
    folder = Path(folder_path)

    if not folder.exists():
        # Folder already empty/wiped
        return {"wiped": [], "total": 0, "message": "No files to wipe"}

    wiped_files = []
    failed_files = []

    for file_path in list(folder.iterdir()):
        if file_path.is_file() and file_path.name != ".gitkeep":
            try:
                file_size = file_path.stat().st_size
                if file_size == 0:
                    file_size = 1024  # Minimum overwrite size

                # Pass 1: Overwrite with zeros
                with open(file_path, "wb") as f:
                    f.write(b'\x00' * file_size)

                # Pass 2: Overwrite with ones
                with open(file_path, "wb") as f:
                    f.write(b'\xFF' * file_size)

                # Pass 3: Overwrite with random data
                with open(file_path, "wb") as f:
                    f.write(os.urandom(file_size))

                # Delete the file
                os.remove(file_path)

                wiped_files.append(file_path.name)
                print(f"[SentinelX] Securely wiped: {file_path.name}")

            except PermissionError:
                failed_files.append(file_path.name)
                print(f"[SentinelX] Permission denied: {file_path.name}")
            except Exception as e:
                failed_files.append(file_path.name)
                print(f"[SentinelX] Wipe failed for {file_path.name}: {e}")

    return {
        "wiped": wiped_files,
        "failed": failed_files,
        "total": len(wiped_files),
        "message": f"Wiped {len(wiped_files)} file(s) using 3-pass overwrite",
    }


def restore_demo_files(folder_path: str) -> dict:
    """
    Re-creates demo sensitive files for testing purposes.
    Called after a wipe to allow re-demonstration.
    """
    folder = Path(folder_path)
    folder.mkdir(exist_ok=True)

    files = {
        "employee_records.txt": (
            "CONFIDENTIAL - EMPLOYEE RECORDS\n"
            "================================\n"
            "ID: EMP001 | Name: John Smith | SSN: 123-45-6789 | Salary: $95,000\n"
            "ID: EMP002 | Name: Sarah Connor | SSN: 987-65-4321 | Salary: $112,000\n"
        ),
        "financial_data.txt": (
            "CONFIDENTIAL - FINANCIAL DATA Q4\n"
            "==================================\n"
            "Revenue: $4,250,000\n"
            "Net Profit: $2,150,000\n"
            "Bank Account: XXXX-XXXX-XXXX-4892\n"
        ),
        "access_credentials.txt": (
            "CONFIDENTIAL - SYSTEM CREDENTIALS\n"
            "===================================\n"
            "DB_PASS: Pr0d@SecurePass!\n"
            "API_KEY: sk-prod-a1b2c3d4e5f6g7h8i9j0\n"
        ),
    }

    created = []
    for filename, content in files.items():
        file_path = folder / filename
        with open(file_path, "w") as f:
            f.write(content)
        created.append(filename)

    return {"created": created, "total": len(created)}
