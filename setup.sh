#!/bin/bash

if ! command -v python &> /dev/null
then
    echo "Python not found! Please make sure Python is installed and added to the PATH."
    exit
fi

# Create a virtual environment
envName="venv"
if [ ! -d "$envName" ]; then
    echo "Creating virtual environment..."
    python -m venv $envName
else
    echo "Virtual environment already exists!"
fi

# Activate the virtual environment
echo "Activating virtual environment..."
source $envName/bin/activate

# Install dependencies
if [ -f "requirements.txt" ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
else
    echo "requirements.txt file not found!"
    exit
fi

# Run the application
if [ -f "app.py" ]; then
    echo "Running the application..."
    python app.py
else
    echo "app.py file not found!"
    exit
fi
