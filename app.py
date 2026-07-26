from flask import Flask, render_template, abort
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

    calendar_folder = os.path.join(app.static_folder, "calendar")

    now = datetime.now(ZoneInfo("Asia/Kolkata"))

    # 6 AM Rule
    if now.hour < 6:
        display_date = now.date() - timedelta(days=1)
    else:
        display_date = now.date()

    latest_image = None

    # Supported extensions
    extensions = [".jpg", ".jpeg", ".png", ".webp"]

    for ext in extensions:
        filename = display_date.strftime("%Y-%m-%d") + ext
        filepath = os.path.join(calendar_folder, filename)

        if os.path.exists(filepath):
            latest_image = filename
            break

    show_calendar = True

    return render_template(
        "ipo-calendar.html",
        latest_image=latest_image,
        show_calendar=show_calendar,
        current_time=now.strftime("%d %b %Y %I:%M %p")
    )

if __name__ == "__main__":
    app.run()
