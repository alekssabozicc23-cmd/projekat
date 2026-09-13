import os
import sys

# Dodavanje backend foldera u Python path kako bi uvoz radio bez greške
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from server import app
