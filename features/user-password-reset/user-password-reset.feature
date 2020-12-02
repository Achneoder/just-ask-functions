Feature: request password reset

  Scenario: request password reset successfully
    Given the world is beautiful
    And environment variables are set as follows:
      | EnvVar                                | Value                                |
      | EMAIL_TRIGGER_BUCKET                  | jask-user-email-trigger              |
      | PASSWORD_RESET_CALLBACK               | https://just-a.sk/password-reset     |
    And a firebase user with with id "0bxPDKQCVaQ2JMKJCDmIaEocWdA2", email address "existing@user.de" and name "Max Mustermann" exists
    When a "POST" request is made to the function with body:
    """
    {
      "email": "existing@user.de"
    }
    """
    Then a file "0bxPDKQCVaQ2JMKJCDmIaEocWdA2/${uuid}.json" should be written to bucket "jask-user-email-trigger" with payload:
    """
    {
      "trigger": "PASSWORD_RESET",
      "firebaseUserId": "0bxPDKQCVaQ2JMKJCDmIaEocWdA2",
      "callbackUri": "https://just-a.sk/password-reset"
    }
    """
    And the response status should be "200"

  Scenario: request password reset successfully with custom callback in test stage
    Given the world is beautiful
    And environment variables are set as follows:
      | EnvVar                                | Value                                |
      | EMAIL_TRIGGER_BUCKET                  | jask-user-email-trigger              |
      | PASSWORD_RESET_CALLBACK               | https://just-a.sk/password-reset     |
      | STAGE                                 | test                                 |
    And a firebase user with with id "0bxPDKQCVaQ2JMKJCDmIaEocWdA2", email address "existing@user.de" and name "Max Mustermann" exists
    When a "POST" request is made to the function with body:
    """
    {
      "email": "existing@user.de",
      "callbackUri": "https://some.other.uri/reset"
    }
    """
    Then a file "0bxPDKQCVaQ2JMKJCDmIaEocWdA2/${uuid}.json" should be written to bucket "jask-user-email-trigger" with payload:
    """
    {
      "trigger": "PASSWORD_RESET",
      "firebaseUserId": "0bxPDKQCVaQ2JMKJCDmIaEocWdA2",
      "callbackUri": "https://some.other.uri/reset"
    }
    """
    And the response status should be "200"

  Scenario: request password reset successfully, ignore custom callbackUri on non test stage
    Given the world is beautiful
    And environment variables are set as follows:
      | EnvVar                                | Value                                |
      | EMAIL_TRIGGER_BUCKET                  | jask-user-email-trigger              |
      | PASSWORD_RESET_CALLBACK               | https://just-a.sk/password-reset     |
    And a firebase user with with id "0bxPDKQCVaQ2JMKJCDmIaEocWdA2", email address "existing@user.de" and name "Max Mustermann" exists
    When a "POST" request is made to the function with body:
    """
    {
      "email": "existing@user.de",
      "callbackUri": "https://some.other.uri/reset"
    }
    """
    Then a file "0bxPDKQCVaQ2JMKJCDmIaEocWdA2/${uuid}.json" should be written to bucket "jask-user-email-trigger" with payload:
    """
    {
      "trigger": "PASSWORD_RESET",
      "firebaseUserId": "0bxPDKQCVaQ2JMKJCDmIaEocWdA2",
      "callbackUri": "https://just-a.sk/password-reset"
    }
    """
    And the response status should be "200"

  Scenario Outline: password reset fails due to incorrect payload
    Given the world is beautiful
    And environment variables are set as follows:
      | EnvVar                                | Value                              |
      | TEMP_ACCOUNT_DATA_BUCKET              | jask-temp-account                  |
      | EMAIL_TRIGGER_BUCKET                  | jask-user-email-trigger            |
      | AUTHENTICATION_ACTIVATION_CALLBACK    | https://just-a.sk/password-reset   |
    And a firebase user with with id "0bxPDKQCVaQ2JMKJCDmIaEocWdA2", email address "existing@user.de" and name "Max Mustermann" exists
    When a "POST" request is made to the function with body:
    """
    {
      <Email>
    }
    """
    Then no file should be written to bucket "jask-user-email-trigger"
    And the response status should be "422"

    Examples:
      | Email                        |
      |                              |
      | "email": "johnny@test"       |
      | "email": "johnnytest.test"   |
