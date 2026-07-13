from flask import Flask, render_template, request, send_from_directory, send_file
import os
import requests
import qrcode
import io


app = Flask(__name__)  # ✅ Fixed
app.secret_key = 'supersecretkey'
@app.route("/")
def index():
    notice = "📢 New Update: Resume generator now supports PDF!"
    return render_template("login.html", notice=notice)


@app.route("/robots.txt")
def robots():
    return send_from_directory("static", "robots.txt")

@app.route("/sitemap.xml")
def sitemap():
    return send_from_directory("static", "sitemap.xml")

@app.before_request
def check_maintenance():
    if os.environ.get('MAINTENANCE_MODE') == 'on' and request.endpoint != 'maintenance':
        return render_template('maintenance.html'), 503



@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/blog')
def blog():
    return render_template('blog.html')

@app.route('/features')
def features():
    return render_template('features.html')

@app.route('/terms')
def terms():
    return render_template('terms.html')

@app.route('/generate_qr', methods=['POST'])
def generate_qr():
    url = request.form.get('url')
    if not url:
        return "No URL provided", 400

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buf = io.BytesIO()
    img.save(buf)
    buf.seek(0)

    try:
        requests.post(
            "https://script.google.com/macros/s/YOUR_SECOND_SCRIPT_ID/exec",
            json={"url": url, "ip": request.remote_addr}
        )
    except Exception as e:
        print("QR log failed:", e)

    return send_file(buf, mimetype='image/png')

if __name__ == '__main__':  # ✅ Fixed
    app.run(debug=True)
