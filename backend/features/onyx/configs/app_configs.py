import os

# Prefix for all custom feature routes (under the global API prefix)
FEATURES_API_PREFIX = os.environ.get("FEATURES_API_PREFIX", "features")
