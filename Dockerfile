FROM python:3.11-slim

WORKDIR /app

# Install PDM
RUN pip install -U pip setuptools wheel
RUN pip install pdm

# Copy PDM files
COPY pyproject.toml pdm.lock ./
COPY src/ src/

# Install dependencies
RUN pdm install --prod --no-lock --no-editable

# Set environment variables
ENV PYTHONPATH=/app/src
ENV PORT=8000

# Expose the port
EXPOSE 8000

# Start the application
CMD ["pdm", "run", "python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"] 