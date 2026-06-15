---
sidebar_label: 'Cisco Duo - MFA For Windows'
sidebar_position: 1
---

import A from './Project-images/image.png';
import B from './Project-images/image-1.png';
import C from './Project-images/image-2.png';
import D from './Project-images/image-3.png';
import E from './Project-images/image-4.png';
import F from './Project-images/image-5.png';
import G from './Project-images/image-6.png';
import H from './Project-images/image-7.png';
import I from './Project-images/image-8.png';
import J from './Project-images/image-9.png';
import K from './Project-images/Passwordless-Requirements.png';

# Cisco Duo - MFA for Windows RDP and Local Logon Events

---

## Step 1 - Admin Console Access and Admin Accounts

- Log into the Duo Admin Console
- If you are the only administrator, it is reccomended that you create another admin account with **Owner** permissions
    - This is a redundancy measure to ensure that you and your organization do not get locked out of Duo

### Creating an Administrator Account:

1. On the side ribbon, navigate to **Users → Administrators → (Manage) Administrators**
2. In the top right, select the **Add Administrator** button
3. Enter their **Name**
4. Enter their **Email address**
5. For the **Role** select **Owner**
6. Scroll Down to the bottom of the page, find the section titled **Complete account setup**
7. Make sure the to check the box next to **Automatically send an account setup link via email**
8. Select **Add Administrator**

:::note
After these steps the new adminstrator user will receive a Duo invite email with instructions on how to complete account setup
:::

## Step 2 - Add Microsoft RDP as Protected Application in the Duo Admin Console

:::note
The term **Microsoft RDP** is slightly misleading. In the context of Duo, **Microsoft RDP** is the application you want to add to Duo if your goal is add MFA to local Windows logons AND remote (RDP) Windows logons for protected workstations and servers within your organization.
:::

### Adding Microsoft RDP to Duo

1. On the side ribbon, navigate to **Applications → (Manage) Applications**
2. In the top right, select the **Add application** button
3. From the **Application Catalog**, in the search bar, type:

```cmd
Microsoft RDP
```

4. Select the **Add** button (You will be taken to the Application Configuration Page)
5. **Optional/Recommended:** in the **Application name** feild, Change the name to something more intuitive (i.e. Windows Logon MFA)
6. Under the **Settings** section, in the **Username normalization** field, ensure **Simple** is selected
7. At this point, all other options can be left in the default configuration. Select the **Save** button

## Pause Here - Progress Report and Looking Ahead

### So Far...

- We have created additional **Admin-Owner** accounts for operational efficiency and to ensure Admin Console availability
- We have added the **Microsoft RDP (Windows Logon MFA)** application to the Duo Admin Console
- At this point, no end users and no production machines are being affected yet

### Overview of Next Steps

- Configure Application Policies- the policy will dictate what the end user experience looks like and the security features that the organization takes advantage of
- Add/Enroll End Users- We will use the Duo Authentication Proxy Application to connect an on-prem Windows Domain Controller to Duo, prepare our Active Directory environment, and add our end users to Duo via a federated external directory sync
- Monitor and Facilitate User Enrollment- Coordinate with customer operation contacts to schedule user enrollment deadlines, have customer contacts provide up-to-date company directory and org charts, assist end users with enrollment questions
- Deploy Duo endpoint software via bat script, push script to endpoints via GPO (Group Policy Object) OR RMM software (Remote Monitoring and Management software)

:::note
The Duo Microsoft RDP application does not support user **self-enrollment**. Users will need use the enrollment email to find instructions for installing the Duo Mobile application and activating the application for use with their organization. Optionally, administrators are able to send the enrollment links via text message- this process will be covered later in the guide in detail.
:::

:::tip
Always add/enroll end users prior to deploying the Duo endpoint software. This will lessen or prevent the amount of user help desk requests related to being locked out of their workstations.
:::

## Step 3 - Configure Windows Logon Application Policies

### Understanding the Global Policy vs. Custom Policies

- **Global Policy** = Default policy that is applied if there is no Specific Policy in place
    - "The fallback policy for all applications, users, and groups"
- **Custom Policy** = A policy that is created and applied to a specific **application** and/or **group**
    - Custom policies override the Global policy. They take precedence.

### Policy Logic

```txt
For each section in a custom policy
                ↓
If the section has a custom rules/configuration → Then override the Global Policy for the app/group
                ↓
If the section has been skipped or left default → Then do whatever the Global Policy says
```

:::tip
if you are only planning on protecting one application with Duo, you can make all of your policy configuration in the Global policy. If you intend on using Duo to protect multiple applications, it is recommended that you create custom policies that are specific to each application for better granularity. 
:::

### Configure Application Policy for Windows Logon:

1. On the side ribbon, navigate to **Policies → Policies**
2. On the Policies overview page, in the top right corner, select the **Add Policy** button (This will open the Policy Editor)
3. **Name & details**, enter a descriptive **Policy name** (i.e. Windows Logon MFA)
4. **New user policy**, toggle the slider to enable this section. select the **Require enrollment** option
5. **Authentication policy**, toggle the slider to enable this section. select the **Enforce MFA** option
6. Skip **Trusted Endpoints** and **Duo Desktop** - these sections can be revisited in the future, if needed
7. **Remembered devices**, toggle the slider to enable this section. select the **Remember devices for Windows Logon** option
    - In the textbox labeled **Always remember devices from these networks:** enter the public IP address or address range in CIDR notation
    - Note: If your org does not have a static IP assigned to them from the ISP, Dynamic DNS would need to be tested and implemented
    - Note: For an organization with a remote workforce, a broader regional Public IP block may need to specified, or a remote access VPN (testing required)
    - Under **Remember devices for Windows Logon for up to:**, enter a time frame that makes sense for your org
8. Skip **Authorized networks** - can be revisited in the future, if needed
9. **Authentication methods**, toggle the slider to enable this section. 
    - Under the **Second-factor authentication (2FA)** section, uncheck all ACCEPT:
        - **Duo Mobile Push** - **Require a Verified Duo Push** - **Require users to enter a verification code**
        - **Bypass code**
10. Select the **Save** button in the bottom left of the Policy Editor to save and return to Policies Overview
11. From the Policies Overview, Find the newly created policy, and navigate to the far right column. Select **Actions → Apply** (See screenshot)
<img src={A} style={{ width: "600px" }} />
12. From the **Apply Policy** page, select **Application policy**, then check the box next to your **Microsoft RDP** Application

## Step 4 - Sync Active Directory Users with Duo

:::tip
Connecting Active Directory to Duo requires the install and use of the Duo Authentication Proxy. For Windows environments, the minimum OS version is Windows Server 2016
:::

1. Log into the machine that will host the Duo Authentication Proxy application (Log in with Domain Admin credentials)
2. Use the following link to install download the executable for the latest version of the Duo Authentication Proxy:
    - https://dl.duosecurity.com/duoauthproxy-latest.exe
3. Launch the installer, Click through the install wizard- On the **Choose Components** screen, make sure the **Proxy Manager** is selected

:::tip
Proxy Manager is a useful application for editing the auth proxy config, determining the proxy status, and starting/stopping the proxy service
:::

4. After you have the Duo Authentication Proxy manager open on target machine, navigate back to the Duo Admin Console
5. Navigate to **Users → (Configure) External Directories**
6. In the top right, select **Add External Directory**, then select **Active Directory** from the drop down menu
7. On the **AD Sync Connection** Page, you will see **3 main parameters:**
    - **Integration Key** = an object needed to properly identify the Duo application
    - **Secret Key** = Treat this like a password. Store in a secure location
    - **API hostname** = The Duo cloud endpoint for your tenant
8. Under **Configuration metadata**, appended to end of step 2, select the link- **download a pre-configured file** (see screenshot)
<img src={B} style={{ width: "600px" }} />
9. After the file downloads, open it in a text editor and copy the contents to the Duo Authentication Proxy manager back on your Authentication Proxy host (see screenshot, note: my connection paramaters have been redacted for privacy/security)
<img src={C} style={{ width: "600px" }} />
10. Back in Duo, on the **AD Sync** enter the IP address of the **Domain Controller(s)**, followed by the **Port**
    - **LDAP** = Lightweight Directory Access Protocol (Cleartext), **Port 389**
11. Enter the **Base DN**
    - **DN** = Distinguished Name
    - A Distinguished Name is the full LDAP path to an object in Active Directory
    - The Base DN tells the LDAP application to start searching for objects from a specific location within AD
    - For Duo AD Sync, it is recommended to use the DN of the directory root. **Example:** domain.local = DC=domain,DC=local
    - If you are not sure what value to enter or want to double check, you can run the following Powershell command on your DC:
    ```Powershell
    Get-ADDomain | Select-Object DistinguishedName
    ```
12. **Authentication type** = **Integrated**
    - This is the option to select if you are hosting the Auth. Proxy on a machine that joined to the domain in question
13. **Transport type** = **Clear**
    - Leave this selection default unless your Auth. Proxy host's connection to the DC is encyrpted
    - **Note:** The traffic between Duo and the Auth. Proxy is encrypted, this is the setting for communciation betwwen the Auth. Proxy and the on-prem DC
14. Go back to your Auth. Proxy host and return to the Auth. Proxy Manager. In the bottom left corner of the window, select the **Validate** button. This tests the Proxy's connection to the Cloud. If everything went well, the software will return the following **Output:**
<img src={D} style={{ width: "600px" }} />
15. On the **Domain Controler**, open **Active Directory Users and Computers**, right click the white space to open the shortcut menu, select **New → Group**. Name the group (i.e. Duo-Users), **Scope = Global**, **Group type = Security**, Select **OK**
    - Alternatively, you can run this command from an elevated Powershell prompt:
    ```Powershell
    New-ADGroup `
     -Name "Duo-Users" `
     -SamAccountName "Duo-Users" `
     -GroupScope Global `
     -GroupCategory Security `
     -Path "OU=Groups,DC=yourdomain,DC=local"
    ```
16. In AD, add all of your users to the Duo User group
    - right-click user, select **add to a group...***, Enter the object name **Duo-Users**, select **Check Names** for verification, then **OK**
17. (Optional) - If your AD environment does not contain the email attribute for domain users, run a powershell script to dynamically add each user's email address. 
- **Note:** Duo MFA for Windows logon (AKA Microsoft RDP) requires users to complete enrollment via email invite (or text message- more on that later). Duo can automate the email invites by sending the invite to each email pulled in from the AD Sync.
- https://github.com/Thomas-Barnett/Cisco-Duo-Helper-Scripts/blob/main/AD-bulk-email-address-update.ps1
- The link above, goes to a script I wrote for this task. It takes the **sAMAccountName for each user, appends "@" + domain-used-for-email, then adds this string to the email field of the respective AD User.

18. Once the configuration is validated and your AD Environment is prepped, select the the **Start Service** button at the top of the window. Your Auth. Proxy Manager application should display a message that reads: **Authentication Proxy service started** (see screenshot)
<img src={E} style={{ width: "600px" }} />
19. Back in Duo, in the top right of your screen, you should see an updated **Status** and a **Save** button. Select **Save** and notice the **Status** change to **Connected** as seen below:
<img src={F} style={{ width: "600px" }} />
20. In the top right of your screen, under **Connected Directory Syncs**, Select the link- **AD Sync**
<img src={G} style={{ width: "600px" }} />
21. Select your Duo-Users AD Group from the dropdown under **Groups**
22. Leave everything else on this page as default except for checking the following boxes:
    - **Import notes** = this is optional, but notes can be helpful if your AD environment contains user verification passphrases. This would be something IT admins would set up to authenticate end-users that call into Help Desk requesting bypass codes or other assistance.
    - **Enrollment Email** = sends enrollment emails to the synced users
23. In the top right corner, select **Complete Setup**
24. Optional, but reccomended - Manually trigger your first sync, but selecting the **Sync Now** button, located under the **Sync Controls** header
    - **Note:** by default, an AD Sync will occur every 12 hours. This can be paused if needed, and you can also enable **Automatic sync frequency** to have the sync run every 30 minutes.

25. Navigate to **Users → (Manage) Users**. You should see a list of new users that reflect each user in your Duo-Users AD Group

## Step 5 - Employee Enrollment Period 

### Reminder-

It is best if all users are enrolled prior to deploying the Duo Windows Logon client to each workstation.

### Monitoring Erollment

- Navigate to **Users → (Manage) Users**
- From here you can see all of the users and their status
- Selecting **Not enrolled** will show you the users that have not yet set up and installed the **Duo Mobile** Application 
<img src={H} style={{ width: "600px" }} />

### Text Message Enrollment Invite (Optional)

:::tip
This is a good option for assisting specific end-users that have not enrolled yet. Or users that are not good at checking email, etc.
:::

1. Navigate to **Users → (Manage) Users**
2. Select the target user
3. Scroll down to the **Phones** section
4. Select **Add Phone**
5. On the **Add Phone** page, **Type** = **Phone**, Enter the end-user's phone number (must be mobile phone)
6. Select **Add Phone**
7. Under **Device Info**, select **Activate Duo Mobile**
<img src={I} style={{ width: "600px" }} />
8. On the **Activate Duo Mobile** page, verify phone number and select activation code **Expiration** timeline
9. Select **Generate Duo Mobile Activation Code** button
10. In the **Send links via** section select **SMS**
11. **Check** the box next to **Installation instructions**
12. **Uncheck** the box next to **Activation instructions**
13. Select the **Send Instructions by SMS**button

:::note
So far, all we are doing is sending the end-user a text, telling them to install the application. we are holding off on sending them the actication instructions until the app is installed because some users get confused and try to use the activation link prior to install the app (which obviously does not work)
:::

14. Once the user has the application installed on their phone, **repeat steps 7-10**
15. (This time) **Uncheck** the box next to **Installation instructions** and **Check** the box next to **Activation instructions**
16. Select the **Send Instructions by SMS**button

:::note
At this point, the end-user will receive a second text with a link. Once they tap the link, it will open the Duo app where they will be prompted to add the auth token
:::

17. Once the end-user has done their part, their user account will be in the enrolled state, and you will be able to see their mobile device information listed under **Device Info**
<img src={J} style={{ width: "600px" }} />

## Step 6 - (Optional) Passwordless for OS Logon

### What is Passwordless?

Duo Passwordless for Windows OS Logon lets users sign in to their computer without manually entering their password. Instead, the password is securely escrowed and protected through Duo Mobile, where encryption keys are used to decrypt the stored credential only when authentication is approved. During logon, Duo automatically triggers a Bluetooth-based push to the user’s mobile device, requiring biometric verification or a PIN before the Windows session is established. This improves user convenience while reducing the risk of stolen passwords being used to compromise an endpoint or escalate privileges.

:::tip
Passwordless uses bluetooth proximity as one of the authentication methods, which means that there are certain hardware considerations to make before deploying. I recommend checking out the **Requirements** listed in Cisco's documentation (screenshot below) located here: https://duo.com/docs/rdp#passwordless-for-operating-system-os-logon
:::

<img src={K} style={{ width: "600px" }} />

### Steps for Configuring Passwordless

1. Navigate to **Users → (Manage) Groups**
2. Top right of screen, select **Add group**
3. Name group, and add description (i.e. Passwordless Users)
4. Select the **Add Group** button
5. Scroll down and select **Add users to group**
6. Select your users, and select **Add to group**
    - **Note:** you will only be able to select enrolled users
7. Navigate to **Applications → (Manage) Applications**
8. Select your Windows Logon Application
9. Scroll down to **Passwordless Settings**
10. Check both boxes: **Passwordless for OS Logon** and **Limit access by groups**
11. Under **Limit access by groups**, select your user group
12. Save

### End-User Experience: Completing Passwordless Set Up on Device

1. At the Windows logon screen, select **Log in without a password**
2. Select **Continue**
3. Select **Set up mobile device**
4. Select your mobile device from the list

   * **Note:** choose the phone that has the **Duo Mobile** app installed
5. When prompted with **Set up in just two steps**, select **Continue**
6. Make sure **Bluetooth** is turned on for both your computer and mobile device
7. Keep your mobile device close to your computer
8. Select **Check for push**
9. On your mobile device, open the **Duo Mobile** app if it does not open automatically
10. If prompted for nearby device permissions, select **Allow**
11. In the Duo Mobile app, review the request and select **Approve**
12. Return to your computer and allow the setup process to finish
13. Once setup is complete, you can use **Duo Passwordless** for Windows logon

## Step 7 - Deploy Duo Endpoint Software via GPO Startup Script (or RMM)

:::tip
Before deploying the Duo Windows Logon client, make sure users have already been added to Duo and have completed enrollment. This will help prevent end users from being locked out of their workstations after the endpoint software is installed.
:::

The Duo Windows Logon client can be deployed to domain-joined workstations using a **GPO startup script**. In this deployment method, a batch file runs during computer startup, installs the required Visual C++ Redistributable, installs the Duo Windows Logon client silently, and writes logs to the local workstation.

### Prepare SYSVOL Deployment Folder

1. On the Domain Controller, create a folder in SYSVOL for the Duo deployment files

    Example:

    ```cmd
    \\lab.local\SYSVOL\lab.local\scripts\duo
    ```

2. Copy the following files into the folder:

    ```cmd
    VC_redist.x64.exe
    duo-win-login-5.2.1.exe
    install-duo.bat
    ```

3. Confirm that domain computers are able to read the SYSVOL folder

    ```cmd
    dir \\lab.local\SYSVOL\lab.local\scripts\duo
    ```

:::note
The startup script runs under the computer context, not the currently logged-in user. If the computer account cannot read the SYSVOL path, the deployment will fail.
:::

### Startup Script Overview

The deployment uses the following batch script:

```cmd
duo-deploy.bat
```

**Link to Script:** https://github.com/Thomas-Barnett/Cisco-Duo-Scripts/blob/main/duo-deploy.bat

At a high level, the script does the following:

1. Creates or appends to the local log file:

    ```cmd
    C:\Windows\Temp\duo_install.log
    ```

2. Checks whether Duo is already installed by looking for:

    ```cmd
    C:\Program Files\Duo Security\DuoCredProv\DuoCredProv.dll
    ```

3. If Duo is already installed, the script exits without making changes
4. Installs the Visual C++ Redistributable silently
5. Installs the Duo Windows Logon client silently
6. Passes the required Duo application values to the installer:
    - `IKEY`
    - `SKEY`
    - `HOST`
7. Writes installation output to the local log file

:::note
The Duo `SKEY` is sensitive. Treat it like a password. Do not upload the script to GitHub, public documentation, shared screenshots, or unsecured file storage.
:::

### Duo Installer Options Used

The script uses the following Duo installer options:

```cmd
AUTOPUSH="#1"
FAILOPEN="#0"
SMARTCARD="#0"
RDPONLY="#0"
```

| Option           | Purpose                                      |
| ---------------- | -------------------------------------------- |
| `AUTOPUSH="#1"`  | Automatically sends a Duo Push               |
| `FAILOPEN="#0"`  | Blocks logon if Duo cannot be reached        |
| `SMARTCARD="#0"` | Does not allow smart card as a Duo bypass    |
| `RDPONLY="#0"`   | Protects both local console and RDP logons   |

:::tip
If the organization only wants to protect RDP logons, change `RDPONLY="#0"` to `RDPONLY="#1"`.
:::

### Create and Link the GPO

1. Open **Group Policy Management**
2. Create a new GPO

    Example:

    ```cmd
    Deploy Duo Windows Logon
    ```

3. Link the GPO to a test OU first
4. Move one or two test computers into the test OU
5. Right-click the GPO and select **Edit**
6. Navigate to:

    ```cmd
    Computer Configuration → Policies → Windows Settings → Scripts → Startup
    ```

7. Select **Add**
8. Browse to the Duo batch script in SYSVOL

    Example:

    ```cmd
    \\lab.local\SYSVOL\lab.local\scripts\duo\install-duo.bat
    ```

9. Save and close the Group Policy editor

:::note
The startup script must be configured under **Computer Configuration**, not **User Configuration**. Duo installs at the machine level and needs to run during computer startup.
:::

### Test the Deployment

1. On a test workstation, run:

    ```cmd
    gpupdate /force
    ```

2. Reboot the workstation:

    ```cmd
    shutdown /r /t 0
    ```

3. After reboot, check the local log file:

    ```cmd
    C:\Windows\Temp\duo_install.log
    ```

4. Confirm the log shows that the script started, installed VC++, installed Duo, and finished deployment

### Verify Duo Installation

1. Confirm the Duo Credential Provider DLL exists:

    ```cmd
    C:\Program Files\Duo Security\DuoCredProv\DuoCredProv.dll
    ```

2. You can also verify from Command Prompt:

    ```cmd
    dir "C:\Program Files\Duo Security\DuoCredProv\DuoCredProv.dll"
    ```

3. Confirm that the Duo prompt appears during local Windows logon or RDP logon

:::tip
Because the script checks for `DuoCredProv.dll`, future reboots should not repeatedly reinstall Duo if the client is already installed.
:::

### Troubleshooting

If Duo does not install, check the local deployment log:

```cmd
C:\Windows\Temp\duo_install.log
```

If the GPO does not appear to apply, run:

```cmd
gpresult /r /scope computer
```

Or generate a full report:

```cmd
gpresult /h C:\Windows\Temp\gpresult.html
```

Common causes include:

- The computer is not in the correct OU
- The GPO is linked to the wrong OU
- The startup script was added under **User Configuration** instead of **Computer Configuration**
- The computer account cannot read the SYSVOL deployment folder
- The Duo installer filename in the script does not match the actual installer filename in SYSVOL
- The `IKEY`, `SKEY`, or `HOST` values are incorrect
- The workstation cannot reach Duo over outbound TCP 443

### Rollout Recommendation

After testing is successful, roll out gradually:

1. Test workstation
2. IT workstation
3. Small pilot group
4. Remaining workstations
5. Servers last

:::caution
Be careful deploying Duo to servers, domain controllers, or remote-only systems. Confirm that you have console access, local administrator access, and a recovery plan before enforcing Duo on critical systems.
:::

### For MSPs using an RMM platform

- **RMM** = Remote Monitoring and Management
- **Reccomendation:**
    - If you are using an RMM to manage endpoints, and if that RMM has a scripting feature, the best method of deployment is put the .bat script in the RMM and deploy the script in bulk to each workstation that needs it.

---

## Troubleshooting and Recovery

---

## Remove Duo Authentication for Windows Logon from Safe Mode

### Why This May Be Necessary

Duo Authentication for Windows Logon installs a Windows credential provider that runs during local and RDP logons. If Duo is misconfigured or cannot complete authentication, an administrator may be unable to log into the device normally to repair or uninstall the application.

Common situations that may require this recovery process include:

* An incorrect **Integration Key**, **Secret Key**, or **API hostname** was used during deployment
* The Duo application was deleted or changed in the Duo Admin Console while endpoints were still using it
* The device cannot reach Duo's cloud service and the client is configured to **fail closed**
* The affected administrator is not enrolled in Duo, or their Windows username does not match their Duo username
* A damaged or incomplete Duo installation prevents the Windows logon screen from working correctly

Booting into Safe Mode starts Windows with a limited set of drivers and services. Duo Authentication for Windows Logon does not protect Safe Mode logons, allowing an authorized administrator to sign in with a Windows administrator account and recover the device.

### Boot into Safe Mode

1. Boot the device into the **Windows Recovery Environment (Windows RE)**
2. Select **Troubleshoot → Advanced options → Startup Settings → Restart**
3. After the device restarts and displays the **Startup Settings** screen, press **4** or **F4** to select **Enable Safe Mode**
4. Log into Windows with an administrator account

### Disable the Duo Credential Provider

From an elevated Command Prompt, run the following commands for Duo Authentication for Windows Logon version **2.0.0 or later**:

```cmd
regsvr32 /u "C:\Program Files\Duo Security\WindowsLogon\DuoCredProv.dll"
regsvr32 /u "C:\Program Files\Duo Security\WindowsLogon\DuoCredFilter.dll"
```

These commands unregister Duo's credential provider DLLs from Windows. This disables Duo's integration with the Windows logon process, but it does **not** completely uninstall the Duo application.

### Enable Windows Installer in Safe Mode

The Windows Installer service, also called **MSIServer**, does not run in Safe Mode by default. Run the following commands from an elevated Command Prompt to allow MSI-based applications to be removed while using regular Safe Mode:

```cmd
reg add "HKLM\SYSTEM\CurrentControlSet\Control\SafeBoot\Minimal\MSIServer" /ve /t REG_SZ /d "Service" /f
net start msiserver
```

If the device was booted using **Safe Mode with Networking** instead, use the following commands:

```cmd
reg add "HKLM\SYSTEM\CurrentControlSet\Control\SafeBoot\Network\MSIServer" /ve /t REG_SZ /d "Service" /f
net start msiserver
```

### Uninstall Duo and Return to Normal Windows

1. Open **Control Panel → Programs → Programs and Features**
2. Select **Duo Authentication for Windows Logon**
3. Select **Uninstall** and complete the uninstall process
4. Restart the device normally
5. Verify that you can log in without receiving a Duo prompt
6. Correct the original deployment, account-enrollment, policy, or connectivity issue before reinstalling Duo

### Reference Documentation

* [Microsoft - Windows Startup Settings](https://support.microsoft.com/en-us/windows/windows-startup-settings-1af6ec8c-4d4a-4b23-adb7-e76eef0b847f)
* [Cisco Duo - Disable or Uninstall Duo Authentication for Windows Logon in Safe Mode](https://help.duo.com/s/article/1088?language=en_US)

---

### Situation: User Loses or Forgets Phone

Given our setup, if a user doesn't have their phone, they will not be able to authenticate to their device and will be locked out. 

### Proposed Solution 1: Temporary Bypass Code

With this solutions, the user will just need to contact their IT help desk and request a **bypass code**. A bypass code is a generated string of characters that can be given to the user to allow them to get into the device. It can be configured to only work for a set number of times or only within a certain time frame. 

:::warning
For IT Help Desk technicians and administrators- To maintain good operational security, it is best have a way to verify the user over the phone priror to providing them a means of unlocking the device. One way of doing this is to poll each user prior to deployment, and as them to provide a 6 digit security PIN. This PIN can be added to the User's notes within Active Directory.
:::

### Steps for Setting Up a Bypass Code:

1. Navigate to **Users → (Manage) Users**
2. Select the user that needs the bypass code
3. Scroll down to **Bypass Codes**, Select **Add Bypass Code**
4. Configure the bypass code as you see fit
5. Select **Generate Code**
6. Back on the user page, you can view or copy the bypass code by scrolling down to **Bypass Codes** and selecting the copy or eyeball button
    - You can **Revoke** the bypass code by selecting the trash can icon on the right side of the screen

:::note
You can manage Bypass codes from a global view by navigating to **Users → (Manage) Bypass Codes**
:::

### Proposed Solution 2: Add Trusted Manager Phone Numbers To Each User

This the reccomended approach. You can manually or programattically (via Duo API automation script) add redundant phone numbers to Duo user accounts. The idea is, if a user forgets their phone or loses it, they can go to their manager/supervisor and have them authenticate for them. This changes the process for the user slightly, see description below. Also, this method assumes that the trusted manager is already enrolled in Duo and is able to receive Duo Push tokens. 

### Steps for Using a Redundant Phone for Device Auth:

1. On the Windows Logon page, enter your password
2. At the Duo Prompt, you will need to select **Cancel** to kill push that was sent to your phone.
    - End Users, be aware that when you get back to your phone, you may have a missed Duo notification
3. At the top of the Duo Prompt, select the the drop down labeled **Device**
4. If properly set up, your manager's phone number will be listed there, select it
5. Next to **"Duo Push"**, select **Send Push**
6. Your Manager will need to approve the push, and then you will have access to your device
    - Depending on your organization's rememebered device policy, you may need to repeat this process multiple times in a work day. 
    - If prompted to "remember device", check that box during this process

:::tip
If you need to add phones to multiple users within specific groups, in bulk, consider using this Python automation script:
- https://github.com/Thomas-Barnett/Cisco-Duo-Scripts/tree/main/duo-phone-assignment
- The script uses the Python Duo API client to select a target Duo user group and add a phone number to each user within the group
- Check out the README.md file for more information
:::