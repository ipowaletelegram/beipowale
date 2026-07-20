from typing import Dict


def check(company: str, search_type: str, value: str) -> Dict:
    """
    KFin service entry point.

    company      -> IPO Name
    search_type  -> pan / application / dpid
    value        -> User entered value

    TODO:
    Add official KFin integration here.
    """

    return {
        "success": False,
        "registrar": "KFin",
        "message": "KFin integration is not configured yet."
    }
