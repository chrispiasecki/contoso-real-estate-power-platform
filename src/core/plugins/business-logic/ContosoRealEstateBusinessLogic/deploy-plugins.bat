:: Copyright (c) Microsoft Corporation.
:: Licensed under the MIT License.
@echo off
set package_root=..\..\
REM Find the spkl in the package folder (irrespective of version)
For /R %package_root% %%G IN (spkl.exe) do (
	IF EXIST "%%G" (set spkl_path=%%G
	goto :continue)
	)

:continue
@echo Using '%spkl_path%' 
REM spkl plugins [path] [connection-string] [/p:release]
"%spkl_path%" plugins "%cd%\.." %*

if errorlevel 1 (
echo Error Code=%errorlevel%
exit /b %errorlevel%
)

pause