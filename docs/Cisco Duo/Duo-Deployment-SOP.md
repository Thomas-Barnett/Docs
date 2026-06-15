---
sidebar_label: 'Duo Deployment SOP'
sidebar_position: 2
---

# Duo Deployment SOP

Use this checklist to deploy Duo MFA for Windows local and RDP logons.

:::caution
Do not install Duo on user devices until all target users are enrolled. Deploy
to test computers first. Deploy to servers last.
:::

## 1. Confirm Access and Required Files

- [ ] Sign in to the Duo Admin Console.
- [ ] Confirm at least two Duo administrators have the **Owner** role.
- [ ] Confirm you have Domain Administrator access.
- [ ] Confirm the Duo Authentication Proxy server runs Windows Server 2016 or later.
- [ ] Confirm you have one or two enrolled test computers in a test OU.
- [ ] Confirm you have local administrator or console access to the test computers.
- [ ] Download the Duo Authentication Proxy installer.
- [ ] Download the Duo Windows Logon installer.
- [ ] Download the Visual C++ Redistributable.
- [ ] Obtain the approved `duo-deploy.bat` deployment script.

## 2. Add the Duo Microsoft RDP Application

- [ ] In Duo, navigate to **Applications → Applications**.
- [ ] Select **Add application**.
- [ ] Search for and add **Microsoft RDP**.
- [ ] Rename the application to **Windows Logon MFA**, if required.
- [ ] Set **Username normalization** to **Simple**.
- [ ] Save the application.
- [ ] Securely record the application's `IKEY`, `SKEY`, and `HOST`.

:::warning
The `SKEY` is a password. Do not place it in public documentation, screenshots,
or repositories.
:::

## 3. Configure the Windows Logon Policy

- [ ] Navigate to **Policies → Policies**.
- [ ] Select **Add Policy**.
- [ ] Name the policy **Windows Logon MFA**.
- [ ] Under **New user policy**, select **Require enrollment**.
- [ ] Under **Authentication policy**, select **Enforce MFA**.
- [ ] Configure approved authentication methods.
- [ ] Configure remembered devices, networks, and duration if required.
- [ ] Save the policy.
- [ ] Select **Actions → Apply** for the new policy.
- [ ] Apply the policy to the Microsoft RDP application.
- [ ] Confirm the policy appears on the Microsoft RDP application.

## 4. Configure Active Directory Sync

- [ ] Install the [Duo Authentication Proxy](https://dl.duosecurity.com/duoauthproxy-latest.exe) on the approved domain-joined server.
- [ ] Include **Proxy Manager** during installation.
- [ ] In Duo, navigate to **Users → External Directories**.
- [ ] Select **Add External Directory → Active Directory**.
- [ ] Download the preconfigured metadata file.
- [ ] Copy the metadata configuration into Proxy Manager.
- [ ] Enter the domain controller address and LDAP port.
- [ ] Run the following command on the domain controller to find the Base DN:

```powershell
Get-ADDomain | Select-Object DistinguishedName
```

- [ ] Enter the Base DN in the Duo directory configuration.
- [ ] Set **Authentication type** to **Integrated**.
- [ ] Configure the approved transport type.
- [ ] In Proxy Manager, select **Validate**.
- [ ] Confirm validation succeeds.

**STOP:** If validation fails, correct the configuration or escalate before
continuing.

## 5. Sync Users to Duo

- [ ] In Active Directory, create a global security group named `Duo-Users`.
- [ ] Add all approved deployment users to `Duo-Users`.
- [ ] Confirm each user has a valid email address.
- [ ] In Proxy Manager, start the Authentication Proxy service.
- [ ] In Duo, save the directory connection.
- [ ] Confirm the directory status is **Connected**.
- [ ] Open the connected **AD Sync**.
- [ ] Select the `Duo-Users` AD group.
- [ ] Enable **Enrollment Email**.
- [ ] Select **Complete Setup**.
- [ ] Select **Sync Now**.
- [ ] Navigate to **Users → Users**.
- [ ] Confirm all expected users appear in Duo.

## 6. Confirm User Enrollment

- [ ] In Duo, navigate to **Users → Users**.
- [ ] Filter for **Not enrolled** users.
- [ ] Contact users who have not completed enrollment.
- [ ] Assist users with Duo Mobile activation if required.
- [ ] Confirm every user in the deployment group is enrolled.

**STOP:** Do not deploy the Windows Logon client until every target user is
enrolled.

## 7. Prepare the Deployment Files

- [ ] Create the following SYSVOL folder, replacing `domain.local`:

```text
\\domain.local\SYSVOL\domain.local\scripts\duo
```

- [ ] Copy these files into the SYSVOL folder:

```text
VC_redist.x64.exe
duo-win-login-<version>.exe
duo-deploy.bat
```

- [ ] Update `duo-deploy.bat` with the correct installer filename.
- [ ] Update `duo-deploy.bat` with the Microsoft RDP application's `IKEY`, `SKEY`, and `HOST`.
- [ ] Confirm the approved installer options are set.
- [ ] From a test computer, confirm the SYSVOL folder is readable:

```cmd
dir \\domain.local\SYSVOL\domain.local\scripts\duo
```

**STOP:** If the test computer cannot read the folder, correct SYSVOL access
before continuing.

## 8. Create and Test the Deployment GPO

- [ ] Open **Group Policy Management**.
- [ ] Create a GPO named **Deploy Duo Windows Logon**.
- [ ] Link the GPO to the test OU only.
- [ ] Confirm one or two enrolled test computers are in the test OU.
- [ ] Edit the GPO.
- [ ] Navigate to **Computer Configuration → Policies → Windows Settings → Scripts → Startup**.
- [ ] Add `duo-deploy.bat` from the SYSVOL folder.
- [ ] On a test computer, run:

```cmd
gpupdate /force
shutdown /r /t 0
```

- [ ] After restart, review `C:\Windows\Temp\duo_install.log`.
- [ ] Confirm the log reports a successful Duo installation.
- [ ] Confirm the Duo Credential Provider exists:

```cmd
dir "C:\Program Files\Duo Security\DuoCredProv\DuoCredProv.dll"
```

- [ ] Test local Windows logon with an enrolled user.
- [ ] Test RDP logon with an enrolled user.
- [ ] Confirm the Duo prompt appears and authentication succeeds.
- [ ] Confirm local administrator or recovery access still works.

**STOP:** Resolve all test failures before expanding the GPO.

## 9. Roll Out to Production

- [ ] Deploy to IT workstations.
- [ ] Confirm successful Duo authentication on IT workstations.
- [ ] Deploy to a small pilot group.
- [ ] Confirm successful Duo authentication for the pilot group.
- [ ] Deploy to remaining workstations.
- [ ] Confirm successful Duo authentication on remaining workstations.
- [ ] Confirm console access and rollback readiness before deploying to servers.
- [ ] Deploy to approved servers last.
- [ ] Record deployment completion and unresolved issues.

## Troubleshooting Checklist

- [ ] Review `C:\Windows\Temp\duo_install.log`.
- [ ] Confirm the computer is in the correct OU.
- [ ] Confirm the GPO is linked to the correct OU.
- [ ] Confirm the startup script is under **Computer Configuration**.
- [ ] Confirm the computer account can read the SYSVOL folder.
- [ ] Confirm the installer filename matches the batch script.
- [ ] Confirm `IKEY`, `SKEY`, and `HOST` are correct.
- [ ] Confirm the computer can reach Duo over outbound TCP 443.
- [ ] Confirm the user is enrolled.
- [ ] Confirm the Windows username matches the Duo username.
- [ ] Run the following commands if the GPO does not apply:

```cmd
gpresult /r /scope computer
gpresult /h C:\Windows\Temp\gpresult.html
```

## Emergency Rollback Checklist

Use this checklist only when Duo prevents normal Windows logon.

- [ ] Boot into Windows Recovery Environment.
- [ ] Select **Troubleshoot → Advanced options → Startup Settings → Restart**.
- [ ] Press **4** or **F4** to start Safe Mode.
- [ ] Sign in with an administrator account.
- [ ] Open an elevated Command Prompt.
- [ ] Unregister the Duo credential provider:

```cmd
regsvr32 /u "C:\Program Files\Duo Security\WindowsLogon\DuoCredProv.dll"
regsvr32 /u "C:\Program Files\Duo Security\WindowsLogon\DuoCredFilter.dll"
```

- [ ] Enable Windows Installer in Safe Mode:

```cmd
reg add "HKLM\SYSTEM\CurrentControlSet\Control\SafeBoot\Minimal\MSIServer" /ve /t REG_SZ /d "Service" /f
net start msiserver
```

- [ ] Open **Control Panel → Programs and Features**.
- [ ] Uninstall **Duo Authentication for Windows Logon**.
- [ ] Restart Windows normally.
- [ ] Confirm normal Windows logon works.
- [ ] Escalate the original configuration or connectivity issue before reinstalling Duo.

## Completion Checklist

- [ ] Duo administrator access is confirmed.
- [ ] Microsoft RDP application and policy are configured.
- [ ] Authentication Proxy validation succeeds.
- [ ] AD Sync status is healthy.
- [ ] All target users are enrolled.
- [ ] Test and pilot deployments succeed.
- [ ] Production rollout is complete.
- [ ] Unresolved issues and exceptions are documented.
