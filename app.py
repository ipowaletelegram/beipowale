from flask import Flask, render_template
from datetime import datetime
import pytz
import os import abort
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

    india = pytz.timezone("Asia/Kolkata")
    now = datetime.now(india)

    # Calendar sirf 6 AM ke baad dikhega
    show_calendar = now.hour >= 6

    today = now.strftime("%Y-%m-%d")

    image = f"calendar/{today}.jpg"

    image_path = os.path.join(
        app.static_folder,
        "calendar",
        f"{today}.jpg"
    )

    image_exists = os.path.exists(image_path)

    return render_template(
        "ipo-calendar.html",
        show_calendar=show_calendar,
        image_exists=image_exists,
        image=image,
        today=today,
        current_time=now.strftime("%d %B %Y %I:%M %p")
    )

if __name__ == "__main__":
    app.run()
