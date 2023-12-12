from flask import Flask, Response

app = Flask("main")

# html routing
@app.route("/")
def text_html():
    text = ""
    with open("src/public/index.html", "r") as f:
        text = f.read()
    
    return Response(text, mimetype="text/html")

# css routing
@app.route("/style.css")
def text_css():
    text = ""
    with open("src/public/style.css", "r") as f:
        text = f.read() 

    return Response(text, mimetype="text/css")

@app.route("/timeline.css")
def text_timeline_css():
    text = ""
    with open("src/public/timeline.css", "r") as f:
        text = f.read()

    return Response(text, mimetype="text/css")

@app.route("/cuelist.css")
def text_timeline_css():
    text = ""
    with open("src/public/cuelist.css", "r") as f:
        text = f.read()

    return Response(text, mimetype="text/css")

# javascript routing
@app.route("/script.js")
def text_js():
    text = ""
    with open("src/public/script.js", "r") as f:
        text = f.read()

    return Response(text, mimetype="text/javascript")



if __name__ == "__main__":
    
    print("Hello, World")
    app.run(host="0.0.0.0", port=5000)

