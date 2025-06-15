FROM python:3.9-slim

WORKDIR /app

COPY . .

RUN pip install flask gunicorn

ENV PORT=8080

CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 main:app
