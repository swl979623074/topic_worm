@echo off
echo db start
"C:\Program Files\MongoDB\Server\3.4\bin\mongod.exe" -f .\conf\mongod.conf
pause