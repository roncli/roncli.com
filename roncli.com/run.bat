#|| goto :windows
grunt $1
node index.js
exit
:windows
call grunt %1
node.exe index.js

