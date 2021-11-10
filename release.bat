@echo off
xcopy "./source" "./crypto-com-better-wallet" /e /i /y /s
for /r ./crypto-com-better-wallet/data/js %%f in (*.js) do call uglifyjs %%f -o %%f
"%ProgramFiles%\WinRAR\WinRAR.exe" a -afzip -ep1 -ibck -r -y crypto-com-better-wallet.zip crypto-com-better-wallet/*
@RD /S /Q "./crypto-com-better-wallet"
