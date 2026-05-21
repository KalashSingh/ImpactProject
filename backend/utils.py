"""
SentinelX — Additional Utility Routes
Add this at the bottom of main.py or import it.
"""

# Add this route to main.py for demo restore functionality
RESTORE_ROUTE = '''
@app.post("/api/restore-demo")
def restore_demo_files():
    """Re-create demo sensitive files after wipe (for presentation use)."""
    from wipe import restore_demo_files
    try:
        result = restore_demo_files(str(BASE_DIR / "demo_sensitive_files"))
        return {"success": True, "message": "Demo files restored", "details": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
'''
