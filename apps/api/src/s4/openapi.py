"""Prints the OpenAPI specification without starting the server.

Used by `make web-types` to generate the frontend types: `python -m s4.openapi`.
"""

import json

from s4.main import app

if __name__ == "__main__":
    print(json.dumps(app.openapi(), indent=2, ensure_ascii=False))
