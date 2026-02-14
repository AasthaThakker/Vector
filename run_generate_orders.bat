@echo off
echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Running order generation script...
python generate_orders.py

pause
