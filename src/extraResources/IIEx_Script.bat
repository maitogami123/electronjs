NET STOP iisadmin /y
NET STOP w3svc

del /s /q C:\inetpub\wwwroot\PrinterService\bin\x86\*.*
del /s /q C:\inetpub\wwwroot\PrinterService\PrinterService7.zip

bitsadmin /transfer AutoUpdateIIS /download /priority normal /dynamic %1% C:\inetpub\wwwroot\PrinterService\PrinterService7.zip


set PATH=%PATH%;C:\Program Files\7-Zip\
echo %PATH%
7z x -y -r C:\inetpub\wwwroot\PrinterService\PrinterService7.zip -oC:\inetpub\wwwroot\PrinterService

NET START iisadmin /y
NET START w3svc