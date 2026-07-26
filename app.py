from flask import Flask, render_template
from datetime import datetime
import pytz
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

    # Show calendar only after 6 AM
    show_calendar = now.hour >= 6

    return render_template(
        "ipo-calendar.html",
        show_calendar=show_calendar,
        current_time=now.strftime("%d %B %Y %I:%M %p"),
        timestamp=int(now.timestamp())
    )

if __name__ == "__main__":
    app.run()
