FROM python:3.11

WORKDIR /code

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src/ ./src/

CMD [ "gunicorn", "--bind", "0.0.0.0:5000", "src.main:app"]
