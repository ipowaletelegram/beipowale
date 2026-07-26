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

    # Before 6 AM show yesterday's calendar
    if now.hour < 6:
        display_date = now.date() - timedelta(days=1)
    else:
        display_date = now.date()

    calendar_folder = os.path.join(app.static_folder, "calendar")

    latest_image = None

    # Supported image extensions
    extensions = [".jpg", ".jpeg", ".png", ".webp"]

    for ext in extensions:

        filename = display_date.strftime("%Y-%m-%d") + ext

        if os.path.exists(os.path.join(calendar_folder, filename)):
            latest_image = filename
            break

    return render_template(
        "ipo-calendar.html",
        latest_image=latest_image,
        show_calendar=True,
        current_time=now.strftime("%d %b %Y %I:%M %p")
    )


if __name__ == "__main__":
    app.run()
