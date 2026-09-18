@echo off
title PORG 개발 서버 실행기
echo ========================================================
echo   PORG (대한민국 정치 조직도) 로컬 개발 서버를 시작합니다.
echo ========================================================
echo.

set PATH=C:\Users\Heisenbug\AppData\Local\Programs\nodejs;%PATH%
cd /d "C:\Users\Heisenbug\Documents\poliorg"

echo 브라우저를 엽니다...
start http://localhost:5173

echo 서버 구동 중... (이 창을 닫으면 서버가 종료됩니다)
npm run dev
