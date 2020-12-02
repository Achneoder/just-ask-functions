Feature: Send email

  Scenario: Send email for registration confirmation
    Given the world is beautiful
    And environment variables are set as follows:
      | EnvVar         | Value          |
      | SMTP_HOST      | smtphost.de    |
      | SMTP_USER      | user           |
      | SMTP_PASS      | pass           |
    And a firebase user with with id "60102914-80e5-11ea-bc55-0242ac130003", email address "mynew@email.de" and name "Max Mustermann" exists
    And a file "cbe44ed5-14c7-47fc-b1e1-8b52ce9f1258.json" in bucket "email-trigger" with payload:
    """
    {
      "trigger": "USER_REGISTRATION",
      "firebaseUserId": "60102914-80e5-11ea-bc55-0242ac130003",
      "callbackUri": "https://just-a.sk/confirm"
    }
    """
    When a write event for file "cbe44ed5-14c7-47fc-b1e1-8b52ce9f1258.json" is triggered on bucket "email-trigger"
    Then an email should be sent to "mynew@email.de" containing text "It looks like you just registered for Just-Ask."
    And an email should be sent to "mynew@email.de" containing text "https://just-a.sk/confirm?oobCode="

  Scenario: Send email for password reset
    Given the world is beautiful
    And environment variables are set as follows:
      | EnvVar         | Value          |
      | SMTP_HOST      | smtphost.de    |
      | SMTP_USER      | user           |
      | SMTP_PASS      | pass           |
    And a firebase user with with id "60102914-80e5-11ea-bc55-0242ac130003", email address "mynew@email.de" and name "Max Mustermann" exists
    And a file "cbe44ed5-14c7-47fc-b1e1-8b52ce9f1258.json" in bucket "email-trigger" with payload:
    """
    {
      "trigger": "PASSWORD_RESET",
      "firebaseUserId": "60102914-80e5-11ea-bc55-0242ac130003",
      "callbackUri": "https://just-a.sk/password-reset"
    }
    """
    When a write event for file "cbe44ed5-14c7-47fc-b1e1-8b52ce9f1258.json" is triggered on bucket "email-trigger"
    Then an email should be sent to "mynew@email.de" containing text "You forgot your password? No problem, just click on the button below."
    And an email should be sent to "mynew@email.de" containing text "https://just-a.sk/password-reset?oobCode="
