from decimal import Decimal
from typing import Annotated

from pydantic import PlainSerializer

# Keep Decimal precision internally, but serialize as float (not the Pydantic v2
# default string) when dumped to JSON, e.g. for FastAPI responses.
DecimalAsFloat = Annotated[
    Decimal,
    PlainSerializer(lambda value: float(value), return_type=float, when_used="json"),
]
