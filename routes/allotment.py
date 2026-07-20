from flask import Blueprint, render_template, request, jsonify
from services import kfin, mufg, bigshare
import json
import os

allotment_bp = Blueprint("allotment", __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IPO_FILE = os.path.join(BASE_DIR, "data", "ipo_list.json")


def get_companies():
    with open(IPO_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


@allotment_bp.route("/allotment")
def allotment():
    companies = get_companies()
    return render_template("allotment.html", companies=companies)


@allotment_bp.route("/check-allotment", methods=["POST"])
def check_allotment():

    data = request.get_json()

    company = data.get("company")
    search_type = data.get("search_type")
    value = data.get("value")

    companies = get_companies()

    registrar = None

    for ipo in companies:
        if ipo["company"] == company:
            registrar = ipo["registrar"]
            break

    if registrar is None:
        return jsonify({
            "success": False,
            "message": "IPO Not Found"
        })

    if registrar == "kfin":
        result = kfin.check(company, search_type, value)

    elif registrar == "mufg":
        result = mufg.check(company, search_type, value)

    elif registrar == "bigshare":
        result = bigshare.check(company, search_type, value)

    else:
        return jsonify({
            "success": False,
            "message": "Registrar not supported."
        })

    return jsonify(result)
