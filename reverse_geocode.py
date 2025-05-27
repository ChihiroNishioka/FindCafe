#!/usr/bin/env python3
"""Simple script to determine current location from GPS coordinates."""
import sys

try:
    from geopy.geocoders import Nominatim
    from geopy.exc import GeocoderUnavailable
except ImportError:
    sys.stderr.write(
        "geopy module not found. Install with `pip install geopy`\n")
    sys.exit(1)

def reverse_geocode(lat, lon):
    geolocator = Nominatim(user_agent="find_cafe_app")
    try:
        location = geolocator.reverse((lat, lon), exactly_one=True)
    except GeocoderUnavailable as e:
        sys.stderr.write(f"Geocoding service unavailable: {e}\n")
        return None
    return location.address if location else None

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python reverse_geocode.py <latitude> <longitude>")
        sys.exit(1)
    latitude = float(sys.argv[1])
    longitude = float(sys.argv[2])
    address = reverse_geocode(latitude, longitude)
    if address:
        print(address)
    else:
        print("Address not found")
