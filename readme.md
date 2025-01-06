## INSTRUCTIONS
at http://52.62.53.91:3000/demo.html :

  1.	Load show 'Demo Show' on 'CONTROL SCREEN' 'SCORING' tab
2.	Use password 'password'
3.	Select 'SETTINGS' tab
4.	Enter the ID for the scoreboard screen
5.	Select 'PLAYERS' tab.
6.	Enter the ID for each player score screen
7.	Select 'BUTTON CONFIG' tab.
8.	Have each player visit the displayed link on their phone, preferably using mobile data network, not WiFi.
9.	On the page that opens, have each player type in their teams button ID.
	As each player joins, they can see their button light up on the control and scoreboard screen.
	There can be more than one button per team.
10.	Select the 'SCORING' tab.
11.	Click the 'START SHOW' button.
12.	As players buzz in to answer the question, others will be locked out.
	The options to reset for the next question are:
	 
	'CORRECT' - The value of 'Correct Value' input box will be added to team score.
	 
	'INCORRECT' - The value of 'Inorrect Value' input box will be added to team score.
	 
	'CLEAR' - No scores will change
	 
	'EXCLUDE INCORRECT' - will exclude the team, The value of 'Inorrect Value' input box will be added to team score, and open it up for other teams to answer.
	 
	'EXCLUDE CLEAR' - will exclude the team, and open it up for other teams to answer. Scores won't be changed.
	 
	'NEXT IN INCORRECT' - The value of 'Inorrect Value' input box will be added to team score. The next player who buzzed in will be selected.
	 
	'NEXT IN CLEAR' - The next player who buzzed in will be selected. Scores won't be changed.
# INSTALL INSTRUCTIONS
Create ba LAMP stack LightSail Server  
Putty SSH into server
  SSH->create tunnel port 8888 destination localhost:80 and press Add
  SSH->Credentials add ppk
  Add IP
  Connect


create folder /opt/bitnami/projects/gsb

sudo apt install nodejs npm

npm install express-ip

sudo npm install socket.io
sudo npm install --save-optional bufferutil utf-8-validate

run cat bitnami_application_password to get mysql pw

go to [localhost:](http://localhost:8888/phpmyadmin)
  username: root
  pw: from command above

create "gsb" database
import gsb db dump

in index.js, change the pw

upload "upload" directory contents to /opt/bitnami/projects/gsb 

run node index.js



