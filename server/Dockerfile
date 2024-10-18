FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV FLASK_APP=server.py
ENV FLASK_ENV=production

EXPOSE 5001

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "server:hostedApp", "--workers=1", "--worker-class", "eventlet", "--log-level=info"]
