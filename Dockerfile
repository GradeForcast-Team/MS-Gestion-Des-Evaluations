# Utilisez l'image officielle MySQL comme image de base
FROM mysql:5.7

# Copiez les fichiers de configuration personnalisés si nécessaire
# COPY custom.cnf /etc/mysql/conf.d/

# Exposez le port MySQL (par défaut, 3306)
EXPOSE 3306
