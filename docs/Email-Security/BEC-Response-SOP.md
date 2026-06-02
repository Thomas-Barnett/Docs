---
sidebar_label: 'Microsoft 365 BEC Response'
---

# SOP: Microsoft 365 Compromised Mailbox / BEC Response

## Purpose

This SOP defines the standard process for responding to a suspected or confirmed Microsoft 365 mailbox compromise where an attacker accessed a user’s business email account and used it to send spam, phishing, or other malicious emails.

This type of incident may be classified as:

* **Compromised Microsoft 365 mailbox**
* **Business Email Compromise**
* **Outbound phishing/spam campaign**
* **Account takeover**

---

## Scope

This procedure applies to Microsoft 365 business tenants using:

* Microsoft 365 Admin Center
* Microsoft Entra Admin Center
* Exchange Admin Center
* Microsoft Defender / Security Admin Center
* Outlook on the web

---

## Severity

Treat this as a **high-priority security incident** when any of the following are true:

* The mailbox sent phishing or spam externally
* The account had successful sign-ins from suspicious locations
* The account belongs to management, finance, HR, IT, or an executive
* The attacker created forwarding rules, inbox rules, or persistence mechanisms
* The account was restricted from sending mail by Microsoft

---

# Phase 1: Initial Containment

## 1. Open the Microsoft 365 Admin Center

Go to:

```text
https://admin.microsoft.com
```

Navigate to:

```text
Users > Active users
```

Search for and select the affected user account.

---

## 2. Revoke Active Sessions

From the affected user’s account page, select:

```text
Revoke sessions
```

This forces existing Microsoft 365 sign-in sessions to expire.

> Note: Revoking sessions may not instantly terminate every token everywhere. Some access may remain valid briefly while Microsoft processes the revocation.

---

## 3. Block Sign-In

From the same user account page, block the user from signing in.

Set:

```text
Block sign-in: Yes
```

This prevents the attacker and the legitimate user from signing in until remediation is complete.

---

## 4. Reset the User’s Password

Reset the affected user’s password.

Recommended settings:

```text
Generate temporary password: Yes
Require user to change password at next sign-in: Yes
```

Store the temporary password securely.

Do not send the temporary password to the compromised mailbox.

---

# Phase 2: Identity and MFA Review

## 5. Open Microsoft Entra Admin Center

Go to:

```text
https://entra.microsoft.com
```

Navigate to:

```text
Identity > Users > All users
```

Select the affected user.

---

## 6. Confirm MFA Is Enabled

Verify that the user is required to use MFA.

Check:

```text
Authentication methods
```

Confirm that the user has legitimate MFA methods registered.

Look for suspicious or unknown methods such as:

* Unknown phone numbers
* Unknown authenticator app registrations
* Unknown email addresses
* Recently added MFA methods
* Authentication methods the user does not recognize

Remove any suspicious MFA methods.

---

## 7. Review Sign-In Activity

In Entra, review the user’s sign-in logs.

Look for suspicious activity such as:

* Sign-ins from unusual countries or regions
* Failed login bursts
* Successful logins from unknown IP addresses
* Legacy authentication attempts
* Suspicious browser or device information
* Login times outside normal business hours

Document suspicious IP addresses, timestamps, and locations.

---

# Phase 3: Mail Flow Investigation

## 8. Open the Exchange Admin Center

Go to:

```text
https://admin.exchange.microsoft.com
```

Navigate to:

```text
Mail flow > Message trace
```

---

## 9. Run a Message Trace

Run a message trace for the affected mailbox.

Recommended trace criteria:

```text
Sender: affected user email address
Direction: Outbound
Time range: suspected compromise window
Status: All
```

Use the largest reasonable time window around the suspected incident.

Example:

```text
From: 24 hours before first known malicious message
To: Current time
```

:::tip
You can also filter the trace by subject line. This is helpful when you know a specific spam or phishing email campaign was sent from your account
:::

---

## 10. Identify Recipients

Review the message trace results and identify:

* External recipients
* Internal recipients
* Number of messages sent
* Subject lines used
* Delivery status
* Failed or blocked messages
* Suspicious attachments or links, if visible

---

## 11. Export Message Trace Results

Export the message trace results to CSV.

Save the file using a clear naming format:

```text
YYYY-MM-DD_CompromisedMailbox_MessageTrace_UserEmail.csv
```

Example:

```text
2026-06-02_CompromisedMailbox_MessageTrace_jdoe@example.com.csv
```

---

## 12. Create a Targeted Recipient Report

Using the exported CSV, create a cleaned list of recipients who received the phishing or spam message.

Include:

* Recipient email address
* Message subject
* Date/time sent
* Delivery status
* Internal or external recipient
* Notes, if needed

Save the cleaned report as:

```text
YYYY-MM-DD_TargetedRecipients_UserEmail.csv
```

---

# Phase 4: Mailbox Rule and Forwarding Review

## 13. Temporarily Re-Enable Login for Remediation

After the password has been reset and MFA has been verified, re-enable the user account only when ready to complete mailbox cleanup.

In Microsoft 365 Admin Center:

```text
Users > Active users > Select user > Block sign-in: No
```

---

## 14. Contact the User

Contact the user using a trusted method, such as:

* Phone call
* Teams call
* Known-good alternate email
* In-person communication

Do not rely only on the compromised mailbox for communication.

Tell the user:

* Their mailbox was compromised
* Their password was reset
* They must sign in with a temporary password
* They must create a new secure password
* They should not reuse any previous password
* They should report any suspicious prompts, MFA requests, or emails

---

## 15. Have the User Sign In

Have the user sign in with the temporary password.

The user should be prompted to create a new password.

Password requirements:

* Unique password
* Not reused from another account
* Long passphrase preferred
* Stored in a password manager if available

Example password guidance:

```text
Use a long passphrase that is unique to this account.
Do not reuse your old Microsoft 365 password.
Do not use passwords from personal accounts.
```

---

## 16. Check Outlook Inbox Rules

Once signed in as the user, open Outlook on the web:

```text
https://outlook.office.com
```

Go to:

```text
Settings > Mail > Rules
```

Review all inbox rules.

Look for suspicious rules that:

* Delete incoming mail
* Move mail to RSS, Archive, Junk, or hidden folders
* Forward mail externally
* Mark messages as read
* Hide replies from recipients
* Target words like “invoice,” “payment,” “wire,” “bank,” “password,” or “MFA”
* Were created around the compromise window

Delete any suspicious rules.

---

## 17. Check Outlook Forwarding Settings

In Outlook on the web, go to:

```text
Settings > Mail > Forwarding
```

Confirm forwarding is disabled unless there is a documented business reason.

Remove any suspicious forwarding address.

---

## 18. Check Exchange Admin Center Mailbox Forwarding

In Exchange Admin Center, go to:

```text
Recipients > Mailboxes > Select affected user
```

Review mailbox forwarding settings.

Confirm there is no unauthorized forwarding address configured.

Remove any suspicious forwarding.

---

## 19. Check Exchange Transport Rules

In Exchange Admin Center, review organization-level mail flow rules.

Navigate to:

```text
Mail flow > Rules
```

Look for recently created or suspicious rules that could:

* Redirect mail externally
* Blind-copy mail externally
* Delete or modify messages
* Bypass spam filtering
* Affect the compromised user’s mailbox

Remove or disable suspicious rules after confirming they are not legitimate.

---

# Phase 5: Restore Sending Capability

## 20. Test Sending Mail

Send a test email from the affected mailbox to:

* An internal recipient
* An external recipient

Confirm whether the message is delivered successfully.

---

## 21. If Sending Is Blocked, Open Microsoft Defender

If the user receives an error that they are not recognized as a valid sender, blocked from sending, or restricted due to suspicious activity, open Microsoft Defender.

Go to:

```text
https://security.microsoft.com
```

Navigate to:

```text
Email & collaboration > Review > Restricted entities
```

---

## 22. Unblock the Affected Mailbox

Find the affected mailbox in the Restricted entities list.

Select the mailbox and choose:

```text
Unblock
```

Document the unblock action in the ticket.

---

## 23. Notify User and Management About Sending Delay

Notify the user and management that mailbox sending functionality has been remediated but may take time to fully restore.

Use this language:

```text
The mailbox has been remediated and removed from Microsoft’s restricted sender list. Microsoft states that sending functionality may take some time to fully restore. Please allow approximately one hour for normal sending to resume.
```

---

# Phase 6: User and Management Communication

## 24. Notify Management

Send management a summary of the incident.

Include:

* Affected mailbox
* Time compromise was detected
* Known or suspected compromise window
* Whether phishing/spam was sent
* Number of known recipients
* Whether the account was blocked from sending
* Remediation steps completed
* Whether any suspicious rules or forwarding were found
* Whether MFA was enabled or updated
* Recommended next steps

Attach:

```text
Targeted recipient CSV report
Message trace CSV report
```

---

## 25. Provide Recipient List for Warning Email

Send management the exported targeted-recipient report so they can issue a warning email if needed.

Suggested warning email should tell recipients:

* The previous email was not legitimate
* Do not click links or open attachments
* Delete the message
* Report the message to IT if they interacted with it
* Reset passwords if credentials were entered
* Contact IT if they provided payment, financial, or sensitive information

---

## 26. Contact the End User

Tell the end user:

* Their account was secured
* Their password was reset
* MFA was reviewed
* Suspicious mailbox rules or forwarding were removed, if found
* Sending may take approximately one hour to fully restore if Microsoft restricted the mailbox
* They should report any suspicious MFA prompts or unexpected login notifications immediately

---

# Phase 7: Endpoint and Follow-Up Checks

## 27. Recommend Endpoint Scan

If there is any indication that the user’s computer may be infected or the compromise came from their device, perform or recommend an endpoint security scan.

Check for:

* Malware
* Browser credential theft
* Suspicious extensions
* Saved passwords in browser
* Remote access tools
* Recently installed unknown software

---

## 28. Review for Additional Compromise

Check whether other accounts may have been affected.

Review:

* Similar sign-in locations
* Other users with suspicious outbound sending
* Other users with newly created forwarding rules
* Other users on the Restricted entities page
* Security alerts in Microsoft Defender
* Risky users in Microsoft Entra ID Protection, if licensed

---

# Phase 8: Documentation

## 29. Document the Incident

In the ticket, document:

```text
Affected user:
Date/time reported:
Date/time containment started:
Date/time account blocked:
Date/time sessions revoked:
Date/time password reset:
Date/time MFA reviewed:
Suspicious sign-ins found:
Suspicious inbox rules found:
Suspicious forwarding found:
Message trace completed:
Number of recipients:
CSV exported:
Restricted entity unblock required:
Date/time sending restored:
User notified:
Management notified:
Additional recommendations:
```

---

## 30. Save Evidence

Save the following files to the ticket or incident folder:

```text
Message trace CSV
Targeted recipient CSV
Screenshots of suspicious inbox rules, if any
Screenshots of suspicious forwarding, if any
Screenshots of restricted entity unblock, if applicable
Sign-in log details, if applicable
Management notification
User notification
```

---

# Phase 9: Preventive Recommendations

## 31. Recommend Stronger Email Security

If the client does not already have advanced email security, recommend adding email security protection.

Recommended option:

```text
Checkpoint Email Security
Estimated cost: $ __ per mailbox per month
```

Explain that this can help reduce risk from:

* Phishing emails
* Malicious links
* Malicious attachments
* Business email compromise attempts
* Account takeover-related email threats
* Impersonation attempts

---

## 32. Additional Security Recommendations

Recommend the following where appropriate:

* Require MFA for all users
* Disable legacy authentication
* Use Conditional Access, if licensed
* Block automatic external forwarding
* Enable mailbox auditing
* Review admin roles
* Use strong password policies
* Train users to report phishing
* Enable Microsoft Defender alerts
* Monitor risky users and risky sign-ins
* Require number matching for authenticator prompts
* Remove stale authentication methods

---

# Completion Criteria

The incident can be considered remediated when:

* User sessions have been revoked
* Sign-in was temporarily blocked
* Password was reset
* MFA was reviewed and secured
* Suspicious MFA methods were removed
* Suspicious inbox rules were removed
* Suspicious forwarding was removed
* Message trace was completed
* Recipient CSV was exported
* User can successfully send email
* Restricted entity status was cleared, if applicable
* User was notified
* Management was notified
* Incident was documented

---

# Quick Checklist

```text
[ ] Open Microsoft 365 Admin Center
[ ] Select affected user
[ ] Revoke sessions
[ ] Block sign-in
[ ] Reset password
[ ] Open Entra Admin Center
[ ] Review MFA methods
[ ] Remove suspicious MFA methods
[ ] Review sign-in logs
[ ] Open Exchange Admin Center
[ ] Run message trace
[ ] Export message trace CSV
[ ] Create targeted recipient CSV
[ ] Re-enable login
[ ] Contact user by trusted method
[ ] User signs in with temporary password
[ ] User resets password
[ ] Check Outlook inbox rules
[ ] Delete suspicious rules
[ ] Check Outlook forwarding
[ ] Remove suspicious forwarding
[ ] Check Exchange mailbox forwarding
[ ] Check Exchange mail flow rules
[ ] Test sending internally
[ ] Test sending externally
[ ] Open Microsoft Defender
[ ] Check Review > Restricted entities
[ ] Unblock mailbox if restricted
[ ] Notify user and management
[ ] Send exported report to management
[ ] Recommend warning email to recipients
[ ] Recommend Checkpoint Email Security
[ ] Document incident
[ ] Save evidence
```
