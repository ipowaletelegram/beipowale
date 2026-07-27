from flask import Flask, render_template
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import os
app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/allotment")
def allotment():
    return render_template("allotment.html")

@app.route("/contact")
def contact():
    return render_template("contact.html")

@app.route("/blog")
def blog():
    return render_template("blog.html")

@app.route("/terms")
def terms():
    return render_template("terms.html")

@app.route("/ipo-calendar")
def ipo_calendar():

    now = datetime.now(ZoneInfo("Asia/Kolkata"))

    current_date = now.strftime("%Y-%m-%d")

    calendar_folder = os.path.join(app.static_folder, "calendar")

    latest_image = None

    for ext in [".jpg", ".jpeg", ".png", ".webp"]:
        filename = current_date + ext

        if os.path.exists(os.path.join(calendar_folder, filename)):
            latest_image = filename
            break

    # 12 AM - 5:59 AM
    if now.hour < 6:
        show_calendar = False
    else:
        show_calendar = True

    return render_template(
        "ipo-calendar.html",
        latest_image=latest_image,
        show_calendar=show_calendar,
        current_time=now.strftime("%d %b %Y %I:%M %p")
    )


if __name__ == "__main__":
    app.run()
