#!/bin/bash
# Indique au système que l'argument qui suit est le programme utilisé pour exécuter ce fichier
# En règle générale, les "#" servent à mettre en commentaire le texte qui suit comme ici
case $1 in 
    clone )
	echo -e "\033[0;42mgit clone $2\033[0m"
	git clone $2;;
    push )
	echo -e "\033[0;42mgit add *\033[0m"
	git add *
	echo -e "\033[0;42mgit commit -m $2\033[0m"
	git commit -m $2
	if [ -n "$3" ]; then
	    echo -e "\033[0;42mgit push origin $3\033[0m"
	    git push origin $3
	else
	    echo -e "\033[0;42mgit push\033[0m"
	    git push
	fi;;
    pull )
	echo -e "\033[0;42mgit pull\033[0m"
	git pull;;
    merge )
	if [ -n "$2" ]; then
	    echo -e "\033[0;42mgit add $2\033[0m"
	    git add $2
	else
	    echo -e "\033[0;42mgit add *\033[0m"
	    git add *
	fi
	echo -e "\033[0;42mgit commit -m 'merge $2'\033[0m"
	git commit -m "merge $2"
	echo -e "\033[0;42mgit pull\033[0m"
	git pull;;
    *)
        echo -e "\033[0;41mCommande inconnue\033[0m"
	exit 1;;
esac 
echo -e "\033[0;43mMyGitCMD vous remercie!\033[0m"
exit 0
