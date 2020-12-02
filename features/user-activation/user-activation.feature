Feature: activate user

  Scenario: activate user successfully
    Given the world is beautiful
    And environment variables are set as follows:
      | EnvVar                                | Value                       |
      | TEMP_ACCOUNT_DATA_BUCKET              | jask-temp-account           |
      | ACCOUNT_DATA_BUCKET                   | jask-account-data           |
    And a firebase user with with id "0bxPDKQCVaQ2JMKJCDmIaEocWdA2", email address "existing@user.de" and name "Max Mustermann" exists
    And the session contains a valid JWT user-token with a userid "0bxPDKQCVaQ2JMKJCDmIaEocWdA2"
    And a file "0bxPDKQCVaQ2JMKJCDmIaEocWdA2.json" in bucket "jask-temp-account" with payload:
    """
    {
      "email": "some.sample@my-email.de",
      "displayName": "Johnny",
      "languages": ["DE", "EN"]
    }
    """
    When a "POST" request is made to the function
    Then a file "0bxPDKQCVaQ2JMKJCDmIaEocWdA2/${uuid}.json" should be written to bucket "jask-account-data" with payload:
    """
    {
      "email": "some.sample@my-email.de",
      "displayName": "Johnny",
      "languages": ["DE", "EN"]
    }
    """
    And the response status should be "200"

  Scenario: activate user failed, email not verified
    Given the world is beautiful
    And environment variables are set as follows:
      | EnvVar                                | Value                       |
      | TEMP_ACCOUNT_DATA_BUCKET              | jask-temp-account           |
      | ACCOUNT_DATA_BUCKET                   | jask-account-data           |
    And a firebase user with with id "0bxPDKQCVaQ2JMKJCDmIaEocWdA2", email address "existing@user.de" and name "Max Mustermann" exists
    And this firebase user has attribute "emailVerified" with value "false"
    And the session contains a valid JWT user-token with a userid "0bxPDKQCVaQ2JMKJCDmIaEocWdA2"
    And a file "0bxPDKQCVaQ2JMKJCDmIaEocWdA2.json" in bucket "jask-temp-account" with payload:
    """
    {
      "email": "some.sample@my-email.de",
      "displayName": "Johnny",
      "languages": ["DE", "EN"]
    }
    """
    When a "POST" request is made to the function
    Then no file should be written to bucket "jask-account-data"
    And the response status should be "401"
