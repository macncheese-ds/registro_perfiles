@echo off
echo Iniciando aplicacion registro_perfiles...
echo.
echo Backend en puerto 6000
echo Frontend servido por nginx en puerto 6001
echo.
start "Backend - registro_perfiles" cmd /k "cd backend && npm start"
echo Backend iniciado
echo.
echo Para acceder a la aplicacion: http://localhost:6001
echo.
pause