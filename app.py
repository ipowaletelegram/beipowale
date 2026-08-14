from flask import Flask, render_template, jsonify
from datetime import datetime
from zoneinfo import ZoneInfo
import os
import json
import csv
import io
import requests

GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQeTO-2tCHWLT6qJOUUIadywyp1GO8MHHRkHkMzNFjfskCjH97Wu2FuJHHWH8rTLwaqcq8rBcPCl7C_/pub?output=csv"
app = Flask(__name__)


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():
    return render_template("index.html")


# =========================================================
# ALLOTMENT
# =========================================================

@app.route("/allotment")
def allotment():
    return render_template("allotment.html")


# =========================================================
# CONTACT
# =========================================================

@app.route("/contact")
def contact():
    return render_template("contact.html")
@app.route("/ipo-documents")
def ipo_documents():
    return render_template("ipo-documents.html")

# =========================================================
# BLOG
# =========================================================

@app.route("/blog")
def blog():
    return render_template("blog.html")


# =========================================================
# TERMS
# =========================================================

@app.route("/terms")
def terms():
    return render_template("terms.html")


# =========================================================
# IPO CALENDAR PAGE
# =========================================================

@app.route("/ipo-calendar")
def ipo_calendar():

    now = datetime.now(
        ZoneInfo("Asia/Kolkata")
    )

    current_date = now.strftime(
        "%Y-%m-%d"
    )

    # Existing calendar image folder
    calendar_folder = os.path.join(
        app.static_folder,
        "calendar"
    )

    latest_image = None

    # Check today's calendar image
    for ext in [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    ]:

        filename = current_date + ext

        image_path = os.path.join(
            calendar_folder,
            filename
        )

        if os.path.exists(image_path):

            latest_image = filename

            break


    # =====================================================
    # 12 AM - 5:59 AM
    # =====================================================

    if now.hour < 6:

        show_calendar = False

    else:

        show_calendar = True


    return render_template(
        "ipo-calendar.html",

        latest_image=latest_image,

        show_calendar=show_calendar,

        current_time=now.strftime(
            "%d %b %Y %I:%M %p"
        )
    )


# =========================================================
# IPO CALENDAR JSON API
# =========================================================
@app.route("/api/ipo-documents")
def api_ipo_documents():

    try:

        response = requests.get(
            GOOGLE_SHEET_CSV_URL,
            timeout=15
        )

        response.raise_for_status()

        csv_text = response.text

        reader = csv.DictReader(
            io.StringIO(csv_text)
        )

        documents = []

        for row in reader:

            company = row.get("Company", "").strip()
            doc_type = row.get("Type", "").strip().upper()
            document_url = row.get("Document URL", "").strip()

            if company and doc_type and document_url:

                documents.append({
                    "company": company,
                    "type": doc_type,
                    "url": document_url
                })

        return jsonify(documents)

    except Exception as e:

        print("IPO DOCUMENT ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500
@app.route("/api/ipo-calendar")
def ipo_calendar_data():

    # JSON file location:
    #
    # static/
    #     data/
    #         ipo-calendar.json

    json_file = os.path.join(
        app.static_folder,
        "data",
        "ipo-calendar.json"
    )


    # =====================================================
    # Check if JSON file exists
    # =====================================================

    if not os.path.exists(json_file):

        return jsonify({
            "error": True,
            "message": "IPO calendar JSON file not found",
            "data": []
        }), 404


    try:

        # =================================================
        # Read JSON
        # =================================================

        with open(
            json_file,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(file)


        # =================================================
        # Make sure JSON contains a list
        # =================================================

        if not isinstance(data, list):

            return jsonify({
                "error": True,
                "message": "Invalid IPO calendar JSON format",
                "data": []
            }), 500


        # =================================================
        # Return IPO data
        # =================================================

        return jsonify(data)


    except json.JSONDecodeError:

        return jsonify({
            "error": True,
            "message": "Invalid JSON syntax in ipo-calendar.json",
            "data": []
        }), 500


    except Exception as e:

        return jsonify({
            "error": True,
            "message": str(e),
            "data": []
        }), 500


# =========================================================
# RUN APPLICATION
# =========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=int(
            os.environ.get(
                "PORT",
                5000
            )
        ),
        debug=False
    )
