"""
SentinelX - IP Location Tracker
Uses free ipapi.co API to get geolocation data based on public IP.
"""

import requests


def get_ip_location() -> dict:
    """
    Fetches current IP address and geolocation info using ipapi.co.
    Returns dict with ip, city, region, country, latitude, longitude.
    Falls back to mock data if API is unreachable.
    """
    try:
        response = requests.get("https://ipapi.co/json/", timeout=5)
        response.raise_for_status()
        data = response.json()

        return {
            "success": True,
            "ip": data.get("ip", "Unknown"),
            "city": data.get("city", "Unknown"),
            "region": data.get("region", "Unknown"),
            "country": data.get("country_name", "Unknown"),
            "country_code": data.get("country_code", "??"),
            "latitude": data.get("latitude", 0.0),
            "longitude": data.get("longitude", 0.0),
            "isp": data.get("org", "Unknown ISP"),
            "timezone": data.get("timezone", "Unknown"),
        }

    except requests.exceptions.ConnectionError:
        # Offline / no internet — return demo data
        return _mock_location("No internet connection")
    except requests.exceptions.Timeout:
        return _mock_location("Request timed out")
    except Exception as e:
        return _mock_location(f"Error: {str(e)}")


def _mock_location(reason: str) -> dict:
    """Returns mock location data when API is unavailable."""
    return {
        "success": False,
        "ip": "192.168.1.100",
        "city": "Demo City",
        "region": "Demo Region",
        "country": "Demo Country",
        "country_code": "DC",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "isp": "Demo ISP",
        "timezone": "Asia/Kolkata",
        "note": reason,
    }
