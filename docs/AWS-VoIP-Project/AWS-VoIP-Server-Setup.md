# AWS FreePBX / Asterisk VoIP Server Setup

## Overview

This guide walks through building a cloud-hosted VoIP PBX using:

* AWS EC2
* Ubuntu Linux
* Asterisk
* FreePBX
* SIP extensions
* Softphones
* Planned Voice VLAN integration

The purpose of this lab is to gain:

* VoIP experience
* Linux administration experience
* AWS experience
* SIP and RTP understanding
* PBX deployment skills
* Troubleshooting experience

---

# Final Architecture

```text
[Softphones / Endpoints]
          ↓
      Internet
          ↓
[AWS EC2 Ubuntu Server]
          ↓
      Asterisk
          ↓
       FreePBX
```

Planned future architecture:

```text
[Voice VLAN 20]
        ↓
     Router
        ↓
     Internet
        ↓
   AWS FreePBX
```

---

# Phase 1 — AWS Setup

## Step 1 — Create AWS Budget

Purpose:

* Prevent surprise charges
* Monitor free-tier usage

Navigate to:

```text
Billing & Cost Management → Budgets
```

Create:

* Cost Budget
* Monthly
* $5

Configure alerts:

* 20%
* 40%
* 80%
* 100%

Concepts Learned:

* AWS Budgets
* Unblended cost
* Entire account aggregation
* Billing alerts

---

# Phase 2 — Launch EC2 Instance

## Step 1 — Launch Ubuntu EC2 Instance

Navigate to:

```text
EC2 → Launch Instance
```

Settings:

| Setting       | Value                   |
| ------------- | ----------------------- |
| Name          | voip-pbx-lab-01         |
| AMI           | Ubuntu Server 24.04 LTS |
| Architecture  | x86_64                  |
| Instance Type | t2.micro                |

Concepts Learned:

* EC2 virtual machines
* AWS Free Tier
* x86_64 architecture
* ARM vs x86

:::warning
Avoid Ubuntu 26.04 LTS for now.

Ubuntu 26.04 currently ships PHP 8.5, which is not fully compatible with current FreePBX dependencies and bootstrap initialization.
:::

---

## Step 2 — Create SSH Key Pair

Create:

| Setting  | Value        |
| -------- | ------------ |
| Key Name | voip-lab-key |
| Type     | RSA          |
| Format   | PEM          |

Important:

* PEM file cannot be downloaded again
* Store securely

---

## Step 3 — Configure Security Group

Initial Rules:

| Type | Port | Source |
| ---- | ---- | ------ |
| SSH  | 22   | My IP  |

Important Concepts:

* Security Groups = virtual firewalls
* Avoid using:

```text
0.0.0.0/0
```

unless necessary.

---

# Phase 3 — Connect to Ubuntu Server

## Step 1 — Fix PEM Permissions

```bash
chmod 400 voip-lab-key.pem
```

Concept Learned:

* SSH rejects insecure private key permissions

---

## Step 2 — SSH Into Server

```bash
ssh -i voip-lab-key.pem ubuntu@PUBLIC_IP
```

Concepts Learned:

* SSH
* PEM authentication
* Default Ubuntu AWS user

---

## Step 3 — Update System

```bash
sudo apt update
sudo apt upgrade -y
```

Set timezone:

```bash
sudo timedatectl set-timezone America/New_York
```

Verify:

```bash
timedatectl
```

Concepts Learned:

* Linux package management
* apt repositories
* timezone configuration

---

# Phase 4 — Install Dependencies

## Install Web Stack and Build Tools

```bash
sudo apt install -y build-essential apache2 mariadb-server mariadb-client \
bison flex php php-cli php-curl php-mysql php-gd php-mbstring php-xml php-zip \
php-bcmath php-soap php-pear curl wget git sox libncurses5-dev libssl-dev \
libxml2-dev libsqlite3-dev uuid-dev libjansson-dev libedit-dev
```

## Verify PHP Version

```bash
php -v
```

Recommended:

| Version | Status |
|---|---|
| PHP 8.1 | Recommended |
| PHP 8.2 | Recommended |
| PHP 8.3 | Likely okay |
| PHP 8.5 | NOT compatible |

Concepts Learned:

- Runtime compatibility
- Dependency management
- Enterprise software support windows

Components:

| Component   | Purpose                |
| ----------- | ---------------------- |
| Apache      | Web server             |
| MariaDB     | Database               |
| PHP         | Web application engine |
| Build Tools | Compile Asterisk       |

---

# Phase 5 — Secure MariaDB

## Run MariaDB Hardening

```bash
sudo mariadb-secure-installation
```

Recommended selections:

| Prompt                     | Selection |
| -------------------------- | --------- |
| unix_socket authentication | Yes       |
| Change root password       | No        |
| Remove anonymous users     | Yes       |
| Disallow remote root login | Yes       |
| Remove test database       | Yes       |
| Reload privilege tables    | Yes       |

Concepts Learned:

* Database hardening
* Anonymous user removal
* Remote root restrictions

:::note
The above section is no longer necessary. Upon running this helper script, you get the following message- MariaDB is secure by default in Debian. Running this script is useless at best, and misleading at worst. This script will be removed in a future MariaDB release in Debian. Please read /usr/share/doc/mariadb-server/README.Debian.gz for details. Basically this is saying that on Debian (what Ubuntu is built off of) MariaDB already comes with the sane secure defaults-
- DB root login = local only (no allowed via remote connections)
- root auth via local Unix socket
- remote DB access not exposed
- The AWS security group that we are using doesn't allow MySQL/MariaDB inbound connections 
:::

---

# Phase 6 — Install Asterisk

## Download Asterisk Source

```bash
cd /usr/src
sudo wget http://downloads.asterisk.org/pub/telephony/asterisk/asterisk-20-current.tar.gz
```

---

## Extract Archive

```bash
sudo tar -xvf asterisk-20-current.tar.gz
```
- **-xvf**
	- x = Extract files from an archive
	- v = Verbosely list files processed
	- f = Use archive file or device ARCHIVE (--file=ARCHIVE)

Concepts Learned:

* tar archives
* gzip compression
* archive extraction

Flags:

| Flag | Meaning |
| ---- | ------- |
| x    | extract |
| v    | verbose |
| f    | file    |

---

## Configure Build

```bash
cd asterisk-20.*/
sudo contrib/scripts/install_prereq install
sudo ./configure
```

Concepts Learned:

* Dependency checks
* Makefiles
* Build environments

---

## Compile Asterisk

```bash
sudo make -j2
```

Concepts Learned:

* Source compilation
* Machine binaries
* Parallel jobs

Meaning of:

```text
-j2
```

* Run 2 parallel compilation jobs

---

## Install Asterisk

```bash
sudo make install
sudo make samples
sudo make config
sudo ldconfig
```

## Edit Asterisk Config

```bash
sudo nano /etc/asterisk/asterisk.conf
```
### Then explicitly verify/change:

```OLD (bad)
[directories](!)
NEW (required)
[directories]
```

## Verify Active Runtime Directories

```bash
sudo asterisk -rx "core show settings" | grep -i log
```

Expected:

```text
Log directory: /var/log/asterisk
```

:::note
ldconfig:

refreshes the Linux shared library cache
helps Asterisk find required libraries
is standard after compiling/installing software from source
:::

Concepts Learned:

* Binary installation
* Sample configurations
* Shared library cache
* Service registration

---

## Start Asterisk

```bash
sudo systemctl start asterisk
sudo systemctl enable asterisk
```

Verify:

```bash
sudo asterisk -rvvv
```
Meaning of the Above Command:

- launches the live Asterisk command-line interface (CLI) and attaches you to the running PBX process with increased verbosity
- r = remote console
- vvv = verbosity level 3 (troubleshooting)

Exit:

```bash
exit
```

Concepts Learned:

* Asterisk CLI
* PBX debugging
* Linux services

---

# Phase 7 — Configure Asterisk User Permissions

## Verify Asterisk User Exists

```bash
id asterisk
```

If missing:

```bash
sudo useradd -m asterisk
```

:::note
The **-m** flag creates the users home directory if it does not already exist
:::

---

## Configure Ownership

```bash
sudo chown asterisk:asterisk /var/run/asterisk
sudo chown -R asterisk:asterisk /etc/asterisk
sudo chown -R asterisk:asterisk /var/{lib,log,spool}/asterisk
sudo chown -R asterisk:asterisk /usr/lib/asterisk
```
:::tip
you can verify ownership of a file/directory by using the following:
```bash
ls -l <insert-file-or-dir-name>
```
:::

Concepts Learned:

* Linux ownership
* Recursive ownership (-R flag)
* user:group syntax

Important:

```text
user.group
```

is deprecated.

Modern syntax:

```text
user:group
```

---

## Configure Asterisk Runtime User

```bash
sudo sed -i 's/^#AST_USER="asterisk"/AST_USER="asterisk"/' /etc/default/asterisk
sudo sed -i 's/^#AST_GROUP="asterisk"/AST_GROUP="asterisk"/' /etc/default/asterisk
sudo sed -i 's/^;runuser = asterisk/runuser = asterisk/' /etc/asterisk/asterisk.conf
sudo sed -i 's/^;rungroup = asterisk/rungroup = asterisk/' /etc/asterisk/asterisk.conf
```

:::note
- sed = stream editor (cli text editor)
- "-i" = in-place editing
- "s/^ = subtitution at start of line
- these sed expression find and replace text in the asterisk config files
:::

### What is a Runtime User?

- The runtime user is the user identity a service is tied to when it is running
- This is important because it dictates the permissions a services has, the files it can read and or write to, and the processes it can access
- runtime users are usually configured in systemctl service files or in application config files

Restart:

```bash
sudo systemctl restart asterisk
```

Verify:

```bash
ps aux | grep asterisk
```

Concepts Learned:

* Service runtime users
* Linux process inspection

---

# Phase 8 — Install FreePBX

## Download FreePBX

```bash
cd /usr/src
sudo wget https://mirror.freepbx.org/modules/packages/freepbx/freepbx-17.0-latest.tgz
```

---

## Extract FreePBX

```bash
sudo tar -xvzf freepbx-17.0-latest.tgz
cd freepbx
```

---

## Install Node.js

FreePBX required Node.js.

Install:

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```
### Breaking down the curl command:

- curl = tool for making HTTP requests and retreiving files
- f = fail silently on HTTP errors
- s = silent mode
- S = show actual failures/errors
- L = follow redirects (important because many download URLs redirect)
- URL = bash script for setup, configures apt repos, doesn't install node
- | = pipe, a logical operator for feeding output into another command
- sudo -E bash - = root, preserve env variables, run bash, read from stdin (standard input), (-) reads commands from pipe

Verify:

```bash
node -v
```

Concepts Learned:

* Node.js dependencies
* NodeSource repository
* LTS versions

---

## Verify Asterisk CLI

```bash
sudo asterisk -rvvv
```

Expected:

```text
Asterisk CLI>
```

If this fails:
DO NOT continue with FreePBX installation.

## Run FreePBX Installer

```bash
sudo ./start_asterisk start
sudo ./install -n --user asterisk --group asterisk
```

Concepts Learned:

* Non-interactive installers
* PBX initialization

---

# Phase 9 — Apache and FreePBX Setup

## Problem — Ubuntu Default Apache Page

Cause:

```text
/var/www/html/index.html
```

Fix:

```bash
sudo rm /var/www/html/index.html
```

---

## Problem — FreePBX Blank Page

Error:

```text
Class "FreePBX" not found
```

Cause:

* Apache could not read:

```text
/etc/freepbx.conf
```

Fix:

```bash
sudo usermod -aG asterisk www-data
sudo systemctl restart apache2
```

Concepts Learned:

* Apache users
* Linux groups
* FreePBX bootstrap process

## What is FreePBX Bootstrap?

FreePBX uses a bootstrap process to initialize:

- PHP classes
- database connections
- modules
- logging
- runtime configuration

Main bootstrap file:

```php
require_once('/var/www/html/admin/bootstrap.php');
```

If bootstrap initialization fails:
- fwconsole fails
- GUI fails
- module loading fails

---

## Problem — Setup Page Loop

Fix:

```bash
sudo fwconsole chown
sudo fwconsole reload
sudo systemctl restart apache2
```

Concepts Learned:

* FreePBX ownership repair
* Module permissions

---

## Problem — Apache Running as Wrong User

Error:

```text
Trying to edit user asterisk, when I'm running as www-data
```

Fix:

```bash
sudo sed -i 's/^export APACHE_RUN_USER=.*/export APACHE_RUN_USER=asterisk/' /etc/apache2/envvars
sudo sed -i 's/^export APACHE_RUN_GROUP=.*/export APACHE_RUN_GROUP=asterisk/' /etc/apache2/envvars
sudo systemctl restart apache2
```

Concepts Learned:

* Apache runtime users
* FreePBX permission model

---

# Phase 10 — Access FreePBX

## Open HTTP in Security Group

Add inbound rule:

| Type | Port | Source |
| ---- | ---- | ------ |
| HTTP | 80   | My IP  |

---

## Access GUI

```text
http://PUBLIC_IP
```

Select:

```text
FreePBX Administration
```

Complete initial setup.

---

# Phase 11 — Create SIP Extension

Navigate to:

```text
Applications → Extensions
```

Create:

| Field        | Value        |
| ------------ | ------------ |
| Type         | PJSIP        |
| Extension    | 1001         |
| Display Name | Tom          |
| Secret       | Password123! |

Apply configuration.

Concepts Learned:

* SIP endpoints
* PJSIP
* Authentication credentials

---

# Phase 12 — VoIP Concepts Learned

## SIP

Purpose:

* signaling
* registration
* call setup

Default Port:

```text
UDP 5060
```

---

## RTP

Purpose:

* audio streams

Ports:

```text
UDP 10000-20000
```

---

# SIP Security Considerations

Internet-exposed PBXs are heavily targeted.

Risks include:

- SIP scanners
- brute-force attempts
- toll fraud
- malicious registrations

Preferred lab Security Group rules:

| Protocol | Port | Source |
|---|---|---|
| UDP | 5060 | My IP |
| UDP | 10000-20000 | My IP |

Avoid:

```text
0.0.0.0/0
```

---

## Asterisk

Purpose:

* PBX engine
* call routing
* voicemail
* IVRs

---

## FreePBX

Purpose:

* GUI management layer
* extension management
* routing configuration

---

# Phase 13 — Voice VLAN Planning

Planned VLAN design:

```text
VLAN 10 = Data
VLAN 20 = Voice
```

Concept Learned:

AWS does not provide traditional layer-2 switching behavior.

Voice VLAN should exist:

* locally
* on switches/routers
* not inside AWS

Planned architecture:

```text
[Softphone VLAN 20]
          ↓
       Router
          ↓
      Internet
          ↓
     AWS FreePBX
```

---

# Phase 14 — Softphone Planning

Explored:

| Softphone | Notes               |
| --------- | ------------------- |
| Linphone  | Best Linux option   |
| Zoiper    | Real-world popular  |
| MicroSIP  | Lightweight Windows |

Decision:

* Debian GUI VM for softphone testing

Concept Learned:

Proxmox itself does not require a GUI.
Only the softphone VM requires a desktop environment.

---

# Phase 15 — AWS Shutdown and Cost Control

## Stop Instance Safely

Navigate to:

```text
EC2 → Instances → Instance State → Stop Instance
```

Important:

| Action    | Result                |
| --------- | --------------------- |
| Stop      | Preserve VM and data  |
| Terminate | Delete VM permanently |

Concepts Learned:

* Stopped instances do not incur compute charges
* EBS storage remains
* Storage cost is minimal

---

