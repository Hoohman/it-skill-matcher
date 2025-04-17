if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Python not found! Please make sure Python is installed and added to the PATH."
    exit
}

# Создание виртуального окружения
$envName = "venv"
if (-Not (Test-Path $envName)) {
    Write-Host "Creating virtual environment..."
    python -m venv $envName
} else {
    Write-Host "Virtual environment already exists!"
}

# Активация виртуального окружения
Write-Host "Activating virtual environment..."
. .\$envName\Scripts\Activate.ps1

# Установка зависимостей
if (Test-Path "requirements.txt") {
    Write-Host "Installing dependencies..."
    pip install -r requirements.txt
} else {
    Write-Host "requirements.txt file not found!"
    exit
}

# Запуск приложения
if (Test-Path "app.py") {
    Write-Host "Running the application..."
    python app.py
} else {
    Write-Host "app.py file not found!"
    exit
}
