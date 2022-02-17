# How to rename UbiCast Moodle plugin

The UbiCast Moodle plugin has been renamed from mod_easycastms to mod_ubicast.
This document describes how to rename the plugin in your Moodle server without loosing any data.

## 1. Backup the database

Use the following command to create a dump file of your database. This dump file will not be used in next steps but it will allow you to restore the data if anything goes wrong.
The user name, database name and password can be found in your "config.php" file (usually in /var/www/moodle/config.php).

```bash
mysqldump -u moodle -p moodle > moodle-db.sql
```

## 2. Get the new module files

```bash
cd /var/www/moodle/mod
git clone https://github.com/UbiCastTeam/moodle-mod_ubicast.git ubicast
```

## 3. Apply the changes in Moodle frontend

With your browser go to:
https://[your-moodle]//admin/index.php

Click on "upgrade" and fill the Nudgis url, key and secret when asked.

## 4. Rename tables and in the database

The user name, database name and password can be found in your "config.php" file (usually in /var/www/moodle/config.php).

```bash
mysql -u moodle -p moodle
```

```sql
RENAME TABLE `mdl_easycastms` to `mdl_ubicast_tmp`;
RENAME TABLE `mdl_ubicast` to `mdl_easycastms`;
RENAME TABLE `mdl_ubicast_tmp` to `mdl_ubicast`;

-- in the following commands, [easycastms_id] is the result of this select:
SELECT `id` FROM `mdl_modules` WHERE `name` = 'easycastms';

-- in the following commands, [ubicast_id] is the result of this select:
SELECT `id` FROM `mdl_modules` WHERE `name` = 'ubicast';

UPDATE `mdl_course_modules` SET `module` = [ubicast_id] WHERE `module` = [easycastms_id];

exit
```

## 5. Remove the old module files

```bash
rm -r /var/www/moodle/mod/easycastms
```

## 6. Remove easycastms from Moodle plugins list

With your browser, go to:
https://[your-moodle]/admin/plugins.php

Click on "Uninstall" next to "easycastms".
