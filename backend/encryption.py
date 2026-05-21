"""
SentinelX - AES Encryption Module
Encrypts and decrypts files in demo_sensitive_files/ using Fernet (AES-128).
Key is stored locally for demo purposes.
"""

import os
from pathlib import Path
from cryptography.fernet import Fernet

# Key file location
KEY_FILE = Path(__file__).parent / "sentinel.key"


def _load_or_create_key() -> bytes:
    """Load existing encryption key or generate a new one."""
    if KEY_FILE.exists():
        with open(KEY_FILE, "rb") as f:
            return f.read()
    else:
        key = Fernet.generate_key()
        with open(KEY_FILE, "wb") as f:
            f.write(key)
        print(f"[SentinelX] New encryption key generated: {KEY_FILE}")
        return key


def encrypt_folder(folder_path: str) -> dict:
    """
    Encrypts all non-encrypted files in the given folder.
    Encrypted files get a .enc extension.
    Returns list of encrypted files.
    """
    key = _load_or_create_key()
    fernet = Fernet(key)
    folder = Path(folder_path)

    if not folder.exists():
        raise FileNotFoundError(f"Folder not found: {folder_path}")

    encrypted_files = []
    skipped_files = []

    for file_path in folder.iterdir():
        # Skip already encrypted files and the key file
        if file_path.suffix == ".enc" or file_path.name == "sentinel.key":
            skipped_files.append(file_path.name)
            continue

        if file_path.is_file():
            try:
                # Read original content
                with open(file_path, "rb") as f:
                    original_data = f.read()

                # Encrypt
                encrypted_data = fernet.encrypt(original_data)

                # Write encrypted file
                enc_path = file_path.with_suffix(file_path.suffix + ".enc")
                with open(enc_path, "wb") as f:
                    f.write(encrypted_data)

                # Remove original file
                os.remove(file_path)

                encrypted_files.append(file_path.name)
                print(f"[SentinelX] Encrypted: {file_path.name} → {enc_path.name}")

            except Exception as e:
                print(f"[SentinelX] Encryption failed for {file_path.name}: {e}")

    return {
        "files": encrypted_files,
        "skipped": skipped_files,
        "total": len(encrypted_files),
    }


def decrypt_folder(folder_path: str) -> dict:
    """
    Decrypts all .enc files in the given folder.
    Restores original files and removes .enc versions.
    Returns list of decrypted files.
    """
    key = _load_or_create_key()
    fernet = Fernet(key)
    folder = Path(folder_path)

    if not folder.exists():
        raise FileNotFoundError(f"Folder not found: {folder_path}")

    decrypted_files = []

    for file_path in folder.iterdir():
        if file_path.suffix == ".enc" and file_path.is_file():
            try:
                # Read encrypted content
                with open(file_path, "rb") as f:
                    encrypted_data = f.read()

                # Decrypt
                original_data = fernet.decrypt(encrypted_data)

                # Restore original filename (remove .enc)
                original_path = file_path.with_suffix("")
                with open(original_path, "wb") as f:
                    f.write(original_data)

                # Remove encrypted file
                os.remove(file_path)

                decrypted_files.append(original_path.name)
                print(f"[SentinelX] Decrypted: {file_path.name} → {original_path.name}")

            except Exception as e:
                print(f"[SentinelX] Decryption failed for {file_path.name}: {e}")

    return {
        "files": decrypted_files,
        "total": len(decrypted_files),
    }
