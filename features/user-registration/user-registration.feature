Feature: register basic user

  Scenario: register basic user successfully
    Given the world is beautiful
    And environment variables are set as follows:
      | EnvVar                                | Value                       |
      | TEMP_ACCOUNT_DATA_BUCKET              | jask-temp-account           |
      | EMAIL_TRIGGER_BUCKET                  | jask-user-email-trigger     |
      | AUTHENTICATION_ACTIVATION_CALLBACK    | https://just-a.sk/confirm   |
    And newly created user should have id "0bxPDKQCVaQ2JMKJCDmIaEocWdA2"
    When a "POST" request is made to the function with body:
    """
    {
      "email": "some.sample@my-email.de",
      "displayName": "Johnny",
      "password": "12345678",
      "languages": ["de_DE", "en_US"]
    }
    """
    Then a NOT verified firebase user should be created with email "some.sample@my-email.de", password "12345678" and displayName "Johnny"
    And a file "0bxPDKQCVaQ2JMKJCDmIaEocWdA2.json" should be written to bucket "jask-temp-account" with payload:
    """
    {
      "email": "some.sample@my-email.de",
      "displayName": "Johnny",
      "languages": ["de_DE", "en_US"]
    }
    """
    And a file "0bxPDKQCVaQ2JMKJCDmIaEocWdA2/${uuid}.json" should be written to bucket "jask-user-email-trigger" with payload:
    """
    {
      "trigger": "USER_REGISTRATION",
      "firebaseUserId": "0bxPDKQCVaQ2JMKJCDmIaEocWdA2",
      "callbackUri": "https://just-a.sk/confirm"
    }
    """
    And the response status should be "200"
    And the response body should have attribute "id" with string value "0bxPDKQCVaQ2JMKJCDmIaEocWdA2"

  Scenario: register basic user successfully with customCallback in test stage
    Given the world is beautiful
    And environment variables are set as follows:
      | EnvVar                                | Value                       |
      | TEMP_ACCOUNT_DATA_BUCKET              | jask-temp-account           |
      | EMAIL_TRIGGER_BUCKET                  | jask-user-email-trigger     |
      | AUTHENTICATION_ACTIVATION_CALLBACK    | https://just-a.sk/confirm   |
      | STAGE                                 | test                        |
    And newly created user should have id "0bxPDKQCVaQ2JMKJCDmIaEocWdA2"
    When a "POST" request is made to the function with body:
    """
    {
      "email": "some.sample@my-email.de",
      "displayName": "Johnny",
      "password": "12345678",
      "languages": ["de_DE", "en_US"],
      "callbackUri": "https://some.other.uri/reg"
    }
    """
    Then a NOT verified firebase user should be created with email "some.sample@my-email.de", password "12345678" and displayName "Johnny"
    And a file "0bxPDKQCVaQ2JMKJCDmIaEocWdA2.json" should be written to bucket "jask-temp-account" with payload:
    """
    {
      "email": "some.sample@my-email.de",
      "displayName": "Johnny",
      "languages": ["de_DE", "en_US"]
    }
    """
    And a file "0bxPDKQCVaQ2JMKJCDmIaEocWdA2/${uuid}.json" should be written to bucket "jask-user-email-trigger" with payload:
    """
    {
      "trigger": "USER_REGISTRATION",
      "firebaseUserId": "0bxPDKQCVaQ2JMKJCDmIaEocWdA2",
      "callbackUri": "https://some.other.uri/reg"
    }
    """
    And the response status should be "200"
    And the response body should have attribute "id" with string value "0bxPDKQCVaQ2JMKJCDmIaEocWdA2"

  Scenario: register basic user successfully, ignore custom callbackUri on non test stage
    Given the world is beautiful
    And environment variables are set as follows:
      | EnvVar                                | Value                       |
      | TEMP_ACCOUNT_DATA_BUCKET              | jask-temp-account           |
      | EMAIL_TRIGGER_BUCKET                  | jask-user-email-trigger     |
      | AUTHENTICATION_ACTIVATION_CALLBACK    | https://just-a.sk/confirm   |
    And newly created user should have id "0bxPDKQCVaQ2JMKJCDmIaEocWdA2"
    When a "POST" request is made to the function with body:
    """
    {
      "email": "some.sample@my-email.de",
      "displayName": "Johnny",
      "password": "12345678",
      "languages": ["de_DE", "en_US"],
      "callbackUri": "https://ignored.uri/reg"
    }
    """
    Then a NOT verified firebase user should be created with email "some.sample@my-email.de", password "12345678" and displayName "Johnny"
    And a file "0bxPDKQCVaQ2JMKJCDmIaEocWdA2.json" should be written to bucket "jask-temp-account" with payload:
    """
    {
      "email": "some.sample@my-email.de",
      "displayName": "Johnny",
      "languages": ["de_DE", "en_US"]
    }
    """
    And a file "0bxPDKQCVaQ2JMKJCDmIaEocWdA2/${uuid}.json" should be written to bucket "jask-user-email-trigger" with payload:
    """
    {
      "trigger": "USER_REGISTRATION",
      "firebaseUserId": "0bxPDKQCVaQ2JMKJCDmIaEocWdA2",
      "callbackUri": "https://just-a.sk/confirm"
    }
    """
    And the response status should be "200"
    And the response body should have attribute "id" with string value "0bxPDKQCVaQ2JMKJCDmIaEocWdA2"

  Scenario Outline: register basic user fails due to incorrect payload
    Given the world is beautiful
    And environment variables are set as follows:
      | EnvVar                                | Value                       |
      | TEMP_ACCOUNT_DATA_BUCKET              | jask-temp-account           |
      | EMAIL_TRIGGER_BUCKET                  | jask-user-email-trigger     |
      | AUTHENTICATION_ACTIVATION_CALLBACK    | https://just-a.sk/confirm   |
    And newly created user should have id "0bxPDKQCVaQ2JMKJCDmIaEocWdA2"
    When a "POST" request is made to the function with body:
    """
    {
      <Email>
      <DisplayName>
      <Password>
      <Languages>
    }
    """
    Then firebase user with id "0bxPDKQCVaQ2JMKJCDmIaEocWdA2" should NOT exist
    And no file should be written to bucket "jask-temp-account"
    And no file should be written to bucket "jask-user-email-trigger"
    And the response status should be "422"

    Examples:
        | Email                        | DisplayName              | Password                | Languages                               |
        |                              | "displayName": "Johnny", | "password": "12345678", | "languages": ["de_DE", "en_US"]               |
        | "email": "johnny@test.test", |                          | "password": "12345678", | "languages": ["de_DE", "en_US"]               |
        | "email": "johnny@test.test", | "displayName": "Johnny", |                         | "languages": ["de_DE", "en_US"]               |
        | "email": "johnny@test.test", | "displayName": "Johnny", | "password": "12345678"  |                                         |
        | "email": "johnny@test",      | "displayName": "Johnny", | "password": "12345678", | "languages": ["de_DE", "en_US"]               |
        | "email": "johnny@test.test", | "displayName": "Johnny", | "password": "12345678", | "languages": []                         |
        | "email": "johnny@test.test", | "displayName": "Johnny", | "password": "12345678", | "languages": ["de_DE", "en_US", "SOME_OTHER"] |

  Scenario: register basic user fails, email already in use
    Given the world is beautiful
    And environment variables are set as follows:
      | EnvVar                                | Value                       |
      | TEMP_ACCOUNT_DATA_BUCKET              | jask-temp-account           |
      | EMAIL_TRIGGER_BUCKET                  | jask-user-email-trigger     |
      | AUTHENTICATION_ACTIVATION_CALLBACK    | https://just-a.sk/confirm   |
    And a firebase user with with id "60102914-80e5-11ea-bc55-0242ac130003", email address "existing@user.de" and name "Max Mustermann" exists
    And newly created user should have id "0bxPDKQCVaQ2JMKJCDmIaEocWdA2"
    When a "POST" request is made to the function with body:
    """
    {
      "email": "existing@user.de",
      "displayName": "Johnny",
      "password": "12345678",
      "languages": ["de_DE", "en_US"]
    }
    """
    Then firebase user with id "0bxPDKQCVaQ2JMKJCDmIaEocWdA2" should NOT exist
    And no file should be written to bucket "jask-temp-account"
    And no file should be written to bucket "jask-user-email-trigger"
    And the response status should be "409"
